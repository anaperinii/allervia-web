import { apiRequest, setCsrfToken } from '@/shared/api/client'
import type { Page } from '@/shared/api/contracts/team'
import type {
  EmailChangeChannel,
  EmailChangeRequestDto,
} from '@/shared/api/contracts/email-change'

export interface EmailChangeRequestQuery {
  page?: number
  pageSize?: number
}

function toQueryString(params: Record<string, unknown>): string {
  const search = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    search.set(key, String(value))
  }

  const query = search.toString()
  return query ? `?${query}` : ''
}

export function requestEmailChangeByAdmin(
  professionalId: string,
  body: { newEmail: string; channel: EmailChangeChannel },
): Promise<EmailChangeRequestDto> {
  return apiRequest(`/professionals/${professionalId}/email-change`, {
    method: 'POST',
    body,
  })
}

export function requestOwnEmailChange(
  newEmail: string,
): Promise<EmailChangeRequestDto> {
  return apiRequest('/account/me/email-change', {
    method: 'POST',
    body: { newEmail },
  })
}

export function listEmailChangeRequests(
  query: EmailChangeRequestQuery,
  signal?: AbortSignal,
): Promise<Page<EmailChangeRequestDto> & { pending: number }> {
  return apiRequest(
    `/professionals/email-change-requests${toQueryString({ ...query })}`,
    { signal },
  )
}

export function approveEmailChange(
  requestId: string,
  channel: EmailChangeChannel,
): Promise<EmailChangeRequestDto> {
  return apiRequest(`/professionals/email-change-requests/${requestId}/approve`, {
    method: 'POST',
    body: { channel },
  })
}

export function rejectEmailChange(
  requestId: string,
): Promise<EmailChangeRequestDto> {
  return apiRequest(`/professionals/email-change-requests/${requestId}/reject`, {
    method: 'POST',
    body: {},
  })
}

async function requestPreAuthCsrfToken(): Promise<void> {
  const { csrfToken } = await apiRequest<{ csrfToken: string }>('/auth/csrf')
  setCsrfToken(csrfToken)
}

export async function verifyEmailChangeToken(
  token: string,
): Promise<{ valid: true; newEmail: string }> {
  await requestPreAuthCsrfToken()
  return apiRequest('/auth/email-change/verify', {
    method: 'POST',
    body: { token },
  })
}

export async function confirmEmailChange(
  token: string,
): Promise<{ message: string }> {
  await requestPreAuthCsrfToken()
  return apiRequest('/auth/email-change/confirm', {
    method: 'POST',
    body: { token },
  })
}
