import { getRouteApi } from '@tanstack/react-router'
import { RegisterPage } from '@/features/auth/register-page'

const route = getRouteApi('/register')

export function RegisterRoute() {
  const { token } = route.useSearch()
  return <RegisterPage token={token} />
}
