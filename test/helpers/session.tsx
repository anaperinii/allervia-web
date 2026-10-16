import type { ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { createAppQueryClient } from '@/shared/api/query-client'
import { ToastViewport, useToastStore } from '@/shared/components'
import {
  SessionContext,
  type SessionValue,
} from '@/shared/auth/session-context'
import { useUserStore } from '@/shared/stores/useUserStore'
import { accountContext, sessionState } from '../fixtures/account'


export const buildSessionState = sessionState
export const buildAccountContext = accountContext

export function buildSessionValue(
  overrides: Partial<SessionValue> = {},
): SessionValue {
  return {
    status: 'authenticated',
    account: buildAccountContext(),
    session: buildSessionState(),
    error: null,
    refresh: async () => {},
    signOut: async () => {},

    adopt: async () => accountContext(),
    ...overrides,
  }
}

export type SessionOverrides = Partial<SessionValue>

interface WithSessionOptions {

  toastViewport?: boolean
}

export function withSession(
  children: ReactNode,
  value?: SessionOverrides,
  options: WithSessionOptions = {},
) {
  const { toastViewport = true } = options
  const queryClient = createAppQueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  const session = buildSessionValue(value)
  useUserStore.getState().syncFromAccount(session.account)
  useToastStore.setState({ toasts: [] })

  return (
    <QueryClientProvider client={queryClient}>
      <SessionContext.Provider value={session}>
        {children}
        {toastViewport && <ToastViewport />}
      </SessionContext.Provider>
    </QueryClientProvider>
  )
}
