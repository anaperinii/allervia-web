import { faArrowRight, faSliders } from '@fortawesome/free-solid-svg-icons'
import { AccentBadge, Card, CardHeader, CardMetric, CircleButton, DayAxis, SHOWCASE } from '@/shared/components/showcase'

interface ActivityCardProps {
  title: string
  caption: string
  total: number
  data: { day: string; value: number }[]
  peakIndex: number
  peakValue: number
  onOpen: () => void
}

export function ActivityCard({ title, caption, total, data, peakIndex, peakValue, onOpen }: ActivityCardProps) {
  const max = Math.max(...data.map((d) => d.value), 1)

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

      <CardMetric caption={caption} value={String(total)} />

      <div className="relative flex-1 flex items-end gap-2 min-h-30">
        {data.map((entry, i) => {
          const isPeak = i === peakIndex
          const height = Math.max(8, Math.round((entry.value / max) * 100))
          return (
            <div key={entry.day} className="relative flex-1 flex flex-col justify-end h-full">
              {isPeak && (
                <div className="absolute inset-x-0 -top-1 flex justify-center">
                  <AccentBadge>{peakValue.toLocaleString('pt-BR')}</AccentBadge>
                </div>
              )}
              <div
                className="rounded-lg w-full"
                style={{
                  height: `${height}%`,
                  backgroundColor: isPeak ? SHOWCASE.white : SHOWCASE.cardInner,
                  backgroundImage: isPeak
                    ? `repeating-linear-gradient(45deg, ${SHOWCASE.ink}42 0 1.4px, transparent 1.4px 6px)`
                    : undefined,
                  border: isPeak ? `1px solid ${SHOWCASE.line}` : undefined,
                }}
              />
            </div>
          )
        })}
      </div>

      <DayAxis days={data.map((d) => d.day)} />
    </Card>
  )
}
