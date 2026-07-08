import { CalendarDays, Clock, Droplet } from 'lucide-react'
import type { ComponentType, CSSProperties } from 'react'

const withSmallMl = (value: string) =>
  value.split(/(ml)/gi).map((part, index) =>
    /^ml$/i.test(part) ? <span key={index} className="text-[0.7em] font-semibold ml-0.5">{part}</span> : part,
  )

interface SummaryCardsProps {
  currentInterval: number
  nextDate: string
  currentDose: string
}

const CARDS: { key: string; icon: ComponentType<{ size?: number; className?: string; style?: CSSProperties }>; label: string; render: (props: SummaryCardsProps) => string }[] = [
  { key: 'interval', icon: Clock, label: 'Intervalo Atual', render: (p) => `${p.currentInterval} dias` },
  { key: 'next', icon: CalendarDays, label: 'Próxima Aplicação', render: (p) => p.nextDate },
  { key: 'dose', icon: Droplet, label: 'Última Concentração e Volume', render: (p) => p.currentDose },
]

export function SummaryCards(props: SummaryCardsProps) {
  return (
    <div
      className="relative grid grid-cols-3 gap-3 rounded-2xl p-3 overflow-hidden"
      style={{
        backgroundImage: 'linear-gradient(160deg, #0e353d 0%, #08191d 100%)',
        boxShadow: '0 20px 50px -20px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)',
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-10 left-10 h-36 w-36 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(108,158,165,0.28), transparent 70%)' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-12 right-12 h-40 w-40 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(155,193,196,0.18), transparent 70%)' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-24 w-56 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(14,53,61,0.45), transparent 70%)' }}
      />
      {CARDS.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.key}
            className="rounded-xl p-4 flex items-center gap-3.5 border relative overflow-hidden"
            style={{
              background: 'linear-gradient(160deg, rgba(220,225,229,0.10), rgba(220,225,229,0.03))',
              borderColor: 'rgba(220,225,229,0.13)',
              boxShadow:
                '0 10px 28px -12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08), 0 0 22px -6px rgba(108,158,165,0.3)',
            }}
          >
            <Icon
              size={22}
              className="shrink-0"
              style={{ color: '#9BC1C4', filter: 'drop-shadow(0 0 6px rgba(108,158,165,0.65))' }}
            />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium" style={{ color: '#7FA6AC' }}>{card.label}</div>
              <div className="text-lg font-semibold truncate" style={{ color: '#EAF1F1' }}>{withSmallMl(card.render(props))}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
