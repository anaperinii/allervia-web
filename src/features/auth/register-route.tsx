import { getRouteApi } from '@tanstack/react-router'
import { RegisterPage } from '@/features/auth/register-page'

const route = getRouteApi('/register')

/** Liga o token do convite recebido por e-mail à página de cadastro. */
export function RegisterRoute() {
  const { token } = route.useSearch()
  return <RegisterPage token={token} />
}
