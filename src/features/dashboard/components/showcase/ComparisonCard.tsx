import { faArrowRight, faSliders } from '@fortawesome/free-solid-svg-icons'
import { AccentBadge, Card, CardHeader, CardMetric, CircleButton, DayAxis, SHOWCASE } from '@/shared/components/showcase'

const VIEW_W = 640
const VIEW_H = 150
const PAD_X = 6

interface ComparisonCardProps {
  title: string
  caption: string
  total: number
  totalSuffix: string
  deltaPct: number
  previousYear: number
  currentYear: number
  rows: { day: string; previous: number; current: number }[]
  onOpen: () => void
}

function scale(rows: { previous: number; current: number }[]) {
  const values = rows.flatMap((r) => [r.previous, r.current])
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const stepX = (VIEW_W - PAD_X * 2) / Math.max(rows.length - 1, 1)
  return {
    x: (i: number) => PAD_X + i * stepX,
    y: (value: number) => VIEW_H - 14 - ((value - min) / span) * (VIEW_H - 34),
  }
}

export function ComparisonCard({
  title,
  caption,
  total,
  totalSuffix,
  deltaPct,
  previousYear,
  currentYear,
  rows,
  onOpen,
}: ComparisonCardProps) {
  const { x, y } = scale(rows)
  const currentLine = rows.map((r, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(r.current)}`).join(' ')
  const previousLine = rows.map((r, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(r.previous)}`).join(' ')
  const band = [
    ...rows.map((r, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(r.current)}`),
    ...rows.map((_, i) => `L${x(rows.length - 1 - i)},${y(rows[rows.length - 1 - i].previous)}`),
    'Z',
  ].join(' ')

  const badgeIndex = Math.floor(rows.length / 2)

  return (
    <Card>
      <CardHeader
        title={title}
        actions={
          <>
            <CircleButton icon={faSliders} size={32} iconSize={10} active aria-label="Filtros" />
            <CircleButton icon={faArrowRight} iconRotateDeg={-45} size={32} iconSize={10} onClick={onOpen} aria-label="Abrir" />
          </>
        }
      />

      <CardMetric caption={caption} value={total.toLocaleString('pt-BR')} suffix={totalSuffix} />

      <div className="relative flex-1 flex gap-3 min-h-30">
        <div className="flex flex-col justify-center gap-8 text-[0.62rem] font-medium shrink-0" style={{ color: SHOWCASE.muted }}>
          <span>{currentYear}</span>
          <span>{previousYear}</span>
        </div>

        <div className="relative flex-1">
          <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="w-full h-full" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <pattern id="comparison-hatch" width="7" height="7" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="0" y2="7" stroke={SHOWCASE.ink} strokeWidth="1" strokeOpacity="0.32" />
              </pattern>
            </defs>
            <path d={band} fill="url(#comparison-hatch)" />
            <path d={previousLine} fill="none" stroke={SHOWCASE.ink} strokeOpacity="0.55" strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
            <path d={currentLine} fill="none" stroke={SHOWCASE.ink} strokeOpacity="0.55" strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
            {rows.map((r, i) => (
              <circle key={r.day} cx={x(i)} cy={y(r.current)} r="2.5" fill={SHOWCASE.white} stroke={SHOWCASE.ink} strokeWidth="1" vectorEffect="non-scaling-stroke" />
            ))}
          </svg>

          <div
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${(x(badgeIndex) / VIEW_W) * 100}%`,
              top: `${((y(rows[badgeIndex].current) + y(rows[badgeIndex].previous)) / 2 / VIEW_H) * 100}%`,
            }}
          >
            <AccentBadge>
              {deltaPct >= 0 ? '+' : ''}
              {deltaPct}%
            </AccentBadge>
          </div>
        </div>
      </div>

      <div className="pl-9">
        <DayAxis days={rows.map((r) => r.day)} />
      </div>
    </Card>
  )
}
