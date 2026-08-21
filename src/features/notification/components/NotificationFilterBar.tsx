import { Button, SegmentedControl, Select, TextInput } from '@/shared/components'
import { cn } from '@/shared/lib/cn'
import { NOTIFICATION_TABS, type NotificationTabKey } from '@/features/notification/constants/notification-display'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'

export type ReadFilter = 'all' | 'read' | 'unread'

interface NotificationTabsProps {
  activeTab: NotificationTabKey
  onTabChange: (tab: NotificationTabKey) => void
  tabCounts: Record<NotificationTabKey, number>
}

export function NotificationFilterBar({ activeTab, onTabChange, tabCounts }: NotificationTabsProps) {
  return (
    <div role="tablist" aria-label="Categoria" className="flex h-7 w-max rounded-lg border-[#CBD6D6]! bg-[#F3F5F6]! overflow-hidden">
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
  )
}

interface NotificationFiltersProps {
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

export function NotificationFilters({
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
}: NotificationFiltersProps) {
  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <SegmentedControl
          size="md"
          value={activeTab}
          onChange={onTabChange}
          options={NOTIFICATION_TABS.map((tab) => {
            const count = tabCounts[tab.key]
            return {
              value: tab.key,
              label: (
                <span className="flex items-center gap-1.5">
                  {tab.key === 'all' ? 'Geral' : tab.label}
                  {count > 0 && (
                    <span
                      className="flex items-center justify-center min-w-[15px] h-[15px] px-1 rounded-full text-[0.55rem] font-bold text-white"
                      style={{ background: '#1d6772' }}
                    >
                      {count}
                    </span>
                  )}
                </span>
              ),
            }
          })}
          aria-label="Categoria"
        />
        <Select
          value={readFilter}
          onChange={(e) => onReadFilterChange(e.target.value as ReadFilter)}
          aria-label="Status de leitura"
          className="h-8 bg-[#F3F5F6]! border-[#CBD6D6]! text-[0.7rem] min-w-28"
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
          className={cn('h-8 bg-[#F3F5F6]! text-[0.7rem]', dateRangeError ? 'border-red-400!' : 'border-[#CBD6D6]!')}
        />
        <span className="text-[0.6rem] text-(--text-muted)" aria-hidden="true">—</span>
        <TextInput
          type="date"
          value={dateTo}
          onChange={(e) => onDateToChange(e.target.value)}
          aria-label="Data fim"
          aria-invalid={dateRangeError || undefined}
          className={cn('h-8 bg-[#F3F5F6]! text-[0.7rem]', dateRangeError ? 'border-red-400!' : 'border-[#CBD6D6]!')}
        />
        {hasActiveFilters && (
          <Button tone="danger" variant="outline" size="sm" leftIcon={<FontAwesomeIcon icon={faXmark} style={{ fontSize: 11 }} />} onClick={onClearFilters}>
            Limpar
          </Button>
        )}
      </div>
      {dateRangeError && (
        <p role="alert" className="text-[0.6rem] text-red-500 text-right">
          Data fim deve ser igual ou posterior à data início
        </p>
      )}
    </div>
  )
}
