import { useEffect, useMemo, useRef, useState } from 'react'

export type AutomationGlyphKind = 'tracking' | 'sync' | 'automation' | 'protocols'

interface AutomationGlyphProps {
  kind: AutomationGlyphKind
  size?: number
  delay?: number
}

interface RadialSpec {
  rings: number
  rIn: number
  rOut: number
  spacing: number
  phase: number
  contrast: number
  sMin: number
  sMax: number
  swirl?: number
  ringBias?: boolean
  spread?: number
  start?: number
}

const D2R = Math.PI / 180

const SPECS: Record<AutomationGlyphKind, RadialSpec> = {
  // ( 03 )
  tracking: {
    rings: 3,
    rIn: 84,
    rOut: 118,
    spacing: 14,
    phase: -70 * D2R,
    contrast: 2.0,
    sMin: 0.5,
    sMax: 6.5,
    swirl: 0.12,
  },
  // ( 05 )
  sync: {
    rings: 4,
    rIn: 60,
    rOut: 116,
    spacing: 15,
    phase: 90 * D2R,
    contrast: 2.1,
    sMin: 0.5,
    sMax: 8.5,
    swirl: 0.1,
    ringBias: true,
  },
  // ( 07 )
  automation: {
    rings: 3,
    rIn: 80,
    rOut: 118,
    spacing: 14,
    phase: 100 * D2R,
    contrast: 1.7,
    sMin: 0.6,
    sMax: 7,
    swirl: 0.16,
  },
  // ( 01 )
  protocols: {
    rings: 4,
    rIn: 64,
    rOut: 116,
    spacing: 15,
    phase: 20 * D2R,
    contrast: 1.5,
    sMin: 0.6,
    sMax: 7,
    swirl: 0.18,
  },
}

interface Dot {
  cx: number
  cy: number
  r: number
}

function generateDots(o: RadialSpec): Dot[] {
  const cx = 150
  const cy = 150
  const out: Dot[] = []
  for (let k = 0; k < o.rings; k++) {
    const R =
      o.rings === 1
        ? o.rOut
        : o.rIn + (o.rOut - o.rIn) * Math.pow(k / (o.rings - 1), o.spread ?? 1)
    const n = Math.max(8, Math.round((2 * Math.PI * R) / o.spacing))
    for (let i = 0; i < n; i++) {
      const th = (i / n) * 2 * Math.PI + (o.swirl ?? 0) * k + (o.start ?? 0)
      let f = 0.5 + 0.5 * Math.cos(th - o.phase)
      if (o.ringBias) f *= 0.45 + 0.55 * (k / Math.max(1, o.rings - 1))
      const r = o.sMin + (o.sMax - o.sMin) * Math.pow(f, o.contrast)
      if (r > 0.7) {
        out.push({
          cx: +(cx + R * Math.cos(th)).toFixed(1),
          cy: +(cy + R * Math.sin(th)).toFixed(1),
          r: +r.toFixed(1),
        })
      }
    }
  }
  return out
}

export function AutomationGlyph({ kind, size = 120, delay = 0 }: AutomationGlyphProps) {
  const dots = useMemo(() => generateDots(SPECS[kind]), [kind])
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [active, setActive] = useState(false)

  useEffect(() => {
    const el = svgRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      viewBox="0 0 300 300"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ color: 'var(--ll-accent-strong)' }}
    >
      <g
        fill="currentColor"
        style={{
          transformOrigin: '150px 150px',
          transform: active ? 'rotate(0deg) scale(1)' : 'rotate(-225deg) scale(0.65)',
          opacity: active ? 1 : 0,
          transition:
            'transform 1.2s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.6s ease',
          transitionDelay: `${delay}ms`,
        }}
      >
        {dots.map((d, i) => (
          <circle key={i} cx={d.cx} cy={d.cy} r={d.r} />
        ))}
      </g>
    </svg>
  )
}
