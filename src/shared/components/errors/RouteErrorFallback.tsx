import { useRouter } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { ErrorFallback } from './ErrorFallback'


export function RouteErrorFallback({
  error,
  reset,
}: {
  error: unknown
  reset: () => void
}) {
  const router = useRouter()
  const queryClient = useQueryClient()

  return (
    <ErrorFallback
      error={error}
      onRetry={() => {
        void queryClient.resetQueries({
          predicate: (query) => query.state.status === 'error',
        })
        reset()
        void router.invalidate()
      }}
    />
  )
}
