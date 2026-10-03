import {
  DarkChartCard,
  DarkMetricsSection,
  type DarkMetric,
} from '@/features/dashboard/components/showcase/DarkMetricsSection'
import { DATE_RANGE_ANCHOR_ATTR, DateRangePopover } from '@/features/dashboard/components/showcase/DateRangePopover'
import { ApplicationsCard } from '@/features/dashboard/components/showcase/ApplicationsCard'
import {
  TodayApplicationsCard,
  type TodayApplication,
} from '@/features/dashboard/components/showcase/TodayApplicationsCard'
import {
  ChartCaption,
  ChartState,
  HBarList,
  PhaseStackChart,
  StatusHistoryChart,
  VolumeConcentrationHeatmap,
} from '@/features/dashboard/components/showcase/AggregateCharts'
import { ComparisonCard } from '@/features/dashboard/components/showcase/ComparisonCard'
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
  type StatusGranularity,
} from '@/features/dashboard/hooks/useDashboardAggregates'
import type { CardFilter } from '@/features/dashboard/hooks/useChartWindow'
import { formatRange } from '@/features/dashboard/lib/format-range'
import { scheduleItemToApplication } from '@/features/patient/adapters/clinical-presentation'
import { getClinicalMetrics, listDoseSchedule } from '@/shared/api/clinical.api'
import { ApiError } from '@/shared/api/contracts/errors'
import { queryKeys } from '@/shared/api/query-keys'
import { useSession } from '@/shared/auth/useSession'
import { CircleButton, PageHeader, Pill } from '@/shared/components/showcase'
import { toOffsetIso } from '@/shared/lib/dates'
import { useHasPermission } from '@/shared/stores/useUserStore'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import {
  faArrowTrendUp,
  faCalendar,
  faCalendarCheck,
  faChartColumn,
  faGaugeHigh,
  faShieldHalved,
  faSyringe,
  faUser,
  faUserXmark,
} from '@fortawesome/free-solid-svg-icons'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { DateRange } from 'react-day-picker'

type DashboardTab = 'panel' | 'analytics'

const TABS: { id: DashboardTab; label: string; icon: IconDefinition }[] = [
  { id: 'panel', label: 'Painel geral', icon: faGaugeHigh },
  { id: 'analytics', label: 'Panorama clínico', icon: faChartColumn },
]

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

  const [tab, setTab] = useState<DashboardTab>('panel')
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  const darkRef = useRef<HTMLElement>(null)

  const goToTab = (next: DashboardTab) => {
    setTab(next)
    if (next === 'analytics') {
      darkRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    darkRef.current?.closest('[data-app-scroll]')?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    const band = darkRef.current
    const scroller = band?.closest('[data-app-scroll]')
    if (!band || !scroller) return

    const sync = () => {
      const inView = band.getBoundingClientRect().top <= window.innerHeight * 0.4
      setTab(inView ? 'analytics' : 'panel')
    }
    sync()
    scroller.addEventListener('scroll', sync, { passive: true })
    window.addEventListener('resize', sync)
    return () => {
      scroller.removeEventListener('scroll', sync)
      window.removeEventListener('resize', sync)
    }
  }, [])

  const periodDays = useMemo(() => {
    const DAY_MS = 24 * 60 * 60 * 1000
    const toDate = dateRange?.to ?? dateRange?.from ?? new Date()
    const fromDate = dateRange?.from ?? new Date(toDate.getTime() - 29 * DAY_MS)
    const fromDay = dayInput(fromDate)
    const toDay = dayInput(toDate)
    const days = eachDay(fromDay, toDay)
    const previousTo = new Date(fromDate.getTime() - DAY_MS)
    const previousFrom = new Date(previousTo.getTime() - (days.length - 1) * DAY_MS)
    const previousFromDay = dayInput(previousFrom)
    const previousToDay = dayInput(previousTo)
    return {
      fromDay,
      toDay,
      days,
      previousFromDay,
      previousToDay,
      previousDays: eachDay(previousFromDay, previousToDay),
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

  const metricsQuery = useQuery({
    queryKey: queryKeys.clinicalMetrics(organizationId, period),
    queryFn: ({ signal }) => getClinicalMetrics(period, signal),
    enabled: organizationId !== '',
  })
  const metrics = metricsQuery.data ?? null

  const previousMetricsQuery = usePreviousMetrics(organizationId, previousPeriod)
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
      aggregatePhasesByDay(
        doseWindowQuery.data ?? [],
        periodDays.fromDay,
        periodDays.toDay,
      ),
    [doseWindowQuery.data, periodDays],
  )
  const typeData = useMemo(
    () => aggregateActiveByType(activeTherapiesQuery.data ?? []),
    [activeTherapiesQuery.data],
  )
  const comparisonSeries = useMemo(
    () =>
      metrics && previousMetricsQuery.data
        ? buildComparisonSeries(
            metrics,
            previousMetricsQuery.data,
            periodDays.days,
            periodDays.previousDays,
          )
        : [],
    [metrics, previousMetricsQuery.data, periodDays],
  )
  const phasesEmpty = phaseSeries.every(
    (entry) => entry.buildUp + entry.maintenance === 0,
  )

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

  const todayKey = dayInput(new Date())
  const todayQuery = useQuery({
    queryKey: queryKeys.schedule(organizationId, { day: todayKey }),
    queryFn: ({ signal }) =>
      listDoseSchedule(
        {
          from: toOffsetIso(todayKey, '00:00'),
          to: toOffsetIso(todayKey, '23:59'),
          pageSize: 100,
        },
        signal,
      ),
    enabled: organizationId !== '',
  })

  const todayApplications: TodayApplication[] = useMemo(
    () =>
      (todayQuery.data?.items ?? [])
        .map(scheduleItemToApplication)
        .sort((a, b) => a.startTime.localeCompare(b.startTime))
        .map((application) => ({
          id: application.id,
          patientId: application.patientId,
          name: application.patientName ?? '—',
          time: application.startTime,
          dose: application.dose,
          status: application.status === 'completed' ? 'completed' : 'scheduled',
        })),
    [todayQuery.data],
  )

  const applicationSeries = useMemo(
    () =>
      (metrics?.applications.byDay ?? []).map((entry) => ({
        date: entry.day,
        label: `${entry.day.slice(8, 10)}/${entry.day.slice(5, 7)}`,
        value: entry.count,
      })),
    [metrics],
  )

  const adherencePct =
    metrics && metrics.adherence.ratio !== null
      ? Math.round(metrics.adherence.ratio * 100)
      : null

  const darkMetrics: DarkMetric[] = useMemo(() => {
    const byDaySeries = (metrics?.applications.byDay ?? []).map((d) => d.count)
    const active = metrics?.therapies.inProgress ?? 0
    return [
      {
        label: 'Tratamentos ativos',
        value: metrics ? String(active) : '—',
        icon: faUser,
        glow: '#257E8C',
        visual: 'spark',
        series: byDaySeries.length ? byDaySeries : [0],
      },
      {
        label: 'Tratamentos suspensos',
        value: metrics ? String(metrics.therapies.suspended) : '—',
        icon: faUserXmark,
        glow: '#12333a',
        visual: 'dots',
        series: new Array(
          Math.max(active + (metrics?.therapies.suspended ?? 0), 1),
        ).fill(0),
        filled: metrics?.therapies.suspended ?? 0,
      },
      {
        label: 'Aplicações no período',
        value: metrics ? String(metrics.applications.total) : '—',
        icon: faSyringe,
        glow: '#3E8E86',
        visual: 'spark',
        series: byDaySeries.length ? byDaySeries : [0],
      },
      {
        label: 'Em indução',
        value: metrics ? String(metrics.therapies.buildUp) : '—',
        icon: faArrowTrendUp,
        glow: '#3E8E86',
        visual: 'dots',
        series: new Array(Math.max(active, 1)).fill(0),
        filled: metrics?.therapies.buildUp ?? 0,
      },
      {
        label: 'Em manutenção',
        value: metrics ? String(metrics.therapies.maintenance) : '—',
        icon: faShieldHalved,
        glow: '#257E8C',
        visual: 'dots',
        series: new Array(Math.max(active, 1)).fill(0),
        filled: metrics?.therapies.maintenance ?? 0,
      },
      {
        label: 'Adesão no período',
        value: adherencePct !== null ? String(adherencePct) : '—',
        unit: adherencePct !== null ? '%' : undefined,
        icon: faCalendarCheck,
        glow: '#12333a',
        visual: 'spark',
        series: byDaySeries.length ? byDaySeries : [0],
      },
    ]
  }, [metrics, adherencePct])

  return (
    <>
      <PageHeader
        breadcrumb={['Painel de Métricas']}
        title="Painel geral"
        actions={
          <Pill active onClick={() => navigate({ to: '/export-report' })}>
            Gerar relatório
          </Pill>
        }
      />

      <div className="relative z-40 flex items-center gap-2 mb-5">
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

        <nav className="ml-auto flex items-center gap-2">
          {TABS.map((entry) => (
            <Pill key={entry.id} icon={entry.icon} active={tab === entry.id} onClick={() => goToTab(entry.id)}>
              {entry.label}
            </Pill>
          ))}
        </nav>
      </div>

      {metricsQuery.error && (
        <p role="alert" className="mb-3 text-[0.72rem] text-red-700">
          {metricsQuery.error instanceof ApiError
            ? metricsQuery.error.message
            : 'Não foi possível carregar os indicadores.'}
        </p>
      )}

      <div className="relative z-10 grid shrink-0 grid-cols-12 gap-4 auto-rows-[minmax(17.5rem,auto)]">
        <div className="col-span-4">
          <div
            className="flex h-full flex-col rounded-xl border border-(--border-custom) bg-white p-5"
          >
            <div className="text-xs font-semibold text-(--text-muted)">Adesão às Aplicações</div>
            <div className="text-[0.65rem] text-(--text-muted) mb-4">
              Aplicações no dia local previsto ÷ aplicações do período
            </div>
            {metricsQuery.isPending ? (
              <div className="flex-1 flex items-center justify-center text-xs text-(--text-muted)">Carregando…</div>
            ) : adherencePct !== null && metrics ? (
              <div className="flex flex-1 flex-col justify-center gap-2">
                <div className="text-5xl font-semibold text-(--text)">{adherencePct}%</div>
                <div className="text-[0.7rem] text-(--text-muted)">
                  {metrics.adherence.numerator} de {metrics.adherence.denominator} aplicações no dia previsto
                </div>
                <div className="mt-2 flex gap-4 text-[0.7rem]">
                  <span className="text-(--text-muted)">
                    Previstas pendentes: <span className="font-semibold text-(--text)">{metrics.scheduled.pending}</span>
                  </span>
                  <span className="text-(--text-muted)">
                    Vencidas: <span className="font-semibold text-amber-700">{metrics.scheduled.overdue}</span>
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center text-[0.72rem] text-(--text-muted) px-4">
                Sem aplicações registradas no período — adesão indisponível, não zero.
              </div>
            )}
          </div>
        </div>

        <div className="col-span-5">
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

        <div className="col-span-3 row-span-2 min-h-0">
          <TodayApplicationsCard
            applications={todayApplications}
            onOpen={() => navigate({ to: '/appointments' })}
            onSelectPatient={(patientId) => navigate({ to: '/patient/$patientId', params: { patientId } })}
          />
        </div>

        <div className="col-span-9">
          {comparisonSeries.length > 0 ? (
            <ComparisonCard
              title="Comparativo de Aplicações"
              caption={`Aplicações por dia vs período anterior (${periodDays.days.length} dias)`}
              totalSuffix="aplicações"
              currentLabel="Atual"
              previousLabel="Anterior"
              series={comparisonSeries}
            />
          ) : (
            <div className="flex h-full flex-col rounded-xl border border-(--border-custom) bg-white p-5">
              <div className="text-xs font-semibold text-(--text-muted)">Comparativo de Aplicações</div>
              <div className="flex flex-1 items-center justify-center text-xs text-(--text-muted)">
                {previousMetricsQuery.isError
                  ? 'Não foi possível carregar o comparativo.'
                  : 'Carregando…'}
              </div>
            </div>
          )}
        </div>
      </div>

      <DarkMetricsSection
        sectionRef={darkRef}
        eyebrow="Painel de Métricas"
        title="Panorama clínico"
        subtitle="Indicadores oficiais do período no fuso clínico da organização; denominadores documentados no contrato."
        metrics={darkMetrics}
      >
        <DarkChartCard
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
        </DarkChartCard>
        <DarkChartCard title="Ciclos de Tratamento por Concentração">
          <ChartCaption>Aplicações administradas no período, por concentração</ChartCaption>
          <ChartState
            loading={doseWindowQuery.isPending}
            error={doseWindowQuery.isError}
            empty={concentrationData.length === 0}
            emptyText="Sem aplicações administradas no período."
          >
            <HBarList data={concentrationData} unit="aplicações" />
          </ChartState>
        </DarkChartCard>
        <DarkChartCard title="Volume vs Concentração">
          <ChartCaption>Matriz de valores administrados no período</ChartCaption>
          <ChartState
            loading={doseWindowQuery.isPending}
            error={doseWindowQuery.isError}
            empty={volumeMatrix.total === 0}
            emptyText="Sem aplicações administradas no período."
          >
            <VolumeConcentrationHeatmap matrix={volumeMatrix} />
          </ChartState>
        </DarkChartCard>
        <DarkChartCard title="Imunoterapias Ativas por Tipo">
          <ChartCaption>Tratamentos em andamento, por tipo de alérgeno</ChartCaption>
          <ChartState
            loading={activeTherapiesQuery.isPending}
            error={activeTherapiesQuery.isError}
            empty={typeData.length === 0}
            emptyText="Sem tratamentos em andamento."
          >
            <HBarList data={typeData} unit="tratamentos" />
          </ChartState>
        </DarkChartCard>
        <DarkChartCard title="Distribuição de Fases" fullWidth>
          <ChartCaption>Aplicações administradas por dia, empilhadas por fase do tratamento</ChartCaption>
          <ChartState
            loading={doseWindowQuery.isPending}
            error={doseWindowQuery.isError}
            empty={phasesEmpty}
            emptyText="Sem aplicações administradas no período."
          >
            <PhaseStackChart series={phaseSeries} />
          </ChartState>
        </DarkChartCard>
      </DarkMetricsSection>
    </>
  )
}
