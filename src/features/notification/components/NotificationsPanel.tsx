import { useSession } from '@/shared/auth/useSession'
import { queryKeys } from '@/shared/api/query-keys'
import { useEffect, useMemo, useState } from 'react'
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
import { NotificationListItem } from '@/features/notification/components/NotificationListItem'
import { NotificationsEmpty } from '@/features/notification/components/NotificationsEmpty'
import { cn } from '@/shared/lib/cn'
import type {
  Notification,
  NotificationPriority,
  NotificationType,
} from '@/features/notification/stores/useNotificationsStore'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckDouble } from '@fortawesome/free-solid-svg-icons'

const PAGE_SIZE = 25

const FALLBACK_PRESENTATION: {
  type: NotificationType
  priority: NotificationPriority
} = { type: 'system_alert', priority: 'medium' }

const KIND_PRESENTATION: Record<
  ServerNotificationKind,
  { type: NotificationType; priority: NotificationPriority }
> = {
  PHYSICIAN_REVIEW_REQUESTED: { type: 'adverse_reaction', priority: 'critical' },
  TREATMENT_SUSPENDED: { type: 'patient_inactivity', priority: 'high' },
  EMAIL_CHANGE_REQUEST_PENDING: { type: 'system_alert', priority: 'high' },
  EMAIL_CHANGE_REQUEST_DECIDED: { type: 'system_alert', priority: 'medium' },
}

function toPresentation(item: ServerNotification): Notification {
  const display = KIND_PRESENTATION[item.kind] ?? FALLBACK_PRESENTATION
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

interface NotificationsPanelProps {
  /** `drawer` drops the rounded card border so the panel fills the slide-over. */
  variant?: 'page' | 'drawer'
  enabled?: boolean
}

export function NotificationsPanel({
  variant = 'page',
  enabled = true,
}: NotificationsPanelProps) {
  const { account } = useSession()
  const organizationId = account?.organization?.id ?? ''
  const userId = account?.user.id ?? ''
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const isDrawer = variant === 'drawer'

  const query = useQuery({
    queryKey: queryKeys.notifications(organizationId, userId, { page, unreadOnly }),
    queryFn: ({ signal }) =>
      listNotifications({ page, pageSize: PAGE_SIZE, unreadOnly }, signal),
    refetchInterval: 60_000,
    enabled: enabled && userId !== '',
  })

  const items = useMemo(
    () => (query.data?.items ?? []).map(toPresentation),
    [query.data],
  )
  const unreadCount = query.data?.unread ?? 0
  const total = query.data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  useEffect(() => {
    setSelectedIds(new Set())
  }, [page, unreadOnly])

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.notificationScope(organizationId, userId) })

  const markReadMutation = useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: invalidate,
  })
  const markAllMutation = useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: invalidate,
  })
  const markSelectedMutation = useMutation({
    mutationFn: (ids: string[]) => Promise.all(ids.map((id) => markNotificationRead(id))),
    onSuccess: () => {
      setSelectedIds(new Set())
      invalidate()
    },
  })

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const visibleIds = items.map((item) => item.id)
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id))
  const toggleSelectAllVisible = () => {
    setSelectedIds((prev) => {
      if (allVisibleSelected) {
        const next = new Set(prev)
        visibleIds.forEach((id) => next.delete(id))
        return next
      }
      return new Set([...prev, ...visibleIds])
    })
  }

  return (
    <div className="flex flex-1 min-h-0 flex-col">
      <div
        className={cn(
          'relative z-10 -mb-px shrink-0 border-b px-5 py-3 flex items-center justify-between gap-3',
          'bg-[#F6F8F8] border-[#DDE6E6]',
          isDrawer ? 'flex-wrap' : 'rounded-t-xl border border-b-0',
        )}
      >
        <div className="flex items-center gap-3">
          {items.length > 0 && (
            <input
              type="checkbox"
              checked={allVisibleSelected}
              onChange={toggleSelectAllVisible}
              aria-label="Selecionar todas as notificações visíveis"
              className="w-3.5 h-3.5 rounded border-gray-300 cursor-pointer accent-[#257E8C]"
            />
          )}
          <span className="text-xs text-(--text-muted)">
            {selectedIds.size > 0
              ? `${selectedIds.size} selecionada${selectedIds.size === 1 ? '' : 's'}`
              : `${total} notificações · ${unreadCount} não lidas`}
          </span>
          {selectedIds.size === 0 && (
            <>
              <label className="flex items-center gap-1.5 text-[0.7rem] text-(--text-muted) cursor-pointer">
                <input
                  type="checkbox"
                  checked={unreadOnly}
                  onChange={(e) => { setUnreadOnly(e.target.checked); setPage(1) }}
                  className="accent-[#257E8C]"
                />
                Somente não lidas
              </label>
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<FontAwesomeIcon icon={faCheckDouble} style={{ fontSize: 10 }} />}
                  disabled={markAllMutation.isPending}
                  onClick={() => markAllMutation.mutate()}
                  className="bg-gray-100! border-gray-300! text-gray-700! hover:bg-gray-200! px-2! py-1! text-[0.68rem]!"
                >
                  Marcar todas como lidas
                </Button>
              )}
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<FontAwesomeIcon icon={faCheckDouble} style={{ fontSize: 12 }} />}
                disabled={markSelectedMutation.isPending}
                onClick={() => markSelectedMutation.mutate([...selectedIds])}
                className="bg-gray-100! border-gray-300! text-gray-700! hover:bg-gray-200!"
              >
                Marcar como lidas
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedIds(new Set())}
                className="bg-gray-100! border-gray-300! text-gray-700! hover:bg-gray-200!"
              >
                Limpar seleção
              </Button>
            </>
          )}
        </div>
      </div>

      <div
        className={cn(
          'flex flex-1 min-h-0 flex-col overflow-y-auto bg-white',
          !isDrawer && 'rounded-b-xl border border-t-0 border-[#DDE6E6]',
        )}
      >
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
                  selected={selectedIds.has(notification.id)}
                  expanded={expandedId === notification.id}
                  onToggleSelect={toggleSelect}
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
          <div className="mt-auto flex items-center justify-center gap-3 py-3 border-t border-(--border-custom)">
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
  )
}
