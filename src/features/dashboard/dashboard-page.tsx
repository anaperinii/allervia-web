import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useHasPermission } from '@/shared/stores/useUserStore'
import { useDashboardAnalytics } from '@/features/dashboard/hooks/useDashboardAnalytics'
import { usePatientStore } from '@/features/patient/stores/usePatientStore'
import { useImmunotherapiesStore } from '@/features/immunotherapy/stores/useImmunotherapiesStore'
import { ConcentrationPieChart } from '@/features/dashboard/components/charts/ConcentrationPieChart'
import { PhasesBarChart } from '@/features/dashboard/components/charts/PhasesBarChart'
import { StatusLineChart } from '@/features/dashboard/components/charts/StatusLineChart'
import { TypesProgressBars } from '@/features/dashboard/components/charts/TypesProgressBars'
import { VolumeStackedBarChart } from '@/features/dashboard/components/charts/VolumeStackedBarChart'
import { TodayApplicationsCard, type TodayApplication } from '@/features/dashboard/components/showcase/TodayApplicationsCard'
import { ApplicationsCard } from '@/features/dashboard/components/showcase/ApplicationsCard'
import { ComparisonCard } from '@/features/dashboard/components/showcase/ComparisonCard'
import { AdherenceCard, type AdherencePoint } from '@/features/dashboard/components/showcase/AdherenceCard'
import { useMonthlyFilters, useSnapshotFilters } from '@/features/dashboard/hooks/useChartWindow'
import { DarkChartCard, DarkMetricsSection, type DarkMetric } from '@/features/dashboard/components/showcase/DarkMetricsSection'
import { faArrowTrendUp, faCalendar, faChartColumn, faGaugeHigh, faShieldHalved, faSliders, faSyringe, faCalendarCheck, faUser, faUserXmark } from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { CircleButton, PageHeader, Pill, SelectPill } from '@/shared/components/showcase'
import { SegmentedControl } from '@/shared/components'
import { cn } from '@/shared/lib/cn'
import type { DateRange } from 'react-day-picker'
import {
  DATE_RANGE_ANCHOR_ATTR,
  DateRangePopover,
  formatRange,
} from '@/features/dashboard/components/showcase/DateRangePopover'

const MONTH_FILTER_OPTIONS = [
  { value: 'all', label: 'Todos os meses' },
  ...['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'].map(
    (label, index) => ({ value: String(index), label }),
  ),
]

const DASHBOARD_YEAR = new Date().getFullYear()
const YEAR_FILTER_OPTIONS = [
  { value: 'all', label: 'Todos os anos' },
  ...Array.from({ length: 5 }, (_, i) => String(DASHBOARD_YEAR - 2 + i)).map((year) => ({ value: year, label: year })),
]

type DashboardTab = 'panel' | 'analytics'

const TABS: { id: DashboardTab; label: string; icon: IconDefinition }[] = [
  { id: 'panel', label: 'Painel geral', icon: faGaugeHigh },
  { id: 'analytics', label: 'Panorama clínico', icon: faChartColumn },
]
export function DashboardPage() {
  const navigate = useNavigate()
  const canViewDashboard = useHasPermission('view_dashboard')
  useEffect(() => {
    if (!canViewDashboard) navigate({ to: '/immunotherapies' })
  }, [canViewDashboard, navigate])

  const [tab, setTab] = useState<DashboardTab>('panel')
  const [modality, setModality] = useState<'sub' | 'sbl'>('sub')
  const [typeFilter, setTypeFilter] = useState('all')
  const promoDismissed = false
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [monthFilter, setMonthFilter] = useState('all')
  const [yearFilter, setYearFilter] = useState('all')

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

  const applications = usePatientStore((state) => state.applications)
  const immunotherapies = useImmunotherapiesStore((state) => state.immunotherapies)

  const analytics = useDashboardAnalytics({
    modality: modality === 'sub' ? 'subcutaneous' : 'sublingual',
    typeFilter,
  })

  const currentYear = new Date().getFullYear()

  const applicationSeries = useMemo(
    () => analytics.timeline.map((entry) => ({ date: entry.date, label: entry.label, value: entry.applications })),
    [analytics.timeline],
  )
  const adherenceSeries: AdherencePoint[] = useMemo(() => {
    const byDate = new Map<string, { completed: number; missed: number; scheduled: number }>()

    applications.forEach((application) => {
      const [day, month, year] = application.date.split('/')
      if (!day || !month || !year) return
      const iso = `${year}-${month}-${day}`
      const entry = byDate.get(iso) ?? { completed: 0, missed: 0, scheduled: 0 }
      if (application.status === 'completed') entry.completed += 1
      else if (application.status === 'missed') entry.missed += 1
      else if (application.status === 'scheduled') entry.scheduled += 1
      byDate.set(iso, entry)
    })

    return Array.from(byDate.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([iso, entry]) => {
        const closed = entry.completed + entry.missed
        return {
          date: iso,
          label: `${iso.slice(8, 10)}/${iso.slice(5, 7)}`,
          value: closed > 0 ? Math.round((entry.completed / closed) * 100) : 100,
          ...entry,
        }
      })
  }, [applications])
  const comparisonSeries = useMemo(
    () =>
      analytics.timeline.map((entry) => ({
        date: entry.date,
        label: entry.label,
        previous: entry.previous,
        current: entry.current,
      })),
    [analytics.timeline],
  )


  const todayApplications: TodayApplication[] = useMemo(() => {
    const now = new Date()
    const key = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`
    const byId = new Map(immunotherapies.map((immunotherapy) => [immunotherapy.id, immunotherapy]))

    return applications
      .filter((application) => application.date === key && application.status !== 'canceled')
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
      .map((application) => {
        const immunotherapy = byId.get(application.patientId)
        return {
          id: application.id,
          patientId: application.patientId,
          name: immunotherapy?.name ?? 'Paciente',
          time: application.startTime,
          dose: application.dose,
          status: (application.status === 'completed' ? 'completed' : application.status === 'missed' ? 'missed' : 'scheduled') as
            | 'completed'
            | 'missed'
            | 'scheduled',
        }
      })
  }, [applications, immunotherapies])

  const activeSpark = useMemo(() => {
    const weeks = 8
    const recent = analytics.timeline.slice(-weeks * 7)
    return Array.from({ length: weeks }, (_, week) => {
      const slice = recent.slice(week * 7, week * 7 + 7)
      if (slice.length === 0) return 0
      return Math.round(slice.reduce((sum, entry) => sum + entry.active, 0) / slice.length)
    })
  }, [analytics.timeline])

  const statusFilters = useMonthlyFilters(analytics.statusHistory)
  const phaseFilters = useMonthlyFilters(analytics.phaseHistory)
  const concentrationFilters = useSnapshotFilters(analytics.concentrationData, (entry) => entry.value)
  const typeFilters = useSnapshotFilters(analytics.typeData, (entry) => entry.value)
  const volumeFilters = useSnapshotFilters(analytics.volumeData, (row) =>
    Object.entries(row).reduce((sum, [key, value]) => (key === 'conc' ? sum : sum + Number(value)), 0),
  )

  const adherence = useMemo(() => {
    const closedIn = (list: typeof applications) =>
      list.filter((application) => application.status === 'completed' || application.status === 'missed')

    const closed = closedIn(applications)
    const completed = closed.filter((application) => application.status === 'completed').length
    const rate = closed.length > 0 ? Math.round((completed / closed.length) * 100) : 0

    // Monthly rate over the last 8 months: weekly buckets are too sparse to plot.
    const now = new Date()
    const monthly = Array.from({ length: 8 }, (_, index) => {
      const cursor = new Date(now.getFullYear(), now.getMonth() - (7 - index), 1)

      const inMonth = closed.filter((application) => {
        const [, month, year] = application.date.split('/').map(Number)
        return month === cursor.getMonth() + 1 && year === cursor.getFullYear()
      })
      const done = inMonth.filter((application) => application.status === 'completed').length
      return inMonth.length > 0 ? Math.round((done / inMonth.length) * 100) : 0
    })

    return { rate, monthly }
  }, [applications])

  const darkMetrics: DarkMetric[] = useMemo(
    () => [
      {
        label: 'Pacientes ativos',
        value: String(analytics.totalActive),
        icon: faUser,
        glow: '#257E8C',
        visual: 'spark',
        series: activeSpark,
      },
      {
        label: 'Pacientes inativos',
        value: String(analytics.inactiveFiltered.length),
        icon: faUserXmark,
        glow: '#12333a',
        visual: 'dots',
        series: new Array(Math.max(analytics.totalActive + analytics.inactiveFiltered.length, 1)).fill(0),
        filled: analytics.inactiveFiltered.length,
      },
      {
        label: 'Aplicações na semana',
        value: String(analytics.weekly.applicationsTotal),
        icon: faSyringe,
        glow: '#3E8E86',
        visual: 'spark',
        series: analytics.weekly.applications.map((d) => d.value),
      },
      {
        label: 'Em indução',
        value: String(analytics.inductionCount),
        icon: faArrowTrendUp,
        glow: '#3E8E86',
        visual: 'dots',
        series: new Array(Math.max(analytics.totalActive, 1)).fill(0),
        filled: analytics.inductionCount,
      },
      {
        label: 'Em manutenção',
        value: String(analytics.maintenanceCount),
        icon: faShieldHalved,
        glow: '#257E8C',
        visual: 'dots',
        series: new Array(Math.max(analytics.totalActive, 1)).fill(0),
        filled: analytics.maintenanceCount,
      },
      {
        label: 'Taxa de adesão',
        value: String(adherence.rate),
        unit: '%',
        icon: faCalendarCheck,
        glow: '#12333a',
        visual: 'spark',
        series: adherence.monthly,
      },
    ],
    [analytics, adherence, activeSpark],
  )

  const typeOptions = useMemo(
    () => [
      { value: 'all', label: 'Todos os tipos' },
      ...analytics.availableTypes.map((type) => ({ value: type, label: type })),
    ],
    [analytics.availableTypes],
  )

  return (
    <>
      <PageHeader
        breadcrumb={['Painel de Métricas']}
        title="Painel geral"
        actions={
          <>
            <SelectPill value={typeFilter} onChange={setTypeFilter} options={typeOptions} aria-label="Tipo de imunoterapia" />
            <Pill active onClick={() => navigate({ to: '/export-report' })}>
              Gerar relatório
            </Pill>
          </>
        }
      />

      <div className="relative z-40 flex items-center gap-2 mb-5">
        <div
          className="relative z-50 flex items-center gap-2 rounded-full p-1 backdrop-blur-md"
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
            className="inline-flex h-9 items-center rounded-full px-4 text-[0.78rem] font-medium whitespace-nowrap"
            style={{ background: '#FFFFFF', border: '1px solid #DDE6E6', color: '#4A6469' }}
          >
            {formatRange(dateRange)}
          </span>
        </div>

        <div
          className={cn(
            'flex items-center gap-2 rounded-full backdrop-blur-md transition-all duration-500 ease-out',
            filtersOpen ? 'p-1' : 'p-0',
          )}
          style={{
            background: filtersOpen ? 'rgba(255,255,255,0.45)' : 'transparent',
            border: filtersOpen ? '1px solid rgba(255,255,255,0.65)' : '1px solid transparent',
          }}
        >
          <CircleButton
            icon={faSliders}
            active={filtersOpen}
            aria-label="Filtros"
            aria-expanded={filtersOpen}
            onClick={() => setFiltersOpen((open) => !open)}
          />

          <div
            className={cn(
              'flex items-center gap-2 overflow-hidden transition-all duration-500 ease-out',
              filtersOpen ? 'max-w-2xl translate-x-0 opacity-100' : 'max-w-0 -translate-x-8 opacity-0',
            )}
          >
            <SelectPill
              value={monthFilter}
              onChange={setMonthFilter}
              options={MONTH_FILTER_OPTIONS}
              aria-label="Filtrar por mês"
            />
            <SelectPill
              value={yearFilter}
              onChange={setYearFilter}
              options={YEAR_FILTER_OPTIONS}
              aria-label="Filtrar por ano"
            />
          </div>
        </div>

        <div className="ml-auto">
          <SegmentedControl
            value={modality}
            onChange={setModality}
            aria-label="Modalidade"
            options={[
              { value: 'sub', label: 'Subcutânea' },
              { value: 'sbl', label: 'Sublingual' },
            ]}
          />
        </div>

        <nav className="flex items-center gap-2">
          {TABS.map((entry) => (
            <Pill key={entry.id} icon={entry.icon} active={tab === entry.id} onClick={() => goToTab(entry.id)}>
              {entry.label}
            </Pill>
          ))}
        </nav>
      </div>

      <div className="relative z-10 grid shrink-0 grid-cols-12 gap-4 auto-rows-[minmax(17.5rem,auto)]">
          <div className={promoDismissed ? 'col-span-5' : 'col-span-4'}>
            <AdherenceCard
              title="Adesão às Aplicações"
              caption="No período"
              series={adherenceSeries}
            />
          </div>

          <div className={promoDismissed ? 'col-span-8' : 'col-span-5'}>
            <ComparisonCard
              title="Comparativo de Aplicações"
              caption="No período"
              totalSuffix=""
              previousYear={currentYear - 1}
              currentYear={currentYear}
              series={comparisonSeries}
            />
          </div>

          {!promoDismissed && (
            <div className="col-span-3 row-span-2 min-h-0">
              <TodayApplicationsCard
                applications={todayApplications}
                onOpen={() => navigate({ to: '/appointments' })}
                onSelectPatient={(patientId) => navigate({ to: '/patient/$patientId', params: { patientId } })}
              />
            </div>
          )}

          <div className={promoDismissed ? 'col-span-12' : 'col-span-9'}>
            <ApplicationsCard
              title="Aplicações Registradas"
              caption="No período"
              series={applicationSeries}
              modalityMix={analytics.modalityMix}
              doseMix={analytics.doseMix}
            />
          </div>
      </div>

      <DarkMetricsSection
        sectionRef={darkRef}
        eyebrow="Painel de Métricas"
          title="Panorama clínico"
          subtitle="Adesão, evolução e resposta dos pacientes em tratamento, em continuidade ao painel."
          metrics={darkMetrics}
        >
          <DarkChartCard title="Status de Imunoterapias" fullWidth filters={statusFilters.filters} filtersActive={statusFilters.active}>
            <StatusLineChart data={statusFilters.slice} />
          </DarkChartCard>
          <DarkChartCard
            title="Ciclos de Tratamento por Concentração"
            filters={concentrationFilters.filters}
            filtersActive={concentrationFilters.active}
          >
            <ConcentrationPieChart data={concentrationFilters.slice} />
          </DarkChartCard>
          <DarkChartCard title="Volume vs Concentração" filters={volumeFilters.filters} filtersActive={volumeFilters.active}>
            <VolumeStackedBarChart data={volumeFilters.slice} />
          </DarkChartCard>
          <DarkChartCard title="Imunoterapias Ativas por Tipo" filters={typeFilters.filters} filtersActive={typeFilters.active}>
            <TypesProgressBars data={typeFilters.slice} />
          </DarkChartCard>
          <DarkChartCard title="Distribuição de Fases" fullWidth filters={phaseFilters.filters} filtersActive={phaseFilters.active}>
            <PhasesBarChart data={phaseFilters.slice} />
          </DarkChartCard>
      </DarkMetricsSection>

    </>
  )
}
