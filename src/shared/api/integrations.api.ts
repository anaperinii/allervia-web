import { apiRequest } from '@/shared/api/client'
import type {
  CalendarAuthorization,
  CalendarConnection,
  CalendarConnectionSummary,
} from '@/shared/api/contracts/integrations'

const BASE = '/integrations/google-calendar'

export function startCalendarAuthorization(): Promise<CalendarAuthorization> {
  return apiRequest(`${BASE}/connect`, { method: 'POST' })
}

export function getCalendarConnection(
  signal?: AbortSignal,
): Promise<CalendarConnection> {
  return apiRequest(`${BASE}/connection`, { signal })
}

export function listCalendarConnections(
  signal?: AbortSignal,
): Promise<CalendarConnectionSummary[]> {
  return apiRequest(`${BASE}/connections`, { signal })
}

export function disconnectCalendar(
  removeEvents = false,
): Promise<{ disconnected: true }> {
  return apiRequest(`${BASE}/connection?removeEvents=${removeEvents}`, {
    method: 'DELETE',
  })
}

export function disconnectProfessionalCalendar(
  professionalId: string,
  removeEvents = false,
): Promise<{ disconnected: true }> {
  return apiRequest(
    `${BASE}/connections/${professionalId}?removeEvents=${removeEvents}`,
    { method: 'DELETE' },
  )
}
