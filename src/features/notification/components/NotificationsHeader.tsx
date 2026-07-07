interface NotificationsHeaderProps {
  unreadCount: number
}

export function NotificationsHeader({ unreadCount }: NotificationsHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <h1 className="text-3xl font-medium text-(--text)">Central de Notificações</h1>
      {unreadCount > 0 && (
        <span className="text-[0.6rem] font-semibold text-brand-dark bg-brand/25 border border-brand/20 rounded-md px-2 py-0.5">
          {unreadCount} não lidas
        </span>
      )}
    </div>
  )
}
