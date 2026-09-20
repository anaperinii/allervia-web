import { useContext } from 'react'
import { SessionContext, type SessionValue } from '@/shared/auth/session-context'

export function useSession(): SessionValue {
  const value = useContext(SessionContext)
  if (!value) {
    throw new Error('useSession precisa estar dentro de SessionProvider.')
  }
  return value
}

/** Capacidade geral concedida pelo servidor; o comando é reavaliado lá. */
export function useCapability(capability: string): boolean {
  const { account } = useSession()
  return account?.capabilities.includes(capability) ?? false
}
