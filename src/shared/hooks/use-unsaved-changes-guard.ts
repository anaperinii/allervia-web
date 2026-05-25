import { useCallback, useEffect, useState } from 'react'

interface UseUnsavedChangesGuardOptions {
  isDirty: boolean
  onClose: () => void
  open?: boolean
}

interface UseUnsavedChangesGuardReturn {
  requestClose: () => void
  guardOpen: boolean
  cancelDiscard: () => void
  confirmDiscard: () => void
}

export function useUnsavedChangesGuard({
  isDirty,
  onClose,
  open,
}: UseUnsavedChangesGuardOptions): UseUnsavedChangesGuardReturn {
  const [guardOpen, setGuardOpen] = useState(false)

  useEffect(() => {
    if (open === false) setGuardOpen(false)
  }, [open])

  const requestClose = useCallback(() => {
    if (isDirty) setGuardOpen(true)
    else onClose()
  }, [isDirty, onClose])

  const cancelDiscard = useCallback(() => setGuardOpen(false), [])

  const confirmDiscard = useCallback(() => {
    setGuardOpen(false)
    onClose()
  }, [onClose])

  return { requestClose, guardOpen, cancelDiscard, confirmDiscard }
}
