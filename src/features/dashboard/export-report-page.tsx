import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useHasPermission } from '@/shared/stores/useUserStore'
import { exportClinicalDoses, getClinicalMetrics } from '@/shared/api/clinical.api'
import type { ClinicalExportRow, TherapyStatus } from '@/shared/api/contracts/clinical'
import { queryKeys } from '@/shared/api/query-keys'
import { useSession } from '@/shared/auth/useSession'
import { exportClinicalDatasetCsv } from '@/features/patient/exporters'
import {
  ALL_DASHBOARD_SECTIONS,
  buildDashboardReportPdf,
  DASHBOARD_SECTIONS,
  exportDashboardReportPdf,
  type DashboardReportData,
  type DashboardSectionId,
} from '@/features/dashboard/exporters/pdf-report-exporter'
import {
  DATE_RANGE_ANCHOR_ATTR,
  DateRangePopover,
} from '@/features/dashboard/components/showcase/DateRangePopover'
import {
  exportDashboardReportCsv,
  exportDashboardReportJson,
} from '@/features/dashboard/exporters/data-report-exporters'
import {
  aggregateActiveByType,
  aggregateByConcentration,
  aggregatePhasesByDay,
  aggregateStatusHistory,
  aggregateVolumeMatrix,
  buildComparisonSeries,
  eachDay,
  useActiveTherapies,
  useDoseWindow,
  usePreviousMetrics,
  useStatusHistory,
} from '@/features/dashboard/hooks/useDashboardAggregates'
import { downloadFile } from '@/shared/lib/file-download'
import { toOffsetIso } from '@/shared/lib/dates'
import { Button, FieldLabel, Modal, Select, showApiErrorToast, TextArea, toast } from '@/shared/components'
import { CircleButton, PageHeader, Pill } from '@/shared/components/showcase'
import type { DateRange } from 'react-day-picker'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCalendar,
  faCircleCheck,
  faCircleInfo,
  faDownload,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons'

const PAGE_SIZE = 100
const MAX_PAGES = 20

type ExportFormat =
  | 'csv'
  | 'json'
  | 'dashboard-pdf'
  | 'dashboard-csv'
  | 'dashboard-json'

const FORMAT_FILE_LABELS: Record<ExportFormat, string> = {
  csv: 'CSV',
  json: 'JSON',
  'dashboard-pdf': 'PDF',
  'dashboard-csv': 'CSV',
  'dashboard-json': 'JSON',
}

const FORMAT_DESCRIPTIONS: Record<ExportFormat, string> = {
  csv: 'O arquivo descreve o conjunto clínico persistido no instante da geração (corte temporal explícito), com previsto e realizado separados, versão fixada e fuso da prescrição em cada linha.',
  json: 'O arquivo descreve o conjunto clínico persistido no instante da geração (corte temporal explícito), com previsto e realizado separados, versão fixada e fuso da prescrição em cada linha.',
  'dashboard-pdf':
    'O PDF reproduz os gráficos do painel no período e nas seções escolhidos abaixo, pronto para impressão.',
  'dashboard-csv':
    'O CSV contém os valores do painel (indicadores e séries dos gráficos) em seções tabulares, sem gráficos e sem a listagem de pacientes.',
  'dashboard-json':
    'O JSON contém os valores do painel (indicadores e séries dos gráficos) em estrutura legível por máquina, sem gráficos e sem a listagem de pacientes.',
}

const STATUS_OPTIONS: { value: '' | TherapyStatus; label: string }[] = [
  { value: '', label: 'Todos os tratamentos' },
  { value: 'IN_PROGRESS', label: 'Em andamento' },
  { value: 'SUSPENDED', label: 'Suspensos' },
  { value: 'COMPLETED', label: 'Concluídos' },
]

function dayInput(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function dayLabel(day: string): string {
  return `${day.slice(8, 10)}/${day.slice(5, 7)}/${day.slice(0, 4)}`
}

export function ExportReportPage() {
  const navigate = useNavigate()
  const canViewDashboard = useHasPermission('view_dashboard')
  useEffect(() => {
    if (!canViewDashboard) navigate({ to: '/immunotherapies' })
  }, [canViewDashboard, navigate])

  const { account } = useSession()
  const organizationId = account?.organization?.id ?? ''

  const [format, setFormat] = useState<ExportFormat>('dashboard-pdf')
  const [status, setStatus] = useState<'' | TherapyStatus>('')
  const [justification, setJustification] = useState('')
  const [consent, setConsent] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [progress, setProgress] = useState<string | null>(null)
  const [sections, setSections] = useState<DashboardSectionId[]>(ALL_DASHBOARD_SECTIONS)
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [calendarOpen, setCalendarOpen] = useState(false)

  const isDashboardFormat = format.startsWith('dashboard-')

  const toggleSection = (id: DashboardSectionId) => {
    setSections((previous) =>
      previous.includes(id)
        ? previous.filter((section) => section !== id)
        : ALL_DASHBOARD_SECTIONS.filter((section) => previous.includes(section) || section === id),
    )
  }

  // Recorte temporal escolhido; sem seleção, o padrão do painel (últimos 30 dias).
  const periodDays = useMemo(() => {
    const DAY_MS = 24 * 60 * 60 * 1000
    const toDate = dateRange?.to ?? dateRange?.from ?? new Date()
    const fromDate = dateRange?.from ?? new Date(toDate.getTime() - 29 * DAY_MS)
    const fromDay = dayInput(fromDate)
    const toDay = dayInput(toDate)
    const days = eachDay(fromDay, toDay)
    const previousTo = new Date(fromDate.getTime() - DAY_MS)
    const previousFrom = new Date(previousTo.getTime() - (days.length - 1) * DAY_MS)
    return {
      fromDay,
      toDay,
      days,
      previousFromDay: dayInput(previousFrom),
      previousToDay: dayInput(previousTo),
      previousDays: eachDay(dayInput(previousFrom), dayInput(previousTo)),
    }
  }, [dateRange])

  const period = useMemo(
    () => ({
      from: toOffsetIso(periodDays.fromDay, '00:00'),
      to: toOffsetIso(periodDays.toDay, '23:59'),
    }),
    [periodDays],
  )
  const previousPeriod = useMemo(
    () => ({
      from: toOffsetIso(periodDays.previousFromDay, '00:00'),
      to: toOffsetIso(periodDays.previousToDay, '23:59'),
    }),
    [periodDays],
  )

  // Agregados do painel só são buscados quando um formato do painel está selecionado.
  const dashboardOrganizationId = isDashboardFormat ? organizationId : ''
  const metricsQuery = useQuery({
    queryKey: queryKeys.clinicalMetrics(organizationId, period),
    queryFn: ({ signal }) => getClinicalMetrics(period, signal),
    enabled: dashboardOrganizationId !== '',
  })
  const previousMetricsQuery = usePreviousMetrics(dashboardOrganizationId, previousPeriod)
  const doseWindowQuery = useDoseWindow(dashboardOrganizationId, period)
  const activeTherapiesQuery = useActiveTherapies(dashboardOrganizationId)
  const statusHistoryQuery = useStatusHistory(dashboardOrganizationId)

  const dashboardLoading =
    isDashboardFormat &&
    (metricsQuery.isPending ||
      previousMetricsQuery.isPending ||
      doseWindowQuery.isPending ||
      activeTherapiesQuery.isPending ||
      statusHistoryQuery.isPending)
  const dashboardError =
    isDashboardFormat &&
    (metricsQuery.isError ||
      previousMetricsQuery.isError ||
      doseWindowQuery.isError ||
      activeTherapiesQuery.isError ||
      statusHistoryQuery.isError)

  const exportDisabled =
    !consent ||
    !justification.trim() ||
    progress !== null ||
    dashboardLoading ||
    dashboardError

  const reportData = useMemo<DashboardReportData | null>(() => {
    const metrics = metricsQuery.data
    const previousMetrics = previousMetricsQuery.data
    if (!metrics || !previousMetrics) return null
    const doses = doseWindowQuery.data ?? []
    return {
      generatedAt: new Date().toLocaleString('pt-BR'),
      periodLabel: `${dayLabel(periodDays.fromDay)} a ${dayLabel(periodDays.toDay)} (${periodDays.days.length} dias)`,
      sections,
      metrics,
      comparisonSeries: buildComparisonSeries(
        metrics,
        previousMetrics,
        periodDays.days,
        periodDays.previousDays,
      ),
      statusSeries: aggregateStatusHistory(statusHistoryQuery.data ?? [], 'month', 12),
      phaseSeries: aggregatePhasesByDay(doses, periodDays.fromDay, periodDays.toDay),
      concentrationData: aggregateByConcentration(doses),
      typeData: aggregateActiveByType(activeTherapiesQuery.data ?? []),
      volumeMatrix: aggregateVolumeMatrix(doses),
    }
  }, [
    metricsQuery.data,
    previousMetricsQuery.data,
    doseWindowQuery.data,
    activeTherapiesQuery.data,
    statusHistoryQuery.data,
    periodDays,
    sections,
  ])

  // Pré-visualização: o mesmo documento do download, servido como blob local.
  // A barra do visualizador nativo fica oculta (#toolbar=0), então imprimir e
  // salvar seguem só pelos botões da página.
  const previewUrl = useMemo(() => {
    if (format !== 'dashboard-pdf' || !reportData) return null
    return URL.createObjectURL(buildDashboardReportPdf(reportData).output('blob'))
  }, [format, reportData])
  useEffect(() => {
    if (!previewUrl) return
    return () => URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  function runDashboardExport() {
    const data = reportData
    if (!data) return
    if (format === 'dashboard-pdf') exportDashboardReportPdf(data)
    else if (format === 'dashboard-csv') exportDashboardReportCsv(data)
    else exportDashboardReportJson(data)
    toast.success({
      icon: <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: 16 }} />,
      title: 'Relatório do painel gerado',
      description: `Período ${dayLabel(periodDays.fromDay)} a ${dayLabel(periodDays.toDay)}, formato ${FORMAT_FILE_LABELS[format]}.`,
      autoDismissMs: 8000,
    })
  }

  async function runDatasetExport() {
    const asOf = new Date().toISOString()
    const rows: ClinicalExportRow[] = []
    let total = 0
    try {
      for (let page = 1; page <= MAX_PAGES; page++) {
        setProgress(`Buscando página ${page}…`)
        const result = await exportClinicalDoses({
          asOf,
          page,
          pageSize: PAGE_SIZE,
          ...(status ? { status } : {}),
        })
        rows.push(...result.items)
        total = result.total
        if (rows.length >= total) break
      }
      if (rows.length < total) {
        toast.warning({
          icon: <FontAwesomeIcon icon={faTriangleExclamation} style={{ fontSize: 16 }} />,
          title: 'Exportação parcial',
          description: `O conjunto tem ${total} linhas e o limite do navegador é ${MAX_PAGES * PAGE_SIZE}. Exportado parcialmente até a linha ${rows.length}; volumes maiores exigem o job de exportação (pendência declarada).`,
          position: 'top-right',
          autoDismissMs: 10000,
        })
      }
      if (format === 'csv') {
        exportClinicalDatasetCsv(rows, asOf)
      } else {
        downloadFile(
          JSON.stringify({ asOf, total: rows.length, rows }, null, 2),
          `allervia_export_${asOf.replace(/[:.]/g, '-')}.json`,
          'application/json',
        )
      }
      toast.success({
        icon: <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: 16 }} />,
        title: 'Exportação gerada',
        description: `Corte temporal ${asOf}; ${rows.length} linha(s). A solicitação foi registrada na auditoria do servidor.`,
        autoDismissMs: 8000,
      })
    } catch (error) {
      showApiErrorToast(error, { title: 'Não foi possível gerar a exportação' })
    } finally {
      setProgress(null)
    }
  }

  async function runExport() {
    if (isDashboardFormat) {
      runDashboardExport()
      return
    }
    await runDatasetExport()
  }

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden pt-0">
      <PageHeader
        breadcrumb={['Painel de Métricas']}
        title="Exportar Relatório"
        actions={
          <div className="flex flex-col items-end gap-1">
            <Pill
              icon={faDownload}
              active
              onClick={() => !exportDisabled && setShowConfirm(true)}
              disabled={exportDisabled}
              className={exportDisabled ? 'opacity-50 cursor-not-allowed' : undefined}
            >
              Exportar {FORMAT_FILE_LABELS[format]}
            </Pill>
            {!consent && (
              <span className="text-[0.68rem] font-medium" style={{ color: '#E0453C' }}>
                Aceite a declaração LGPD para habilitar a exportação
              </span>
            )}
          </div>
        }
      />

      <div className="flex min-h-0 flex-1 gap-5">
      <div className="flex-1 overflow-y-auto max-w-2xl space-y-4 px-1 pb-8">
        <div className="flex items-start gap-2 bg-brand/10 border border-brand/25 rounded-lg px-3 py-2.5">
          <FontAwesomeIcon icon={faCircleInfo} className="text-brand shrink-0 mt-0.5" style={{ fontSize: 14 }} />
          <p className="text-[0.68rem] text-brand-dark leading-relaxed">
            {FORMAT_DESCRIPTIONS[format]} Cada geração fica registrada na auditoria
            do servidor com autor, filtros e corte.
          </p>
        </div>

        <div className="rounded-xl border border-(--border-custom) bg-white px-4 py-3 space-y-3">
          <FieldLabel label="Formato">
            <Select value={format} onChange={(e) => setFormat(e.target.value as ExportFormat)}>
              <optgroup label="Conjunto clínico (listagem completa)">
                <option value="csv">CSV (com proteção de células-fórmula)</option>
                <option value="json">JSON estruturado</option>
              </optgroup>
              <optgroup label="Painel de métricas (dashboard)">
                <option value="dashboard-pdf">PDF com gráficos (para impressão)</option>
                <option value="dashboard-csv">CSV — valores do painel, sem gráficos</option>
                <option value="dashboard-json">JSON — valores do painel, sem gráficos</option>
              </optgroup>
            </Select>
          </FieldLabel>
          {isDashboardFormat && (
            <>
              <FieldLabel label="Período do relatório">
                <div className="relative z-40 flex items-center gap-2">
                  <span className="relative inline-flex" {...{ [DATE_RANGE_ANCHOR_ATTR]: '' }}>
                    <CircleButton
                      icon={faCalendar}
                      active={calendarOpen || Boolean(dateRange?.from)}
                      aria-label="Período"
                      aria-expanded={calendarOpen}
                      onClick={() => setCalendarOpen((open) => !open)}
                    />
                    <DateRangePopover
                      open={calendarOpen}
                      range={dateRange}
                      onRangeChange={setDateRange}
                      onClose={() => setCalendarOpen(false)}
                    />
                  </span>
                  <span className="text-[0.72rem] text-(--text)">
                    {dayLabel(periodDays.fromDay)} a {dayLabel(periodDays.toDay)}
                    <span className="text-(--text-muted)"> · {periodDays.days.length} dias</span>
                  </span>
                  {dateRange?.from && (
                    <button
                      type="button"
                      className="text-[0.68rem] underline text-(--text-muted) cursor-pointer"
                      onClick={() => setDateRange(undefined)}
                    >
                      Últimos 30 dias
                    </button>
                  )}
                </div>
              </FieldLabel>

              <FieldLabel label="Seções incluídas">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                  {DASHBOARD_SECTIONS.map((section) => (
                    <label
                      key={section.id}
                      className="flex items-center gap-2 text-[0.7rem] text-(--text) cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={sections.includes(section.id)}
                        onChange={() => toggleSection(section.id)}
                      />
                      {section.label}
                    </label>
                  ))}
                </div>
              </FieldLabel>
            </>
          )}
          {!isDashboardFormat && (
            <FieldLabel label="Filtro por situação do tratamento">
              <Select value={status} onChange={(e) => setStatus(e.target.value as '' | TherapyStatus)}>
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </Select>
            </FieldLabel>
          )}
          <FieldLabel label="Justificativa" required>
            <TextArea
              rows={2}
              placeholder="Motivo desta exportação (LGPD)"
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
            />
          </FieldLabel>
          <label className="flex items-start gap-2 text-[0.7rem] text-(--text) cursor-pointer">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5"
            />
            Declaro ciência da LGPD: os dados exportados permanecem sob
            responsabilidade da organização e desta solicitação registrada.
          </label>
        </div>

        {dashboardLoading && (
          <p className="text-xs text-(--text-muted)">Carregando indicadores do painel…</p>
        )}
        {dashboardError && (
          <p role="alert" className="text-xs text-red-700">
            Não foi possível carregar os indicadores do painel. Recarregue a página e tente novamente.
          </p>
        )}
        {progress && <p className="text-xs text-(--text-muted)">{progress}</p>}
      </div>

      <aside className="hidden min-h-0 flex-1 flex-col gap-2 pb-8 lg:flex">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-[0.8rem] font-semibold text-(--text)">Pré-visualização</h2>
          <span className="text-[0.66rem] text-(--text-muted)">
            {dayLabel(periodDays.fromDay)} a {dayLabel(periodDays.toDay)}
          </span>
        </div>
        {previewUrl ? (
          <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-(--border-custom) bg-white">
            <iframe
              key={previewUrl}
              src={`${previewUrl}#toolbar=0&navpanes=0&view=FitH`}
              title="Pré-visualização do relatório em PDF"
              className="h-full w-full"
            />
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 items-center justify-center rounded-xl border border-(--border-custom) bg-gray-50 px-6 text-center text-[0.72rem] text-(--text-muted)">
            {format !== 'dashboard-pdf' || dashboardError
              ? 'Pré-visualização indisponível'
              : 'Montando a pré-visualização…'}
          </div>
        )}
        <p className="text-[0.62rem] text-(--text-muted)">
          {format === 'dashboard-pdf'
            ? 'Documento idêntico ao do download; o visualizador é o do navegador.'
            : 'Só o PDF do painel tem pré-visualização.'}
        </p>
      </aside>
      </div>

      <Modal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Confirmar exportação"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>Cancelar</Button>
            <Button
              tone="brand"
              variant="solid"
              onClick={() => { setShowConfirm(false); void runExport() }}
            >
              Confirmar e exportar
            </Button>
          </>
        }
      >
        <p className="text-[0.7rem] text-(--text-muted) leading-relaxed">
          A geração define o corte temporal e registra a solicitação na auditoria do
          servidor com autor e filtros. Formato: {FORMAT_FILE_LABELS[format]}
          {!isDashboardFormat && status
            ? ` · Filtro: ${STATUS_OPTIONS.find((o) => o.value === status)?.label}`
            : ''}
          {isDashboardFormat
            ? ` · Valores do painel, ${dayLabel(periodDays.fromDay)} a ${dayLabel(periodDays.toDay)}, ${sections.length} de ${ALL_DASHBOARD_SECTIONS.length} seções${format === 'dashboard-pdf' ? ', com gráficos' : ', sem gráficos'}`
            : ''}.
        </p>
      </Modal>
    </div>
  )
}
