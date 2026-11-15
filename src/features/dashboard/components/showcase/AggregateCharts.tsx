import { useId, useState, type ReactNode } from 'react'
import { SHOWCASE } from '@/shared/components/showcase'
import { axisLabels, todayIndex, weekKey } from '@/features/dashboard/hooks/useChartWindow'
import type {
  CountEntry,
  PhaseDayEntry,
  StatusBucketEntry,
  VolumeConcentrationMatrix as VolumeMatrixData,
} from '@/features/dashboard/hooks/useDashboardAggregates'
import { ChartTooltip, HoverBands } from './ChartHover'
import { smoothPath, type Point } from './smooth-path'


const PHASE_SERIES = [
  { key: 'buildUp', label: 'Indução', color: '#74C3B9', trend: '#12A594' },
  { key: 'maintenance', label: 'Manutenção', color: '#B7E06A', trend: '#7CB518' },
] as const


const SEQUENTIAL_RAMP = ['#CCE9E4', '#A6D9D1', '#74C3B9', '#4FA99E', '#37877D']





const ORDINAL_RAMP = ['#4C9A8F', '#36887F', '#257E8C', '#1C5A66', '#12333A']





const LIME_RAMP = ['#8DBE2A', '#6FA018', '#558014', '#3F6412', '#2A4A11']

export function ChartState({
  loading,
  error,
  empty,
  emptyText,
  children,
}: {
  loading: boolean
  error?: boolean
  empty: boolean
  emptyText: string
  children: ReactNode
}) {
  if (error) {
    return (
      <div className="flex h-full min-h-32 items-center justify-center px-6 text-center text-[0.72rem]" style={{ color: SHOWCASE.muted }}>
        Não foi possível carregar o indicador.
      </div>
    )
  }
  if (loading) {
    return (
      <div className="flex h-full min-h-32 items-center justify-center text-[0.72rem]" style={{ color: SHOWCASE.muted }}>
        Carregando…
      </div>
    )
  }
  if (empty) {
    return (
      <div className="flex h-full min-h-32 items-center justify-center px-6 text-center text-[0.72rem]" style={{ color: SHOWCASE.muted }}>
        {emptyText}
      </div>
    )
  }
  return <>{children}</>
}

export function ChartCaption({ children, size = '0.66rem' }: { children: ReactNode; size?: string }) {
  return (
    <p className="mb-6 -mt-3 leading-snug" style={{ color: SHOWCASE.muted, fontSize: size }}>
      {children}
    </p>
  )
}







const RING_VIEW_W = 220
const RING_VIEW_H = 104
const RING_RADIUS = 92
const RING_STROKE = 14
const RING_CENTER_X = RING_VIEW_W / 2
const RING_BASELINE = 104
const RING_ARC = `M${RING_CENTER_X - RING_RADIUS},${RING_BASELINE} A${RING_RADIUS},${RING_RADIUS} 0 0 1 ${RING_CENTER_X + RING_RADIUS},${RING_BASELINE}`
const RING_SEMICIRCLE = Math.PI * RING_RADIUS

function ConcentrationRing({ rows, unit }: { rows: { entry: CountEntry; color: string }[]; unit: string }) {
  const total = rows.reduce((sum, { entry }) => sum + entry.count, 0)
  const clipId = useId()

  const segments = rows.reduce<{ entry: CountEntry; color: string; length: number; offset: number }[]>(
    (acc, row) => {
      const length = total > 0 ? (row.entry.count / total) * RING_SEMICIRCLE : 0
      const previousOffset = acc.length > 0 ? acc[acc.length - 1].offset + acc[acc.length - 1].length : 0
      acc.push({ ...row, length, offset: previousOffset })
      return acc
    },
    [],
  )

  return (
    <div className="mt-auto flex flex-col items-center pt-4 -mb-5">
      <div className="relative w-full max-w-[18rem]">
        <svg
          viewBox={`0 0 ${RING_VIEW_W} ${RING_VIEW_H}`}
          className="w-full"
          style={{ overflow: 'visible' }}
          role="img"
          aria-label={`Total: ${total} ${unit}`}
        >
          <defs>
            <clipPath id={clipId}>
              <rect x={0} y={0} width={RING_VIEW_W} height={RING_BASELINE} />
            </clipPath>
          </defs>
          <g clipPath={`url(#${clipId})`}>
            <path
              d={RING_ARC}
              fill="none"
              stroke={SHOWCASE.cardInnerStrong}
              strokeWidth={RING_STROKE}
              strokeLinecap="round"
            />
            {segments.map(({ entry, color, length, offset }) => (
              <path
                key={entry.label}
                d={RING_ARC}
                fill="none"
                stroke={color}
                strokeWidth={RING_STROKE}
                strokeLinecap="round"
                strokeDasharray={`${length} ${RING_SEMICIRCLE}`}
                strokeDashoffset={-offset}
              />
            ))}
          </g>
        </svg>

        <div className="absolute inset-x-0 bottom-5 flex flex-col items-center gap-0.5">
          <span
            className="text-[1.9rem] font-medium leading-none tracking-tight tabular-nums"
            style={{ color: SHOWCASE.ink }}
          >
            {total}
          </span>
          <span className="text-[0.62rem] font-semibold uppercase tracking-wide" style={{ color: SHOWCASE.muted }}>
            {unit}
          </span>
        </div>
      </div>
    </div>
  )
}

export function HBarList({
  data,
  unit,
  palette = 'ordinal',
  showRing = true,
}: {
  data: CountEntry[]
  unit: string
  palette?: 'ordinal' | 'lime'
  showRing?: boolean
}) {
  const ramp = palette === 'lime' ? LIME_RAMP : ORDINAL_RAMP
  const rows = data.map((entry, index) => {
    const step =
      data.length <= 1 ? 1 : Math.round((index / (data.length - 1)) * (ramp.length - 1))
    return { entry, color: ramp[step] }
  })

  return (
    <div className="flex flex-1 flex-col gap-2.5">
      {rows.map(({ entry, color }) => (
        <div key={entry.label} className="flex items-center gap-2.5">
          <span
            className="flex w-28 shrink-0 items-center gap-1.5 text-[0.7rem] font-medium"
            style={{ color: SHOWCASE.inkSoft }}
            title={entry.label}
          >
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: color }} />
            <span className="truncate">{entry.label}</span>
          </span>
          <div
            className="h-3 flex-1 overflow-hidden rounded-full"
            style={{ background: SHOWCASE.cardInnerStrong }}
            role="img"
            aria-label={`${entry.label}: ${entry.count} ${unit} (${entry.pct}%)`}
          >
            <span
              className="block h-full rounded-full"
              style={{ width: `${Math.max(entry.pct, 2)}%`, background: color }}
            />
          </div>
          <span className="w-16 shrink-0 text-right text-[0.7rem] tabular-nums" style={{ color: SHOWCASE.ink }}>
            <span className="font-semibold">{entry.count}</span>
            <span style={{ color: SHOWCASE.muted }}> · {entry.pct}%</span>
          </span>
        </div>
      ))}

      {showRing && <ConcentrationRing rows={rows} unit={unit} />}
    </div>
  )
}

function matrixCellColor(count: number, max: number): string | undefined {
  if (count === 0 || max === 0) return undefined
  const step = Math.min(
    SEQUENTIAL_RAMP.length - 1,
    Math.floor((count / max) * SEQUENTIAL_RAMP.length),
  )
  return SEQUENTIAL_RAMP[step]
}

function matrixCellInk(count: number, max: number): string {
  if (count === 0 || max === 0) return SHOWCASE.muted
  const step = Math.min(
    SEQUENTIAL_RAMP.length - 1,
    Math.floor((count / max) * SEQUENTIAL_RAMP.length),
  )
  return step >= 3 ? SHOWCASE.white : SHOWCASE.ink
}


export function VolumeConcentrationHeatmap({ matrix }: { matrix: VolumeMatrixData }) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `minmax(4.5rem,auto) repeat(${matrix.volumes.length}, minmax(0,1fr))` }}
      >
        <span />
        {matrix.volumes.map((volume) => (
          <span
            key={volume}
            className="truncate text-center text-[0.62rem] font-semibold"
            style={{ color: SHOWCASE.muted }}
            title={volume}
          >
            {volume}
          </span>
        ))}
        {matrix.concentrations.map((conc, row) => (
          <div key={conc} className="contents">
            <span
              className="truncate self-center text-[0.66rem] font-medium"
              style={{ color: SHOWCASE.inkSoft }}
              title={conc}
            >
              {conc}
            </span>
            {matrix.volumes.map((volume, col) => {
              const count = matrix.counts[row][col]
              return (
                <span
                  key={volume}
                  className="flex h-9 items-center justify-center rounded-lg text-[0.68rem] font-semibold tabular-nums"
                  style={{
                    background: matrixCellColor(count, matrix.max) ?? 'transparent',
                    border: count === 0 ? `1px dashed ${SHOWCASE.line}` : '1px solid transparent',
                    color: matrixCellInk(count, matrix.max),
                  }}
                  title={`${conc} · ${volume}: ${count} ${count === 1 ? 'aplicação' : 'aplicações'}`}
                >
                  {count > 0 ? count : ''}
                </span>
              )
            })}
          </div>
        ))}
      </div>
      <p className="text-center text-[0.6rem] uppercase tracking-wide" style={{ color: SHOWCASE.muted }}>
        Tom mais escuro = mais aplicações no período
      </p>
    </div>
  )
}


const STATUS_SERIES = [
  { key: 'active', label: 'Ativas', color: '#0E9E8C' },
  { key: 'suspended', label: 'Suspensas', color: '#FF8C69' },
  { key: 'completed', label: 'Concluídas', color: '#00E0D1' },
] as const

const STATUS_VIEW_W = 640
const STATUS_VIEW_H = 150


export function StatusHistoryChart({ series }: { series: StatusBucketEntry[] }) {
  const max = Math.max(
    ...series.flatMap((row) => [row.active, row.suspended, row.completed]),
    1,
  )
  const stepX = (STATUS_VIEW_W - 12) / Math.max(series.length - 1, 1)
  const x = (index: number) => 6 + index * stepX
  const y = (value: number) =>
    STATUS_VIEW_H - 10 - (value / max) * (STATUS_VIEW_H - 24)

  const [hover, setHover] = useState<number | null>(null)
  const hovered = hover !== null ? series[hover] : undefined

  const paths = STATUS_SERIES.map((status) => {
    const points: Point[] = series.map((row, index) => ({
      x: x(index),
      y: y(row[status.key]),
    }))
    const line = smoothPath(points)
    const last = points[points.length - 1]
    const first = points[0]
    return {
      status,
      line,
      area: line ? `${line} L${last.x},${STATUS_VIEW_H} L${first.x},${STATUS_VIEW_H} Z` : '',
    }
  })

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-4">
        {STATUS_SERIES.map((status) => (
          <span
            key={status.key}
            className="flex items-center gap-1.5 text-[0.66rem] font-medium"
            style={{ color: SHOWCASE.inkSoft }}
          >
            <span className="h-2 w-2 rounded-full" style={{ background: status.color }} />
            {status.label}
          </span>
        ))}
      </div>

      <div className="relative h-40">
        <svg
          viewBox={`0 0 ${STATUS_VIEW_W} ${STATUS_VIEW_H}`}
          className="h-full w-full"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            {paths.map(({ status }) => (
              <linearGradient key={status.key} id={`status-fade-${status.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={status.color} stopOpacity="0.28" />
                <stop offset="100%" stopColor={status.color} stopOpacity="0" />
              </linearGradient>
            ))}
          </defs>

          {paths.map(({ status, area }) => (
            <path key={`${status.key}-area`} d={area} fill={`url(#status-fade-${status.key})`} stroke="none" />
          ))}

          {paths.map(({ status, line }) => (
            <path
              key={status.key}
              d={line}
              fill="none"
              stroke={status.color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>

        {                                                                                    }
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          {series.map((row, index) =>
            series.length <= 14 || hover === index
              ? STATUS_SERIES.map((status) => {
                  const size = hover === index ? 9 : 6
                  return (
                    <span
                      key={`${status.key}-${row.date}`}
                      className="absolute rounded-full"
                      style={{
                        left: `${(x(index) / STATUS_VIEW_W) * 100}%`,
                        top: `${(y(row[status.key]) / STATUS_VIEW_H) * 100}%`,
                        width: size,
                        height: size,
                        marginLeft: -size / 2,
                        marginTop: -size / 2,
                        background: status.color,
                        border: `1.5px solid ${SHOWCASE.white}`,
                      }}
                    />
                  )
                })
              : null,
          )}
        </div>

        <HoverBands count={series.length} onHover={setHover} />

        {hovered && hover !== null && (
          <ChartTooltip
            leftPct={(x(hover) / STATUS_VIEW_W) * 100}
            topPct={
              (Math.min(...STATUS_SERIES.map((status) => y(hovered[status.key]))) /
                STATUS_VIEW_H) *
              100
            }
            label={hovered.label}
          >
            {STATUS_SERIES.map((status, index) => (
              <span key={status.key}>
                {index > 0 && <span className="opacity-50"> · </span>}
                {status.label}: {hovered[status.key].toLocaleString('pt-BR')}
              </span>
            ))}
          </ChartTooltip>
        )}
      </div>

      <div className="flex items-center justify-between text-[0.62rem] font-medium" style={{ color: SHOWCASE.muted }}>
        {axisLabels(series.map((row) => row.label), 12).map((label, index) => (
          <span key={`${label}-${index}`} className="flex-1 text-center">
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}

function bucketByWeek(series: PhaseDayEntry[]): PhaseDayEntry[] {
  const buckets = new Map<string, PhaseDayEntry>()
  for (const entry of series) {
    const [year, month, day] = entry.date.split('-').map(Number)
    const key = weekKey(new Date(year, month - 1, day))
    const bucket = buckets.get(key)
    if (bucket) {
      bucket.buildUp += entry.buildUp
      bucket.maintenance += entry.maintenance
    } else {
      buckets.set(key, {
        date: key,
        label: `Sem. ${key.slice(8, 10)}/${key.slice(5, 7)}`,
        buildUp: entry.buildUp,
        maintenance: entry.maintenance,
      })
    }
  }
  return [...buckets.values()]
}

export type PhaseGranularity = 'day' | 'week'
export type PhaseFilterKey = 'all' | 'buildUp' | 'maintenance'


function PhaseSparkline({
  values,
  labels,
  color,
  hover,
  onHover,
  highlightIndex,
}: {
  values: number[]
  labels: string[]
  color: string
  hover: number | null
  onHover: (index: number | null) => void
  highlightIndex: number | null
}) {
  const viewW = 200
  const viewH = 56
  const gradientId = useId()
  const min = Math.min(...values)
  const max = Math.max(...values, min + 1)
  const stepX = viewW / Math.max(values.length - 1, 1)
  const points: Point[] = values.map((value, index) => ({
    x: values.length <= 1 ? viewW / 2 : index * stepX,
    y: viewH - 6 - ((value - min) / (max - min || 1)) * (viewH - 12),
  }))
  const line = smoothPath(points)
  const area = `${line} L${points[points.length - 1].x},${viewH} L${points[0].x},${viewH} Z`
  const displayIndex = hover ?? highlightIndex
  const hoveredPoint = displayIndex !== null ? points[displayIndex] : undefined

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${viewW} ${viewH}`} className="h-9 w-full" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#${gradientId})`} stroke="none" />
        <path
          d={line}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        {hoveredPoint && (
          <line
            x1={hoveredPoint.x}
            y1={0}
            x2={hoveredPoint.x}
            y2={viewH}
            stroke={SHOWCASE.muted}
            strokeWidth="1"
            strokeDasharray="3 3"
            vectorEffect="non-scaling-stroke"
            opacity={0.5}
          />
        )}
      </svg>

      <HoverBands count={values.length} onHover={onHover} />

      {hoveredPoint && displayIndex !== null && (
        <ChartTooltip
          leftPct={(hoveredPoint.x / viewW) * 100}
          topPct={(hoveredPoint.y / viewH) * 100}
          label={labels[displayIndex]}
        >
          {values[displayIndex].toLocaleString('pt-BR')}
        </ChartTooltip>
      )}
    </div>
  )
}

export function PhaseStackChart({
  series,
  granularity = 'auto',
  visiblePhase = 'all',
}: {
  series: PhaseDayEntry[]

  granularity?: PhaseGranularity | 'auto'
  visiblePhase?: PhaseFilterKey
}) {
  const byWeek = granularity === 'week' || (granularity === 'auto' && series.length > 60)
  const rows = byWeek ? bucketByWeek(series) : series
  const visibleKeys = (visiblePhase === 'all' ? ['buildUp', 'maintenance'] : [visiblePhase]) as (
    'buildUp' | 'maintenance'
  )[]

  const latest = rows[rows.length - 1] ?? { buildUp: 0, maintenance: 0 }
  const earliest = rows[0] ?? latest
  const totalLatest = latest.buildUp + latest.maintenance
  const buildUpPct = totalLatest > 0 ? Math.round((latest.buildUp / totalLatest) * 100) : 0
  const maintenancePct = totalLatest > 0 ? 100 - buildUpPct : 0
  const [hover, setHover] = useState<number | null>(null)
  const labels = rows.map((row) => row.label)
  const todayIdx = todayIndex(rows)
  const highlightIndex = todayIdx >= 0 ? todayIdx : null

  return (
    <div className="flex flex-col gap-4">
      {totalLatest > 0 && (
        <div className="flex items-center" style={{ color: SHOWCASE.ink }}>
          <span className="text-[1.1rem] font-semibold" style={{ width: `${buildUpPct}%` }}>
            {buildUpPct}
            <span className="text-[0.6em] font-normal">%</span>
          </span>
          <span className="text-right text-[1.1rem] font-semibold" style={{ width: `${maintenancePct}%` }}>
            {maintenancePct}
            <span className="text-[0.6em] font-normal">%</span>
          </span>
        </div>
      )}
      <div className="-mt-2 flex h-2.5 w-full overflow-hidden rounded-full" style={{ background: SHOWCASE.cardInnerStrong }}>
        {totalLatest > 0 ? (
          <>
            <span className="h-full" style={{ width: `${buildUpPct}%`, background: PHASE_SERIES[0].color }} />
            <span className="h-full" style={{ width: `${maintenancePct}%`, background: PHASE_SERIES[1].color }} />
          </>
        ) : (
          <span className="h-full w-full" style={{ background: SHOWCASE.muted, opacity: 0.3 }} />
        )}
      </div>

      <div className={visibleKeys.length > 1 ? 'grid grid-cols-2 gap-4' : 'grid grid-cols-1 gap-4'}>
        {visibleKeys.map((key) => {
          const phase = PHASE_SERIES.find((entry) => entry.key === key)!
          const delta = latest[key] - earliest[key]
          const deltaColor = delta > 0 ? '#1A9E6B' : delta < 0 ? '#D14343' : SHOWCASE.muted
          return (
            <div key={key} className="rounded-xl border p-4" style={{ borderColor: SHOWCASE.line }}>
              <span
                className="flex items-center gap-1.5 text-[0.72rem] font-medium tracking-wide"
                style={{ color: SHOWCASE.inkSoft }}
              >
                <span className="h-2 w-2 rounded-full" style={{ background: phase.color }} />
                {phase.label}
              </span>
              <div
                className="mt-1 text-[2.1rem] font-medium leading-none tracking-tight tabular-nums"
                style={{ color: SHOWCASE.ink }}
              >
                {latest[key].toLocaleString('pt-BR')}
              </div>
              <p className="mt-1.5 text-[0.7rem]" style={{ color: SHOWCASE.muted }}>
                {delta === 0 ? (
                  'sem variação'
                ) : (
                  <span className="font-semibold" style={{ color: deltaColor }}>
                    {delta > 0 ? '+' : ''}
                    {delta}
                  </span>
                )}
                {delta !== 0 && ` em ${rows.length} dias`}
              </p>
              <div className="mt-2">
                <PhaseSparkline
                  values={rows.map((row) => row[key])}
                  labels={labels}
                  color={phase.trend}
                  hover={hover}
                  onHover={setHover}
                  highlightIndex={highlightIndex}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
