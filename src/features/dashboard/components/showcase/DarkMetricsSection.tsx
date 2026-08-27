import { faArrowRight } from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { ReactNode } from 'react'
import { smoothPath, type Point } from './smooth-path'

export const DARK_PLATE = 'linear-gradient(165deg, #0e353d 0%, #08191d 55%, #061215 100%)'
const CARD_PLATE = 'linear-gradient(160deg, rgba(220,225,229,0.07), rgba(220,225,229,0.018))'
const CARD_BORDER = 'rgba(220,225,229,0.13)'
const INK = '#DCE1E5'
const INK_MUTED = '#7FA6AC'

// Cancels the shell padding (32) plus the rail column (48) and its gap (20),
// so the band reaches both edges of the viewport.
const BLEED = { marginLeft: -100, marginRight: -32 }

export type DarkTileVisual = 'spark' | 'dots' | 'bars'

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
  onOpen: () => void
  children?: ReactNode
  sectionRef?: React.Ref<HTMLElement>
}

export function DarkChartCard({
  title,
  children,
  fullWidth,
}: {
  title: string
  children: ReactNode
  fullWidth?: boolean
}) {
  return (
    <section
      className={fullWidth ? 'col-span-3 rounded-3xl p-5' : 'rounded-3xl p-5'}
      style={{ background: CARD_PLATE, border: `1px solid ${CARD_BORDER}` }}
    >
      <h3 className="mb-4 text-[0.95rem] font-medium" style={{ color: INK }}>
        {title}
      </h3>
      {children}
    </section>
  )
}

const SPARK_W = 120
const SPARK_H = 34

function Spark({ series, glow }: { series: number[]; glow: string }) {
  const min = Math.min(...series)
  const max = Math.max(...series)
  const span = max - min || 1
  const step = SPARK_W / Math.max(series.length - 1, 1)
  const points: Point[] = series.map((value, i) => ({
    x: i * step,
    y: SPARK_H - 3 - ((value - min) / span) * (SPARK_H - 8),
  }))

  return (
    <svg width={SPARK_W} height={SPARK_H} viewBox={`0 0 ${SPARK_W} ${SPARK_H}`} aria-hidden="true">
      <path d={smoothPath(points)} fill="none" stroke={glow} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function Bars({ series, glow }: { series: number[]; glow: string }) {
  const max = Math.max(...series, 1)
  return (
    <div className="flex h-8 items-end gap-1" aria-hidden="true">
      {series.map((value, i) => (
        <span
          key={i}
          className="w-1.5 rounded-full"
          style={{
            height: `${Math.max(12, (value / max) * 100)}%`,
            background: i === series.length - 1 ? glow : 'rgba(220,225,229,0.22)',
          }}
        />
      ))}
    </div>
  )
}

function Dots({ total, filled, glow }: { total: number; filled: number; glow: string }) {
  return (
    <div className="flex items-center gap-1.5" aria-hidden="true">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className="h-2.5 w-2.5 rounded-full"
          style={{
            background: i < filled ? glow : 'transparent',
            border: i < filled ? 'none' : '1px solid rgba(220,225,229,0.28)',
          }}
        />
      ))}
    </div>
  )
}

function DarkTile({ metric, onOpen }: { metric: DarkMetric; onOpen: () => void }) {
  return (
    <article
      className="relative flex flex-col justify-between overflow-hidden rounded-3xl p-5"
      style={{ background: CARD_PLATE, border: `1px solid ${CARD_BORDER}` }}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -left-10 -top-14 h-40 w-40 rounded-full"
        style={{ background: `radial-gradient(closest-side, ${metric.glow}38, transparent 72%)`, filter: 'blur(6px)' }}
      />

      <header className="relative z-10 flex items-start justify-between gap-3">
        <span
          className="flex h-8 w-8 items-center justify-center rounded-full"
          style={{ background: 'rgba(220,225,229,0.08)', border: `1px solid ${CARD_BORDER}`, color: metric.glow }}
        >
          <FontAwesomeIcon icon={metric.icon} style={{ fontSize: 12 }} />
        </span>
        <button
          type="button"
          onClick={onOpen}
          aria-label={`Abrir ${metric.label}`}
          className="flex h-8 w-8 items-center justify-center rounded-full cursor-pointer transition-transform duration-200 hover:scale-105"
          style={{ background: 'rgba(220,225,229,0.08)', border: `1px solid ${CARD_BORDER}`, color: INK }}
        >
          <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 10, transform: 'rotate(-45deg)' }} />
        </button>
      </header>

      <p className="relative z-10 mt-6 text-[0.82rem] font-medium" style={{ color: INK_MUTED }}>
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

        {metric.visual === 'spark' && <Spark series={metric.series} glow={metric.glow} />}
        {metric.visual === 'bars' && <Bars series={metric.series} glow={metric.glow} />}
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
  onOpen,
  children,
  sectionRef,
}: DarkMetricsSectionProps) {
  return (
    <section
      ref={sectionRef}
      data-dark-band=""
      className="relative z-30 mt-6 shrink-0 overflow-hidden pb-10 pl-[6.25rem] pr-8 pt-20"
      style={{ ...BLEED, background: DARK_PLATE }}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 flex h-6 w-72 -translate-x-1/2 items-end justify-center pb-1.5"
        style={{ background: '#EBEEEE', borderRadius: '0 0 999px 999px' }}
      >
        <span className="h-1 w-11 rounded-full" style={{ background: '#B3C0C0' }} />
      </span>

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
        {metrics.map((metric) => (
          <DarkTile key={metric.label} metric={metric} onOpen={onOpen} />
        ))}
      </div>

      {children && <div className="dark-charts mt-4 grid grid-cols-3 gap-4">{children}</div>}
    </section>
  )
}
