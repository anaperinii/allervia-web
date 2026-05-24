import type { NotificationCategory, NotificationType } from '@/features/notification/stores/notifications-store'

export interface NotificationTypeDisplay {
  color: string
  bg: string
  label: string
  shortLabel: string
}

export const NOTIFICATION_TYPE_DISPLAY: Record<NotificationType, NotificationTypeDisplay> = {
  upcoming_application: { color: 'text-brand', bg: 'bg-teal-50', label: 'Aplicação próxima', shortLabel: 'Aplicação' },
  missed_appointment: { color: 'text-red-600', bg: 'bg-red-50', label: 'Falta', shortLabel: 'Falta' },
  adverse_reaction: { color: 'text-amber-600', bg: 'bg-amber-50', label: 'Reação adversa', shortLabel: 'Reação' },
  protocol_milestone: { color: 'text-violet-600', bg: 'bg-violet-50', label: 'Protocolo', shortLabel: 'Protocolo' },
  patient_inactivity: { color: 'text-orange-600', bg: 'bg-orange-50', label: 'Inatividade', shortLabel: 'Inatividade' },
  system_alert: { color: 'text-gray-500', bg: 'bg-gray-100', label: 'Sistema', shortLabel: 'Sistema' },
}

export type NotificationTabKey = 'all' | NotificationCategory

export interface NotificationTab {
  key: NotificationTabKey
  label: string
}

export const NOTIFICATION_TABS: NotificationTab[] = [
  { key: 'all', label: 'Todas' },
  { key: 'clinical', label: 'Clínicas' },
  { key: 'scheduling', label: 'Agendamentos' },
  { key: 'system', label: 'Sistema' },
]
