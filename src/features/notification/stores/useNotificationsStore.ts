export type NotificationType =
  | 'upcoming_application'
  | 'missed_appointment'
  | 'adverse_reaction'
  | 'protocol_milestone'
  | 'patient_inactivity'
  | 'system_alert'
export type NotificationPriority = 'critical' | 'high' | 'medium' | 'low'
export type NotificationCategory = 'clinical' | 'scheduling' | 'system'

export interface Notification {
  id: string
  type: NotificationType
  priority: NotificationPriority
  title: string
  message: string
  details?: string
  timestamp: Date
  read: boolean
  patientId?: string
  actionUrl?: string
  actionLabel?: string
}

export const TYPE_TO_CATEGORY: Record<NotificationType, NotificationCategory> = {
  upcoming_application: 'scheduling',
  missed_appointment: 'scheduling',
  adverse_reaction: 'clinical',
  protocol_milestone: 'clinical',
  patient_inactivity: 'clinical',
  system_alert: 'system',
}
