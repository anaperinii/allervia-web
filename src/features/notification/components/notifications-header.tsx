import { CheckCheck, Mail, MailOpen } from 'lucide-react'
import { Button } from '@/shared/components'

interface NotificationsHeaderProps {
  unreadCount: number
  selectedCount: number
  onMarkAllRead: () => void
  onBatchRead: () => void
  onBatchUnread: () => void
}

export function NotificationsHeader({
  unreadCount,
  selectedCount,
  onMarkAllRead,
  onBatchRead,
  onBatchUnread,
}: NotificationsHeaderProps) {
  return (
    <div className="border-b border-(--border-custom) px-5 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-(--text)">Central de Notificações</h1>
        {unreadCount > 0 && (
          <span className="text-[0.6rem] font-semibold text-white bg-red-500 rounded-full px-2 py-0.5">
            {unreadCount} não lidas
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {selectedCount > 0 && (
          <>
            <span className="text-[0.6rem] font-semibold text-brand bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
              {selectedCount} selecionadas
            </span>
            <Button variant="outline" size="sm" leftIcon={<MailOpen size={11} />} onClick={onBatchRead}>
              Marcar como lidas
            </Button>
            <Button variant="outline" size="sm" leftIcon={<Mail size={11} />} onClick={onBatchUnread}>
              Marcar como não lidas
            </Button>
          </>
        )}
        {unreadCount > 0 && selectedCount === 0 && (
          <Button variant="outline" size="sm" leftIcon={<CheckCheck size={12} />} onClick={onMarkAllRead}>
            Marcar todas como lidas
          </Button>
        )}
      </div>
    </div>
  )
}
