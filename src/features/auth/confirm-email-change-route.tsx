import { getRouteApi } from '@tanstack/react-router'
import { ConfirmEmailChangePage } from '@/features/auth/confirm-email-change-page'

const route = getRouteApi('/confirm-email-change')

export function ConfirmEmailChangeRoute() {
  const { token } = route.useSearch()
  return <ConfirmEmailChangePage initialToken={token} />
}
