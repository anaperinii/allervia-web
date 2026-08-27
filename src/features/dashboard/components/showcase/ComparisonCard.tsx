import { useState } from 'react'
import { AccentBadge, Card, CardHeader, CardMetric, DayAxis, SHOWCASE } from '@/shared/components/showcase'
import { axisLabels, todayIndex, useSeriesFilters, windowCaption } from '@/features/dashboard/hooks/useChartWindow'
import { CardFilters } from './CardFilters'
import { ChartTooltip, HoverBands } from './ChartHover'

const VIEW_W = 640
const VIEW_H = 150
const PAD_X = 6

interface ComparisonCardProps {
  title: string
  caption: string
  totalSuffix: string
  previousYear: number
  currentYear: number
  series: { date: string; label: string; previous: number; current: number }[]
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
  totalSuffix,
  previousYear,
  currentYear,
  series,
}: ComparisonCardProps) {
  const { slice: rows, filters, active } = useSeriesFilters(series, { range: true })

  const previousTotal = rows.reduce((sum, r) => sum + r.previous, 0)
  const currentTotal = rows.reduce((sum, r) => sum + r.current, 0)
  const deltaPct = previousTotal > 0 ? Math.round(((currentTotal - previousTotal) / previousTotal) * 100) : 0

  const { x, y } = scale(rows)
  const currentLine = rows.map((r, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(r.current)}`).join(' ')
  const previousLine = rows.map((r, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(r.previous)}`).join(' ')
  const band = [
    ...rows.map((r, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(r.current)}`),
    ...rows.map((_, i) => `L${x(rows.length - 1 - i)},${y(rows[rows.length - 1 - i].previous)}`),
    'Z',
  ].join(' ')

  const badgeIndex = todayIndex(rows)
  const [hover, setHover] = useState<number | null>(null)
  const hovered = hover !== null ? rows[hover] : undefined

  return (
    <Card>
      <CardHeader
        title={title}
        subtitle={windowCaption(caption, rows)}
        actions={
          <CardFilters filters={filters} active={active} />
        }
      />

      <CardMetric
        value={currentTotal.toLocaleString('pt-BR')}
        suffix={totalSuffix}
      />

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
            {rows.map((r, i) =>
              rows.length <= 14 || hover === i ? (
                <circle
                  key={`${r.label}-${i}`}
                  cx={x(i)}
                  cy={y(r.current)}
                  r={hover === i ? 4 : 2.5}
                  fill={hover === i ? SHOWCASE.accent : SHOWCASE.white}
                  stroke={SHOWCASE.ink}
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                />
              ) : null,
            )}
          </svg>

          <HoverBands count={rows.length} onHover={setHover} />

          {hovered && hover !== null && (
            <ChartTooltip
              leftPct={(x(hover) / VIEW_W) * 100}
              topPct={(y(hovered.current) / VIEW_H) * 100}
              label={hovered.label}
            >
              {currentYear}: {hovered.current.toLocaleString('pt-BR')}
              <span className="opacity-70">
                {' · '}
                {previousYear}: {hovered.previous.toLocaleString('pt-BR')}
              </span>
            </ChartTooltip>
          )}

          {hover === null && badgeIndex >= 0 && (
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
          )}
        </div>
      </div>

      <div className="pl-9">
        <DayAxis days={axisLabels(rows.map((r) => r.label))} />
      </div>
    </Card>
  )
}
