import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/shared/components'

interface CalendarToolbarProps {
  monthLabel: string
  onPrev: () => void
  onNext: () => void
  onToday: () => void
}

const LEGEND_ITEMS = [
  { color: '#DEF3B2', label: 'Subcutânea' },
  { color: '#A5D4CE', label: 'Sublingual' },
  { color: '#E2E5E9', label: 'Ausente' },
]

const NOTCH = 'rgba(249,250,251,0.8)'

export function CalendarToolbar({
  monthLabel,
  onPrev,
  onNext,
  onToday,
}: CalendarToolbarProps) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div className="relative flex items-center gap-3 rounded-t-xl h-11 border border-b-0 border-(--border-custom) bg-gray-50/80 px-4">
        <button
          onClick={onPrev}
          aria-label="Período anterior"
          className="flex items-center justify-center text-(--text) hover:text-brand transition-colors"
        >
          <ChevronLeft size={20} strokeWidth={2.2} />
        </button>
        <span className="text-base font-semibold text-(--text) min-w-32 text-center capitalize">
          {monthLabel}
        </span>
        <button
          onClick={onNext}
          aria-label="Próximo período"
          className="flex items-center justify-center text-(--text) hover:text-brand transition-colors"
        >
          <ChevronRight size={20} strokeWidth={2.2} />
        </button>
        <Button tone="brand" variant="outline" size="sm" onClick={onToday} className="ml-1 text-(--text)! text-[0.7rem]!">
          Hoje
        </Button>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-3 bottom-0 h-3 w-3"
          style={{ background: `radial-gradient(circle at 100% 0%, transparent 11.5px, ${NOTCH} 12.5px)` }}
        />
      </div>

      <div className="relative flex items-center gap-4 rounded-t-xl h-11 border border-b-0 border-(--border-custom) bg-gray-50/80 px-4 text-[0.7rem] text-(--text-muted)">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -left-3 bottom-0 h-3 w-3"
          style={{ background: `radial-gradient(circle at 0% 0%, transparent 11.5px, ${NOTCH} 12.5px)` }}
        />
        {LEGEND_ITEMS.map((item) => (
          <span key={item.label} className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: item.color }}
            />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  )
}
