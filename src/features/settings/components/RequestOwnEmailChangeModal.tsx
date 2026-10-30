import { useState } from 'react'
import { emailSchema } from '@/shared/lib/field-schemas'
import { Button, FieldLabel, Modal, TextInput, toast } from '@/shared/components'
import { ApiError, API_ERROR_CODES } from '@/shared/api/contracts/errors'
import { humanErrorMessage } from '@/shared/api/error-copy'
import { requestOwnEmailChange } from '@/shared/api/email-change.api'
import { useReauthenticatedAction } from '@/shared/auth/useReauthenticatedAction'
import { useSession } from '@/shared/auth/useSession'
import { ReauthenticateModal } from '@/features/settings/components/ReauthenticateModal'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faEnvelopeCircleCheck } from '@fortawesome/free-solid-svg-icons'

interface RequestOwnEmailChangeModalProps {
  open: boolean
  onClose: () => void
}

export function RequestOwnEmailChangeModal(props: RequestOwnEmailChangeModalProps) {
  return props.open ? <RequestOwnEmailChangeForm {...props} /> : null
}

function RequestOwnEmailChangeForm({ onClose }: RequestOwnEmailChangeModalProps) {
  const { account } = useSession()
  const mfaEnabled = account?.security.mfaEnabled ?? false
  const [newEmail, setNewEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const sensitive = useReauthenticatedAction()

  const handleClose = () => {
    if (sensitive.busy) return
    setNewEmail('')
    setError(null)
    onClose()
  }

  const canSubmit = emailSchema.safeParse(newEmail.trim().toLowerCase()).success

  const submitRequest = async () => {
    setError(null)
    try {
      await requestOwnEmailChange(newEmail.trim().toLowerCase())
      handleClose()
      toast.success({
        icon: <FontAwesomeIcon icon={faCheck} style={{ fontSize: 14 }} />,
        title: 'Pedido enviado para aprovação',
        description: 'Você será avisado quando for decidido.',
        position: 'top-right',
        compact: true,
        autoDismissMs: 4000,
      })
    } catch (cause) {
      if (cause instanceof ApiError && cause.code === API_ERROR_CODES.reauthenticationRequired)
        throw cause
      setError(humanErrorMessage(cause, 'Não foi possível enviar o pedido de troca de e-mail.'))
    }
  }

  return (
    <>
      <Modal
        open
        pending={sensitive.busy}
        onClose={handleClose}
        size="sm"
        title="Alterar e-mail de acesso"
        icon={<FontAwesomeIcon icon={faEnvelopeCircleCheck} style={{ fontSize: 16 }} />}
        footer={
          <>
            <Button variant="outline" onClick={handleClose} disabled={sensitive.busy}>Cancelar</Button>
            <Button
              tone="brand"
              variant="solid"
              disabled={!canSubmit || sensitive.busy}
              onClick={() => void sensitive.run(submitRequest)}
            >
              Enviar pedido
            </Button>
          </>
        }
      >
        <p className="text-xs text-(--text-muted)">
          Seu pedido fica pendente até um administrador aprovar. Você continua acessando com o
          e-mail atual até a troca ser confirmada.
        </p>
        <FieldLabel label="Novo e-mail de acesso">
          <TextInput
            type="email"
            placeholder="novo@clinica.com"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
        </FieldLabel>
        {error && (
          <p className="text-xs text-red-500" role="alert">{error}</p>
        )}
      </Modal>

      {sensitive.pending && (
        <ReauthenticateModal
          open
          requireCode={mfaEnabled}
          onClose={sensitive.cancel}
          onSuccess={() => void sensitive.resume()}
        />
      )}
    </>
  )
}
