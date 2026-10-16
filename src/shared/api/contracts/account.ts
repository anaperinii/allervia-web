import type { Schema } from '@/shared/api/generated/helpers'

export type UserType = Schema<'AccountUserDto'>['type']

export type BackendRole = Schema<'AccountContextDto'>['roles'][number]

export type Profession = Schema<'AccountProfessionalDto'>['profession']

export type AccountUser = Schema<'AccountUserDto'>

export type AccountProfessional = Schema<'AccountProfessionalDto'>

export type AccountOrganization = Schema<'AccountOrganizationDto'>

export type AccountSecurity = Schema<'AccountSecurityDto'>

export interface AccountContext {
  user: AccountUser
  professional: AccountProfessional | null
  organization: AccountOrganization | null
  roles: BackendRole[]
  capabilities: string[]
  security: AccountSecurity
}

export type SessionState = Schema<'SessionStateDto'>

export type SessionEnvelope = Schema<'MfaVerifiedSessionDto'>

export type MfaChallenge =
  | Schema<'MfaChallengeDto'>
  | Schema<'MfaEnrollmentChallengeDto'>

export type StartSessionResult = SessionEnvelope | MfaChallenge

export function isMfaChallenge(
  result: StartSessionResult,
): result is MfaChallenge {
  return 'status' in result
}

export type DeviceSession = Schema<'DeviceSessionDto'>

export type MfaFactor = Schema<'MfaFactorDto'>
