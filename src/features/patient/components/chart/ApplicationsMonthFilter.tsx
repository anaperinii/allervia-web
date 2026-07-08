import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { IconButton } from '@/shared/components'
import { useScrollIndicators } from '@/shared/hooks/useScrollIndicators'

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
          className="border border-(--border-custom) shadow-sm rounded-md"
        >
          <ChevronLeft size={12} />
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
          className="border border-(--border-custom) shadow-sm rounded-md"
        >
          <ChevronRight size={12} />
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
        'shrink-0 px-3 py-1 rounded-md text-[0.65rem] font-semibold border transition-all cursor-pointer',
        active
          ? 'bg-linear-to-br from-brand to-brand-dark text-white border-transparent'
          : 'bg-white text-(--text-muted) border-(--border-custom) hover:border-teal-300 hover:text-teal-600',
      )}
    >
      {children}
    </button>
  )
}
