import {
  ChartCard,
  MetricsSection,
  type Metric,
} from '@/features/dashboard/components/showcase/MetricsSection'
import { GaugeArc, GaugeLegendItem } from '@/features/dashboard/components/showcase/GaugeArc'
import { DATE_RANGE_ANCHOR_ATTR, DateRangePopover } from '@/features/dashboard/components/showcase/DateRangePopover'
import { ApplicationsCard } from '@/features/dashboard/components/showcase/ApplicationsCard'
import {
  ChartCaption,
  ChartState,
  HBarList,
  PhaseStackChart,
  StatusHistoryChart,
  VolumeConcentrationHeatmap,
  type PhaseFilterKey,
  type PhaseGranularity,
} from '@/features/dashboard/components/showcase/AggregateCharts'
import {
  aggregateActiveByType,
  aggregateByConcentration,
  aggregatePhasePatientsByDay,
  aggregateStatusHistory,
  aggregateVolumeMatrix,
  eachDay,
  filterMatrixByConcentration,
  useActiveTherapies,
  useDoseWindow,
  useStatusHistory,
  type StatusGranularity,
} from '@/features/dashboard/hooks/useDashboardAggregates'
import type { CardFilter } from '@/features/dashboard/hooks/useChartWindow'
import { useCustomTypesStore } from '@/features/immunotherapy/stores/useCustomTypesStore'
import { formatRange } from '@/features/dashboard/lib/format-range'
import { getClinicalMetrics } from '@/shared/api/clinical.api'
import { ApiError } from '@/shared/api/contracts/errors'
import { queryKeys } from '@/shared/api/query-keys'
import { useSession } from '@/shared/auth/useSession'
import { Card, CardHeader, CircleButton, PageHeader, Pill, SHOWCASE } from '@/shared/components/showcase'
import { toOffsetIso } from '@/shared/lib/dates'
import { useHasPermission } from '@/shared/stores/useUserStore'
import {
  faArrowTrendUp,
  faCalendar,
  faShieldHalved,
  faUser,
  faUserXmark,
} from '@fortawesome/free-solid-svg-icons'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import type { DateRange } from 'react-day-picker'

function dayInput(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function DashboardPage() {
  const navigate = useNavigate()
  const canViewDashboard = useHasPermission('view_dashboard')
  useEffect(() => {
    if (!canViewDashboard) navigate({ to: '/immunotherapies' })
  }, [canViewDashboard, navigate])

  const { account } = useSession()
  const organizationId = account?.organization?.id ?? ''

  const [calendarOpen, setCalendarOpen] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  const periodDays = useMemo(() => {
    const DAY_MS = 24 * 60 * 60 * 1000
    const toDate = dateRange?.to ?? dateRange?.from ?? new Date()
    const fromDate = dateRange?.from ?? new Date(toDate.getTime() - 29 * DAY_MS)
    const fromDay = dayInput(fromDate)
    const toDay = dayInput(toDate)
    return { fromDay, toDay }
  }, [dateRange])

  const period = useMemo(
    () => ({
      from: toOffsetIso(periodDays.fromDay, '00:00'),
      to: toOffsetIso(periodDays.toDay, '23:59'),
    }),
    [periodDays],
  )

  const metricsQuery = useQuery({
    queryKey: queryKeys.clinicalMetrics(organizationId, period),
    queryFn: ({ signal }) => getClinicalMetrics(period, signal),
    enabled: organizationId !== '',
  })
  const metrics = metricsQuery.data ?? null

  const doseWindowQuery = useDoseWindow(organizationId, period)
  const activeTherapiesQuery = useActiveTherapies(organizationId)

  const concentrationData = useMemo(
    () => aggregateByConcentration(doseWindowQuery.data ?? []),
    [doseWindowQuery.data],
  )
  const volumeMatrix = useMemo(
    () => aggregateVolumeMatrix(doseWindowQuery.data ?? []),
    [doseWindowQuery.data],
  )
  const phaseSeries = useMemo(
    () =>
      aggregatePhasePatientsByDay(
        activeTherapiesQuery.data ?? [],
        periodDays.fromDay,
        periodDays.toDay,
      ),
    [activeTherapiesQuery.data, periodDays],
  )
  const knownTypes = useCustomTypesStore((state) => state.types)
  const typeData = useMemo(
    () =>
      aggregateActiveByType(
        activeTherapiesQuery.data ?? [],
        knownTypes.map((type) => type.label),
      ),
    [activeTherapiesQuery.data, knownTypes],
  )
  const phasesEmpty = phaseSeries.every(
    (entry) => entry.buildUp + entry.maintenance === 0,
  )

  const [concentrationTop, setConcentrationTop] = useState('all')
  const [concentrationOrder, setConcentrationOrder] = useState('scale')
  const concentrationView = useMemo(() => {
    const ordered =
      concentrationOrder === 'scale'
        ? concentrationData
        : [...concentrationData].sort((a, b) =>
            concentrationOrder === 'desc' ? b.count - a.count : a.count - b.count,
          )
    return concentrationTop === 'all' ? ordered : ordered.slice(0, Number(concentrationTop))
  }, [concentrationData, concentrationOrder, concentrationTop])
  const concentrationFilters: CardFilter[] = [
    {
      key: 'order',
      value: concentrationOrder,
      onChange: setConcentrationOrder,
      options: [
        { value: 'scale', label: 'Ordem de diluição' },
        { value: 'desc', label: 'Maior primeiro' },
        { value: 'asc', label: 'Menor primeiro' },
      ],
      ariaLabel: 'Ordenação',
    },
    {
      key: 'top',
      value: concentrationTop,
      onChange: setConcentrationTop,
      options: [
        { value: 'all', label: 'Todas' },
        { value: '3', label: 'Top 3' },
        { value: '5', label: 'Top 5' },
      ],
      ariaLabel: 'Quantidade exibida',
    },
  ]

  const [matrixConcentration, setMatrixConcentration] = useState('all')
  const matrixView = useMemo(
    () => filterMatrixByConcentration(volumeMatrix, matrixConcentration),
    [volumeMatrix, matrixConcentration],
  )
  const matrixFilters: CardFilter[] = [
    {
      key: 'concentration',
      value: matrixConcentration,
      onChange: setMatrixConcentration,
      options: [
        { value: 'all', label: 'Todas as concentrações' },
        ...volumeMatrix.concentrations.map((label) => ({ value: label, label })),
      ],
      ariaLabel: 'Filtrar por concentração',
    },
  ]

  const [typeTop, setTypeTop] = useState('all')
  const [typeZeros, setTypeZeros] = useState('show')
  const typeView = useMemo(() => {
    const visible = typeZeros === 'show' ? typeData : typeData.filter((entry) => entry.count > 0)
    return typeTop === 'all' ? visible : visible.slice(0, Number(typeTop))
  }, [typeData, typeTop, typeZeros])
  const typeFilters: CardFilter[] = [
    {
      key: 'zeros',
      value: typeZeros,
      onChange: setTypeZeros,
      options: [
        { value: 'show', label: 'Exibir zerados' },
        { value: 'hide', label: 'Ocultar zerados' },
      ],
      ariaLabel: 'Tipos sem tratamentos',
    },
    {
      key: 'top',
      value: typeTop,
      onChange: setTypeTop,
      options: [
        { value: 'all', label: 'Todos' },
        { value: '3', label: 'Top 3' },
        { value: '5', label: 'Top 5' },
      ],
      ariaLabel: 'Quantidade exibida',
    },
  ]

  const [phaseGranularity, setPhaseGranularity] = useState<PhaseGranularity>('day')
  const [visiblePhase, setVisiblePhase] = useState<PhaseFilterKey>('all')
  const phaseFilters: CardFilter[] = [
    {
      key: 'granularity',
      value: phaseGranularity,
      onChange: (value) => setPhaseGranularity(value as PhaseGranularity),
      options: [
        { value: 'day', label: 'Por dia' },
        { value: 'week', label: 'Por semana' },
      ],
      ariaLabel: 'Granularidade',
    },
    {
      key: 'phase',
      value: visiblePhase,
      onChange: (value) => setVisiblePhase(value as PhaseFilterKey),
      options: [
        { value: 'all', label: 'Ambas as fases' },
        { value: 'buildUp', label: 'Só indução' },
        { value: 'maintenance', label: 'Só manutenção' },
      ],
      ariaLabel: 'Fase exibida',
    },
  ]

  const statusHistoryQuery = useStatusHistory(organizationId)
  const [statusGranularity, setStatusGranularity] =
    useState<StatusGranularity>('month')
  const [statusWindow, setStatusWindow] = useState('12')
  const statusSeries = useMemo(
    () =>
      aggregateStatusHistory(
        statusHistoryQuery.data ?? [],
        statusGranularity,
        Number(statusWindow),
      ),
    [statusHistoryQuery.data, statusGranularity, statusWindow],
  )
  const statusFilters: CardFilter[] = [
    {
      key: 'granularity',
      value: statusGranularity,
      onChange: (value) => {
        setStatusGranularity(value as StatusGranularity)
        setStatusWindow('12')
      },
      options: [
        { value: 'week', label: 'Semanas' },
        { value: 'month', label: 'Meses' },
      ],
      ariaLabel: 'Granularidade',
    },
    {
      key: 'range',
      value: statusWindow,
      onChange: setStatusWindow,
      options:
        statusGranularity === 'month'
          ? [
              { value: '3', label: 'Últimos 3 meses' },
              { value: '6', label: 'Últimos 6 meses' },
              { value: '12', label: 'Últimos 12 meses' },
            ]
          : [
              { value: '4', label: 'Últimas 4 semanas' },
              { value: '8', label: 'Últimas 8 semanas' },
              { value: '12', label: 'Últimas 12 semanas' },
              { value: '26', label: 'Últimas 26 semanas' },
            ],
      ariaLabel: 'Janela',
    },
  ]

  const applicationSeries = useMemo(() => {
    const counts = new Map(
      (metrics?.applications.byDay ?? []).map((entry) => [entry.day, entry.count]),
    )
    return eachDay(periodDays.fromDay, periodDays.toDay).map((day) => ({
      date: day,
      label: `${day.slice(8, 10)}/${day.slice(5, 7)}`,
      value: counts.get(day) ?? 0,
    }))
  }, [metrics, periodDays])

  const adherencePct =
    metrics && metrics.adherence.ratio !== null
      ? Math.round(metrics.adherence.ratio * 100)
      : null

  const summaryMetrics: Metric[] = useMemo(
    () => [
      {
        label: 'Tratamentos ativos',
        value: metrics ? String(metrics.therapies.inProgress) : '—',
        icon: faUser,
      },
      {
        label: 'Tratamentos suspensos',
        value: metrics ? String(metrics.therapies.suspended) : '—',
        icon: faUserXmark,
      },
      {
        label: 'Em indução',
        value: metrics ? String(metrics.therapies.buildUp) : '—',
        icon: faArrowTrendUp,
      },
      {
        label: 'Em manutenção',
        value: metrics ? String(metrics.therapies.maintenance) : '—',
        icon: faShieldHalved,
      },
    ],
    [metrics],
  )

  return (
    <>
      <PageHeader
        breadcrumb={['Painel de Métricas']}
        title="Painel de Métricas"
        actions={
          <>
            <div
              className="relative z-50 flex items-center gap-2 rounded-lg p-1 backdrop-blur-md"
              style={{ background: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.65)' }}
            >
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
              <span
                className="inline-flex h-9 items-center rounded-lg px-4 text-[0.78rem] font-medium whitespace-nowrap"
                style={{ background: '#FFFFFF', border: '1px solid #DDE6E6', color: '#4A6469' }}
              >
                {dateRange?.from ? formatRange(dateRange) : 'Últimos 30 dias'}
              </span>
            </div>
            <Pill active onClick={() => navigate({ to: '/export-report' })}>
              Gerar relatório
            </Pill>
          </>
        }
      />

      {metricsQuery.error && (
        <p role="alert" className="mb-3 text-[0.72rem] text-red-700">
          {metricsQuery.error instanceof ApiError
            ? metricsQuery.error.message
            : 'Não foi possível carregar os indicadores.'}
        </p>
      )}

      <div className="relative z-10 grid shrink-0 grid-cols-12 gap-4 auto-rows-[minmax(17.5rem,auto)]">
        <div className="col-span-4">
          <Card tone="plain">
            <CardHeader
              title="Adesão às Aplicações"
              subtitle="Aplicações no dia local previsto ÷ aplicações do período"
            />
            {metricsQuery.isPending ? (
              <div className="flex flex-1 items-center justify-center text-xs" style={{ color: SHOWCASE.muted }}>
                Carregando…
              </div>
            ) : adherencePct !== null && metrics ? (
              <div className="flex flex-1 flex-col justify-center">
                <GaugeArc
                  ratio={adherencePct / 100}
                  value={`${adherencePct}%`}
                  caption={`${metrics.adherence.numerator} de ${metrics.adherence.denominator} aplicações`}
                  footnote="no dia previsto"
                  ariaLabel={`Adesão de ${adherencePct}% no período`}
                >
                  <GaugeLegendItem
                    color={SHOWCASE.accent}
                    label="Previstas pendentes"
                    value={String(metrics.scheduled.pending)}
                  />
                  <GaugeLegendItem
                    color={SHOWCASE.muted}
                    label="Vencidas"
                    value={String(metrics.scheduled.overdue)}
                  />
                </GaugeArc>
              </div>
            ) : (
              <div
                className="flex flex-1 items-center justify-center px-4 text-center text-[0.72rem]"
                style={{ color: SHOWCASE.muted }}
              >
                Sem aplicações registradas no período — adesão indisponível, não zero.
              </div>
            )}
          </Card>
        </div>

        <div className="col-span-8">
          <ApplicationsCard
            title="Aplicações Registradas"
            caption="No período"
            series={applicationSeries}
            modalityMix={{
              subcutaneous: metrics?.therapies.inProgress ?? 0,
              sublingual: 0,
              total: metrics?.therapies.inProgress ?? 0,
            }}
            doseMix={[]}
          />
        </div>

      </div>

      <MetricsSection metrics={summaryMetrics}>
        <ChartCard
          title="Status de Imunoterapias"
          fullWidth
          filters={statusFilters}
          filtersActive={statusGranularity !== 'month' || statusWindow !== '12'}
        >
          <ChartCaption>
            Tratamentos por status ao fim de cada {statusGranularity === 'month' ? 'mês' : 'semana'}, reconstruídos do histórico de suspensões, retomadas e conclusões
          </ChartCaption>
          <ChartState
            loading={statusHistoryQuery.isPending}
            error={statusHistoryQuery.isError}
            empty={(statusHistoryQuery.data ?? []).length === 0}
            emptyText="Sem tratamentos registrados."
          >
            <StatusHistoryChart series={statusSeries} />
          </ChartState>
        </ChartCard>
        <ChartCard
          title="Ciclos de Tratamento por Concentração"
          filters={concentrationFilters}
          filtersActive={concentrationOrder !== 'scale' || concentrationTop !== 'all'}
        >
          <ChartCaption>Aplicações administradas no período, por concentração</ChartCaption>
          <ChartState
            loading={doseWindowQuery.isPending}
            error={doseWindowQuery.isError}
            empty={concentrationView.length === 0}
            emptyText="Sem aplicações administradas no período."
          >
            <HBarList data={concentrationView} unit="aplicações" />
          </ChartState>
        </ChartCard>
        <ChartCard
          title="Volume vs Concentração"
          filters={matrixFilters}
          filtersActive={matrixConcentration !== 'all'}
        >
          <ChartCaption>Matriz de valores administrados no período</ChartCaption>
          <ChartState
            loading={doseWindowQuery.isPending}
            error={doseWindowQuery.isError}
            empty={matrixView.total === 0}
            emptyText="Sem aplicações administradas no período."
          >
            <VolumeConcentrationHeatmap matrix={matrixView} />
          </ChartState>
        </ChartCard>
        <ChartCard
          title="Imunoterapias Ativas por Tipo"
          filters={typeFilters}
          filtersActive={typeZeros !== 'show' || typeTop !== 'all'}
        >
          <ChartCaption>Tratamentos em andamento, por tipo de alérgeno</ChartCaption>
          <ChartState
            loading={activeTherapiesQuery.isPending}
            error={activeTherapiesQuery.isError}
            empty={typeView.every((entry) => entry.count === 0)}
            emptyText="Sem tratamentos em andamento."
          >
            <HBarList data={typeView} unit="tratamentos" palette="lime" />
          </ChartState>
        </ChartCard>
        <ChartCard
          title="Distribuição de Fases"
          fullWidth
          filters={phaseFilters}
          filtersActive={phaseGranularity !== 'day' || visiblePhase !== 'all'}
        >
          <ChartCaption>
            Pacientes com tratamento em andamento em cada dia, por fase — reconstruídos das datas de início de indução e manutenção
          </ChartCaption>
          <ChartState
            loading={activeTherapiesQuery.isPending}
            error={activeTherapiesQuery.isError}
            empty={phasesEmpty}
            emptyText="Sem tratamentos em andamento no período."
          >
            <PhaseStackChart
              series={phaseSeries}
              granularity={phaseGranularity}
              visiblePhase={visiblePhase}
            />
          </ChartState>
        </ChartCard>
      </MetricsSection>
    </>
  )
}
