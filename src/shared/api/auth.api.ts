import { apiRequest, setCsrfToken } from '@/shared/api/client'
import type {
  AccountContext,
  DeviceSession,
  MfaFactor,
  SessionEnvelope,
  StartSessionResult,
} from '@/shared/api/contracts/account'

/**
 * Prepara o formulário de entrada: o servidor emite o cookie de pré-sessão e
 * devolve o desafio que acompanha o comando de login.
 */
async function requestPreAuthCsrfToken(): Promise<string> {
  const { csrfToken } = await apiRequest<{ csrfToken: string }>('/auth/csrf')
  setCsrfToken(csrfToken)
  return csrfToken
}

export async function startSession(input: {
  email: string
  password: string
}): Promise<StartSessionResult> {
  await requestPreAuthCsrfToken()

  const result = await apiRequest<StartSessionResult>('/auth/sessions', {
    method: 'POST',
    body: input,
  })

  if (!('status' in result)) setCsrfToken(result.csrfToken)
  return result
}

export async function verifySecondFactor(input: {
  challengeToken: string
  code: string
}): Promise<SessionEnvelope> {
  await requestPreAuthCsrfToken()

  const envelope = await apiRequest<SessionEnvelope>('/auth/mfa/verify', {
    method: 'POST',
    body: input,
  })

  setCsrfToken(envelope.csrfToken)
  return envelope
}

/** Restaura a sessão após reload. Devolve `null` quando não há sessão válida. */
export async function readSession(
  signal?: AbortSignal,
): Promise<SessionEnvelope> {
  const envelope = await apiRequest<SessionEnvelope>('/auth/session', { signal })
  setCsrfToken(envelope.csrfToken)
  return envelope
}

export function readAccount(signal?: AbortSignal): Promise<AccountContext> {
  return apiRequest<AccountContext>('/account/me', { signal })
}

export async function endSession(): Promise<void> {
  await apiRequest<void>('/auth/logout', { method: 'POST' })
  setCsrfToken(null)
}

export async function endAllSessions(): Promise<void> {
  await apiRequest<void>('/auth/logout-all', { method: 'POST' })
  setCsrfToken(null)
}

export function listDevices(signal?: AbortSignal): Promise<DeviceSession[]> {
  return apiRequest<DeviceSession[]>('/auth/sessions', { signal })
}

export function revokeDevice(sessionId: string): Promise<void> {
  return apiRequest<void>(`/auth/sessions/${sessionId}`, { method: 'DELETE' })
}

/** Renova a inatividade por atividade real do usuário, não por polling. */
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
