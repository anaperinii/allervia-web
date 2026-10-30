import { createFileRoute } from '@tanstack/react-router'
import { ConfirmEmailChangeRoute } from '@/features/auth/confirm-email-change-route'

type SearchParams = {
  token?: string
}

export const Route = createFileRoute('/confirm-email-change')({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    token: typeof search.token === 'string' ? search.token : undefined,
  }),
  component: ConfirmEmailChangeRoute,
})
