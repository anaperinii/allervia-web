import type { ReactNode } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'

interface CalendarToolbarProps {
  monthLabel: string
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  rightContent?: ReactNode
}

const LEGEND_ITEMS = [
  { color: '#B7E06A', label: 'Subcutânea' },
  { color: '#74C3B9', label: 'Sublingual' },
]

const NAV_BUTTON_CLASS =
  'flex h-8 w-8 items-center justify-center rounded-full cursor-pointer transition-colors text-(--text) hover:text-brand'

export function CalendarToolbar({ monthLabel, onPrev, onNext, onToday, rightContent }: CalendarToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-3 h-14 px-6 border-b border-(--border-custom) shrink-0">
      <div className="flex items-center gap-3">
        <span className="text-base font-semibold text-(--text) capitalize">{monthLabel}</span>

        {/* Classes, not inline styles, so the hover tint can override the base fill. */}
        <button
          type="button"
          onClick={onToday}
          className="h-7 rounded-full border border-[#257E8C] bg-[#257E8C]/10 px-4 text-[0.75rem] font-medium text-[#257E8C] cursor-pointer transition-colors hover:bg-[#257E8C]/20"
        >
          Hoje
        </button>

        <div className="flex items-center gap-1">
          <button type="button" onClick={onPrev} aria-label="Período anterior" className={NAV_BUTTON_CLASS}>
            <FontAwesomeIcon icon={faChevronLeft} style={{ fontSize: 16 }} />
          </button>
          <button type="button" onClick={onNext} aria-label="Próximo período" className={NAV_BUTTON_CLASS}>
            <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 16 }} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-4 text-[0.7rem] text-(--text-muted)">
          {LEGEND_ITEMS.map((item) => (
            <span key={item.label} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              {item.label}
            </span>
          ))}
        </div>
        {rightContent}
      </div>
    </div>
  )
}
