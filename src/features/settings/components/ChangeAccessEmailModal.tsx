import { useState } from 'react'
import { emailSchema } from '@/shared/lib/field-schemas'
import { Button, FieldLabel, Modal, SegmentedControl, TextInput, toast } from '@/shared/components'
import { humanErrorMessage } from '@/shared/api/error-copy'
import { requestEmailChangeByAdmin } from '@/shared/api/email-change.api'
import type { EmailChangeChannel, EmailChangeRequestDto } from '@/shared/api/contracts/email-change'
import type { TeamMember } from '@/shared/api/contracts/team'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCheck,
  faComment,
  faEnvelope,
  faEnvelopeCircleCheck,
  faShareFromSquare,
} from '@fortawesome/free-solid-svg-icons'

interface ChangeAccessEmailModalProps {
  member: TeamMember | null
  onClose: () => void
  onDispatched: () => void
}

export function ChangeAccessEmailModal(props: ChangeAccessEmailModalProps) {
  return props.member ? <ChangeAccessEmailForm {...props} member={props.member} /> : null
}

function ChangeAccessEmailForm({
  member,
  onClose,
  onDispatched,
}: ChangeAccessEmailModalProps & { member: TeamMember }) {
  const [newEmail, setNewEmail] = useState('')
  const [channel, setChannel] = useState<EmailChangeChannel>('email')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<EmailChangeRequestDto | null>(null)

  const handleClose = () => {
    if (submitting) return
    setNewEmail('')
    setChannel('email')
    setError(null)
    setResult(null)
    onClose()
  }

  const canSubmit = emailSchema.safeParse(newEmail.trim().toLowerCase()).success

  const submit = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const dispatched = await requestEmailChangeByAdmin(member.professionalId, {
        newEmail: newEmail.trim().toLowerCase(),
        channel,
      })
      onDispatched()
      if (dispatched.whatsappUrl) {
        setResult(dispatched)
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
      setError(humanErrorMessage(cause, 'Não foi possível iniciar a troca de e-mail.'))
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
        icon={<FontAwesomeIcon icon={faEnvelopeCircleCheck} style={{ fontSize: 16 }} />}
        tone="success"
        footer={<Button variant="outline" onClick={handleClose}>Fechar</Button>}
      >
        <p className="text-xs text-(--text-muted)">
          Abra o WhatsApp para enviar o link de confirmação a {member.fullName}.
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
      title="Alterar e-mail de acesso"
      icon={<FontAwesomeIcon icon={faEnvelopeCircleCheck} style={{ fontSize: 16 }} />}
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={submitting}>Cancelar</Button>
          <Button
            tone="brand"
            variant="solid"
            disabled={!canSubmit || submitting}
            onClick={() => void submit()}
          >
            Enviar confirmação
          </Button>
        </>
      }
    >
      <p className="text-xs text-(--text-muted)">
        {member.fullName} continua acessando com o e-mail atual até confirmar o link enviado.
      </p>
      <FieldLabel label="Novo e-mail de acesso">
        <TextInput
          type="email"
          name="email"
          autoComplete="email"
          maxLength={254}
          placeholder="novo@clinica.com"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
        />
      </FieldLabel>
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
