import { ChevronLeft, ChevronRight } from 'lucide-react'
import { SegmentedControl } from '@/shared/components'
import type { CalendarViewMode } from '@/features/scheduling/hooks/useCalendarNav'

interface CalendarToolbarProps {
  viewMode: CalendarViewMode
  onViewModeChange: (mode: CalendarViewMode) => void
  monthLabel: string
  onPrev: () => void
  onNext: () => void
  onToday: () => void
}

export function CalendarToolbar({
  viewMode,
  onViewModeChange,
  monthLabel,
  onPrev,
  onNext,
  onToday,
}: CalendarToolbarProps) {
  return (
    <div className="border-b border-(--border-custom) px-5 py-2.5 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <button
          onClick={onPrev}
          aria-label="Período anterior"
          className="h-7 w-7 flex items-center justify-center rounded-md border border-(--border-custom) text-(--text-muted) hover:border-brand hover:text-brand transition-all"
        >
          <ChevronLeft size={14} />
        </button>
        <button
          onClick={onNext}
          aria-label="Próximo período"
          className="h-7 w-7 flex items-center justify-center rounded-md border border-(--border-custom) text-(--text-muted) hover:border-brand hover:text-brand transition-all"
        >
          <ChevronRight size={14} />
        </button>
        <button
          onClick={onToday}
          className="h-7 px-2.5 rounded-md border border-(--border-custom) text-xs font-medium text-(--text-muted) hover:border-brand hover:text-brand transition-all"
        >
          Hoje
        </button>
        <span className="text-sm font-semibold text-(--text) ml-1">{monthLabel}</span>
      </div>
      <SegmentedControl
        value={viewMode}
        onChange={onViewModeChange}
        size="sm"
        options={[
          { value: 'week', label: 'Semana' },
          { value: 'month', label: 'Mês' },
        ]}
        aria-label="Modo de visualização"
      />
    </div>
  )
}
