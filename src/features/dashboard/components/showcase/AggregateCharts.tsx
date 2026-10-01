import { useState, type ReactNode } from 'react'
import { SHOWCASE } from '@/shared/components/showcase'
import { axisLabels, weekKey } from '@/features/dashboard/hooks/useChartWindow'
import type {
  CountEntry,
  PhaseDayEntry,
  StatusBucketEntry,
  VolumeConcentrationMatrix as VolumeMatrixData,
} from '@/features/dashboard/hooks/useDashboardAggregates'
import { ChartTooltip, HoverBands } from './ChartHover'

/** Par categórico validado (CVD + contraste) sobre a superfície #F6F8F8. */
const PHASE_SERIES = [
  { key: 'buildUp', label: 'Indução', color: '#6E9A2B' },
  { key: 'maintenance', label: 'Manutenção', color: '#0C86C9' },
] as const

/** Rampa sequencial (claro → escuro = menos → mais) para magnitude. */
const SEQUENTIAL_RAMP = ['#CCE9E4', '#A6D9D1', '#74C3B9', '#4FA99E', '#37877D']

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

export function ChartCaption({ children }: { children: ReactNode }) {
  return (
    <p className="mb-3 -mt-3 text-[0.66rem]" style={{ color: SHOWCASE.muted }}>
      {children}
    </p>
  )
}

/** Barras horizontais de magnitude — um tom único, valor rotulado direto. */
export function HBarList({
  data,
  unit,
}: {
  data: CountEntry[]
  unit: string
}) {
  const max = Math.max(...data.map((entry) => entry.count), 1)
  return (
    <div className="flex flex-col gap-2.5">
      {data.map((entry) => (
        <div key={entry.label} className="flex items-center gap-2.5">
          <span
            className="w-24 shrink-0 truncate text-[0.7rem] font-medium"
            style={{ color: SHOWCASE.inkSoft }}
            title={entry.label}
          >
            {entry.label}
          </span>
          <div
            className="h-3 flex-1 overflow-hidden rounded-full"
            style={{ background: SHOWCASE.cardInnerStrong }}
            role="img"
            aria-label={`${entry.label}: ${entry.count} ${unit} (${entry.pct}%)`}
          >
            <span
              className="block h-full rounded-full"
              style={{ width: `${Math.max((entry.count / max) * 100, 2)}%`, background: SHOWCASE.accent }}
            />
          </div>
          <span className="w-16 shrink-0 text-right text-[0.7rem] tabular-nums" style={{ color: SHOWCASE.ink }}>
            <span className="font-semibold">{entry.count}</span>
            <span style={{ color: SHOWCASE.muted }}> · {entry.pct}%</span>
          </span>
        </div>
      ))}
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

/** Matriz concentração × volume — rampa sequencial + contagem rotulada em cada célula. */
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
      <p className="text-[0.6rem] uppercase tracking-wide" style={{ color: SHOWCASE.muted }}>
        Tom mais escuro = mais aplicações no período
      </p>
    </div>
  )
}

/** Trio categórico validado (CVD + contraste ≥ 3:1) sobre a superfície #F6F8F8. */
const STATUS_SERIES = [
  { key: 'active', label: 'Ativas', color: '#0E9E8C' },
  { key: 'suspended', label: 'Suspensas', color: '#0774B8' },
  { key: 'completed', label: 'Concluídas', color: '#2E7D32' },
] as const

const STATUS_VIEW_W = 640
const STATUS_VIEW_H = 150

/** Linhas de contagem por status ao fim de cada semana/mês. */
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
          {STATUS_SERIES.map((status) => (
            <path
              key={status.key}
              d={series
                .map((row, index) => `${index === 0 ? 'M' : 'L'}${x(index)},${y(row[status.key])}`)
                .join(' ')}
              fill="none"
              stroke={status.color}
              strokeWidth="2"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {series.map((row, index) =>
            series.length <= 14 || hover === index
              ? STATUS_SERIES.map((status) => (
                  <circle
                    key={`${status.key}-${row.date}`}
                    cx={x(index)}
                    cy={y(row[status.key])}
                    r={hover === index ? 4 : 2.5}
                    fill={status.color}
                    stroke={SHOWCASE.card}
                    strokeWidth="1.5"
                    vectorEffect="non-scaling-stroke"
                  />
                ))
              : null,
          )}
        </svg>

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

/** Barras empilhadas por dia (ou semana, em janelas longas): indução vs manutenção. */
export function PhaseStackChart({ series }: { series: PhaseDayEntry[] }) {
  const rows = series.length > 60 ? bucketByWeek(series) : series
  const max = Math.max(...rows.map((row) => row.buildUp + row.maintenance), 1)
  const [hover, setHover] = useState<number | null>(null)
  const hovered = hover !== null ? rows[hover] : undefined

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-4">
        {PHASE_SERIES.map((phase) => (
          <span key={phase.key} className="flex items-center gap-1.5 text-[0.66rem] font-medium" style={{ color: SHOWCASE.inkSoft }}>
            <span className="h-2 w-2 rounded-full" style={{ background: phase.color }} />
            {phase.label}
          </span>
        ))}
      </div>

      <div className="relative flex h-36 items-end gap-[3px]">
        {rows.map((row, index) => {
          const total = row.buildUp + row.maintenance
          const dimmed = hover !== null && hover !== index
          return (
            <div key={row.date} className="flex h-full flex-1 flex-col justify-end gap-[2px]" style={{ opacity: dimmed ? 0.45 : 1 }}>
              {row.maintenance > 0 && (
                <span
                  className="w-full rounded-[3px]"
                  style={{ height: `${(row.maintenance / max) * 100}%`, background: PHASE_SERIES[1].color, minHeight: 3 }}
                />
              )}
              {row.buildUp > 0 && (
                <span
                  className="w-full rounded-[3px]"
                  style={{ height: `${(row.buildUp / max) * 100}%`, background: PHASE_SERIES[0].color, minHeight: 3 }}
                />
              )}
              {total === 0 && <span className="w-full rounded-[3px]" style={{ height: 2, background: SHOWCASE.cardInnerStrong }} />}
            </div>
          )
        })}

        <HoverBands count={rows.length} onHover={setHover} />

        {hovered && hover !== null && (
          <ChartTooltip
            leftPct={((hover + 0.5) / rows.length) * 100}
            topPct={100 - ((hovered.buildUp + hovered.maintenance) / max) * 100}
            label={hovered.label}
          >
            Indução: {hovered.buildUp.toLocaleString('pt-BR')}
            <span className="opacity-70"> · Manutenção: {hovered.maintenance.toLocaleString('pt-BR')}</span>
          </ChartTooltip>
        )}
      </div>

      <div className="flex items-center justify-between text-[0.62rem] font-medium" style={{ color: SHOWCASE.muted }}>
        {axisLabels(rows.map((row) => row.label), 8).map((label, index) => (
          <span key={`${label}-${index}`} className="flex-1 text-center">
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}
