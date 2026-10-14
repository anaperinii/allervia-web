import { useContext } from 'react'
import { Link } from '@tanstack/react-router'
import { SessionContext } from '@/shared/auth/session-context'


export function NotFoundFallback() {
  const session = useContext(SessionContext)
  const authenticated = session?.status === 'authenticated'

  return (
    <div
      role="alert"
      className="flex min-h-[60vh] flex-1 flex-col items-center justify-center gap-4 px-6 text-center"
    >
      <div className="max-w-md space-y-2">
        <h1 className="text-lg font-semibold text-(--text)">Endereço não encontrado</h1>
        <p className="text-sm text-(--text-muted)">
          Esta página não existe ou foi movida. Confira o endereço ou volte para uma área
          disponível para você.
        </p>
      </div>
      <Link
        to={authenticated ? '/immunotherapies' : '/'}
        className="text-xs font-semibold text-brand underline"
      >
        {authenticated ? 'Ir para a lista clínica' : 'Ir para a página inicial'}
      </Link>
    </div>
  )
}
