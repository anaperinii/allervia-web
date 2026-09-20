import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type {
  AccountContext,
  SessionState,
} from '@/shared/api/contracts/account'
import {
  SessionContext,
  type SessionValue,
} from '@/shared/auth/session-context'

export function buildSessionState(
  overrides: Partial<SessionState> = {},
): SessionState {
  return {
    id: 'session-1',
    createdAt: '2026-09-19T12:00:00.000Z',
    expiresAt: '2026-09-19T20:00:00.000Z',
    lastInteractiveAt: '2026-09-19T12:00:00.000Z',
    mfaVerified: true,
    reauthenticatedAt: null,
    ...overrides,
  }
}

export function buildAccountContext(
  overrides: Partial<AccountContext> = {},
): AccountContext {
  return {
    user: {
      id: 'user-1',
      email: 'profissional@clinica.com.br',
      type: 'PROFESSIONAL',
      isActive: true,
      createdAt: '2026-01-01T12:00:00.000Z',
    },
    professional: {
      id: 'professional-1',
      fullName: 'Dra. Karina Martins',
      phoneNumber: '62995571423',
      profession: 'PHYSICIAN',
      councilNumber: '24815',
      councilUf: 'GO',
    },
    organization: {
      id: 'organization-1',
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
      'doses:read',
      'doses:create',
      'protocols:manage',
    ],
    security: { mfaEnabled: true, mfaRequired: true, sessionBased: true },
    ...overrides,
  }
}

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
    adopt: async () => {},
    ...overrides,
  }
}

/**
 * Envolve a árvore com os provedores que a aplicação real monta, sem fazer
 * chamadas de rede: a sessão é fornecida diretamente pelo teste.
 */
export function withSession(children: ReactNode, value?: Partial<SessionValue>) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <SessionContext.Provider value={buildSessionValue(value)}>
        {children}
      </SessionContext.Provider>
    </QueryClientProvider>
  )
}
