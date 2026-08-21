import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowTrendUp, faCalendarDays, faCircleExclamation, faDroplet } from '@fortawesome/free-solid-svg-icons'

const withSmallSymbol = (value: string) =>
  value.split(/(%)/g).map((part, index) =>
    part === '%' ? <span key={index} className="text-[0.6em] font-normal">%</span> : part,
  )

interface CompletionMetricsProps {
  totalApplications: number
  adherencePct: number
  rescheduledCount: number
  adverseEventsCount: number
  totalDurationLabel: string
}

interface MetricCard {
  key: string
  icon: IconDefinition
  label: string
  value: string
  valueTag?: string
}

export function CompletionMetrics({
  totalApplications,
  adherencePct,
  rescheduledCount,
  adverseEventsCount,
  totalDurationLabel,
}: CompletionMetricsProps) {
  const cards: MetricCard[] = [
    { key: 'apps', icon: faDroplet, label: 'Aplicações totais', value: String(totalApplications) },
    {
      key: 'adherence',
      icon: faArrowTrendUp,
      label: 'Aderência',
      value: `${adherencePct}%`,
      valueTag: rescheduledCount === 1 ? '1 reagendamento' : `${rescheduledCount} reagendamentos`,
    },
    { key: 'adverse', icon: faCircleExclamation, label: 'Reações adversas', value: String(adverseEventsCount) },
    {
      key: 'duration',
      icon: faCalendarDays,
      label: 'Duração total',
      value: totalDurationLabel,
    },
  ]

  return (
    <div className="grid grid-cols-4 gap-3">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.key}
            className="relative overflow-hidden border border-(--border-custom) rounded-xl bg-white/55 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-4 flex items-center gap-3"
            style={{
              backgroundImage:
                'linear-gradient(105deg, rgba(108,158,165,0.28) 0%, rgba(155,193,196,0.16) 25%, rgba(234,241,241,0.07) 55%, transparent 80%)',
            }}
          >
            <FontAwesomeIcon icon={Icon} className="pointer-events-none absolute -bottom-5 -left-9 text-brand/15" style={{ fontSize: 82 }} />
            <div className="relative flex flex-1 items-baseline gap-2 min-w-0">
              <span className="text-2xl font-semibold leading-none text-(--text) shrink-0">{withSmallSymbol(card.value)}</span>
              <span className="text-[0.7rem] font-medium leading-tight text-(--text-muted)">{card.label}</span>
            </div>
            {card.valueTag && (
              <span className="relative shrink-0 text-[0.55rem] font-semibold text-(--text-muted) bg-gray-100 border border-(--border-custom) rounded-md px-1.5 py-0.5">
                {card.valueTag}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
