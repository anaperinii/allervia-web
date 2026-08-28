import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { ReactNode } from 'react'
import type { CardFilter } from '@/features/dashboard/hooks/useChartWindow'
import { CardFilters } from './CardFilters'
import { smoothPath, type Point } from './smooth-path'

// Same glass recipe as the landing 'Quatro pilares' cards (light theme).
const PILLAR_TONES = ['155,193,196', '108,158,165', '37,126,140']
const PILLAR_ANGLES = [
  '120% 90% at 22% 92%',
  '110% 95% at 78% 88%',
  '120% 90% at 50% 100%',
  '115% 95% at 12% 78%',
  '125% 95% at 88% 100%',
  '115% 90% at 62% 82%',
]
const PILLAR_BORDER = 'rgba(37,126,140,0.14)'
const PILLAR_SCRIM =
  'linear-gradient(to top, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.34) 55%, rgba(255,255,255,0) 100%)'

function pillarPlate(index: number) {
  const tone = PILLAR_TONES[0]
  const angle = PILLAR_ANGLES[index % PILLAR_ANGLES.length]
  return `radial-gradient(${angle}, rgba(${tone},0.26) 0%, rgba(${tone},0.10) 38%, rgba(219,231,232,0.94) 78%, #f4f8f8 100%)`
}

const INK = '#0E2E34'
const INK_MUTED = 'rgba(14,46,52,0.75)'

export type DarkTileVisual = 'spark' | 'dots' | 'bars' | 'gauge'

export interface DarkMetric {
  label: string
  value: string
  unit?: string
  icon: IconDefinition
  /** Neon tone that lights the card's corner and its chart. */
  glow: string
  visual: DarkTileVisual
  series: number[]
  /** Filled dots for the `dots` visual. */
  filled?: number
}

interface DarkMetricsSectionProps {
  eyebrow?: string
  title: string
  subtitle: string
  metrics: DarkMetric[]
  children?: ReactNode
  sectionRef?: React.Ref<HTMLElement>
}

export function DarkChartCard({
  title,
  children,
  fullWidth,
  filters,
  filtersActive,
}: {
  title: string
  children: ReactNode
  fullWidth?: boolean
  filters?: CardFilter[]
  filtersActive?: boolean
}) {
  return (
    <section
      className={fullWidth ? 'col-span-3 rounded-3xl p-5' : 'rounded-3xl p-5'}
      style={{ background: '#F6F8F8', border: '1px solid #DDE6E6' }}
    >
      <header className="mb-4 flex items-start justify-between gap-3">
        <h3 className="text-[0.95rem] font-bold" style={{ color: INK }}>
          {title}
        </h3>
        {filters && <CardFilters filters={filters} active={filtersActive} inline={fullWidth} />}
      </header>
      {children}
    </section>
  )
}

const SPARK_W = 152
const SPARK_H = 46

function Spark({ series, glow, id }: { series: number[]; glow: string; id: string }) {
  const min = Math.min(...series)
  const max = Math.max(...series)
  const span = max - min || 1
  const step = SPARK_W / Math.max(series.length - 1, 1)
  // A flat series would sit glued to the baseline, so it rides the middle instead.
  const flat = max === min
  const points: Point[] = series.map((value, i) => ({
    x: i * step,
    y: flat ? SPARK_H / 2 : SPARK_H - 6 - ((value - min) / span) * (SPARK_H - 16),
  }))

  const line = smoothPath(points)
  const area = `${line} L${points[points.length - 1].x},${SPARK_H} L${points[0].x},${SPARK_H} Z`

  return (
    <svg width={SPARK_W} height={SPARK_H} viewBox={`0 0 ${SPARK_W} ${SPARK_H}`} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={glow} stopOpacity="0.45" />
          <stop offset="100%" stopColor={glow} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={glow} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function Bars({ series, glow }: { series: number[]; glow: string }) {
  const max = Math.max(...series, 1)
  return (
    <div className="flex h-11 items-end gap-1.5" aria-hidden="true">
      {series.map((value, i) => (
        <span
          key={i}
          className="w-2 rounded-full"
          style={{
            height: `${Math.max(12, (value / max) * 100)}%`,
            background: i === series.length - 1 ? glow : '#DDE6E6',
          }}
        />
      ))}
    </div>
  )
}

function Dots({ total, filled, glow }: { total: number; filled: number; glow: string }) {
  // Mirrored right triangle: the bottom row is the widest, the shortage trims the top row.
  const rowCount = Math.ceil((Math.sqrt(1 + 8 * total) - 1) / 2)
  const sizes: number[] = []
  let left = total
  for (let row = rowCount; row >= 1; row--) {
    const size = Math.min(row, left)
    left -= size
    if (size > 0) sizes.unshift(size)
  }
  let cursor = 0
  const rows = sizes.map((size) => Array.from({ length: size }, () => cursor++))

  return (
    <div className="flex flex-col items-end gap-1" aria-hidden="true">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex items-center gap-1">
          {row.map((dot) => (
            <span
              key={dot}
              className="h-2.5 w-2.5 rounded-full"
              style={{
                background: dot < filled ? glow : 'transparent',
                border: dot < filled ? 'none' : '1.5px solid #B3C0C0',
              }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

function Gauge({ value, max, glow }: { value: number; max: number; glow: string }) {
  const ratio = Math.max(0, Math.min(value / max, 1))
  const radius = 26
  const circumference = Math.PI * radius

  const arc = `M12,38 A${radius},${radius} 0 0 1 64,38`

  return (
    <svg width="96" height="56" viewBox="0 0 76 44" aria-hidden="true">
      <path d={arc} fill="none" stroke="#DDE6E6" strokeWidth="6" strokeLinecap="round" />
      <path
        d={arc}
        fill="none"
        stroke={glow}
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={`${circumference * ratio} ${circumference}`}
      />
      <circle cx="38" cy="38" r="2.5" fill={glow} />
    </svg>
  )
}

function DarkTile({ metric, index }: { metric: DarkMetric; index: number }) {
  return (
    <article
      className="relative flex flex-col justify-between overflow-hidden rounded-3xl p-5 backdrop-blur-md"
      style={{
        background: pillarPlate(index),
        border: `1px solid ${PILLAR_BORDER}`,
      }}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-16 h-40"
        style={{
          background: `radial-gradient(120% 100% at 50% 0%, ${metric.glow}3D, transparent 70%)`,
          filter: 'blur(10px)',
        }}
      />

      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[68%]"
        style={{
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          background: PILLAR_SCRIM,
          maskImage: 'linear-gradient(to top, #000 0%, #000 45%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to top, #000 0%, #000 45%, transparent 100%)',
        }}
      />

      <header className="relative z-10 flex items-start gap-3">
        <span
          className="flex h-11 w-11 items-center justify-center rounded-full"
          style={{
            background: `${metric.glow}2E`,
            border: `1px solid ${metric.glow}66`,
            color: metric.glow,
          }}
        >
          <FontAwesomeIcon icon={metric.icon} style={{ fontSize: 17, filter: 'saturate(1.85) brightness(0.96)' }} />
        </span>
      </header>

      <p className="relative z-10 mt-6 text-[0.8rem] font-medium" style={{ color: INK_MUTED }}>
        {metric.label}
      </p>

      <div className="relative z-10 mt-2 flex items-end justify-between gap-3">
        <span className="flex items-baseline gap-1" style={{ color: INK }}>
          <span className="text-[2.1rem] font-semibold leading-none tracking-tight tabular-nums">{metric.value}</span>
          {metric.unit && (
            <span className="text-[0.72rem] font-medium" style={{ color: INK_MUTED }}>
              {metric.unit}
            </span>
          )}
        </span>

        {metric.visual === 'spark' && (
          <Spark series={metric.series} glow={metric.glow} id={`spark-${metric.label.replace(/\W+/g, '-')}`} />
        )}
        {metric.visual === 'bars' && <Bars series={metric.series} glow={metric.glow} />}
        {metric.visual === 'gauge' && <Gauge value={Number(metric.value.replace(',', '.'))} max={10} glow={metric.glow} />}
        {metric.visual === 'dots' && (
          <Dots total={metric.series.length} filled={metric.filled ?? 0} glow={metric.glow} />
        )}
      </div>
    </article>
  )
}

export function DarkMetricsSection({
  eyebrow,
  title,
  subtitle,
  metrics,
  children,
  sectionRef,
}: DarkMetricsSectionProps) {
  return (
    <section
      ref={sectionRef}
      className="relative z-30 mt-16 shrink-0 pb-10"
    >
      <header className="mb-6">
        {eyebrow && (
          <p className="mb-0.5 text-[0.88rem]" style={{ color: INK_MUTED }}>
            {eyebrow}
          </p>
        )}
        <h2 className="text-[2.15rem] font-medium leading-[1.15] tracking-tight" style={{ color: INK }}>
          {title}
        </h2>
        <p className="mt-1.5 text-[0.88rem]" style={{ color: INK_MUTED }}>
          {subtitle}
        </p>
      </header>

      <div className="grid grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <DarkTile key={metric.label} metric={metric} index={index} />
        ))}
      </div>

      {children && <div className="mt-4 grid grid-cols-3 gap-4">{children}</div>}
    </section>
  )
}
