import { faArrowRight, faSliders } from '@fortawesome/free-solid-svg-icons'
import { AccentBadge, Card, CardHeader, CircleButton, DayAxis, SHOWCASE } from '@/shared/components/showcase'
import { smoothPath, type Point } from './smooth-path'

const VIEW_W = 560
const VIEW_H = 150
const PAD_X = 10

interface TotalSpendCardProps {
  title: string
  caption: string
  total: number
  totalPrefix: string
  subValue: string
  stats: { value: string; label: string }[]
  data: { day: string; value: number }[]
  peakIndex: number
  peakValue: number
  onOpen: () => void
}

/** Big figure plus a soft curve with an inline lime callout on the peak day. */
export function TotalSpendCard({
  title,
  caption,
  total,
  totalPrefix,
  subValue,
  stats,
  data,
  peakIndex,
  peakValue,
  onOpen,
}: TotalSpendCardProps) {
  const values = data.map((d) => d.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const stepX = (VIEW_W - PAD_X * 2) / Math.max(data.length - 1, 1)

  const points: Point[] = data.map((d, i) => ({
    x: PAD_X + i * stepX,
    y: VIEW_H - 18 - ((d.value - min) / span) * (VIEW_H - 42),
  }))
  const line = smoothPath(points)
  const area = `${line} L${points[points.length - 1].x},${VIEW_H} L${points[0].x},${VIEW_H} Z`

  return (
    <Card>
      <CardHeader
        title={title}
        actions={
          <>
            <CircleButton icon={faSliders} size={32} iconSize={10} aria-label="Filtros" />
            <CircleButton icon={faArrowRight} iconRotateDeg={-45} size={32} iconSize={10} onClick={onOpen} aria-label="Abrir" />
          </>
        }
      />

      <div className="flex flex-1 gap-5 min-h-0">
        <div className="flex flex-col shrink-0 w-40">
          <div className="text-[0.68rem] font-medium mb-1" style={{ color: SHOWCASE.muted }}>
            {caption}
          </div>
          <div className="flex items-baseline" style={{ color: SHOWCASE.ink }}>
            <span className="text-lg font-medium">{totalPrefix}</span>
            <span className="text-[2.35rem] font-semibold leading-none tracking-tight tabular-nums">
              {total.toLocaleString('pt-BR')}
            </span>
          </div>
          <div className="text-[0.68rem] font-medium mt-1" style={{ color: SHOWCASE.muted }}>
            {subValue}
          </div>

          <div className="mt-auto space-y-2 pt-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5"
                style={{ background: SHOWCASE.cardInner }}
              >
                <span className="text-[0.78rem] font-bold tabular-nums" style={{ color: SHOWCASE.ink }}>
                  {stat.value}
                </span>
                <span className="text-[0.68rem] font-medium" style={{ color: SHOWCASE.muted }}>
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-1 flex-col min-w-0">
          <div className="relative flex-1 min-h-30">
            <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="w-full h-full" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id="spend-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={SHOWCASE.accent} stopOpacity="0.14" />
                  <stop offset="100%" stopColor={SHOWCASE.accent} stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={area} fill="url(#spend-area)" />
              <path d={line} fill="none" stroke={SHOWCASE.ink} strokeOpacity="0.62" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
              {points.map((point, i) => (
                <circle key={data[i].day} cx={point.x} cy={point.y} r="3" fill={SHOWCASE.ink} />
              ))}
            </svg>

            <div
              className="absolute -translate-x-1/2 -translate-y-[150%]"
              style={{
                left: `${(points[peakIndex].x / VIEW_W) * 100}%`,
                top: `${(points[peakIndex].y / VIEW_H) * 100}%`,
              }}
            >
              <AccentBadge>{peakValue.toLocaleString('pt-BR')}</AccentBadge>
            </div>
          </div>

          <DayAxis days={data.map((d) => d.day)} />
        </div>
      </div>
    </Card>
  )
}
