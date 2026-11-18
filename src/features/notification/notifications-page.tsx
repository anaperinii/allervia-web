import { NotificationsHeader } from '@/features/notification/components/NotificationsHeader'
import { NotificationsPanel } from '@/features/notification/components/NotificationsPanel'

export function NotificationsPage() {
  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden pt-0">
      <NotificationsHeader actions={null} />
      <NotificationsPanel />
    </div>
  )
}
