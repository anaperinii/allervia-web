import { createContext } from 'react'
import type { AccountContext, SessionState } from '@/shared/api/contracts/account'
import type { ApiError } from '@/shared/api/contracts/errors'

export type SessionStatus = 'loading' | 'authenticated' | 'anonymous' | 'error'

export interface SessionValue {
  status: SessionStatus
  account: AccountContext | null
  session: SessionState | null
  error: ApiError | null
  refresh: () => Promise<void>
  signOut: () => Promise<void>
  adopt: (session: SessionState) => Promise<void>
}

export const SessionContext = createContext<SessionValue | null>(null)
