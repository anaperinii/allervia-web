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
    <div
      role="tablist"
      aria-label="Categoria"
      className="flex h-9 w-max items-stretch gap-0.5 rounded-full border border-[#DDE6E6] bg-white p-0.5"
    >
      {NOTIFICATION_TABS.map((tab) => {
        const active = activeTab === tab.key
        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={active}
            onClick={() => onTabChange(tab.key)}
            className={cn(
              'rounded-full px-4 text-[0.7rem] font-medium transition-all duration-200 flex items-center gap-1.5 cursor-pointer whitespace-nowrap',
              active ? 'bg-[#12333a] text-white' : 'text-[#4A6469] hover:text-[#12333a]',
            )}
          >
            {tab.label}
            {tabCounts[tab.key] > 0 && (
              <span
                className={cn(
                  'text-[0.55rem] font-bold rounded-full px-1.5 py-px',
                  active ? 'bg-white/22' : 'bg-[#257E8C] text-white',
                )}
              >
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
          className="h-9 text-[0.7rem] min-w-28"
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
          className={cn('h-9 text-[0.7rem]', dateRangeError ? 'border-red-400!' : '')}
        />
        <span className="text-[0.6rem] text-(--text-muted)" aria-hidden="true">—</span>
        <TextInput
          type="date"
          value={dateTo}
          onChange={(e) => onDateToChange(e.target.value)}
          aria-label="Data fim"
          aria-invalid={dateRangeError || undefined}
          className={cn('h-9 text-[0.7rem]', dateRangeError ? 'border-red-400!' : '')}
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
