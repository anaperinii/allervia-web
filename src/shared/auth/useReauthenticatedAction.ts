import { useEffect, useRef, useState } from 'react'
import { getAuthGeneration } from '@/shared/api/client'
import { ApiError, API_ERROR_CODES } from '@/shared/api/contracts/errors'
import { showApiErrorToast } from '@/shared/components'

interface PendingAction { action: () => Promise<void>; generation: number }

export function useReauthenticatedAction() {
  const mounted = useRef(true)
  const running = useRef(false)
  const pendingRef = useRef<PendingAction | null>(null)
  const [pending, setPending] = useState(false)
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false; pendingRef.current = null }
  }, [])
  const execute = async (action: () => Promise<void>, allowChallenge: boolean, generation: number) => {
    if (running.current || !mounted.current || generation !== getAuthGeneration()) return
    running.current = true
    setBusy(true)
    try { await action() } catch (error) {
      if (!mounted.current || generation !== getAuthGeneration()) return
      if (allowChallenge && error instanceof ApiError && error.code === API_ERROR_CODES.reauthenticationRequired) {
        pendingRef.current = { action, generation }
        setPending(true)
      } else { showApiErrorToast(error) }
    } finally { running.current = false; if (mounted.current) setBusy(false) }
  }
  const run = (action: () => Promise<void>) => {
    if (pendingRef.current) return Promise.resolve()
    return execute(action, true, getAuthGeneration())
  }
  const cancel = () => { pendingRef.current = null; setPending(false) }
  const resume = () => {
    const saved = pendingRef.current
    pendingRef.current = null
    setPending(false)
    return saved ? execute(saved.action, false, saved.generation) : Promise.resolve()
  }
  return { run, cancel, resume, pending, busy }
}
