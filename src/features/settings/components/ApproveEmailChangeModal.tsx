import { useState } from 'react'
import { Button, Modal, SegmentedControl, toast } from '@/shared/components'
import { humanErrorMessage } from '@/shared/api/error-copy'
import { approveEmailChange } from '@/shared/api/email-change.api'
import type { EmailChangeChannel, EmailChangeRequestDto } from '@/shared/api/contracts/email-change'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCheck,
  faComment,
  faEnvelope,
  faShareFromSquare,
  faUserCheck,
} from '@fortawesome/free-solid-svg-icons'

interface ApproveEmailChangeModalProps {
  request: EmailChangeRequestDto | null
  onClose: () => void
  onApproved: () => void
}

export function ApproveEmailChangeModal(props: ApproveEmailChangeModalProps) {
  return props.request ? <ApproveEmailChangeForm {...props} request={props.request} /> : null
}

function ApproveEmailChangeForm({
  request,
  onClose,
  onApproved,
}: ApproveEmailChangeModalProps & { request: EmailChangeRequestDto }) {
  const [channel, setChannel] = useState<EmailChangeChannel>('email')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<EmailChangeRequestDto | null>(null)

  const handleClose = () => {
    if (submitting) return
    setChannel('email')
    setError(null)
    setResult(null)
    onClose()
  }

  const submit = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const approved = await approveEmailChange(request.id, channel)
      onApproved()
      if (approved.whatsappUrl) {
        setResult(approved)
      } else {
        toast.success({
          icon: <FontAwesomeIcon icon={faCheck} style={{ fontSize: 14 }} />,
          title: 'Confirmação enviada para o e-mail atual',
          position: 'top-right',
          compact: true,
          autoDismissMs: 3000,
        })
        handleClose()
      }
    } catch (cause) {
      setError(humanErrorMessage(cause, 'Não foi possível aprovar a troca de e-mail.'))
    } finally {
      setSubmitting(false)
    }
  }

  if (result) {
    return (
      <Modal
        open
        onClose={handleClose}
        size="sm"
        title="Confirmação pronta para envio"
        icon={<FontAwesomeIcon icon={faUserCheck} style={{ fontSize: 16 }} />}
        tone="success"
        footer={<Button variant="outline" onClick={handleClose}>Fechar</Button>}
      >
        <p className="text-xs text-(--text-muted)">
          Abra o WhatsApp para enviar o link de confirmação a {request.professionalName}.
        </p>
        <Button
          tone="success"
          variant="solid"
          fullWidth
          leftIcon={<FontAwesomeIcon icon={faShareFromSquare} style={{ fontSize: 13 }} />}
          onClick={() => window.open(result.whatsappUrl, '_blank', 'noopener,noreferrer')}
        >
          Abrir WhatsApp e enviar
        </Button>
      </Modal>
    )
  }

  return (
    <Modal
      open
      pending={submitting}
      onClose={handleClose}
      size="sm"
      title="Aprovar troca de e-mail"
      icon={<FontAwesomeIcon icon={faUserCheck} style={{ fontSize: 16 }} />}
      tone="success"
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={submitting}>Cancelar</Button>
          <Button tone="success" variant="solid" disabled={submitting} onClick={() => void submit()}>
            Aprovar
          </Button>
        </>
      }
    >
      <p className="text-xs text-(--text-muted)">
        {request.professionalName}: {request.currentEmail} → {request.newEmail}
      </p>
      <div>
        <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">
          Canal de confirmação
        </label>
        <SegmentedControl
          aria-label="Canal de confirmação"
          value={channel}
          onChange={setChannel}
          fullWidth
          options={[
            { value: 'email', label: 'E-mail', icon: <FontAwesomeIcon icon={faEnvelope} style={{ fontSize: 12 }} /> },
            { value: 'whatsapp', label: 'WhatsApp', icon: <FontAwesomeIcon icon={faComment} style={{ fontSize: 12 }} /> },
          ]}
        />
      </div>
      {error && (
        <p className="text-xs text-red-500" role="alert">{error}</p>
      )}
    </Modal>
  )
}
