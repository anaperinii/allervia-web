import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CalendarToolbarProps {
  monthLabel: string
  onPrev: () => void
  onNext: () => void
  onToday: () => void
}

const LEGEND_ITEMS = [
  { color: '#FB923C', label: 'Subcutânea' },
  { color: '#8B5CF6', label: 'Sublingual' },
  { color: '#94A3B8', label: 'Ausente' },
]

export function CalendarToolbar({
  monthLabel,
  onPrev,
  onNext,
  onToday,
}: CalendarToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <button
          onClick={onPrev}
          aria-label="Período anterior"
          className="flex items-center justify-center text-(--text) hover:text-brand transition-colors"
        >
          <ChevronLeft size={20} strokeWidth={2.2} />
        </button>
        <span className="text-base font-semibold text-(--text) min-w-[8rem] text-center capitalize">
          {monthLabel}
        </span>
        <button
          onClick={onNext}
          aria-label="Próximo período"
          className="flex items-center justify-center text-(--text) hover:text-brand transition-colors"
        >
          <ChevronRight size={20} strokeWidth={2.2} />
        </button>
        <button
          onClick={onToday}
          className="ml-3 h-7 px-3 rounded-md border border-(--border-custom) bg-white text-xs font-medium text-(--text-muted) hover:border-brand hover:text-brand transition-all"
        >
          Hoje
        </button>
      </div>
      <div className="flex items-center gap-4 text-[0.7rem] text-(--text-muted)">
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
