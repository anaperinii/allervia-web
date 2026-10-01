import { useState } from 'react'
import { Button, FieldLabel, Modal, PasswordInput, TextInput } from '@/shared/components'
import { reauthenticate } from '@/shared/api/auth.api'
import { ApiError } from '@/shared/api/contracts/errors'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLock } from '@fortawesome/free-solid-svg-icons'

interface ReauthenticateModalProps {
  open: boolean
  requireCode: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ReauthenticateModal({
  open,
  requireCode,
  onClose,
  onSuccess,
}: ReauthenticateModalProps) {
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const submit = async () => {
    setError(null)
    setSubmitting(true)
    try {
      await reauthenticate({
        password,
        ...(requireCode ? { code: code.trim() } : {}),
      })
      onSuccess()
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Não foi possível confirmar sua identidade. Tente novamente.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  const incomplete =
    password.length === 0 || (requireCode && code.trim().length === 0)

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title="Confirme sua identidade"
      icon={<FontAwesomeIcon icon={faLock} style={{ fontSize: 16 }} />}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            tone="brand"
            variant="solid"
            onClick={() => void submit()}
            disabled={submitting || incomplete}
          >
            Confirmar
          </Button>
        </>
      }
    >
      <p className="text-xs text-(--text-muted)">
        Esta ação é sensível e exige que você confirme sua identidade novamente.
      </p>
      <FieldLabel label="Senha">
        <PasswordInput
          placeholder="Insira aqui"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </FieldLabel>
      {requireCode && (
        <FieldLabel label="Código do autenticador ou de recuperação">
          <TextInput
            placeholder="000000"
            autoComplete="one-time-code"
            maxLength={32}
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </FieldLabel>
      )}
      {error && (
        <p className="text-xs text-red-500" role="alert">
          {error}
        </p>
      )}
    </Modal>
  )
}
