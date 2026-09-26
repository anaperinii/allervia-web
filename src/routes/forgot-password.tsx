import { createFileRoute } from '@tanstack/react-router'
import { ForgotPasswordRoute } from '@/features/auth/forgot-password-route'

type SearchParams = {
  token?: string
}

export const Route = createFileRoute('/forgot-password')({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    token: typeof search.token === 'string' ? search.token : undefined,
  }),
  component: ForgotPasswordRoute,
})
