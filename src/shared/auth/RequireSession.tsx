import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useSession } from '@/shared/auth/useSession'
import { useUserStore } from '@/shared/stores/useUserStore'

function CenteredMessage({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center"
      style={{ background: 'var(--bg)' }}
    >
      <h1 className="text-base font-semibold" style={{ color: 'var(--text)' }}>
        {title}
      </h1>
      <p
        className="max-w-md text-sm leading-relaxed"
        style={{ color: 'var(--text-muted)' }}
      >
        {description}
      </p>
      {action}
    </div>
  )
}

/**
 * Porta de entrada das áreas privadas. Enquanto a sessão é restaurada nada do
 * prontuário é montado; sem sessão, o acesso direto por URL vai para o login.
 * Indisponibilidade do servidor é mostrada como erro, não como logout.
 */
export function RequireSession({ children }: { children: ReactNode }) {
  const { status, account, error, refresh } = useSession()
  const navigate = useNavigate()
  const syncFromAccount = useUserStore((s) => s.syncFromAccount)

  useEffect(() => {
    syncFromAccount(account)
  }, [account, syncFromAccount])

  useEffect(() => {
    if (status === 'anonymous') {
      void navigate({ to: '/login', replace: true })
    }
  }, [status, navigate])

  if (status === 'loading' || status === 'anonymous') {
    return (
      <CenteredMessage
        title="Carregando sua sessão"
        description="Verificando seu acesso com o servidor."
      />
    )
  }

  if (status === 'error') {
    return (
      <CenteredMessage
        title="Não foi possível confirmar sua sessão"
        description={
          error?.message ??
          'O servidor não respondeu. Seus dados continuam salvos; tente novamente em instantes.'
        }
        action={
          <button
            type="button"
            onClick={() => void refresh()}
            className="mt-1 rounded-lg px-4 py-2 text-sm font-semibold cursor-pointer"
            style={{ background: 'var(--color-brand)', color: '#ffffff' }}
          >
            Tentar novamente
          </button>
        }
      />
    )
  }

  if (!account) return null

  return <>{children}</>
}
