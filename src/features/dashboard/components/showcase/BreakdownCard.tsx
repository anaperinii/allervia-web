import { faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { Card, CardHeader, CircleButton, SHOWCASE } from '@/shared/components/showcase'

interface BreakdownRow {
  label: string
  pct: number
}

interface BreakdownCardProps {
  title: string
  caption: string
  total: number
  totalPrefix?: string
  subValue: string
  rows: BreakdownRow[]
  onOpen: () => void
}

export function BreakdownCard({ title, caption, total, totalPrefix, subValue, rows, onOpen }: BreakdownCardProps) {
  return (
    <Card>
      <CardHeader
        title={title}
        actions={<CircleButton icon={faArrowRight} iconRotateDeg={-45} size={32} iconSize={10} onClick={onOpen} aria-label="Abrir" />}
      />

      <div className="text-[0.68rem] font-medium mb-1" style={{ color: SHOWCASE.muted }}>
        {caption}
      </div>
      <div className="flex items-baseline" style={{ color: SHOWCASE.ink }}>
        {totalPrefix && <span className="text-lg font-medium">{totalPrefix}</span>}
        <span className="text-[2.35rem] font-semibold leading-none tracking-tight tabular-nums">
          {total.toLocaleString('pt-BR')}
        </span>
      </div>
      <div className="text-[0.68rem] font-medium mt-1" style={{ color: SHOWCASE.muted }}>
        {subValue}
      </div>

      <div className="mt-auto space-y-2.5 pt-5">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center gap-3">
            <span className="w-16 shrink-0 text-[0.7rem] font-medium truncate" style={{ color: SHOWCASE.inkSoft }}>
              {row.label}
            </span>
            <div
              className="flex h-8 items-center rounded-lg px-3 min-w-14"
              style={{ width: `${Math.max(row.pct, 12)}%`, background: SHOWCASE.cardInner }}
            >
              <span className="text-[0.72rem] font-semibold tabular-nums" style={{ color: SHOWCASE.ink }}>
                {row.pct}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
