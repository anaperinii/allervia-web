import { EyeOff } from 'lucide-react'
import type { ChartOption } from './config-panel'
import { ConcentrationPieChart } from '@/features/dashboard/components/charts/concentration-pie-chart'
import { PhasesBarChart } from '@/features/dashboard/components/charts/phases-bar-chart'
import { StatusLineChart } from '@/features/dashboard/components/charts/status-line-chart'
import { TypesProgressBars } from '@/features/dashboard/components/charts/types-progress-bars'
import { VolumeStackedBarChart } from '@/features/dashboard/components/charts/volume-stacked-bar-chart'
import type { useDashboardAnalytics } from '@/features/dashboard/hooks/use-dashboard-analytics'

type Analytics = ReturnType<typeof useDashboardAnalytics>

interface ExportPreviewProps {
  modality: 'sub' | 'sbl'
  interval: string
  monthFilter: string
  yearFilter: string
  startDate: string
  endDate: string
  anonymize: boolean
  selectedCharts: string[]
  chartOptions: readonly ChartOption[]
  analytics: Analytics
}

export function ExportPreview({
  modality,
  interval,
  monthFilter,
  yearFilter,
  startDate,
  endDate,
  anonymize,
  selectedCharts,
  chartOptions,
  analytics,
}: ExportPreviewProps) {
  const periodLabel =
    interval === 'Personalizado' && startDate && endDate
      ? `${startDate} a ${endDate}`
      : monthFilter !== 'all'
        ? `${monthFilter} ${yearFilter}`
        : `${interval} · ${yearFilter}`

  return (
    <div className="flex-1 overflow-y-auto p-5 bg-gray-50/50">
      <div className="bg-white rounded-xl border border-(--border-custom) shadow-sm max-w-2xl mx-auto">
        <div className="px-6 py-5 border-b border-(--border-custom)">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-(--text)">ImuneCare — Relatório Clínico</h2>
              <p className="text-[0.65rem] text-(--text-muted) mt-0.5">
                {periodLabel} · Gerado em {new Date().toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div className="text-[0.6rem] text-(--text-muted) text-right">
              <div>Modalidade: {modality === 'sub' ? 'Subcutânea' : 'Sublingual'}</div>
              {anonymize && (
                <div className="flex items-center gap-1 text-brand font-semibold mt-0.5 justify-end">
                  <EyeOff size={10} />
                  Dados anonimizados
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-6">
          {selectedCharts.length === 0 ? (
            <div className="text-center py-12 text-xs text-(--text-muted)">
              Selecione pelo menos um gráfico para visualizar a prévia.
            </div>
          ) : (
            selectedCharts.map((chartId) => {
              const chart = chartOptions.find((option) => option.id === chartId)
              return (
                <div key={chartId} className="border border-(--border-custom) rounded-lg p-4 relative z-20">
                  <h3 className="text-xs font-bold text-(--text) mb-3">{chart?.label}</h3>

                  {chartId === 'concentration' && (
                    <ConcentrationPieChart
                      data={analytics.concentrationData}
                      height={160}
                      innerRadius={35}
                      outerRadius={60}
                      showCounts
                    />
                  )}

                  {chartId === 'phases' && (
                    <PhasesBarChart data={analytics.phaseData} height={160} showValueLabels />
                  )}

                  {chartId === 'status' && (
                    <StatusLineChart data={analytics.statusData} height={160} showMonthSummary />
                  )}

                  {chartId === 'types' && (
                    <TypesProgressBars data={analytics.typeData} showCountsAlways />
                  )}

                  {chartId === 'volume' && (
                    <VolumeStackedBarChart data={analytics.volumeData} height={176} showValueLabels />
                  )}
                </div>
              )
            })
          )}
        </div>

        <div className="px-6 py-3 border-t border-(--border-custom)">
          <div className="flex justify-between mb-2">
            <span className="text-[0.6rem] text-(--text-muted)">ImuneCare © 2026</span>
            <span className="text-[0.6rem] text-(--text-muted)">Página 1 de 1</span>
          </div>
          <p className="text-[0.5rem] text-(--text-muted)/60 leading-relaxed mb-2">
            Este documento contém dados protegidos pela Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018). A reprodução, compartilhamento ou armazenamento não autorizado é estritamente proibido. O responsável pela exportação assume total responsabilidade pelo uso adequado das informações contidas neste relatório.
          </p>
          <div className="text-center py-1.5 bg-gray-50 rounded-md border border-(--border-custom)">
            <span className="text-[0.7rem] font-bold text-gray-300 uppercase tracking-[0.2em]">Confidencial</span>
          </div>
        </div>
      </div>
    </div>
  )
}
