import { cn } from '@/shared/lib/cn'
import { IconButton } from '@/shared/components'
import { useScrollIndicators } from '@/shared/hooks/useScrollIndicators'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'

interface MonthOption {
  key: string
  label: string
}

interface ApplicationsMonthFilterProps {
  months: MonthOption[]
  activeKey: string
  onChange: (key: string) => void
}

export function ApplicationsMonthFilter({ months, activeKey, onChange }: ApplicationsMonthFilterProps) {
  const { ref, canScrollLeft, canScrollRight, scrollBy } = useScrollIndicators<HTMLDivElement>()

  return (
    <div className="flex items-center gap-1 flex-1 min-w-0">
      {canScrollLeft && (
        <IconButton
          aria-label="Rolar meses para a esquerda"
          size="sm"
          onClick={() => scrollBy('left')}
          className="border border-[#DDE6E6] shadow-sm rounded-full"
        >
          <FontAwesomeIcon icon={faChevronLeft} style={{ fontSize: 12 }} />
        </IconButton>
      )}
      <div ref={ref} className="flex gap-1.5 overflow-x-auto pb-0.5 scroll-smooth flex-1 min-w-0" style={{ scrollbarWidth: 'none' }}>
        <FilterPill active={activeKey === 'all'} onClick={() => onChange('all')}>Todas</FilterPill>
        {months.map((m) => (
          <FilterPill key={m.key} active={activeKey === m.key} onClick={() => onChange(m.key)}>
            {m.label.charAt(0) + m.label.slice(1).toLowerCase()}
          </FilterPill>
        ))}
      </div>
      {canScrollRight && (
        <IconButton
          aria-label="Rolar meses para a direita"
          size="sm"
          onClick={() => scrollBy('right')}
          className="border border-[#DDE6E6] shadow-sm rounded-full"
        >
          <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 12 }} />
        </IconButton>
      )}
    </div>
  )
}

function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'shrink-0 h-6.5 inline-flex items-center px-3 rounded-full text-[0.62rem] font-medium border transition-all cursor-pointer whitespace-nowrap',
        active
          ? 'bg-[#12333a] text-white border-transparent'
          : 'bg-white text-[#4A6469] border-[#DDE6E6] hover:border-[#257E8C]/45 hover:text-[#257E8C]',
      )}
    >
      {children}
    </button>
  )
}
