import allerviaMark from '@/assets/allervia-mark-light.png'
import { cn } from '@/shared/lib/cn'

const withSmallMl = (value: string) =>
  value.split(/(ml)/gi).map((part, index) =>
    /^ml$/i.test(part) ? <span key={index} className="text-[0.7em] font-semibold ml-0.5">{part}</span> : part,
  )

interface SummaryCardsProps {
  currentInterval: string
  nextDate: string
  currentDose: string

  previousDose?: string | null
}

const CARDS: {
  key: string
  label: string
  render: (props: SummaryCardsProps) => string

  ornament: string
  ornamentEcho: string
}[] = [
  {
    key: 'interval',
    label: 'Intervalo Atual',
    render: (p) => p.currentInterval,
    ornament: '-right-7 -top-5 h-32 w-32 rotate-[18deg]',
    ornamentEcho: 'right-6 -top-10 h-20 w-20 -rotate-[48deg]',
  },
  {
    key: 'next',
    label: 'Próxima Aplicação',
    render: (p) => p.nextDate,
    ornament: '-right-6 -bottom-8 h-32 w-32 -rotate-[62deg]',
    ornamentEcho: '-right-14 bottom-6 h-24 w-24 rotate-[96deg]',
  },
  {
    key: 'dose',
    label: 'Concentração e Volume Vigentes',
    render: (p) => p.currentDose,
    ornament: '-right-10 top-1/2 -translate-y-1/2 h-32 w-32 rotate-[128deg]',
    ornamentEcho: 'right-2 -bottom-12 h-24 w-24 -rotate-[20deg]',
  },
]

export function SummaryCards(props: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-3 pt-2">
      {CARDS.map((card) => (
        <div key={card.key} className="relative">
          <div
            className="relative rounded-xl p-4 border overflow-hidden backdrop-blur-xl"
            style={{
              backgroundImage:
                'linear-gradient(160deg, rgba(220,225,229,0.14), rgba(220,225,229,0.04)), linear-gradient(160deg, #0e353d 0%, #08191d 100%)',
              borderColor: 'rgba(220,225,229,0.14)',
              boxShadow:
                '0 12px 30px -14px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.1), 0 0 22px -8px rgba(108,158,165,0.3)',
            }}
          >
            <img
              src={allerviaMark}
              alt=""
              aria-hidden="true"
              className={cn('pointer-events-none absolute object-contain', card.ornament)}
              style={{ filter: 'brightness(0) invert(1)', opacity: 0.07 }}
            />
            <img
              src={allerviaMark}
              alt=""
              aria-hidden="true"
              className={cn('pointer-events-none absolute object-contain', card.ornamentEcho)}
              style={{ filter: 'brightness(0) invert(1)', opacity: 0.05 }}
            />
            <div className="relative">
              <div className="text-xs font-medium" style={{ color: '#8FB4BA' }}>{card.label}</div>
              <div className="flex min-w-0 items-center gap-2">
                <div className="truncate text-lg font-semibold" style={{ color: '#F2F6F7' }}>
                  {withSmallMl(card.render(props))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
