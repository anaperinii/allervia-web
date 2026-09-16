import { useState } from 'react'
import { Card, CardHeader, DayAxis, SHOWCASE } from '@/shared/components/showcase'
import { axisLabels, useSeriesFilters, windowCaption } from '@/features/dashboard/hooks/useChartWindow'
import { CardFilters } from './CardFilters'
import { ChartTooltip, HoverBands } from './ChartHover'
import { smoothPath, type Point } from './smooth-path'

const VIEW_W = 480
const VIEW_H = 140
const PAD_X = 10

export interface AdherencePoint {
  date: string
  label: string
  value: number
  completed: number
  missed: number
  scheduled: number
}

interface AdherenceCardProps {
  title: string
  caption: string
  series: AdherencePoint[]
}

export function AdherenceCard({ title, caption, series }: AdherenceCardProps) {
  const { slice, filters, active } = useSeriesFilters(series, { range: true })
  const [hover, setHover] = useState<number | null>(null)
  const hovered = hover !== null ? slice[hover] : undefined

  const completed = slice.reduce((sum, entry) => sum + entry.completed, 0)
  const missed = slice.reduce((sum, entry) => sum + entry.missed, 0)
  const scheduled = slice.reduce((sum, entry) => sum + entry.scheduled, 0)
  const closed = completed + missed
  const adherence = closed > 0 ? Math.round((completed / closed) * 100) : 0

  const stepX = (VIEW_W - PAD_X * 2) / Math.max(slice.length - 1, 1)
  const points: Point[] = slice.map((entry, i) => ({
    x: PAD_X + i * stepX,
    y: VIEW_H - 16 - (entry.value / 100) * (VIEW_H - 34),
  }))
  const line = points.length > 0 ? smoothPath(points) : ''
  const area =
    points.length > 0 ? `${line} L${points[points.length - 1].x},${VIEW_H} L${points[0].x},${VIEW_H} Z` : ''

  return (
    <Card>
      <CardHeader
        title={title}
        subtitle={windowCaption(caption, slice)}
        actions={<CardFilters filters={filters} active={active} />}
      />

      <div className="flex items-center gap-3" style={{ color: SHOWCASE.ink }}>
        <span className="text-[2.35rem] font-semibold leading-none tracking-tight tabular-nums">{adherence}%</span>

        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { label: 'realizadas', value: completed, color: '#8FD285' },
            { label: 'faltas', value: missed, color: '#E0453C' },
            { label: 'previstas', value: scheduled, color: SHOWCASE.muted },
          ].map((row) => (
            <span
              key={row.label}
              className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.66rem] font-medium leading-none"
              style={{ background: `${row.color}26`, border: `1px solid ${row.color}`, color: SHOWCASE.ink }}
            >
              <span className="font-bold tabular-nums">{row.value}</span>
              {row.label}
            </span>
          ))}
        </div>
      </div>

      <div className="relative mt-auto min-h-24 flex-1">
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="h-full w-full" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="adherence-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={SHOWCASE.accent} stopOpacity="0.16" />
              <stop offset="100%" stopColor={SHOWCASE.accent} stopOpacity="0" />
            </linearGradient>
          </defs>
          <line
            x1="0"
            x2={VIEW_W}
            y1={VIEW_H - 16 - 0.8 * (VIEW_H - 34)}
            y2={VIEW_H - 16 - 0.8 * (VIEW_H - 34)}
            stroke={SHOWCASE.line}
            strokeDasharray="4 4"
            vectorEffect="non-scaling-stroke"
          />
          <path d={area} fill="url(#adherence-area)" />
          <path
            d={line}
            fill="none"
            stroke={SHOWCASE.ink}
            strokeOpacity="0.62"
            strokeWidth="1.6"
            vectorEffect="non-scaling-stroke"
          />
          {points.map((point, i) =>
            slice.length <= 14 || hover === i ? (
              <circle
                key={`${slice[i].label}-${i}`}
                cx={point.x}
                cy={point.y}
                r={hover === i ? 4.5 : 3}
                fill={hover === i ? SHOWCASE.accent : SHOWCASE.ink}
              />
            ) : null,
          )}
        </svg>

        <HoverBands count={slice.length} onHover={setHover} />

        {hovered && hover !== null && (
          <ChartTooltip
            leftPct={(points[hover].x / VIEW_W) * 100}
            topPct={(points[hover].y / VIEW_H) * 100}
            label={hovered.label}
          >
            {hovered.value}% · {hovered.completed} realizadas
            <span className="opacity-70">
              {' · '}
              {hovered.missed} faltas
            </span>
          </ChartTooltip>
        )}
      </div>

      <DayAxis days={axisLabels(slice.map((entry) => entry.label))} />
    </Card>
  )
}
