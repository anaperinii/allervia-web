function DottedSpot({ className }: { className?: string }) {
  const cols = 16
  const rows = 10
  const gap = 8
  const r = 1.6
  const pad = r + 1
  const width = (cols - 1) * gap + pad * 2
  const height = (rows - 1) * gap + pad * 2
  const maxDist = Math.hypot(cols - 1, rows - 1)
  const dots = []
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const frac = 1 - Math.hypot(cols - 1 - col, rows - 1 - row) / maxDist
      if (frac < 0.32 && (col + row) % 3 !== 0) continue
      if (frac < 0.58 && (col + row) % 2 !== 0) continue
      dots.push(
        <circle
          key={`${row}-${col}`}
          cx={pad + col * gap}
          cy={pad + row * gap}
          r={r}
          fill="#B9D4D7"
          fillOpacity={0.03 + Math.pow(frac, 2.2) * 0.92}
        />,
      )
    }
  }
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={className} aria-hidden="true">
      {dots}
    </svg>
  )
}

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
      {CARDS.map((card) => (
        <div
          key={card.key}
          className="relative rounded-xl p-4 border overflow-hidden"
          style={{
            background: 'linear-gradient(160deg, rgba(220,225,229,0.18), rgba(220,225,229,0.07))',
            borderColor: 'rgba(220,225,229,0.15)',
            boxShadow:
              '0 10px 28px -12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1), 0 0 22px -6px rgba(108,158,165,0.3)',
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
