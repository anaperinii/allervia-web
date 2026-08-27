import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useHasPermission } from '@/shared/stores/useUserStore'
import { useDashboardAnalytics } from '@/features/dashboard/hooks/useDashboardAnalytics'
import { ConcentrationPieChart } from '@/features/dashboard/components/charts/ConcentrationPieChart'
import { PhasesBarChart } from '@/features/dashboard/components/charts/PhasesBarChart'
import { StatusLineChart } from '@/features/dashboard/components/charts/StatusLineChart'
import { TypesProgressBars } from '@/features/dashboard/components/charts/TypesProgressBars'
import { VolumeStackedBarChart } from '@/features/dashboard/components/charts/VolumeStackedBarChart'
import { PromoCard } from '@/features/dashboard/components/showcase/PromoCard'
import { ActivityCard } from '@/features/dashboard/components/showcase/ActivityCard'
import { ComparisonCard } from '@/features/dashboard/components/showcase/ComparisonCard'
import { TotalSpendCard } from '@/features/dashboard/components/showcase/TotalSpendCard'
import { BreakdownCard } from '@/features/dashboard/components/showcase/BreakdownCard'
import { DarkChartCard, DarkMetricsSection, type DarkMetric } from '@/features/dashboard/components/showcase/DarkMetricsSection'
import { faArrowTrendUp, faCalendar, faChartColumn, faDroplet, faGaugeHigh, faPlus, faShieldHalved, faSliders, faSyringe, faUser, faUserXmark } from '@fortawesome/free-solid-svg-icons'
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

  const analytics = useDashboardAnalytics({
    modality: modality === 'sub' ? 'subcutaneous' : 'sublingual',
    typeFilter,
  })

  const currentYear = new Date().getFullYear()


  const promoMetrics = useMemo(
    () => [
      { value: analytics.totalActive, label: 'Pacientes Ativos', icon: faUser, color: '#257E8C' },
      { value: analytics.inactiveFiltered.length, label: 'Pacientes Inativos', icon: faUserXmark, color: '#E0453C' },
      { value: analytics.inductionCount, label: 'Em Indução', icon: faArrowTrendUp, color: '#5C8A16' },
      { value: analytics.maintenanceCount, label: 'Em Manutenção', icon: faShieldHalved, color: '#12333a' },
    ],
    [analytics.totalActive, analytics.inactiveFiltered.length, analytics.inductionCount, analytics.maintenanceCount],
  )

  const darkMetrics: DarkMetric[] = useMemo(
    () => [
      {
        label: 'Pacientes ativos',
        value: String(analytics.totalActive),
        icon: faUser,
        glow: '#B7E06A',
        visual: 'spark',
        series: analytics.weekly.applications.map((d) => d.value),
      },
      {
        label: 'Aplicações na semana',
        value: String(analytics.weekly.applicationsTotal),
        icon: faSyringe,
        glow: '#74C3B9',
        visual: 'bars',
        series: analytics.weekly.applications.map((d) => d.value),
      },
      {
        label: 'Doses aplicadas',
        value: String(analytics.weekly.dosesTotal),
        icon: faDroplet,
        glow: '#9BC1C4',
        visual: 'spark',
        series: analytics.weekly.doses.map((d) => d.value),
      },
      {
        label: 'Em indução',
        value: String(analytics.inductionCount),
        icon: faArrowTrendUp,
        glow: '#8FD285',
        visual: 'dots',
        series: new Array(Math.max(analytics.totalActive, 1)).fill(0),
        filled: analytics.inductionCount,
      },
      {
        label: 'Em manutenção',
        value: String(analytics.maintenanceCount),
        icon: faShieldHalved,
        glow: '#6C9EA5',
        visual: 'dots',
        series: new Array(Math.max(analytics.totalActive, 1)).fill(0),
        filled: analytics.maintenanceCount,
      },
      {
        label: 'Evolução no ano',
        value: `${analytics.yearComparison.deltaPct >= 0 ? '+' : ''}${analytics.yearComparison.deltaPct}`,
        unit: '%',
        icon: faChartColumn,
        glow: '#E4F7B8',
        visual: 'spark',
        series: analytics.yearComparison.rows.map((r) => r.current),
      },
    ],
    [analytics],
  )

  const concentrationRows = useMemo(() => {
    const total = analytics.concentrationData.reduce((sum, d) => sum + d.value, 0)
    return [...analytics.concentrationData]
      .sort((a, b) => b.value - a.value)
      .slice(0, 2)
      .map((d) => ({ label: d.name, pct: total > 0 ? Math.round((d.value / total) * 100) : 0 }))
  }, [analytics.concentrationData])

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
        title="Painel de Métricas"
        actions={
          <>
            <SelectPill value={typeFilter} onChange={setTypeFilter} options={typeOptions} aria-label="Tipo de imunoterapia" />
            <Pill
              icon={faPlus}
              onClick={() => goToTab('analytics')}
            >
              Adicionar widget
            </Pill>
            <Pill active onClick={() => navigate({ to: '/export-report' })}>
              Gerar relatório
            </Pill>
          </>
        }
      />

      <div className="relative z-40 flex items-center gap-2 mb-5">
        <div
          className="relative z-50 flex items-center gap-2 rounded-full p-1 backdrop-blur-md"
          style={{ background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(255,255,255,0.95)' }}
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
          {!promoDismissed && (
            <div className="col-span-3 row-span-2 min-h-0">
              <PromoCard metrics={promoMetrics} />
            </div>
          )}

          <div className={promoDismissed ? 'col-span-4' : 'col-span-3'}>
            <ActivityCard
              title="Aplicações"
              caption="Realizadas esta semana"
              total={analytics.weekly.applicationsTotal}
              data={analytics.weekly.applications}
              peakIndex={analytics.weekly.peakApplicationIndex}
              peakValue={analytics.weekly.peakApplicationValue}
              onOpen={() => goToTab('analytics')}
            />
          </div>

          <div className={promoDismissed ? 'col-span-8' : 'col-span-6'}>
            <ComparisonCard
              title="Comparativo de Ciclos"
              caption="Em todo o período"
              total={analytics.yearComparison.currentTotal}
              totalSuffix=""
              deltaPct={analytics.yearComparison.deltaPct}
              previousYear={currentYear - 1}
              currentYear={currentYear}
              rows={analytics.yearComparison.rows}
              onOpen={() => goToTab('analytics')}
            />
          </div>

          <div className={promoDismissed ? 'col-span-7' : 'col-span-5'}>
            <TotalSpendCard
              title="Doses Aplicadas"
              caption="Na semana"
              total={analytics.weekly.dosesTotal}
              totalPrefix=""
              subValue={analytics.totalActive + ' ciclos ativos'}
              stats={[
                { value: String(analytics.totalActive), label: 'Pacientes' },
                { value: String(analytics.availableTypes.length), label: 'Tipos' },
              ]}
              data={analytics.weekly.doses}
              peakIndex={analytics.weekly.peakDoseIndex}
              peakValue={analytics.weekly.peakDoseValue}
              onOpen={() => goToTab('analytics')}
            />
          </div>

          <div className={promoDismissed ? 'col-span-5' : 'col-span-4'}>
            <BreakdownCard
              title="Concentrações"
              caption="Ciclos ativos"
              total={analytics.totalActive}
              subValue={analytics.inactiveFiltered.length + ' inativos'}
              rows={concentrationRows}
              onOpen={() => goToTab('analytics')}
            />
          </div>
      </div>

      <DarkMetricsSection
        sectionRef={darkRef}
        eyebrow="Painel de Métricas"
          title="Panorama clínico"
          subtitle="Adesão, evolução e resposta dos pacientes em tratamento, em continuidade ao painel."
          metrics={darkMetrics}
          onOpen={() => goToTab('analytics')}
        >
          <DarkChartCard title="Status de Imunoterapias" fullWidth>
            <StatusLineChart data={analytics.statusData} />
          </DarkChartCard>
          <DarkChartCard title="Ciclos de Tratamento por Concentração">
            <ConcentrationPieChart data={analytics.concentrationData} />
          </DarkChartCard>
          <DarkChartCard title="Distribuição de Fases">
            <PhasesBarChart data={analytics.phaseData} />
          </DarkChartCard>
          <DarkChartCard title="Imunoterapias Ativas por Tipo">
            <TypesProgressBars data={analytics.typeData} />
          </DarkChartCard>
          <DarkChartCard title="Volume vs Concentração" fullWidth>
            <VolumeStackedBarChart data={analytics.volumeData} />
          </DarkChartCard>
      </DarkMetricsSection>

    </>
  )
}
