import { getRouteApi } from '@tanstack/react-router'
import { ForgotPasswordPage } from '@/features/auth/forgot-password-page'

const route = getRouteApi('/forgot-password')

/** Liga o token do link de e-mail ao passo de verificação da página. */
export function ForgotPasswordRoute() {
  const { token } = route.useSearch()
  return <ForgotPasswordPage initialToken={token} />
}
