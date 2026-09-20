import { useCallback, useEffect, useMemo } from 'react'
import type { ReactNode } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { endSession, readAccount, readSession } from '@/shared/api/auth.api'
import { setCsrfToken, setUnauthenticatedHandler } from '@/shared/api/client'
import { queryKeys } from '@/shared/api/query-keys'
import type { SessionState } from '@/shared/api/contracts/account'
import { ApiError } from '@/shared/api/contracts/errors'
import {
  SessionContext,
  type SessionStatus,
  type SessionValue,
} from '@/shared/auth/session-context'

/** 401 é resposta esperada de "sem sessão"; não é erro a repetir. */
function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError && error.statusCode > 0) return false
  return failureCount < 1
}

/**
 * Restaura a sessão no carregamento e mantém identidade e capacidades vindas do
 * servidor. Nada de identidade é inferido no cliente: sem `/auth/session`
 * válido, o usuário é anônimo.
 */
export function SessionProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()

  const sessionQuery = useQuery({
    queryKey: queryKeys.session(),
    queryFn: ({ signal }) => readSession(signal),
    retry: shouldRetry,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  })

  const accountQuery = useQuery({
    queryKey: queryKeys.account(),
    queryFn: ({ signal }) => readAccount(signal),
    enabled: sessionQuery.isSuccess,
    retry: shouldRetry,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  })

  // Tratamento único de 401: qualquer chamada que perca a sessão devolve a
  // aplicação ao estado anônimo, sem cada tela decidir por conta própria.
  useEffect(() => {
    setUnauthenticatedHandler(() => {
      setCsrfToken(null)
      queryClient.clear()
    })
    return () => setUnauthenticatedHandler(null)
  }, [queryClient])

  const refresh = useCallback(async () => {
    await sessionQuery.refetch()
    await accountQuery.refetch()
  }, [sessionQuery, accountQuery])

  const signOut = useCallback(async () => {
    try {
      await endSession()
    } catch {
      // O servidor pode já ter encerrado a sessão; o estado local cai de todo jeito.
    }
    setCsrfToken(null)
    // Nenhum dado de uma sessão sobrevive para a próxima: organizações e
    // usuários diferentes não compartilham cache.
    queryClient.clear()
  }, [queryClient])

  const adopt = useCallback(
    async (session: SessionState) => {
      queryClient.setQueryData(queryKeys.session(), {
        authenticated: true,
        csrfToken: '',
        session,
      })
      await queryClient.invalidateQueries({ queryKey: queryKeys.account() })
      await queryClient.fetchQuery({
        queryKey: queryKeys.account(),
        queryFn: ({ signal }) => readAccount(signal),
      })
    },
    [queryClient],
  )

  const status = useMemo<SessionStatus>(() => {
    const failure = sessionQuery.error ?? accountQuery.error
    if (failure instanceof ApiError && failure.isUnauthenticated) return 'anonymous'
    if (failure) return 'error'
    if (accountQuery.data && sessionQuery.data) return 'authenticated'
    return 'loading'
  }, [sessionQuery.error, sessionQuery.data, accountQuery.error, accountQuery.data])

  const value = useMemo<SessionValue>(() => {
    const failure = sessionQuery.error ?? accountQuery.error
    return {
      status,
      account: accountQuery.data ?? null,
      session: sessionQuery.data?.session ?? null,
      error: failure instanceof ApiError && !failure.isUnauthenticated ? failure : null,
      refresh,
      signOut,
      adopt,
    }
  }, [
    status,
    sessionQuery.data,
    sessionQuery.error,
    accountQuery.data,
    accountQuery.error,
    refresh,
    signOut,
    adopt,
  ])

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}
