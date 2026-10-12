import { apiRequest } from '@/shared/api/client'
import type { Schema } from '@/shared/api/generated/helpers'

export type ServerNotificationKind = Schema<'NotificationDto'>['kind']

export type ServerNotification = Schema<'NotificationDto'>

export type NotificationPage = Schema<'NotificationPageDto'>

export type NotificationPreference = Schema<'NotificationPreferenceDto'>

export function listNotifications(
  query: { page?: number; pageSize?: number; unreadOnly?: boolean },
  signal?: AbortSignal,
): Promise<NotificationPage> {
  const search = new URLSearchParams()
  if (query.page) search.set('page', String(query.page))
  if (query.pageSize) search.set('pageSize', String(query.pageSize))
  if (query.unreadOnly) search.set('unreadOnly', 'true')
  const suffix = search.toString() ? `?${search.toString()}` : ''
  return apiRequest(`/notifications${suffix}`, { signal })
}

export function markNotificationRead(id: string): Promise<ServerNotification> {
  return apiRequest(`/notifications/${id}/read`, { method: 'PATCH', body: {} })
}

export function markAllNotificationsRead(): Promise<
  Schema<'MarkAllReadResponseDto'>
> {
  return apiRequest('/notifications/read-all', { method: 'POST', body: {} })
}

export function getNotificationPreferences(
  signal?: AbortSignal,
): Promise<NotificationPreference[]> {
  return apiRequest('/notifications/preferences', { signal })
}

export function setNotificationPreference(
  kind: ServerNotificationKind,
  enabled: boolean,
): Promise<NotificationPreference[]> {
  return apiRequest('/notifications/preferences', {
    method: 'PATCH',
    body: { kind, enabled },
  })
}

export function createSupportRequest(body: {
  subject: string
  message: string
}): Promise<Schema<'SupportRequestReceiptDto'>> {
  return apiRequest('/support-requests', { method: 'POST', body })
}

export type SupportRequestItem = Schema<'SupportRequestListItemDto'>

export function listSupportRequests(
  signal?: AbortSignal,
): Promise<SupportRequestItem[]> {
  return apiRequest('/support-requests', { signal })
}
