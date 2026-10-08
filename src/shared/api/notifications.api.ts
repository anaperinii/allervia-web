import { apiRequest } from '@/shared/api/client'
import type { Page } from '@/shared/api/contracts/team'

export type ServerNotificationKind =
  | 'PHYSICIAN_REVIEW_REQUESTED'
  | 'TREATMENT_SUSPENDED'

export interface ServerNotification {
  id: string
  kind: ServerNotificationKind
  title: string
  body: string
  entityType: string | null
  entityId: string | null
  readAt: string | null
  createdAt: string
}

export interface NotificationPage extends Page<ServerNotification> {
  unread: number
}

export interface NotificationPreference {
  kind: ServerNotificationKind
  enabled: boolean
}

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

export function markAllNotificationsRead(): Promise<{ marked: number }> {
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
}): Promise<{ received: boolean; id: string; status: string; createdAt: string }> {
  return apiRequest('/support-requests', { method: 'POST', body })
}

export interface SupportRequestItem {
  id: string
  subject: string
  message: string
  status: 'RECEIVED' | 'HANDLED'
  createdAt: string
}

export function listSupportRequests(
  signal?: AbortSignal,
): Promise<SupportRequestItem[]> {
  return apiRequest('/support-requests', { signal })
}
