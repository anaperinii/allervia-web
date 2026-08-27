import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useHasPermission } from '@/shared/stores/useUserStore'
import { useDashboardAnalytics } from '@/features/dashboard/hooks/useDashboardAnalytics'
import { StatCards } from '@/features/dashboard/components/StatCards'
import { ChartCard } from '@/features/dashboard/components/ChartCard'
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
import { faCalendar, faChartColumn, faDatabase, faGaugeHigh, faHeartPulse, faMagnifyingGlass, faPlus, faSliders } from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { CircleButton, PageHeader, Pill, SelectPill } from '@/shared/components/showcase'

type DashboardTab = 'panel' | 'analytics' | 'pulse' | 'data'

const TABS: { id: DashboardTab; label: string; icon: IconDefinition }[] = [
  { id: 'panel', label: 'Painel', icon: faGaugeHigh },
  { id: 'analytics', label: 'Análises', icon: faChartColumn },
  { id: 'pulse', label: 'Evolução', icon: faHeartPulse },
  { id: 'data', label: 'Dados', icon: faDatabase },
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
  const [promoDismissed, setPromoDismissed] = useState(false)

  const analytics = useDashboardAnalytics({
    modality: modality === 'sub' ? 'subcutaneous' : 'sublingual',
    typeFilter,
  })

  const [archivedCharts, setArchivedCharts] = useState<string[]>([])
  const [showArchived, setShowArchived] = useState(false)

  const toggleArchive = (id: string) => {
    setArchivedCharts((prev) => (prev.includes(id) ? prev.filter((chartId) => chartId !== id) : [...prev, id]))
  }
  const isVisible = (id: string) => (showArchived ? archivedCharts.includes(id) : !archivedCharts.includes(id))

  const currentYear = new Date().getFullYear()

  const maintenancePct = analytics.totalActive > 0
    ? Math.round((analytics.maintenanceCount / analytics.totalActive) * 100)
    : 0

  const promoBars = useMemo(
    () => [
      { label: analytics.totalActive.toLocaleString('pt-BR'), caption: 'ciclos', ratio: 1, accent: true },
      { label: `${maintenancePct}%`, caption: 'manutenção', ratio: 0.6, accent: false },
      { label: analytics.weekly.dosesTotal.toLocaleString('pt-BR'), caption: 'doses', ratio: 0.84, accent: true },
      { label: `${analytics.yearComparison.deltaPct}%`, caption: 'evolução', ratio: 0.71, accent: false },
    ],
    [analytics.totalActive, analytics.weekly.dosesTotal, analytics.yearComparison.deltaPct, maintenancePct],
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

  const archivedList = (
    <div className="flex flex-wrap gap-4">
      {isVisible('status') && (
        <ChartCard
          id="status"
          title="Status de Imunoterapias"
          archived={archivedCharts.includes('status')}
          onToggleArchive={toggleArchive}
          fullWidth
        >
          <StatusLineChart data={analytics.statusData} />
        </ChartCard>
      )}
      {isVisible('concentration') && (
        <ChartCard
          id="concentration"
          title="Ciclos de Tratamento por Concentração"
          archived={archivedCharts.includes('concentration')}
          onToggleArchive={toggleArchive}
          widthBasis="calc(38% - 0.5rem)"
        >
          <ConcentrationPieChart data={analytics.concentrationData} />
        </ChartCard>
      )}
      {isVisible('phase') && (
        <ChartCard
          id="phase"
          title="Distribuição de Fases"
          archived={archivedCharts.includes('phase')}
          onToggleArchive={toggleArchive}
          widthBasis="calc(62% - 0.5rem)"
        >
          <PhasesBarChart data={analytics.phaseData} />
        </ChartCard>
      )}
      {isVisible('type') && (
        <ChartCard
          id="type"
          title="Imunoterapias Ativas por Tipo"
          archived={archivedCharts.includes('type')}
          onToggleArchive={toggleArchive}
        >
          <TypesProgressBars data={analytics.typeData} />
        </ChartCard>
      )}
      {isVisible('volume') && (
        <ChartCard
          id="volume"
          title="Volume vs Concentração"
          archived={archivedCharts.includes('volume')}
          onToggleArchive={toggleArchive}
        >
          <VolumeStackedBarChart data={analytics.volumeData} />
        </ChartCard>
      )}
    </div>
  )

  return (
    <>
      <PageHeader
        title="Painel de Métricas"
        actions={
          <>
            <CircleButton icon={faMagnifyingGlass} aria-label="Buscar" />
            <CircleButton icon={faSliders} aria-label="Filtros" />
            <CircleButton icon={faCalendar} active aria-label="Período" />
            <SelectPill
              value={modality}
              onChange={(value) => setModality(value as 'sub' | 'sbl')}
              options={[
                { value: 'sub', label: 'Subcutânea' },
                { value: 'sbl', label: 'Sublingual' },
              ]}
              aria-label="Modalidade"
            />
            <SelectPill value={typeFilter} onChange={setTypeFilter} options={typeOptions} aria-label="Tipo de imunoterapia" />
            <Pill
              icon={faPlus}
              onClick={() => {
                setShowArchived(true)
                setTab('analytics')
              }}
            >
              Adicionar widget
            </Pill>
            <Pill onClick={() => navigate({ to: '/export-report' })}>Gerar relatório</Pill>
          </>
        }
      />

      <nav className="flex items-center gap-2 mb-5">
        {TABS.map((entry) => (
          <Pill key={entry.id} icon={entry.icon} active={tab === entry.id} onClick={() => setTab(entry.id)}>
            {entry.label}
          </Pill>
        ))}
      </nav>

      {tab === 'panel' && (
        <div className="grid grid-cols-12 gap-4 auto-rows-[minmax(17.5rem,auto)]">
          {!promoDismissed && (
            <div className="col-span-3 row-span-2 min-h-0">
              <PromoCard
                inductionCount={analytics.inductionCount}
                maintenanceCount={analytics.maintenanceCount}
                bars={promoBars}
                onDismiss={() => setPromoDismissed(true)}
                onOpen={() => setTab('analytics')}
              />
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
              onOpen={() => setTab('pulse')}
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
              onOpen={() => setTab('analytics')}
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
              onOpen={() => setTab('data')}
            />
          </div>

          <div className={promoDismissed ? 'col-span-5' : 'col-span-4'}>
            <BreakdownCard
              title="Concentrações"
              caption="Ciclos ativos"
              total={analytics.totalActive}
              subValue={analytics.inactiveFiltered.length + ' inativos'}
              rows={concentrationRows}
              onOpen={() => setTab('data')}
            />
          </div>
        </div>
      )}

      {tab === 'analytics' && (
        <div className="space-y-5">
          <StatCards
            totalActive={analytics.totalActive}
            inactiveCount={analytics.inactiveFiltered.length}
            inductionCount={analytics.inductionCount}
            maintenanceCount={analytics.maintenanceCount}
          />
          {archivedList}
        </div>
      )}

      {tab === 'pulse' && (
        <div className="flex flex-wrap gap-4">
          <ChartCard
            id="status"
            archived={archivedCharts.includes('status')}
            title="Status de Imunoterapias"
            onToggleArchive={toggleArchive}
            fullWidth
          >
            <StatusLineChart data={analytics.statusData} />
          </ChartCard>
          <ChartCard
            id="phase"
            archived={archivedCharts.includes('phase')}
            title="Distribuição de Fases"
            onToggleArchive={toggleArchive}
            fullWidth
          >
            <PhasesBarChart data={analytics.phaseData} />
          </ChartCard>
        </div>
      )}

      {tab === 'data' && (
        <div className="flex flex-wrap gap-4">
          <ChartCard
            id="type"
            archived={archivedCharts.includes('type')}
            title="Imunoterapias Ativas por Tipo"
            onToggleArchive={toggleArchive}
          >
            <TypesProgressBars data={analytics.typeData} />
          </ChartCard>
          <ChartCard
            id="volume"
            archived={archivedCharts.includes('volume')}
            title="Volume vs Concentração"
            onToggleArchive={toggleArchive}
          >
            <VolumeStackedBarChart data={analytics.volumeData} />
          </ChartCard>
          <ChartCard
            id="concentration"
            archived={archivedCharts.includes('concentration')}
            title="Ciclos de Tratamento por Concentração"
            onToggleArchive={toggleArchive}
            fullWidth
          >
            <ConcentrationPieChart data={analytics.concentrationData} />
          </ChartCard>
        </div>
      )}
    </>
  )
}
