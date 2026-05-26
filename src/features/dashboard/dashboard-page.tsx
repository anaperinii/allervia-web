import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Download, Archive } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { Button, SegmentedControl, Select } from '@/shared/components'
import { useHasPermission } from '@/shared/stores/useUserStore'
import { useDashboardAnalytics } from '@/features/dashboard/hooks/useDashboardAnalytics'
import { StatCards } from '@/features/dashboard/components/StatCards'
import { ChartCard } from '@/features/dashboard/components/ChartCard'
import { ConcentrationPieChart } from '@/features/dashboard/components/charts/ConcentrationPieChart'
import { PhasesBarChart } from '@/features/dashboard/components/charts/PhasesBarChart'
import { StatusLineChart } from '@/features/dashboard/components/charts/StatusLineChart'
import { TypesProgressBars } from '@/features/dashboard/components/charts/TypesProgressBars'
import { VolumeStackedBarChart } from '@/features/dashboard/components/charts/VolumeStackedBarChart'

export function DashboardPage() {
  const navigate = useNavigate()
  const canViewDashboard = useHasPermission('view_dashboard')
  useEffect(() => {
    if (!canViewDashboard) navigate({ to: '/immunotherapies' })
  }, [canViewDashboard, navigate])

  const [modality, setModality] = useState<'sub' | 'sbl'>('sub')
  const [typeFilter, setTypeFilter] = useState('all')

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

  return (
    <div className="flex flex-1 flex-col bg-gray-50/80 min-h-0 overflow-hidden">
      <div className="flex flex-1 min-h-0 flex-col rounded-xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden m-4">
        <div className="border-b border-(--border-custom) px-5 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-(--text)">Dashboard</h1>
          <div className="flex items-center gap-2">
            <SegmentedControl
              value={modality}
              onChange={setModality}
              options={[
                { value: 'sub', label: 'Subcutânea' },
                { value: 'sbl', label: 'Sublingual' },
              ]}
              aria-label="Modalidade"
            />
            <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="h-8 bg-white">
              <option value="all">Todos os tipos</option>
              {analytics.availableTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </Select>
            <button
              onClick={() => setShowArchived(!showArchived)}
              className={cn(
                'h-8 px-3 flex items-center gap-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer',
                showArchived ? 'bg-teal-50 border-teal-200 text-teal-700' : 'border-(--border-custom) text-(--text-muted) hover:bg-gray-50',
              )}
            >
              <Archive size={13} />
              {showArchived ? 'Voltar' : 'Arquivados'}
              {archivedCharts.length > 0 && (
                <span className={cn('px-1.5 py-0.5 rounded-full text-[0.55rem]', showArchived ? 'bg-teal-200 text-teal-800' : 'bg-gray-200 text-gray-600')}>
                  {archivedCharts.length}
                </span>
              )}
            </button>
            <Button tone="brand" variant="solid" prominent leftIcon={<Download size={13} />} to="/export-report" className="px-3">
              Exportar Relatório
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <StatCards
            totalActive={analytics.totalActive}
            inductionCount={analytics.inductionCount}
            maintenanceCount={analytics.maintenanceCount}
          />

          <div className="flex flex-wrap gap-4">
            {isVisible('concentration') && (
              <ChartCard
                id="concentration"
                title="Ciclos de Tratamento por Concentração"
                archived={archivedCharts.includes('concentration')}
                onToggleArchive={toggleArchive}
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
              >
                <PhasesBarChart data={analytics.phaseData} />
              </ChartCard>
            )}

            {isVisible('status') && (
              <ChartCard
                id="status"
                title="Status de Imunoterapias"
                archived={archivedCharts.includes('status')}
                onToggleArchive={toggleArchive}
              >
                <StatusLineChart data={analytics.statusData} />
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
                fullWidth
              >
                <VolumeStackedBarChart data={analytics.volumeData} />
              </ChartCard>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
