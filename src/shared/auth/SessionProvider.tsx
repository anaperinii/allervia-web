import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  endSession,
  readAccount,
  readSession,
  registerActivity,
} from '@/shared/api/auth.api'
import { setCsrfToken, setUnauthenticatedHandler } from '@/shared/api/client'
import { queryKeys } from '@/shared/api/query-keys'
import type { SessionState } from '@/shared/api/contracts/account'
import { ApiError } from '@/shared/api/contracts/errors'
import {
  SessionContext,
  type SessionStatus,
  type SessionValue,
} from '@/shared/auth/session-context'

function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError && error.statusCode > 0) return false
  return failureCount < 1
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [forcedAnonymous, setForcedAnonymous] = useState(false)
  const [logoutError, setLogoutError] = useState(false)

  const sessionQuery = useQuery({
    enabled: !forcedAnonymous,
    queryKey: queryKeys.session(),
    queryFn: ({ signal }) => readSession(signal),
    retry: false,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  })

  const accountQuery = useQuery({
    queryKey: queryKeys.account(),
    queryFn: ({ signal }) => readAccount(signal),
    enabled: !forcedAnonymous && sessionQuery.isSuccess,
    retry: shouldRetry,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    setUnauthenticatedHandler(() => {
      setForcedAnonymous(true)
      setCsrfToken(null)
      queryClient.clear()
    })
    return () => setUnauthenticatedHandler(null)
  }, [queryClient])

  useEffect(() => {
    const check = () => {
      if (!forcedAnonymous && document.visibilityState === 'visible')
        void sessionQuery.refetch()
    }
    window.addEventListener('focus', check)
    return () => window.removeEventListener('focus', check)
  }, [forcedAnonymous, sessionQuery])

  const refresh = useCallback(async () => {
    await sessionQuery.refetch()
    await accountQuery.refetch()
  }, [sessionQuery, accountQuery])

  const signOut = useCallback(async () => {
    setLogoutError(false)
    setForcedAnonymous(true)
    queryClient.clear()
    try {
      await endSession()
    } catch (error) {
      setLogoutError(true)
      throw error
    } finally {
      setForcedAnonymous(true)
      setCsrfToken(null)
      queryClient.clear()
    }
  }, [queryClient])

  const adopt = useCallback(
    async (session: SessionState) => {
      setForcedAnonymous(false)
      setLogoutError(false)
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
    if (forcedAnonymous) return 'anonymous'
    const failure = sessionQuery.error ?? accountQuery.error
    if (failure instanceof ApiError && failure.isUnauthenticated)
      return 'anonymous'
    if (failure) return 'error'
    if (accountQuery.data && sessionQuery.data) return 'authenticated'
    return 'loading'
  }, [
    forcedAnonymous,
    sessionQuery.error,
    sessionQuery.data,
    accountQuery.error,
    accountQuery.data,
  ])

  useEffect(() => {
    if (status !== 'authenticated') return
    let lastActivity = 0
    const notify = (event: Event) => {
      if (!event.isTrusted || document.visibilityState !== 'visible') return
      const now = Date.now()
      if (now - lastActivity < 60_000) return
      lastActivity = now
      void registerActivity().catch(() => undefined)
    }
    window.addEventListener('pointerdown', notify, { passive: true })
    window.addEventListener('keydown', notify)
    return () => {
      window.removeEventListener('pointerdown', notify)
      window.removeEventListener('keydown', notify)
    }
  }, [status])

  const value = useMemo<SessionValue>(() => {
    const failure = sessionQuery.error ?? accountQuery.error
    return {
      status,
      account: accountQuery.data ?? null,
      session: sessionQuery.data?.session ?? null,
      error:
        failure instanceof ApiError && !failure.isUnauthenticated
          ? failure
          : null,
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

  return (
    <SessionContext.Provider value={value}>
      {logoutError && (
        <div
          role="alert"
          className="fixed top-0 inset-x-0 z-50 bg-red-50 p-4 text-red-900"
        >
          O acesso local foi encerrado, mas a saída no servidor não foi
          confirmada.
          <button
            type="button"
            onClick={() =>
              void endSession()
                .then(() => setLogoutError(false))
                .catch(() => setLogoutError(true))
            }
          >
            Tentar encerrar novamente
          </button>
        </div>
      )}
      {children}
    </SessionContext.Provider>
  )
}
