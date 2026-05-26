import { CalendarDays, Clock, Droplet } from 'lucide-react'
import type { ComponentType } from 'react'

interface SummaryCardsProps {
  currentInterval: number
  nextDate: string
  currentDose: string
}

const CARDS: { key: string; icon: ComponentType<{ size?: number; className?: string }>; label: string; render: (props: SummaryCardsProps) => string }[] = [
  { key: 'interval', icon: Clock, label: 'Intervalo Atual', render: (p) => `${p.currentInterval} dias` },
  { key: 'next', icon: CalendarDays, label: 'Próxima Aplicação', render: (p) => p.nextDate },
  { key: 'dose', icon: Droplet, label: 'Última Concentração - Volume', render: (p) => p.currentDose },
]

export function SummaryCards(props: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {CARDS.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.key}
            className="border border-(--border-custom) rounded-xl p-4 flex items-center gap-3.5 relative overflow-hidden bg-white"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-brand to-brand/25" />
            <div className="absolute inset-0 bg-linear-to-r from-brand/10 to-transparent" />
            <div className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0 relative z-10 bg-teal-100/70">
              <Icon size={18} className="text-brand" />
            </div>
            <div className="flex-1 relative z-10 min-w-0">
              <div className="text-xs font-medium text-(--text-muted)">{card.label}</div>
              <div className="text-sm font-extrabold text-(--text) truncate">{card.render(props)}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
