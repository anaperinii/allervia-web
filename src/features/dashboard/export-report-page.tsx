import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useHasPermission } from '@/shared/stores/useUserStore'
import { getClinicalMetrics } from '@/shared/api/clinical.api'
import { queryKeys } from '@/shared/api/query-keys'
import { useSession } from '@/shared/auth/useSession'
import {
  exportDashboardReportPdf,
  type DashboardReportData,
} from '@/features/dashboard/exporters/pdf-report-exporter'
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
import { toOffsetIso } from '@/shared/lib/dates'
import { Button, FieldLabel, Modal, Select, TextArea, toast } from '@/shared/components'
import { PageHeader, Pill } from '@/shared/components/showcase'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck, faCircleInfo, faDownload } from '@fortawesome/free-solid-svg-icons'

type ExportFormat = 'pdf' | 'csv' | 'json'

const FORMAT_DESCRIPTIONS: Record<ExportFormat, string> = {
  pdf: 'O PDF reproduz os gráficos do painel (indicadores, comparativo, status, fases, concentrações, tipos e matriz volume × concentração) no recorte dos últimos 30 dias, pronto para impressão.',
  csv: 'O CSV contém os valores do painel (indicadores e séries dos gráficos) em seções tabulares, sem gráficos e sem a listagem de pacientes.',
  json: 'O JSON contém os valores do painel (indicadores e séries dos gráficos) em estrutura legível por máquina, sem gráficos e sem a listagem de pacientes.',
}

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

  const [format, setFormat] = useState<ExportFormat>('pdf')
  const [justification, setJustification] = useState('')
  const [consent, setConsent] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // Mesmo recorte padrão do painel: últimos 30 dias.
  const periodDays = useMemo(() => {
    const DAY_MS = 24 * 60 * 60 * 1000
    const toDate = new Date()
    const fromDate = new Date(toDate.getTime() - 29 * DAY_MS)
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
  }, [])

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

  const metricsQuery = useQuery({
    queryKey: queryKeys.clinicalMetrics(organizationId, period),
    queryFn: ({ signal }) => getClinicalMetrics(period, signal),
    enabled: organizationId !== '',
  })
  const previousMetricsQuery = usePreviousMetrics(organizationId, previousPeriod)
  const doseWindowQuery = useDoseWindow(organizationId, period)
  const activeTherapiesQuery = useActiveTherapies(organizationId)
  const statusHistoryQuery = useStatusHistory(organizationId)

  const dataLoading =
    metricsQuery.isPending ||
    previousMetricsQuery.isPending ||
    doseWindowQuery.isPending ||
    activeTherapiesQuery.isPending ||
    statusHistoryQuery.isPending
  const dataError =
    metricsQuery.isError ||
    previousMetricsQuery.isError ||
    doseWindowQuery.isError ||
    activeTherapiesQuery.isError ||
    statusHistoryQuery.isError

  const exportDisabled = !consent || !justification.trim() || dataLoading || dataError

  function runExport() {
    const metrics = metricsQuery.data
    const previousMetrics = previousMetricsQuery.data
    if (!metrics || !previousMetrics) return
    const doses = doseWindowQuery.data ?? []
    const data: DashboardReportData = {
      generatedAt: new Date().toLocaleString('pt-BR'),
      periodLabel: `${dayLabel(periodDays.fromDay)} a ${dayLabel(periodDays.toDay)} (últimos 30 dias)`,
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
    if (format === 'pdf') exportDashboardReportPdf(data)
    else if (format === 'csv') exportDashboardReportCsv(data)
    else exportDashboardReportJson(data)
    toast.success({
      icon: <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: 16 }} />,
      title: 'Relatório gerado',
      description: `Período ${dayLabel(periodDays.fromDay)} a ${dayLabel(periodDays.toDay)}, formato ${format.toUpperCase()}. A solicitação foi registrada na auditoria do servidor.`,
      autoDismissMs: 8000,
    })
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
              Exportar {format.toUpperCase()}
            </Pill>
            {!consent && (
              <span className="text-[0.68rem] font-medium" style={{ color: '#E0453C' }}>
                Aceite a declaração LGPD para habilitar a exportação
              </span>
            )}
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto max-w-2xl space-y-4 px-1 pb-8">
        <div className="flex items-start gap-2 bg-brand/10 border border-brand/25 rounded-lg px-3 py-2.5">
          <FontAwesomeIcon icon={faCircleInfo} className="text-brand shrink-0 mt-0.5" style={{ fontSize: 14 }} />
          <p className="text-[0.68rem] text-brand-dark leading-relaxed">
            {FORMAT_DESCRIPTIONS[format]} Cada geração fica registrada na auditoria
            do servidor com autor e período.
          </p>
        </div>

        <div className="rounded-xl border border-(--border-custom) bg-white px-4 py-3 space-y-3">
          <FieldLabel label="Formato">
            <Select value={format} onChange={(e) => setFormat(e.target.value as ExportFormat)}>
              <option value="pdf">PDF com gráficos (para impressão)</option>
              <option value="csv">CSV — valores do painel, sem gráficos</option>
              <option value="json">JSON — valores do painel, sem gráficos</option>
            </Select>
          </FieldLabel>
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

        {dataLoading && (
          <p className="text-xs text-(--text-muted)">Carregando indicadores do painel…</p>
        )}
        {dataError && (
          <p role="alert" className="text-xs text-red-700">
            Não foi possível carregar os indicadores do painel. Recarregue a página e tente novamente.
          </p>
        )}
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
              onClick={() => { setShowConfirm(false); runExport() }}
            >
              Confirmar e exportar
            </Button>
          </>
        }
      >
        <p className="text-[0.7rem] text-(--text-muted) leading-relaxed">
          A geração define o corte temporal e registra a solicitação na auditoria do
          servidor com autor e período. Formato: {format.toUpperCase()} · Valores do
          painel, últimos 30 dias{format === 'pdf' ? ', com gráficos' : ', sem gráficos'}.
        </p>
      </Modal>
    </div>
  )
}
