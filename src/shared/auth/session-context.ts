import { createContext } from 'react'
import type { AccountContext, SessionState } from '@/shared/api/contracts/account'
import type { ApiError } from '@/shared/api/contracts/errors'

export type SessionStatus = 'loading' | 'authenticated' | 'anonymous' | 'error'

export interface SessionValue {
  status: SessionStatus
  account: AccountContext | null
  session: SessionState | null
  /** Preenchido quando a restauração falhou por motivo diferente de 401. */
  error: ApiError | null
  refresh: () => Promise<void>
  signOut: () => Promise<void>
  /** Adota a sessão recém-criada pelo login, sem esperar um novo reload. */
  adopt: (session: SessionState) => Promise<void>
}

export const SessionContext = createContext<SessionValue | null>(null)
