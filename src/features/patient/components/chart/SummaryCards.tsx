import { DottedSpot } from '@/features/patient/components/DottedSpot'

const withSmallMl = (value: string) =>
  value.split(/(ml)/gi).map((part, index) =>
    /^ml$/i.test(part) ? <span key={index} className="text-[0.7em] font-semibold ml-0.5">{part}</span> : part,
  )

interface SummaryCardsProps {
  currentInterval: number
  nextDate: string
  currentDose: string
}

const CARDS: { key: string; label: string; render: (props: SummaryCardsProps) => string }[] = [
  { key: 'interval', label: 'Intervalo Atual', render: (p) => `${p.currentInterval} dias` },
  { key: 'next', label: 'Próxima Aplicação', render: (p) => p.nextDate },
  { key: 'dose', label: 'Última Concentração e Volume', render: (p) => p.currentDose },
]

export function SummaryCards(props: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {CARDS.map((card) => (
        <div
          key={card.key}
          className="relative rounded-xl p-4 border overflow-hidden backdrop-blur-xl"
          style={{
            backgroundImage:
              'linear-gradient(160deg, rgba(220,225,229,0.14), rgba(220,225,229,0.04)), linear-gradient(160deg, #0e353d 0%, #08191d 100%)',
            borderColor: 'rgba(220,225,229,0.14)',
            boxShadow:
              '0 12px 30px -14px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.1), 0 0 22px -8px rgba(108,158,165,0.3)',
          }}
        >
          <DottedSpot className="pointer-events-none absolute bottom-0 right-0" />
          <div className="relative">
            <div className="text-xs font-medium" style={{ color: '#8FB4BA' }}>{card.label}</div>
            <div className="text-lg font-semibold truncate" style={{ color: '#F2F6F7' }}>{withSmallMl(card.render(props))}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
