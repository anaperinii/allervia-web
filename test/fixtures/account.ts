import type {
  AccountContext,
  MfaChallenge,
  SessionEnvelope,
  SessionState,
} from '@/shared/api/contracts/account'
import type { Schema } from '@/shared/api/generated/helpers'
import { ORGANIZATION_ID, PHYSICIAN_ID, USER_ID } from './clinical'







export function sessionState(overrides: Partial<SessionState> = {}): SessionState {
  return {
    createdAt: '2026-09-19T12:00:00.000Z',
    expiresAt: '2026-09-19T20:00:00.000Z',
    id: 'session-1',
    lastInteractiveAt: '2026-09-19T12:00:00.000Z',
    mfaVerified: true,
    organizationId: ORGANIZATION_ID,
    reauthenticatedAt: null,
    userId: USER_ID,
    ...overrides,
  }
}

export function sessionEnvelope(
  overrides: Partial<SessionEnvelope> = {},
): SessionEnvelope {
  return {
    authenticated: true,
    csrfToken: 'csrf-da-sessao',
    session: sessionState(),
    ...overrides,
  }
}

export function mfaChallenge(
  overrides: Partial<Schema<'MfaChallengeDto'>> = {},
): MfaChallenge {
  return {
    challengeToken: 'desafio-1',
    expiresAt: '2026-09-19T12:05:00.000Z',
    status: 'MFA_REQUIRED',
    ...overrides,
  }
}

export function mfaEnrollmentChallenge(
  overrides: Partial<Schema<'MfaEnrollmentChallengeDto'>> = {},
): MfaChallenge {
  return {
    challengeToken: 'desafio-2',
    enrollment: {
      credentialId: 'credencial-1',
      keyUri: 'otpauth://totp/Allervia:profissional',
      secret: 'JBSWY3DPEHPK3PXP',
    },
    expiresAt: '2026-09-19T12:05:00.000Z',
    status: 'MFA_ENROLLMENT_REQUIRED',
    ...overrides,
  }
}

export function accountContext(
  overrides: Partial<AccountContext> = {},
): AccountContext {
  return {
    user: {
      id: USER_ID,
      email: 'profissional@clinica.com.br',
      type: 'PROFESSIONAL',
      isActive: true,
      createdAt: '2026-01-01T12:00:00.000Z',
    },
    professional: {
      id: PHYSICIAN_ID,
      fullName: 'Dra. Karina Martins',
      phoneNumber: '62995571423',
      profession: 'PHYSICIAN',
      councilNumber: '24815',
      councilUf: 'GO',
    },
    organization: {
      id: ORGANIZATION_ID,
      name: 'Clínica Integrada Princípios',
      timeZone: 'America/Sao_Paulo',
      automationEnabled: true,
    },
    roles: ['PHYSICIAN'],
    capabilities: [
      'patients:read',
      'patients:create',
      'patients:update',
      'immunotherapies:read',
      'immunotherapies:create',
      'immunotherapies:update',
      'doses:read',
      'doses:create',
      'doses:update',
      'appointments:read',
      'appointments:manage',
      'protocols:manage',
    ],
    security: { mfaEnabled: true, mfaRequired: true, sessionBased: true },
    ...overrides,
  }
}
