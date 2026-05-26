import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import {
  TREATMENT_STATUS_KEYS,
  TREATMENT_STATUS_LABELS,
  TREATMENT_STATUS_COLORS,
} from '@/features/dashboard/constants/chart-colors'
import { CHART_TOOLTIP_STYLE, CHART_TOOLTIP_CURSOR } from './chart-tooltip-style'

interface StatusDatum {
  month: string
  active: number
  interrupted: number
  completed: number
}

interface StatusLineChartProps {
  data: StatusDatum[]
  height?: number
  showMonthSummary?: boolean
}

export function StatusLineChart({ data, height = 192, showMonthSummary = false }: StatusLineChartProps) {
  const ariaLabel = `Gráfico de linha: evolução do status de tratamento. ${data
    .map((d) => `${d.month}: ativos ${d.active}, interrompidos ${d.interrupted}, concluídos ${d.completed}`)
    .join('; ')}.`

  return (
    <>
      <div style={{ height }} role="img" aria-label={ariaLabel}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={CHART_TOOLTIP_STYLE} cursor={CHART_TOOLTIP_CURSOR} />
            {TREATMENT_STATUS_KEYS.map((key) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                name={TREATMENT_STATUS_LABELS[key]}
                stroke={TREATMENT_STATUS_COLORS[key]}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-4 mt-2">
        {TREATMENT_STATUS_KEYS.map((key) => (
          <div key={key} className="flex items-center gap-1.5 text-[0.6rem] text-(--text-muted)">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: TREATMENT_STATUS_COLORS[key] }} />
            {TREATMENT_STATUS_LABELS[key]}
          </div>
        ))}
      </div>
      {showMonthSummary && (
        <div className="grid grid-cols-4 gap-2 mt-3">
          {data.map((datum) => (
            <div key={datum.month} className="bg-gray-50 rounded-lg px-2.5 py-2 text-center">
              <div className="text-[0.6rem] font-semibold text-(--text-muted) mb-1">{datum.month}</div>
              <div className="flex justify-center gap-2">
                {TREATMENT_STATUS_KEYS.map((key) => (
                  <span key={key} className="text-[0.55rem] font-bold" style={{ color: TREATMENT_STATUS_COLORS[key] }}>
                    {datum[key]}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
