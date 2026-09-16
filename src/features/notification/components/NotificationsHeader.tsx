import type { ReactNode } from 'react'
import { PageHeader } from '@/shared/components/showcase'

export function NotificationsHeader({ actions }: { actions?: ReactNode }) {
  return <PageHeader title="Central de Notificações" actions={actions} />
}
