import { useMemo, useState } from 'react'
import { isAfter, isBefore, parse, startOfDay, endOfDay } from 'date-fns'
import { useNotificationsStore, TYPE_TO_CATEGORY } from '@/features/notification/stores/notifications-store'
import type { NotificationTabKey } from '@/features/notification/constants/notification-display'
import type { ReadFilter } from '@/features/notification/components/notification-filter-bar'
import { NotificationsHeader } from '@/features/notification/components/notifications-header'
import { NotificationFilterBar } from '@/features/notification/components/notification-filter-bar'
import { NotificationListItem } from '@/features/notification/components/notification-list-item'
import { NotificationsEmpty } from '@/features/notification/components/notifications-empty'

function parseDateInput(value: string): Date | null {
  if (!value) return null
  const parsed = parse(value, 'yyyy-MM-dd', new Date())
  return isNaN(parsed.getTime()) ? null : parsed
}

export function NotificationsPage() {
  const { notifications, markAsRead, markAsUnread, markAllAsRead, markSelectedAsRead, markSelectedAsUnread } =
    useNotificationsStore()

  const [activeTab, setActiveTab] = useState<NotificationTabKey>('all')
  const [readFilter, setReadFilter] = useState<ReadFilter>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const { effectiveDateFrom, effectiveDateTo, dateRangeError } = useMemo(() => {
    const from = parseDateInput(dateFrom)
    const to = parseDateInput(dateTo)
    if (from && to && from > to) {
      return { effectiveDateFrom: null, effectiveDateTo: null, dateRangeError: true }
    }
    return { effectiveDateFrom: from, effectiveDateTo: to, dateRangeError: false }
  }, [dateFrom, dateTo])

  const hasActiveFilters =
    activeTab !== 'all' || readFilter !== 'all' || dateFrom !== '' || dateTo !== ''

  const clearFilters = () => {
    setActiveTab('all')
    setReadFilter('all')
    setDateFrom('')
    setDateTo('')
  }

  const filtered = useMemo(() => {
    return notifications
      .filter((notification) => activeTab === 'all' || TYPE_TO_CATEGORY[notification.type] === activeTab)
      .filter((notification) => readFilter === 'all' || (readFilter === 'unread' ? !notification.read : notification.read))
      .filter((notification) => {
        if (effectiveDateFrom && isBefore(notification.timestamp, startOfDay(effectiveDateFrom))) return false
        if (effectiveDateTo && isAfter(notification.timestamp, endOfDay(effectiveDateTo))) return false
        return true
      })
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }, [notifications, activeTab, readFilter, effectiveDateFrom, effectiveDateTo])

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications],
  )

  const tabCounts = useMemo(() => {
    const counts: Record<NotificationTabKey, number> = { all: 0, clinical: 0, scheduling: 0, system: 0 }
    notifications
      .filter((notification) => !notification.read)
      .forEach((notification) => {
        counts.all++
        counts[TYPE_TO_CATEGORY[notification.type]]++
      })
    return counts
  }, [notifications])

  const allSelected = filtered.length > 0 && selectedIds.size === filtered.length

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (allSelected) setSelectedIds(new Set())
    else setSelectedIds(new Set(filtered.map((notification) => notification.id)))
  }

  const handleBatchRead = () => {
    markSelectedAsRead([...selectedIds])
    setSelectedIds(new Set())
  }

  const handleBatchUnread = () => {
    markSelectedAsUnread([...selectedIds])
    setSelectedIds(new Set())
  }

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="flex flex-1 flex-col bg-gray-50/80 min-h-0 overflow-hidden">
      <div className="flex flex-1 min-h-0 flex-col rounded-xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden m-4">
        <NotificationsHeader
          unreadCount={unreadCount}
          selectedCount={selectedIds.size}
          onMarkAllRead={markAllAsRead}
          onBatchRead={handleBatchRead}
          onBatchUnread={handleBatchUnread}
        />

        <NotificationFilterBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabCounts={tabCounts}
          readFilter={readFilter}
          onReadFilterChange={setReadFilter}
          dateFrom={dateFrom}
          onDateFromChange={setDateFrom}
          dateTo={dateTo}
          onDateToChange={setDateTo}
          dateRangeError={dateRangeError}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearFilters}
        />

        <div className="px-5 py-1.5 border-b border-(--border-custom) bg-gray-50/50 flex items-center gap-3">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleSelectAll}
            aria-label="Selecionar todas as notificações"
            className="w-3.5 h-3.5 rounded border-gray-300 text-brand cursor-pointer accent-brand"
          />
          <span className="text-[0.6rem] text-(--text-muted)">{filtered.length} notificações</span>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <NotificationsEmpty hasActiveFilters={hasActiveFilters} onClearFilters={clearFilters} />
          ) : (
            <ul role="list" aria-label="Notificações" className="list-none m-0 p-0">
              {filtered.map((notification) => (
                <li key={notification.id} className="list-none">
                  <NotificationListItem
                    notification={notification}
                    selected={selectedIds.has(notification.id)}
                    expanded={expandedId === notification.id}
                    onToggleSelect={toggleSelect}
                    onToggleExpand={toggleExpand}
                    onMarkRead={markAsRead}
                    onMarkUnread={markAsUnread}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
