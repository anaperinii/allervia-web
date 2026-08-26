import type { ReactNode } from 'react'
import { PageHeader } from '@/shared/components/showcase'

export function NotificationsHeader({ actions }: { actions?: ReactNode }) {
  return <PageHeader breadcrumb={['Allervia', 'Notificações']} title="Central de Notificações" actions={actions} />
}
