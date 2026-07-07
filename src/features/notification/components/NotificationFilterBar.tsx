import { X } from 'lucide-react'
import { Button, Select, TextInput } from '@/shared/components'
import { cn } from '@/shared/lib/cn'
import { NOTIFICATION_TABS, type NotificationTabKey } from '@/features/notification/constants/notification-display'

export type ReadFilter = 'all' | 'read' | 'unread'

interface NotificationFilterBarProps {
  activeTab: NotificationTabKey
  onTabChange: (tab: NotificationTabKey) => void
  tabCounts: Record<NotificationTabKey, number>
  readFilter: ReadFilter
  onReadFilterChange: (filter: ReadFilter) => void
  dateFrom: string
  onDateFromChange: (value: string) => void
  dateTo: string
  onDateToChange: (value: string) => void
  dateRangeError: boolean
  hasActiveFilters: boolean
  onClearFilters: () => void
}

export function NotificationFilterBar({
  activeTab,
  onTabChange,
  tabCounts,
  readFilter,
  onReadFilterChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  dateRangeError,
  hasActiveFilters,
  onClearFilters,
}: NotificationFilterBarProps) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div role="tablist" aria-label="Categoria" className="flex h-7 rounded-lg border-[#CBD6D6]! bg-[#F3F5F6]! overflow-hidden">
          {NOTIFICATION_TABS.map((tab) => {
            const active = activeTab === tab.key
            return (
              <button
                key={tab.key}
                role="tab"
                aria-selected={active}
                onClick={() => onTabChange(tab.key)}
                className={cn(
                  'px-3 text-[0.65rem] font-semibold transition-all flex items-center gap-1',
                  active ? 'bg-linear-to-br from-brand to-brand-dark text-white' : 'text-(--text-muted) hover:bg-teal-50/60',
                )}
              >
                {tab.label}
                {tabCounts[tab.key] > 0 && (
                  <span className={cn('text-[0.5rem] rounded-full px-1 py-px', active ? 'bg-white/25' : 'bg-brand text-white')}>
                    {tabCounts[tab.key]}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={readFilter}
            onChange={(e) => onReadFilterChange(e.target.value as ReadFilter)}
            aria-label="Status de leitura"
            className="h-7 bg-[#F3F5F6]! border-[#CBD6D6]! text-[0.65rem] min-w-28"
          >
            <option value="all">Todas</option>
            <option value="unread">Não lidas</option>
            <option value="read">Lidas</option>
          </Select>
          <TextInput
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            aria-label="Data início"
            aria-invalid={dateRangeError || undefined}
            className={cn('h-7 bg-[#F3F5F6]! text-[0.65rem]', dateRangeError ? 'border-red-400!' : 'border-[#CBD6D6]!')}
          />
          <span className="text-[0.6rem] text-(--text-muted)" aria-hidden="true">—</span>
          <TextInput
            type="date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            aria-label="Data fim"
            aria-invalid={dateRangeError || undefined}
            className={cn('h-7 bg-[#F3F5F6]! text-[0.65rem]', dateRangeError ? 'border-red-400!' : 'border-[#CBD6D6]!')}
          />
          {hasActiveFilters && (
            <Button tone="danger" variant="outline" size="sm" leftIcon={<X size={11} />} onClick={onClearFilters}>
              Limpar
            </Button>
          )}
        </div>
      </div>
      {dateRangeError && (
        <p role="alert" className="text-[0.6rem] text-red-500 mt-1.5 text-right">
          Data fim deve ser igual ou posterior à data início
        </p>
      )}
    </div>
  )
}
