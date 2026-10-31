import { useEffect, useRef, useState } from 'react'
import { getAuthGeneration } from '@/shared/api/client'
import { humanErrorMessage } from '@/shared/api/error-copy'
import { Button, FieldLabel, Modal, PasswordInput, TextInput } from '@/shared/components'
import { reauthenticate } from '@/shared/api/auth.api'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLock } from '@fortawesome/free-solid-svg-icons'

interface ReauthenticateModalProps {
  open: boolean
  requireCode: boolean
  onClose: () => void
  onSuccess: () => void
}

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

export function ReauthenticateFields({
  form,
  requireCode,
}: {
  form: ReauthenticateForm
  requireCode: boolean
}) {
  return (
    <>
      <p className="text-xs text-(--text-muted)">
        Esta ação é sensível e exige que você confirme sua identidade novamente.
      </p>
      <FieldLabel label="Senha">
        <PasswordInput
          placeholder="Insira aqui"
          autoComplete="current-password"
          value={form.password}
          onChange={(e) => form.setPassword(e.target.value)}
        />
      </FieldLabel>
      {requireCode && (
        <FieldLabel label="Código do autenticador ou de recuperação">
          <TextInput
            placeholder="000000"
            autoComplete="one-time-code"
            maxLength={32}
            value={form.code}
            onChange={(e) => form.setCode(e.target.value)}
          />
        </FieldLabel>
      )}
      {form.error && (
        <p className="text-xs text-red-500" role="alert">
          {form.error}
        </p>
      )}
    </>
  )
}

function ReauthenticateFormModal({
  open,
  requireCode,
  onClose,
  onSuccess,
}: ReauthenticateModalProps) {
  const form = useReauthenticateForm({ requireCode, onSuccess })

  return (
    <Modal
      open={open}
      pending={form.submitting}
      onClose={onClose}
      size="sm"
      title="Confirme sua identidade"
      icon={reauthenticateIcon}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={form.submitting}>
            Cancelar
          </Button>
          <Button
            tone="brand"
            variant="solid"
            onClick={() => void form.submit()}
            disabled={form.submitting || form.incomplete}
          >
            Confirmar
          </Button>
        </>
      }
    >
      <ReauthenticateFields form={form} requireCode={requireCode} />
    </Modal>
  )
}

export function ReauthenticateModal(props: ReauthenticateModalProps) {
  return props.open ? <ReauthenticateFormModal {...props} /> : null
}
