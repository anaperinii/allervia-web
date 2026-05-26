import { AlertCircle, CalendarDays, Droplet, RotateCcw } from 'lucide-react'
import type { ComponentType } from 'react'

interface CompletionMetricsProps {
  totalApplications: number
  adherencePct: number
  rescheduledCount: number
  adverseEventsCount: number
  totalDurationLabel: string
}

interface MetricCard {
  key: string
  icon: ComponentType<{ size?: number; className?: string }>
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
    { key: 'apps', icon: Droplet, label: 'Aplicações totais', value: String(totalApplications) },
    {
      key: 'adherence',
      icon: RotateCcw,
      label: 'Aderência',
      value: `${adherencePct}%`,
      valueTag: rescheduledCount === 1 ? '1 reagendamento' : `${rescheduledCount} reagendamentos`,
    },
    { key: 'adverse', icon: AlertCircle, label: 'Reações adversas', value: String(adverseEventsCount) },
    {
      key: 'duration',
      icon: CalendarDays,
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
            className="border border-(--border-custom) rounded-xl bg-white p-4 flex items-start gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl shrink-0 bg-teal-100/70">
              <Icon size={16} className="text-brand" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[0.65rem] font-medium text-(--text-muted)">{card.label}</div>
              <div className="flex items-baseline gap-1.5">
                <div className="text-base font-extrabold text-(--text) leading-tight">{card.value}</div>
                {card.valueTag && (
                  <span className="text-[0.55rem] font-semibold text-(--text-muted) bg-gray-100 border border-(--border-custom) rounded-full px-1.5 py-0.5">
                    {card.valueTag}
                  </span>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
