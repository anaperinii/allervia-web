import { useMemo, useState } from 'react'
import { isAfter, isBefore, startOfDay, endOfDay } from 'date-fns'
import { useNotificationsStore, TYPE_TO_CATEGORY } from '@/features/notification/stores/useNotificationsStore'
import type { NotificationTabKey } from '@/features/notification/constants/notification-display'
import type { ReadFilter } from '@/features/notification/components/NotificationFilterBar'
import { Button } from '@/shared/components'
import { NotificationsHeader } from '@/features/notification/components/NotificationsHeader'
import { NotificationFilters } from '@/features/notification/components/NotificationFilterBar'
import { NotificationListItem } from '@/features/notification/components/NotificationListItem'
import { NotificationsEmpty } from '@/features/notification/components/NotificationsEmpty'
import { parseIsoDate } from '@/shared/lib/dates'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckDouble, faEnvelope, faEnvelopeOpen, faTrash } from '@fortawesome/free-solid-svg-icons'

export function NotificationsPage() {
  const { notifications, markAsRead, markAsUnread, markAllAsRead, markSelectedAsRead, markSelectedAsUnread, deleteSelected } =
    useNotificationsStore()

  const [activeTab, setActiveTab] = useState<NotificationTabKey>('all')
  const [readFilter, setReadFilter] = useState<ReadFilter>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const { effectiveDateFrom, effectiveDateTo, dateRangeError } = useMemo(() => {
    const from = parseIsoDate(dateFrom)
    const to = parseIsoDate(dateTo)
    if (from && to && from > to) {
      return { effectiveDateFrom: null, effectiveDateTo: null, dateRangeError: true }
    }
    return { effectiveDateFrom: from, effectiveDateTo: to, dateRangeError: false }
  }, [dateFrom, dateTo])

  const hasActiveFilters =
    readFilter !== 'all' || dateFrom !== '' || dateTo !== ''

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

  const handleBatchDelete = () => {
    deleteSelected([...selectedIds])
    setSelectedIds(new Set())
  }

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden pt-0">
      {/* Filters ride in the header's actions slot; the PageHeader owns the spacing. */}
      <NotificationsHeader
        actions={
          <NotificationFilters
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
        }
      />

      <div className="flex flex-1 min-h-0 flex-col">
        <div className="relative z-10 -mb-px shrink-0 rounded-t-3xl border border-b-0 border-[#DDE6E6] bg-[#F6F8F8] px-5 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleSelectAll}
              aria-label="Selecionar todas as notificações"
              className="w-4 h-4 rounded border-gray-300 text-brand cursor-pointer accent-[#257E8C]"
            />
            <span className="text-xs text-(--text-muted)">{filtered.length} notificações</span>
            {selectedIds.size > 0 && (
              <span className="text-[0.6rem] font-semibold text-brand-dark bg-brand/25 border border-brand/20 px-2 py-0.5 rounded-md">
                {selectedIds.size} selecionadas
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {selectedIds.size > 0 && (
              <>
                <Button variant="outline" size="sm" leftIcon={<FontAwesomeIcon icon={faEnvelopeOpen} style={{ fontSize: 11 }} />} onClick={handleBatchRead} className="bg-gray-100! border-gray-300! text-gray-700! hover:bg-gray-200!">
                  Marcar como lidas
                </Button>
                <Button variant="outline" size="sm" leftIcon={<FontAwesomeIcon icon={faEnvelope} style={{ fontSize: 11 }} />} onClick={handleBatchUnread} className="bg-gray-100! border-gray-300! text-gray-700! hover:bg-gray-200!">
                  Marcar como não lidas
                </Button>
                <Button tone="danger" variant="outline" size="sm" leftIcon={<FontAwesomeIcon icon={faTrash} style={{ fontSize: 11 }} />} onClick={handleBatchDelete}>
                  Excluir
                </Button>
              </>
            )}
            {unreadCount > 0 && selectedIds.size === 0 && (
              <Button variant="outline" size="sm" leftIcon={<FontAwesomeIcon icon={faCheckDouble} style={{ fontSize: 12 }} />} onClick={markAllAsRead} className="bg-gray-100! border-gray-300! text-gray-700! hover:bg-gray-200!">
                Marcar todas como lidas
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-1 min-h-0 flex-col overflow-y-auto rounded-b-3xl border border-t-0 border-[#DDE6E6] bg-white">
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
