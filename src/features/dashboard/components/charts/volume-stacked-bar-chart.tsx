import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { VOLUME_KEYS, VOLUME_COLORS } from '@/features/dashboard/constants/chart-colors'
import { CHART_TOOLTIP_STYLE, CHART_TOOLTIP_CURSOR } from './chart-tooltip-style'

interface VolumeStackedBarChartProps {
  data: Array<Record<string, string | number>>
  height?: number
  showValueLabels?: boolean
}

export function VolumeStackedBarChart({ data, height = 208, showValueLabels = false }: VolumeStackedBarChartProps) {
  const ariaLabel = `Gráfico de barras empilhadas: volume de aplicações por concentração. ${data
    .map((d) => `Concentração ${d['conc']}: ${VOLUME_KEYS.map((k) => `${k} ${d[k]}`).join(', ')}`)
    .join('; ')}.`

  return (
    <>
      <div style={{ height }} role="img" aria-label={ariaLabel}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" tick={{ fontSize: 10 }} />
            <YAxis type="category" dataKey="conc" tick={{ fontSize: 10 }} width={60} />
            <Tooltip contentStyle={CHART_TOOLTIP_STYLE} cursor={CHART_TOOLTIP_CURSOR} />
            {VOLUME_KEYS.map((key, index) => {
              const isLast = index === VOLUME_KEYS.length - 1
              const labelFill = ['#374151', '#374151', '#fff', '#fff', '#fff'][index]
              return (
                <Bar
                  key={key}
                  dataKey={key}
                  stackId="a"
                  fill={VOLUME_COLORS[key]}
                  radius={isLast ? [0, 3, 3, 0] : 0}
                  label={showValueLabels ? { position: 'center', fontSize: 9, fill: labelFill } : undefined}
                />
              )
            })}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-3 mt-2">
        {VOLUME_KEYS.map((key) => (
          <div key={key} className="flex items-center gap-1.5 text-[0.6rem] text-(--text-muted)">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: VOLUME_COLORS[key] }} />
            {key}
          </div>
        ))}
      </div>
    </>
  )
}
