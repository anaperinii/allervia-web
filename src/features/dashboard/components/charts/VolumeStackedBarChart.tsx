import { BarChart, Bar, Cell, LabelList, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { VOLUME_KEYS, CONCENTRATION_VOLUME_COLORS, VOLUME_LEGEND_COLORS, type VolumeKey } from '@/features/dashboard/constants/chart-colors'
import { CHART_TOOLTIP_STYLE, CHART_TOOLTIP_CURSOR } from './chart-tooltip-style'

interface VolumeStackedBarChartProps {
  data: Array<Record<string, string | number>>
  height?: number
  showValueLabels?: boolean
}

const FALLBACK_COLOR = '#94a3b8'

interface ValueLabelProps {
  x?: number | string
  y?: number | string
  width?: number | string
  height?: number | string
  value?: number | string
}

// draw the volume (in ml) centered inside each segment; skip empty or too-small cells
function renderVolumeLabel({ x, y, width, height, value }: ValueLabelProps, volume: VolumeKey) {
  const count = Number(value)
  const w = Number(width)
  const h = Number(height)
  if (!count || w < 26 || h < 9) return null
  return (
    <text
      x={Number(x) + w / 2}
      y={Number(y) + h / 2}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={9}
      fontWeight={700}
      fill="#374151"
    >
      {volume}
    </text>
  )
}

interface VolumeTooltipProps {
  active?: boolean
  label?: string
  payload?: Array<{ dataKey?: string | number; value?: number }>
}

function VolumeTooltip({ active, label, payload }: VolumeTooltipProps) {
  if (!active || !label || !payload?.length) return null
  const ramp = CONCENTRATION_VOLUME_COLORS[label]
  const rows = payload.filter((entry) => Number(entry.value) > 0)
  if (!rows.length) return null
  return (
    <div
      className="chart-tooltip"
      style={{ ...CHART_TOOLTIP_STYLE, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}
    >
      <div style={{ fontWeight: 600, marginBottom: 2 }}>{label}</div>
      {rows.map((entry) => {
        const key = String(entry.dataKey) as VolumeKey
        return (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: 9999, background: ramp?.[key] || FALLBACK_COLOR, display: 'inline-block' }} />
            <span>{key}</span>
            <span style={{ marginLeft: 12, fontWeight: 600 }}>{entry.value}</span>
          </div>
        )
      })}
    </div>
  )
}

export function VolumeStackedBarChart({ data, height = 208, showValueLabels = true }: VolumeStackedBarChartProps) {
  return (
    <>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
            <YAxis type="category" dataKey="conc" tick={{ fontSize: 10 }} width={60} />
            <Tooltip content={<VolumeTooltip />} cursor={CHART_TOOLTIP_CURSOR} />
            {VOLUME_KEYS.map((key) => {
              return (
                <Bar key={key} dataKey={key} stackId="a" barSize={22}>
                  {data.map((row) => {
                    const ramp = CONCENTRATION_VOLUME_COLORS[String(row.conc)]
                    // Round only the ends that actually exist in this row's stack.
                    const filled = VOLUME_KEYS.filter((volume) => Number(row[volume]) > 0)
                    const isRowFirst = filled[0] === key
                    const isRowLast = filled[filled.length - 1] === key
                    const radius: [number, number, number, number] = [
                      isRowFirst ? 8 : 0,
                      isRowLast ? 8 : 0,
                      isRowLast ? 8 : 0,
                      isRowFirst ? 8 : 0,
                    ]
                    return (
                      <Cell
                        key={String(row.conc)}
                        fill={ramp?.[key] || FALLBACK_COLOR}
                        {...({ radius } as unknown as { radius: number })}
                      />
                    )
                  })}
                  {showValueLabels && (
                    <LabelList dataKey={key} content={(props) => renderVolumeLabel(props as ValueLabelProps, key)} />
                  )}
                </Bar>
              )
            })}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-col items-center gap-1 mt-2">
        <span className="text-[0.55rem] uppercase tracking-wide text-(--text-muted)">
          Volume — tom mais escuro = mais volume
        </span>
        <div className="flex justify-center gap-3">
          {VOLUME_KEYS.map((key) => (
            <div key={key} className="flex items-center gap-1.5 text-[0.6rem] text-(--text-muted)">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: VOLUME_LEGEND_COLORS[key] }} />
              {key}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
