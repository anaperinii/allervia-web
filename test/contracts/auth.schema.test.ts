import { describe, expect, it } from 'vitest'
import {
  parseAccountContext,
  parseSessionEnvelope,
} from '@/shared/api/contracts/auth.schema'
import { expectContractViolation } from './contract-parsing'

function validEnvelope() {
  return {
    authenticated: true,
    csrfToken: 'csrf-token-1',
    session: {
      id: 'session-1',
      organizationId: 'org-1',
      userId: 'user-1',
      createdAt: '2026-10-10T12:00:00.000Z',
      expiresAt: '2026-10-10T20:00:00.000Z',
      lastInteractiveAt: '2026-10-10T12:05:00.000Z',
      mfaVerified: true,
      reauthenticatedAt: null,
    },
  }
}

function validAccount() {
  return {
    user: {
      id: 'user-1',
      email: 'quem@clinica.com.br',
      type: 'PROFESSIONAL',
      isActive: true,
      createdAt: '2026-01-01T12:00:00.000Z',
    },
    professional: null,
    organization: {
      id: 'org-1',
      name: 'Clínica Exemplo',
      timeZone: 'America/Sao_Paulo',
      automationEnabled: false,
    },
    roles: ['PHYSICIAN'],
    capabilities: ['clinical:read'],
    security: { mfaEnabled: true, mfaRequired: true, sessionBased: true },
  }
}

describe('parseSessionEnvelope', () => {
  it('returns a valid envelope unchanged', () => {
    const payload = validEnvelope()
    const snapshot = structuredClone(payload)
    const result = parseSessionEnvelope(payload)
    expect(result).toBe(payload)
    expect(result).toEqual(snapshot)
  })

  it('accepts a reauthenticated session', () => {
    const payload = validEnvelope()
    payload.session.reauthenticatedAt = '2026-10-10T12:30:00.000Z' as never
    expect(parseSessionEnvelope(payload)).toBe(payload)
  })

  it('accepts unknown additive fields and preserves them', () => {
    const payload = { ...validEnvelope(), recoveryCodes: ['abc'] }
    const result = parseSessionEnvelope(payload) as Record<string, unknown>
    expect(result.recoveryCodes).toEqual(['abc'])
  })

  it('rejects a missing csrfToken', () => {
    const payload: Record<string, unknown> = { ...validEnvelope() }
    delete payload.csrfToken
    expectContractViolation(() => parseSessionEnvelope(payload))
  })

  it('rejects a missing session block', () => {
    const payload: Record<string, unknown> = { ...validEnvelope() }
    delete payload.session
    expectContractViolation(() => parseSessionEnvelope(payload))
  })

  it('rejects a wrongly typed mfaVerified', () => {
    const payload = validEnvelope()
    payload.session.mfaVerified = 'yes' as unknown as boolean
    expectContractViolation(() => parseSessionEnvelope(payload))
  })
})

describe('parseAccountContext', () => {
  it('returns a valid account unchanged', () => {
    const payload = validAccount()
    const snapshot = structuredClone(payload)
    const result = parseAccountContext(payload)
    expect(result).toBe(payload)
    expect(result).toEqual(snapshot)
  })

  it('accepts a null organization', () => {
    const payload = { ...validAccount(), organization: null }
    expect(parseAccountContext(payload)).toBe(payload)
  })

  it('accepts unknown additive fields and preserves them', () => {
    const payload = { ...validAccount(), preferences: { theme: 'dark' } }
    const result = parseAccountContext(payload) as unknown as Record<
      string,
      unknown
    >
    expect(result.preferences).toEqual({ theme: 'dark' })
  })

  it('rejects a missing security block', () => {
    const payload: Record<string, unknown> = { ...validAccount() }
    delete payload.security
    expectContractViolation(() => parseAccountContext(payload))
  })

  it('rejects wrongly typed roles', () => {
    const payload = validAccount()
    payload.roles = 'PHYSICIAN' as unknown as string[]
    expectContractViolation(() => parseAccountContext(payload))
  })

  it('rejects a wrongly typed user id', () => {
    const payload = validAccount()
    payload.user.id = 42 as unknown as string
    expectContractViolation(() => parseAccountContext(payload))
  })
})
