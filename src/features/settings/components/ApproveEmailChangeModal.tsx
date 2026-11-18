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
          title: 'Link de confirmação enviado para o novo e-mail',
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
      tone="brand"
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
        Você está aprovando a troca do e-mail de acesso de{' '}
        <span className="font-semibold text-(--text)">{request.professionalName}</span>.
      </p>

      <div className="rounded-lg border border-(--border-custom) bg-gray-50/60 divide-y divide-(--border-custom)">
        <div className="flex items-baseline gap-3 px-3 py-2">
          <span className="text-[0.68rem] font-semibold uppercase tracking-wide text-(--text-muted) w-24 shrink-0">
            E-mail atual
          </span>
          <span className="text-xs text-(--text-muted) break-all">
            {request.currentEmail}
          </span>
        </div>
        <div className="flex items-baseline gap-3 px-3 py-2">
          <span className="text-[0.68rem] font-semibold uppercase tracking-wide text-(--text-muted) w-24 shrink-0">
            Novo e-mail
          </span>
          <span className="text-xs font-semibold text-(--text) break-all">
            {request.newEmail}
          </span>
        </div>
      </div>

      <p className="text-xs text-(--text-muted) leading-relaxed">
        {channel === 'email'
          ? 'Ao aprovar, enviamos um link de confirmação para o novo e-mail.'
          : 'Ao aprovar, geramos um link de confirmação para você enviar pelo WhatsApp.'}{' '}
        A troca só acontece depois que o profissional abrir esse link, que expira em 60 minutos e
        vale uma única vez.
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
