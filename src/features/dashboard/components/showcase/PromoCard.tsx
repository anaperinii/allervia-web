import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import proArt from '@/assets/pro-art.jpg'
import { cn } from '@/shared/lib/cn'
import { SHOWCASE } from '@/shared/components/showcase'

export interface PromoMetric {
  value: number
  label: string
  icon: IconDefinition
  color: string
}

interface PromoCardProps {
  metrics: PromoMetric[]
}

export function PromoCard({ metrics }: PromoCardProps) {
  return (
    <section
      className="relative flex h-full flex-col overflow-hidden rounded-3xl"
      style={{ background: SHOWCASE.card, border: `1px solid ${SHOWCASE.line}` }}
    >
      <img
        src={proArt}
        alt=""
        className="pointer-events-none absolute inset-x-0 top-0 h-[115%] w-full object-cover"
        style={{ transform: 'translateY(-13%)' }}
      />

      <div className="relative z-10 flex h-full flex-col justify-start gap-5 p-4">

        {metrics.map((metric, i) => (
          <div
            key={metric.label}
            className={cn(
              'flex w-fit max-w-[92%] items-baseline gap-2.5 rounded-2xl px-4 py-2.5 backdrop-blur-md',
              i % 2 === 0 ? 'self-start' : 'self-end',
            )}
            style={{
              background: 'rgba(255,255,255,0.24)',
              border: '1px solid rgba(255,255,255,0.42)',
            }}
          >
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center self-center rounded-full"
              style={{ background: `${metric.color}2E`, color: metric.color }}
            >
              <FontAwesomeIcon icon={metric.icon} style={{ fontSize: 13 }} />
            </span>
            <span
              className="text-[1.7rem] font-semibold leading-none tracking-tight tabular-nums"
              style={{ color: SHOWCASE.ink }}
            >
              {String(metric.value).padStart(2, '0')}
            </span>
            <span className="text-[0.82rem] font-medium leading-tight" style={{ color: SHOWCASE.inkSoft }}>
              {metric.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
