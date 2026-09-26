
export type UserType = 'PROFESSIONAL' | 'PATIENT'

export type BackendRole =
  | 'ADMINISTRATOR'
  | 'RECEPTIONIST'
  | 'PHYSICIAN'
  | 'NURSE'

export type Profession =
  | 'PHYSICIAN'
  | 'NURSE'
  | 'NURSING_TECHNICIAN'
  | 'RECEPTIONIST'

export interface AccountUser {
  id: string
  email: string
  type: UserType
  isActive: boolean
  createdAt: string
}

export interface AccountProfessional {
  id: string
  fullName: string
  phoneNumber: string
  profession: Profession
  councilNumber: string | null
  councilUf: string | null
}

export interface AccountOrganization {
  id: string
  name: string
  timeZone: string
  automationEnabled: boolean
}

export interface AccountSecurity {
  mfaEnabled: boolean
  mfaRequired: boolean
  sessionBased: boolean
}

export interface AccountContext {
  user: AccountUser
  professional: AccountProfessional | null
  organization: AccountOrganization | null
  roles: BackendRole[]
  capabilities: string[]
  security: AccountSecurity
}

export interface SessionState {
  id: string
  createdAt: string
  expiresAt: string
  lastInteractiveAt: string
  mfaVerified: boolean
  reauthenticatedAt: string | null
}

export interface SessionEnvelope {
  authenticated: true
  csrfToken: string
  session: SessionState
  recoveryCodes?: string[]
}

export interface MfaChallenge {
  status: 'MFA_REQUIRED' | 'MFA_ENROLLMENT_REQUIRED'
  challengeToken: string
  expiresAt: string
  enrollment?: {
    credentialId: string
    secret: string
    keyUri: string
  }
}

export type StartSessionResult = SessionEnvelope | MfaChallenge

export function isMfaChallenge(
  result: StartSessionResult,
): result is MfaChallenge {
  return 'status' in result
}

export interface DeviceSession {
  id: string
  createdAt: string
  lastInteractiveAt: string
  expiresAt: string
  userAgent: string | null
  current: boolean
}

export interface MfaFactor {
  id: string
  label: string
  confirmed: boolean
}
