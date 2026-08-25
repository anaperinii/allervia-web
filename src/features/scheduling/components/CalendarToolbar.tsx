import type { ReactNode } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'

interface CalendarToolbarProps {
  monthLabel: string
  onPrev: () => void
  onNext: () => void
  rightContent?: ReactNode
}

const LEGEND_ITEMS = [
  { color: '#B7E06A', label: 'Subcutânea' },
  { color: '#74C3B9', label: 'Sublingual' },
]

export function CalendarToolbar({
  monthLabel,
  onPrev,
  onNext,
  rightContent,
}: CalendarToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-3 h-14 px-4 border-b border-(--border-custom) shrink-0">
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-3">
          <button
            onClick={onPrev}
            aria-label="Período anterior"
            className="flex items-center justify-center text-(--text) hover:text-brand transition-colors"
          >
            <FontAwesomeIcon icon={faChevronLeft} style={{ fontSize: 16 }} />
          </button>
          <span className="text-base font-semibold text-(--text) min-w-32 text-center capitalize">
            {monthLabel}
          </span>
          <button
            onClick={onNext}
            aria-label="Próximo período"
            className="flex items-center justify-center text-(--text) hover:text-brand transition-colors"
          >
            <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 16 }} />
          </button>
        </div>

        <div className="flex items-center gap-4 text-[0.7rem] text-(--text-muted)">
          {LEGEND_ITEMS.map((item) => (
            <span key={item.label} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              {item.label}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {rightContent}
      </div>
    </div>
  )
}
