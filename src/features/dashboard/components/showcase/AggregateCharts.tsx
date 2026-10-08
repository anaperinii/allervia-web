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
import { smoothPath, type Point } from './smooth-path'

/** Mesmas cores de fase do Lab de Protocolos (`PHASE_VIEW`). */
const PHASE_SERIES = [
  { key: 'buildUp', label: 'Indução', color: '#74C3B9', trend: '#12A594' },
  { key: 'maintenance', label: 'Manutenção', color: '#B7E06A', trend: '#7CB518' },
] as const

/** Rampa sequencial (claro → escuro = menos → mais) para magnitude. */
const SEQUENTIAL_RAMP = ['#CCE9E4', '#A6D9D1', '#74C3B9', '#4FA99E', '#37877D']

/**
 * Rampa ordinal da marca — passos do mais claro ao mais escuro, todos ≥ 3:1
 * sobre a superfície branca. Ordem da categoria = posição na rampa.
 */
const ORDINAL_RAMP = ['#4C9A8F', '#36887F', '#257E8C', '#1C5A66', '#12333A']

/**
 * Rampa ordinal ancorada no verde-limão da marca — mesmo matiz (spread 7°),
 * clara → escura, ponta clara ≥ 2:1 sobre a superfície branca.
 */
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

export function ChartCaption({ children }: { children: ReactNode }) {
  return (
    <p className="mb-6 -mt-3 leading-snug text-[0.66rem]" style={{ color: SHOWCASE.muted }}>
      {children}
    </p>
  )
}

/**
 * Barras horizontais de magnitude com valor rotulado direto.
 * `palette`: `ordinal` (teal da marca) quando a ordem da categoria tem
 * significado próprio — concentração crescente; `lime` quando a lista vem
 * ordenada por contagem e o passo mais escuro deve marcar o maior volume.
 */
export function HBarList({
  data,
  unit,
  palette = 'ordinal',
}: {
  data: CountEntry[]
  unit: string
  palette?: 'ordinal' | 'lime'
}) {
  const max = Math.max(...data.map((entry) => entry.count), 1)
  const ramp = palette === 'lime' ? LIME_RAMP : ORDINAL_RAMP
  const rows = data.map((entry, index) => {
    const step =
      data.length <= 1 ? 1 : Math.round((index / (data.length - 1)) * (ramp.length - 1))
    return { entry, color: ramp[step] }
  })

  return (
    <div className="flex flex-col gap-2.5">
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
              style={{ width: `${Math.max((entry.count / max) * 100, 2)}%`, background: color }}
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
      <p className="text-center text-[0.6rem] uppercase tracking-wide" style={{ color: SHOWCASE.muted }}>
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

        {/* Marcadores em HTML: o SVG estica sem manter proporção e achataria os círculos. */}
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

const PHASE_VIEW_W = 640
const PHASE_VIEW_H = 144

export type PhaseGranularity = 'day' | 'week'
export type PhaseFilterKey = 'all' | 'buildUp' | 'maintenance'

/** Barras empilhadas por dia (ou semana, em janelas longas): indução vs manutenção. */
export function PhaseStackChart({
  series,
  granularity = 'auto',
  visiblePhase = 'all',
}: {
  series: PhaseDayEntry[]
  /** `auto` agrupa por semana só quando a janela passa de 60 dias. */
  granularity?: PhaseGranularity | 'auto'
  visiblePhase?: PhaseFilterKey
}) {
  const byWeek = granularity === 'week' || (granularity === 'auto' && series.length > 60)
  const rows = byWeek ? bucketByWeek(series) : series
  const phases = PHASE_SERIES.filter(
    (phase) => visiblePhase === 'all' || phase.key === visiblePhase,
  )
  const max = Math.max(
    ...rows.map((row) => phases.reduce((sum, phase) => sum + row[phase.key], 0)),
    1,
  )
  const [hover, setHover] = useState<number | null>(null)
  const hovered = hover !== null ? rows[hover] : undefined

  // Tendência de cada fase: mesma escala das barras, traçada sobre o empilhado.
  const stepX = PHASE_VIEW_W / Math.max(rows.length, 1)
  const trends = phases.map((phase) => ({
    phase,
    line: smoothPath(
      rows.map((row, index) => ({
        x: stepX * (index + 0.5),
        y: PHASE_VIEW_H - (row[phase.key] / max) * PHASE_VIEW_H,
      })),
    ),
  }))

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-4">
        {phases.map((phase) => (
          <span key={phase.key} className="flex items-center gap-1.5 text-[0.66rem] font-medium" style={{ color: SHOWCASE.inkSoft }}>
            <span className="h-2 w-2 rounded-full" style={{ background: phase.color }} />
            {phase.label}
          </span>
        ))}
        <span className="flex items-center gap-1.5 text-[0.66rem] font-medium" style={{ color: SHOWCASE.muted }}>
          <span className="h-0.5 w-4 rounded-full" style={{ background: SHOWCASE.inkSoft }} />
          Tendência por fase
        </span>
      </div>

      <div className="relative flex h-36 items-end gap-[3px]">
        {rows.map((row, index) => {
          const total = phases.reduce((sum, phase) => sum + row[phase.key], 0)
          const dimmed = hover !== null && hover !== index
          const showMaintenance = visiblePhase === 'all' || visiblePhase === 'maintenance'
          const showBuildUp = visiblePhase === 'all' || visiblePhase === 'buildUp'
          return (
            <div key={row.date} className="flex h-full flex-1 flex-col justify-end gap-[2px]" style={{ opacity: dimmed ? 0.45 : 1 }}>
              {showMaintenance && row.maintenance > 0 && (
                <span
                  className="w-full rounded-[3px]"
                  style={{
                    height: `${(row.maintenance / max) * 100}%`,
                    background: `${PHASE_SERIES[1].color}99`,
                    minHeight: 3,
                  }}
                />
              )}
              {showBuildUp && row.buildUp > 0 && (
                <span
                  className="w-full rounded-[3px]"
                  style={{
                    height: `${(row.buildUp / max) * 100}%`,
                    background: `linear-gradient(180deg, ${PHASE_SERIES[0].color}99 0%, ${PHASE_SERIES[0].color}33 100%)`,
                    minHeight: 3,
                  }}
                />
              )}
              {/* Dia sem aplicação: linha de base explícita — zero registrado, não lacuna. */}
              {total === 0 && (
                <span
                  className="w-full rounded-[2px]"
                  style={{ height: 3, background: SHOWCASE.muted, opacity: 0.45 }}
                />
              )}
            </div>
          )
        })}

        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox={`0 0 ${PHASE_VIEW_W} ${PHASE_VIEW_H}`}
          preserveAspectRatio="none"
          /* O traço fica centrado na coordenada: no zero e no topo metade dele cai
             fora da viewBox e seria cortado pelo clip padrão do SVG. */
          style={{ overflow: 'visible' }}
          aria-hidden="true"
        >
          {trends.map(({ phase, line }) => (
            <path
              key={phase.key}
              d={line}
              fill="none"
              stroke={phase.trend}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>

        <HoverBands count={rows.length} onHover={setHover} />

        {hovered && hover !== null && (
          <ChartTooltip
            leftPct={((hover + 0.5) / rows.length) * 100}
            topPct={
              100 -
              (phases.reduce((sum, phase) => sum + hovered[phase.key], 0) / max) * 100
            }
            label={hovered.label}
          >
            {phases.map((phase, index) => (
              <span key={phase.key} className={index > 0 ? 'opacity-70' : undefined}>
                {index > 0 && ' · '}
                {phase.label}: {hovered[phase.key].toLocaleString('pt-BR')} pacientes
              </span>
            ))}
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
