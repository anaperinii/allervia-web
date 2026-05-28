import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { PHASE_KEYS, PHASE_LABELS, PHASE_COLORS } from '@/features/dashboard/constants/chart-colors'
import { CHART_TOOLTIP_STYLE, CHART_TOOLTIP_CURSOR } from './chart-tooltip-style'

interface PhaseDatum {
  month: string
  induction: number
  maintenance: number
}

interface PhasesBarChartProps {
  data: PhaseDatum[]
  height?: number
  showValueLabels?: boolean
}

export function PhasesBarChart({ data, height = 192, showValueLabels = false }: PhasesBarChartProps) {
  const ariaLabel = `Gráfico de barras: fases do tratamento por mês. ${data
    .map((d) => `${d.month}: indução ${d.induction}, manutenção ${d.maintenance}`)
    .join('; ')}.`

  return (
    <>
      <div style={{ height }} role="img" aria-label={ariaLabel}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={CHART_TOOLTIP_STYLE} cursor={CHART_TOOLTIP_CURSOR} />
            {PHASE_KEYS.map((key) => (
              <Bar
                key={key}
                dataKey={key}
                name={PHASE_LABELS[key]}
                fill={PHASE_COLORS[key]}
                radius={[3, 3, 0, 0]}
                label={showValueLabels ? { position: 'top', fontSize: 9, fill: '#6b7280' } : undefined}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-4 mt-2">
        {PHASE_KEYS.map((key) => {
          const total = data.reduce((sum, datum) => sum + datum[key], 0)
          return (
            <div key={key} className="flex items-center gap-1.5 text-[0.6rem] text-(--text-muted)">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PHASE_COLORS[key] }} />
              {PHASE_LABELS[key]}
              {showValueLabels && <span className="font-semibold text-(--text)">({total})</span>}
            </div>
          )
        })}
      </div>
    </>
  )
}
