import { getRouteApi } from '@tanstack/react-router'
import { ForgotPasswordPage } from '@/features/auth/forgot-password-page'

const route = getRouteApi('/forgot-password')

export function ForgotPasswordRoute() {
  const { token } = route.useSearch()
  return <ForgotPasswordPage initialToken={token} />
}
