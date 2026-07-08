import { useId, useMemo, useState } from 'react'
import { comparePtDateAsc } from '@/shared/lib/dates'
import { getIntervalColor } from '@/features/immunotherapy/constants/interval-colors'
import type { Application } from '@/features/patient/stores/usePatientStore'

interface TreatmentTimelineProps {
  applications: Application[]
  inductionStart: string
  maintenanceStart: string | null
}

interface Pt {
  x: number
  y: number
  date: string
  dose: string
  conc: string
  days: number
  reaction: boolean
  color: string
}

const concOf = (a: Application) => (a.extractConcentration || a.dose.split(' - ')[0] || '').trim()
const volOf = (a: Application) => (a.appliedVolume || a.dose.split(' - ')[1] || '').trim()

function parseVolume(value: string): number {
  const n = parseFloat(value.replace(/ml/i, '').replace(',', '.').trim())
  return Number.isFinite(n) ? n : 0
}

function concDenominator(value: string): number {
  const parts = value.split(':')
  if (parts.length < 2) return 0
  const n = parseInt(parts[1].replace(/\D/g, ''), 10)
  return Number.isFinite(n) ? n : 0
}

function smoothPath(pts: Pt[]): string {
  if (pts.length < 2) return pts.length ? `M ${pts[0].x} ${pts[0].y}` : ''
  let d = `M ${pts[0].x} ${pts[0].y}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] ?? p2
    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6
    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)} ${cp2x.toFixed(2)} ${cp2y.toFixed(2)} ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`
  }
  return d
}

const W = 960
const H = 180
const PX = 18
const PT = 20
const PB = 30

export function TreatmentTimeline({ applications, inductionStart }: TreatmentTimelineProps) {
  const gradientId = useId()
  const fadeMaskId = useId()
  const fadeGradId = useId()
  const [hovered, setHovered] = useState<number | null>(null)

  const { pts, path, area, stops, x0, xN, intervals, labelIdx } = useMemo(() => {
    const realized = applications
      .filter((application) => application.status === 'completed')
      .sort((a, b) => comparePtDateAsc(a.date, b.date))

    const raw = realized.map((a) => {
      const vol = parseVolume(volOf(a))
      const denom = concDenominator(concOf(a))
      const potency = denom > 0 ? vol / denom : vol
      return { potency: potency > 0 ? potency : 1e-6, date: a.date, dose: a.dose, conc: concOf(a), days: a.cycle.days, reaction: a.sideEffect === 'yes' }
    })

    const logs = raw.map((r) => Math.log10(r.potency))
    const minY = Math.min(...logs)
    const maxY = Math.max(...logs)
    const spanY = maxY - minY || 1
    const n = raw.length

    const pts: Pt[] = raw.map((r, i) => ({
      x: PX + (n > 1 ? i / (n - 1) : 0.5) * (W - 2 * PX),
      y: PT + (1 - (Math.log10(r.potency) - minY) / spanY) * (H - PT - PB),
      date: r.date,
      dose: r.dose,
      conc: r.conc,
      days: r.days,
      reaction: r.reaction,
      color: getIntervalColor(r.days).dot,
    }))

    const path = smoothPath(pts)
    const x0 = pts[0]?.x ?? PX
    const xN = pts[n - 1]?.x ?? W - PX
    const area = n > 1 ? `${path} L ${xN.toFixed(2)} ${H - PB} L ${x0.toFixed(2)} ${H - PB} Z` : ''
    const denomX = xN - x0 || 1
    const stops = pts.map((p) => ({ offset: ((p.x - x0) / denomX) * 100, color: p.color }))

    const intervals = Array.from(new Set(realized.map((a) => a.cycle.days))).sort((a, b) => a - b)

    // date label at each concentration change and, once on the target dose, at each interval change
    const labelIdx: number[] = []
    pts.forEach((p, i) => {
      if (i === 0 || p.conc !== pts[i - 1].conc || p.days !== pts[i - 1].days) labelIdx.push(i)
    })

    return { pts, path, area, stops, x0, xN, intervals, labelIdx }
  }, [applications])

  return (
    <div className="border border-(--border-custom) rounded-xl bg-white/55 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-5 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-bold text-(--text)">Progressão da dose</div>
          <div className="text-[0.65rem] text-(--text-muted) mt-0.5">
            Dose efetiva ao longo do tempo · {pts.length} {pts.length === 1 ? 'aplicação' : 'aplicações'} desde {inductionStart}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {intervals.map((days) => {
            const color = getIntervalColor(days)
            return (
              <span key={days} className="inline-flex items-center gap-1.5 text-[0.55rem] font-semibold text-(--text-muted)">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color.dot }} />
                {days} dias
              </span>
            )
          })}
        </div>
      </div>

      {pts.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-[0.65rem] text-(--text-muted)">
          Sem aplicações realizadas.
        </div>
      ) : (
        <div className="relative">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 'auto' }} role="img" aria-label="Progressão da dose efetiva ao longo do tempo">
            <defs>
              <linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1={x0} y1="0" x2={xN} y2="0">
                {stops.map((s, i) => (
                  <stop key={i} offset={`${s.offset}%`} stopColor={s.color} />
                ))}
              </linearGradient>
              <linearGradient id={fadeGradId} gradientUnits="userSpaceOnUse" x1="0" y1={PT} x2="0" y2={H - PB}>
                <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                <stop offset="55%" stopColor="#ffffff" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>
              <mask id={fadeMaskId}>
                <rect x="0" y="0" width={W} height={H} fill={`url(#${fadeGradId})`} />
              </mask>
            </defs>

            {area && <path d={area} fill={`url(#${gradientId})`} fillOpacity={0.4} stroke="none" mask={`url(#${fadeMaskId})`} />}
            {labelIdx.filter((i) => i > 0).map((i) => {
              const bx = (pts[i - 1].x + pts[i].x) / 2
              const by = (pts[i - 1].y + pts[i].y) / 2
              return (
                <line key={`bound-${i}`} x1={bx} y1={by} x2={bx} y2={H - PB} stroke="#94A3B8" strokeOpacity={0.5} strokeWidth={1} strokeDasharray="4 4" />
              )
            })}
            <path d={path} fill="none" stroke={`url(#${gradientId})`} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

            {pts.map((p, i) => (
              <g key={i}>
                {p.reaction && <circle cx={p.x} cy={p.y} r={8} fill="none" stroke="#C46A3C" strokeWidth={2} />}
                <circle cx={p.x} cy={p.y} r={hovered === i ? 6 : 4.5} fill={p.color} stroke="#ffffff" strokeWidth={1} />
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={15}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                />
              </g>
            ))}

            {labelIdx.map((i) => (
              <text
                key={i}
                x={pts[i].x}
                y={H - 9}
                textAnchor="middle"
                className="fill-(--text-muted)"
                style={{ fontSize: '9px', fontWeight: 600 }}
              >
                {pts[i].date.slice(0, 5)}
              </text>
            ))}
          </svg>

          {hovered !== null && (
            <div
              className="absolute z-10 -translate-x-1/2 -translate-y-full pointer-events-none"
              style={{ left: `${(pts[hovered].x / W) * 100}%`, top: `${(pts[hovered].y / H) * 100 - 4}%` }}
            >
              <div className="rounded-lg bg-(--text) px-2.5 py-1.5 text-white shadow-lg whitespace-nowrap">
                <div className="text-[0.6rem] font-bold">{pts[hovered].dose}</div>
                <div className="text-[0.5rem] opacity-80 mt-0.5">
                  {pts[hovered].date} · {pts[hovered].days} dias{pts[hovered].reaction ? ' · reação registrada' : ''}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
