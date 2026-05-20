import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { CONCENTRATION_COLORS } from '@/features/dashboard/constants/chart-colors'
import { CHART_TOOLTIP_STYLE, CHART_TOOLTIP_CURSOR } from './chart-tooltip-style'

interface ConcentrationDatum {
  name: string
  value: number
}

interface ConcentrationPieChartProps {
  data: ConcentrationDatum[]
  height?: number
  innerRadius?: number
  outerRadius?: number
  showCounts?: boolean
}

const FALLBACK_COLOR = '#94a3b8'

export function ConcentrationPieChart({
  data,
  height = 192,
  innerRadius = 45,
  outerRadius = 75,
  showCounts = false,
}: ConcentrationPieChartProps) {
  return (
    <>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={innerRadius} outerRadius={outerRadius} paddingAngle={3} dataKey="value" stroke="none">
              {data.map((entry) => (
                <Cell key={entry.name} fill={CONCENTRATION_COLORS[entry.name] || FALLBACK_COLOR} />
              ))}
            </Pie>
            <Tooltip contentStyle={CHART_TOOLTIP_STYLE} cursor={CHART_TOOLTIP_CURSOR} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-3 mt-2">
        {data.map((datum) => (
          <div key={datum.name} className="flex items-center gap-1.5 text-[0.6rem] text-(--text-muted)">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CONCENTRATION_COLORS[datum.name] || FALLBACK_COLOR }} />
            {datum.name}
            {showCounts && <span className="font-semibold text-(--text)">({datum.value})</span>}
          </div>
        ))}
      </div>
    </>
  )
}
