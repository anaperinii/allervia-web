import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type ServerNotification,
  type ServerNotificationKind,
} from '@/shared/api/notifications.api'
import { ApiError } from '@/shared/api/contracts/errors'
import { Button } from '@/shared/components'
import { NotificationsHeader } from '@/features/notification/components/NotificationsHeader'
import { NotificationListItem } from '@/features/notification/components/NotificationListItem'
import { NotificationsEmpty } from '@/features/notification/components/NotificationsEmpty'
import type {
  Notification,
  NotificationPriority,
  NotificationType,
} from '@/features/notification/stores/useNotificationsStore'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckDouble } from '@fortawesome/free-solid-svg-icons'

const PAGE_SIZE = 25

const KIND_PRESENTATION: Record<
  ServerNotificationKind,
  { type: NotificationType; priority: NotificationPriority }
> = {
  PHYSICIAN_REVIEW_REQUESTED: { type: 'adverse_reaction', priority: 'critical' },
  TREATMENT_SUSPENDED: { type: 'patient_inactivity', priority: 'high' },
}

function toPresentation(item: ServerNotification): Notification {
  const display = KIND_PRESENTATION[item.kind]
  return {
    id: item.id,
    type: display.type,
    priority: display.priority,
    title: item.title,
    message: item.body,
    timestamp: new Date(item.createdAt),
    read: item.readAt !== null,
  }
}

export function NotificationsPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const query = useQuery({
    queryKey: ['notifications', { page, unreadOnly }],
    queryFn: ({ signal }) =>
      listNotifications({ page, pageSize: PAGE_SIZE, unreadOnly }, signal),
    refetchInterval: 60_000,
  })

  const items = useMemo(
    () => (query.data?.items ?? []).map(toPresentation),
    [query.data],
  )
  const unreadCount = query.data?.unread ?? 0
  const total = query.data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['notifications'] })

  const markReadMutation = useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: invalidate,
  })
  const markAllMutation = useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: invalidate,
  })

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden pt-0">
      <NotificationsHeader actions={null} />

      <div className="flex flex-1 min-h-0 flex-col">
        <div className="relative z-10 -mb-px shrink-0 rounded-t-3xl border border-b-0 border-[#DDE6E6] bg-[#F6F8F8] px-5 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs text-(--text-muted)">
              {total} notificações · {unreadCount} não lidas
            </span>
            <label className="flex items-center gap-1.5 text-[0.7rem] text-(--text-muted) cursor-pointer">
              <input
                type="checkbox"
                checked={unreadOnly}
                onChange={(e) => { setUnreadOnly(e.target.checked); setPage(1) }}
                className="accent-[#257E8C]"
              />
              Somente não lidas
            </label>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<FontAwesomeIcon icon={faCheckDouble} style={{ fontSize: 12 }} />}
                disabled={markAllMutation.isPending}
                onClick={() => markAllMutation.mutate()}
                className="bg-gray-100! border-gray-300! text-gray-700! hover:bg-gray-200!"
              >
                Marcar todas como lidas
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-1 min-h-0 flex-col overflow-y-auto rounded-b-3xl border border-t-0 border-[#DDE6E6] bg-white">
          {query.error && (
            <p role="alert" className="px-5 py-4 text-xs text-red-700">
              {query.error instanceof ApiError
                ? query.error.message
                : 'Não foi possível carregar as notificações.'}
            </p>
          )}
          {query.isPending && (
            <p className="px-5 py-4 text-xs text-(--text-muted)">Carregando…</p>
          )}
          {!query.isPending && items.length === 0 && !query.error ? (
            <NotificationsEmpty
              hasActiveFilters={unreadOnly}
              onClearFilters={() => setUnreadOnly(false)}
            />
          ) : (
            <ul role="list" aria-label="Notificações" className="list-none m-0 p-0">
              {items.map((notification) => (
                <li key={notification.id} className="list-none">
                  <NotificationListItem
                    notification={notification}
                    selected={false}
                    expanded={expandedId === notification.id}
                    onToggleSelect={() => {}}
                    onToggleExpand={(id) =>
                      setExpandedId((prev) => (prev === id ? null : id))
                    }
                    onMarkRead={(id) => markReadMutation.mutate(id)}
                    onMarkUnread={() => {}}
                  />
                </li>
              ))}
            </ul>
          )}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 py-3 border-t border-(--border-custom)">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Anterior
              </Button>
              <span className="text-[0.7rem] text-(--text-muted)">
                Página {page} de {totalPages}
              </span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Próxima
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
