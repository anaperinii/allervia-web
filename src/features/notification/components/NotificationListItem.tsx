import { Link } from '@tanstack/react-router'
import { ChevronDown, ChevronRight, ChevronUp, Mail, MailOpen } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/shared/lib/cn'
import { IconButton } from '@/shared/components'
import { NOTIFICATION_TYPE_DISPLAY } from '@/features/notification/constants/notification-display'
import type { Notification } from '@/features/notification/stores/useNotificationsStore'

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
  const relativeTime = formatDistanceToNow(notification.timestamp, { locale: ptBR, addSuffix: true })

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
          className="w-3.5 h-3.5 rounded border-gray-300 mt-1 cursor-pointer accent-brand shrink-0"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className={cn('text-[0.55rem] font-semibold px-1.5 py-px rounded-full', display.bg, display.color)}>
              {display.label}
            </span>
            <time
              dateTime={notification.timestamp.toISOString()}
              title={notification.timestamp.toLocaleString('pt-BR')}
              className="text-[0.6rem] text-(--text-muted)"
            >
              {relativeTime}
            </time>
            {!notification.read && <span className="w-1.5 h-1.5 rounded-full bg-brand" aria-label="Não lida" />}
          </div>
          <div className="text-xs font-semibold text-(--text)">{notification.title}</div>
          <div className={cn('text-[0.65rem] text-(--text-muted) mt-0.5 leading-relaxed', !expanded && 'line-clamp-2')}>
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
                <p className="text-[0.65rem] text-(--text-muted) leading-relaxed">{notification.details}</p>
                {notification.actionUrl && (
                  <Link
                    to={notification.actionUrl}
                    className="inline-flex items-center gap-1 text-[0.7rem] font-semibold text-brand hover:underline no-underline mt-2"
                  >
                    {notification.actionLabel || 'Ver detalhes'}
                    <ChevronRight size={12} />
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
            {notification.read ? <Mail size={13} /> : <MailOpen size={13} />}
          </IconButton>
          <IconButton
            size="sm"
            aria-label={expanded ? 'Recolher detalhes' : 'Expandir detalhes'}
            aria-expanded={expanded}
            onClick={() => onToggleExpand(notification.id)}
          >
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </IconButton>
        </div>
      </div>
    </div>
  )
}
