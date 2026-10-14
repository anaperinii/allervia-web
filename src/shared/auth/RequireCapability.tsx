import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { useSession } from '@/shared/auth/useSession'
import { defaultDestination } from '@/shared/auth/navigation-policy'
import type { Permission } from '@/shared/stores/useUserStore'
import { hasPermission } from '@/shared/stores/useUserStore'


export function RequireCapability({
  capability,
  children,
}: {
  capability: Permission
  children: ReactNode
}) {
  const { status, account } = useSession()

  if (status === 'loading' || (status === 'authenticated' && !account)) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <span className="text-xs text-(--text-muted)">Verificando seu acesso…</span>
      </div>
    )
  }

  const capabilities = account?.capabilities ?? []
  if (!hasPermission(capabilities, capability)) {
    return (
      <div
        role="alert"
        className="flex min-h-[40vh] flex-col items-center justify-center gap-3 px-6 text-center"
      >
        <h1 className="text-base font-semibold text-(--text)">Acesso restrito</h1>
        <p className="max-w-md text-sm text-(--text-muted)">
          Seu perfil não tem a capacidade necessária para esta tela. Se você precisa dela,
          peça a um administrador da clínica.
        </p>
        <Link
          to={defaultDestination(capabilities)}
          className="text-xs font-semibold text-brand underline"
        >
          Voltar para uma área disponível
        </Link>
      </div>
    )
  }

  return <>{children}</>
}
