import { useBlocker } from '@tanstack/react-router'

interface UnsavedChangesBlockerOptions {
  /** Só intercepta quando há algo preenchido que seria perdido. */
  hasUnsavedChanges: boolean
}

/**
 * Intercepta a navegação para fora de um fluxo em edição e devolve o estado
 * do bloqueio para a tela confirmar a saída com o usuário.
 */
export function useUnsavedChangesBlocker({ hasUnsavedChanges }: UnsavedChangesBlockerOptions) {
  const blocker = useBlocker({
    shouldBlockFn: () => hasUnsavedChanges,
    enableBeforeUnload: () => hasUnsavedChanges,
    withResolver: true,
  })

  return {
    isBlocked: blocker.status === 'blocked',
    confirmLeave: () => blocker.proceed?.(),
    cancelLeave: () => blocker.reset?.(),
  }
}
