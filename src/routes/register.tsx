import { createFileRoute } from '@tanstack/react-router'
import { RegisterRoute } from '@/features/auth/register-route'

type SearchParams = {
  token?: string
}

export const Route = createFileRoute('/register')({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    token: typeof search.token === 'string' ? search.token : undefined,
  }),
  component: RegisterRoute,
})
