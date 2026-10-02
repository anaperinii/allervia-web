import type { Profession } from '@/shared/api/contracts/account'

export type CalendarConnectionStatus = 'ACTIVE' | 'BROKEN'

export interface CalendarConnectionDisconnected {
  connected: false
}

export interface CalendarConnectionDetails {
  connected: true
  googleAccountEmail: string
  status: CalendarConnectionStatus
  brokenReason: string | null
  channelExpiresAt: string | null
  lastIncrementalSyncAt: string | null
  pendingJobs: number
  deadLetteredJobs: number
}

export type CalendarConnection =
  | CalendarConnectionDisconnected
  | CalendarConnectionDetails

export interface CalendarConnectionSummary {
  professionalId: string
  googleAccountEmail: string
  status: CalendarConnectionStatus
  brokenReason: string | null
  channelExpiresAt: string | null
  lastIncrementalSyncAt: string | null
  createdAt: string
  professional: {
    id: string
    fullName: string
    profession: Profession
  } | null
}

export interface CalendarAuthorization {
  authorizationUrl: string
}
