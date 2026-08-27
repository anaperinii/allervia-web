import { Link } from '@tanstack/react-router'
import { format, isToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/shared/lib/cn'
import { IconButton } from '@/shared/components'
import { NOTIFICATION_TYPE_DISPLAY } from '@/features/notification/constants/notification-display'
import type { Notification } from '@/features/notification/stores/useNotificationsStore'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faChevronRight, faChevronUp, faEnvelope, faEnvelopeOpen } from '@fortawesome/free-solid-svg-icons'

interface NotificationListItemProps {
  notification: Notification
  selected: boolean
  expanded: boolean
  onToggleSelect: (id: string) => void
  onToggleExpand: (id: string) => void
  onMarkRead: (id: string) => void
  onMarkUnread: (id: string) => void
}

export function NotificationListItem({
  notification,
  selected,
  expanded,
  onToggleSelect,
  onToggleExpand,
  onMarkRead,
  onMarkUnread,
}: NotificationListItemProps) {
  const display = NOTIFICATION_TYPE_DISPLAY[notification.type]
  const receivedAt = isToday(notification.timestamp)
    ? format(notification.timestamp, 'HH:mm', { locale: ptBR })
    : format(notification.timestamp, 'dd/MM/yyyy', { locale: ptBR })

  return (
    <div
      className={cn(
        'px-5 py-3 border-b border-(--border-custom) last:border-0 transition-colors',
        !notification.read && 'bg-teal-50/20',
        selected && 'bg-brand/5',
      )}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect(notification.id)}
          aria-label={`Selecionar notificação: ${notification.title}`}
          className="w-3.5 h-3.5 rounded border-gray-300 mt-1 cursor-pointer accent-[#257E8C] shrink-0"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className="text-[0.62rem] font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 border border-gray-200">
              {display.label}
            </span>
            <time
              dateTime={notification.timestamp.toISOString()}
              title={notification.timestamp.toLocaleString('pt-BR')}
              className="text-[0.68rem] text-(--text-muted)"
            >
              {receivedAt}
            </time>
            {!notification.read && <span className="w-1.5 h-1.5 rounded-full bg-red-500" aria-label="Não lida" />}
          </div>
          <div className="text-[0.85rem] font-semibold text-(--text)">{notification.title}</div>
          <div className={cn('text-[0.78rem] text-(--text-muted) mt-1 leading-relaxed', !expanded && 'line-clamp-2')}>
            {notification.message}
          </div>

          {notification.details && (
            <div
              className={cn(
                'overflow-hidden transition-[max-height,opacity] duration-300 ease-out',
                expanded ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0',
              )}
            >
              <div className="mt-2 pt-2 border-t border-(--border-custom)">
                <p className="text-[0.78rem] text-(--text-muted) leading-relaxed">{notification.details}</p>
                {notification.actionUrl && (
                  <Link
                    to={notification.actionUrl}
                    className="inline-flex items-center gap-1 text-[0.7rem] font-semibold text-brand hover:underline no-underline mt-2"
                  >
                    {notification.actionLabel || 'Ver detalhes'}
                    <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 12 }} />
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <IconButton
            size="sm"
            aria-label={notification.read ? 'Marcar como não lida' : 'Marcar como lida'}
            onClick={() => (notification.read ? onMarkUnread(notification.id) : onMarkRead(notification.id))}
          >
            {notification.read ? <FontAwesomeIcon icon={faEnvelope} style={{ fontSize: 13 }} /> : <FontAwesomeIcon icon={faEnvelopeOpen} style={{ fontSize: 13 }} />}
          </IconButton>
          <IconButton
            size="sm"
            aria-label={expanded ? 'Recolher detalhes' : 'Expandir detalhes'}
            aria-expanded={expanded}
            onClick={() => onToggleExpand(notification.id)}
          >
            {expanded ? <FontAwesomeIcon icon={faChevronUp} style={{ fontSize: 13 }} /> : <FontAwesomeIcon icon={faChevronDown} style={{ fontSize: 13 }} />}
          </IconButton>
        </div>
      </div>
    </div>
  )
}
