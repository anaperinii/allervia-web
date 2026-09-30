import { MutationCache, QueryClient } from '@tanstack/react-query'
import type { QueryClientConfig } from '@tanstack/react-query'
import { ApiError } from '@/shared/api/contracts/errors'
import { showApiErrorToast } from '@/shared/components'

declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: { suppressErrorToast?: boolean }
  }
}

export function createAppQueryClient(overrides: QueryClientConfig = {}) {
  return new QueryClient({
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        if (mutation.meta?.suppressErrorToast) return
        showApiErrorToast(error)
      },
    }),
    ...overrides,
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          if (error instanceof ApiError && error.statusCode > 0) return false
          return failureCount < 2
        },
        ...overrides.defaultOptions?.queries,
      },
      mutations: { retry: false, ...overrides.defaultOptions?.mutations },
    },
  })
}
