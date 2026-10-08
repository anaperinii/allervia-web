import {
  apiRequest,
  setCsrfToken,
  getSessionContext,
  acceptSession,
  clearSession,
  withAuthLock,
} from '@/shared/api/client'
import { ApiError } from '@/shared/api/contracts/errors'
import type {
  AccountContext,
  DeviceSession,
  MfaFactor,
  SessionEnvelope,
  StartSessionResult,
} from '@/shared/api/contracts/account'

let pendingLogoutContext: string | null = null

function adoptCredentials(envelope: SessionEnvelope): void {
  pendingLogoutContext = null
  if (!envelope.session?.id || !envelope.csrfToken)
    throw new ApiError({ statusCode: 502, code: 'INVALID_AUTH_RESPONSE', message: 'Resposta de autenticação inválida.' })
  clearSession(true)
  acceptSession(envelope.session.id, envelope.csrfToken)
}

async function requestPreAuthCsrfToken(): Promise<string> {
  const { csrfToken } = await apiRequest<{ csrfToken: string }>('/auth/csrf')
  setCsrfToken(csrfToken)
  return csrfToken
}

export async function startSession(input: {
  email: string
  password: string
}): Promise<StartSessionResult> {
  return withAuthLock(async () => {
    await requestPreAuthCsrfToken()

    const result = await apiRequest<StartSessionResult>('/auth/sessions', {
      method: 'POST',
      body: input,
    })

    if (!('status' in result)) adoptCredentials(result)
    return result
  })
}

export async function verifySecondFactor(input: {
  challengeToken: string
  code: string
}): Promise<SessionEnvelope> {
  return withAuthLock(async () => {
    await requestPreAuthCsrfToken()

    const envelope = await apiRequest<SessionEnvelope>('/auth/mfa/verify', {
      method: 'POST',
      body: input,
    })

    adoptCredentials(envelope)
    return envelope
  })
}

export async function readSession(
  signal?: AbortSignal,
): Promise<SessionEnvelope> {
  const envelope = await apiRequest<SessionEnvelope>('/auth/session', {
    signal,
  })
  acceptSession(envelope.session.id, envelope.csrfToken)
  return envelope
}

export function readAccount(signal?: AbortSignal): Promise<AccountContext> {
  return apiRequest<AccountContext>('/account/me', { signal })
}

export async function endSession(): Promise<void> {
  const expected = getSessionContext() ?? pendingLogoutContext
  pendingLogoutContext = expected
  clearSession(true)
  await withAuthLock(async () => {
    const protection = await apiRequest<{ csrfToken: string }>('/auth/csrf?scope=session')
    setCsrfToken(protection.csrfToken)
    await apiRequest<void>('/auth/logout', { method: 'POST', body: {}, headers: expected ? { 'X-Session-Context': expected } : {} })
    setCsrfToken(null)
    pendingLogoutContext = null
  })
}

export async function endAllSessions(): Promise<void> {
  try {
    await apiRequest<void>('/auth/logout-all', { method: 'POST', body: {} })
  } finally {
    clearSession(true)
  }
}

export function listDevices(signal?: AbortSignal): Promise<DeviceSession[]> {
  return apiRequest<DeviceSession[]>('/auth/sessions', { signal })
}

export function revokeDevice(sessionId: string): Promise<void> {
  return apiRequest<void>(`/auth/sessions/${sessionId}`, { method: 'DELETE' })
}

export function registerActivity(): Promise<void> {
  return apiRequest<void>('/auth/session/activity', { method: 'POST' })
}

export function reauthenticate(input: {
  password: string
  code?: string
}): Promise<{ reauthenticatedAt: string; maxAgeSeconds: number }> {
  return apiRequest('/auth/reauthenticate', { method: 'POST', body: input })
}

export function listMfaFactors(
  signal?: AbortSignal,
): Promise<{ factors: MfaFactor[]; recoveryCodesRemaining: number }> {
  return apiRequest('/auth/mfa/factors', { signal })
}

export function enrollMfaFactor(input: {
  label?: string
}): Promise<{ credentialId: string; secret: string; keyUri: string }> {
  return apiRequest('/auth/mfa/enroll', { method: 'POST', body: input })
}

export function confirmMfaFactor(input: {
  credentialId: string
  code: string
}): Promise<{ recoveryCodes: string[] }> {
  return apiRequest('/auth/mfa/enroll/confirm', { method: 'POST', body: input })
}

export function regenerateRecoveryCodes(): Promise<{ recoveryCodes: string[] }> {
  return apiRequest('/auth/mfa/recovery-codes', { method: 'POST', body: {} })
}

export function revokeMfaFactor(credentialId: string): Promise<void> {
  return apiRequest<void>(`/auth/mfa/factors/${credentialId}`, {
    method: 'DELETE',
  })
}

export async function requestPasswordReset(email: string): Promise<void> {
  await requestPreAuthCsrfToken()
  await apiRequest<{ message: string }>('/auth/password-reset/request', {
    method: 'POST',
    body: { email },
  })
}

export async function verifyPasswordResetToken(token: string): Promise<void> {
  await requestPreAuthCsrfToken()
  await apiRequest<{ valid: true }>('/auth/password-reset/verify', {
    method: 'POST',
    body: { token },
  })
}

export async function confirmPasswordReset(input: {
  token: string
  newPassword: string
}): Promise<void> {
  await requestPreAuthCsrfToken()
  await apiRequest<{ message: string }>('/auth/password-reset/confirm', {
    method: 'POST',
    body: input,
  })
}
