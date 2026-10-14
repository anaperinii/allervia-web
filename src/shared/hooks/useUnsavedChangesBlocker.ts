import { useBlocker } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'

interface UnsavedChangesBlockerOptions {

  hasUnsavedChanges: boolean
}


export function useUnsavedChangesBlocker({ hasUnsavedChanges }: UnsavedChangesBlockerOptions) {

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

    allowNextNavigation: () => {
      allowNextRef.current = true
    },
  }
}
