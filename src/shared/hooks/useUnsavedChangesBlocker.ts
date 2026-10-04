import { useBlocker } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'

interface UnsavedChangesBlockerOptions {
  /** Só intercepta quando há algo preenchido que seria perdido. */
  hasUnsavedChanges: boolean
}

/**
 * Intercepta a navegação para fora de um fluxo em edição e devolve o estado
 * do bloqueio para a tela confirmar a saída com o usuário.
 */
export function useUnsavedChangesBlocker({ hasUnsavedChanges }: UnsavedChangesBlockerOptions) {
  // Lido na hora da navegação: evita bloquear uma saída que a própria tela já
  // confirmou, sem depender de um novo render para atualizar a condição.
  const blockRef = useRef(hasUnsavedChanges)
  const allowNextRef = useRef(false)

  useEffect(() => {
    blockRef.current = hasUnsavedChanges
  }, [hasUnsavedChanges])

  const shouldBlock = () => {
    if (allowNextRef.current) {
      allowNextRef.current = false
      return false
    }
    return blockRef.current
  }

  const blocker = useBlocker({
    shouldBlockFn: shouldBlock,
    enableBeforeUnload: () => blockRef.current,
    withResolver: true,
  })

  return {
    isBlocked: blocker.status === 'blocked',
    confirmLeave: () => blocker.proceed?.(),
    cancelLeave: () => blocker.reset?.(),
    /** Libera a próxima navegação, para saídas já confirmadas pela tela. */
    allowNextNavigation: () => {
      allowNextRef.current = true
    },
  }
}
