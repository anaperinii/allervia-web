import { useEffect, useRef, useState } from 'react'
import { getAuthGeneration } from '@/shared/api/client'
import { humanErrorMessage } from '@/shared/api/error-copy'
import { reauthenticate } from '@/shared/api/auth.api'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLock } from '@fortawesome/free-solid-svg-icons'

interface UseReauthenticateFormOptions {
  requireCode: boolean
  onSuccess: () => void
}

export type ReauthenticateForm = ReturnType<typeof useReauthenticateForm>

export function useReauthenticateForm({ requireCode, onSuccess }: UseReauthenticateFormOptions) {
  const mounted = useRef(true)
  const inFlight = useRef(false)
  const completed = useRef(false)
  useEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const reset = () => {
    completed.current = false
    setPassword('')
    setCode('')
    setError(null)
  }

  const submit = async () => {
    if (inFlight.current || completed.current) return
    const identity = getAuthGeneration()
    inFlight.current = true
    setError(null)
    setSubmitting(true)
    try {
      await reauthenticate({
        password,
        ...(requireCode ? { code: code.trim() } : {}),
      })
      if (!mounted.current || identity !== getAuthGeneration()) return
      completed.current = true
      setPassword('')
      setCode('')
      onSuccess()
    } catch (error) {
      if (mounted.current && identity === getAuthGeneration())
        setError(humanErrorMessage(error, 'Não foi possível confirmar sua identidade. Tente novamente.'))
    } finally {
      inFlight.current = false
      if (mounted.current) setSubmitting(false)
    }
  }

  const incomplete =
    password.length === 0 || (requireCode && code.trim().length === 0)

  return { password, setPassword, code, setCode, error, submitting, incomplete, submit, reset }
}

export const reauthenticateIcon = <FontAwesomeIcon icon={faLock} style={{ fontSize: 16 }} />
