import { createFileRoute } from '@tanstack/react-router'
import { LoginPage } from '@/features/auth/login-page'

type SearchParams = {

  returnTo?: string
}

export const Route = createFileRoute('/login')({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    returnTo: typeof search.returnTo === 'string' ? search.returnTo : undefined,
  }),
  component: LoginPage,
})
