import { Modal, Button } from '@/shared/components'
import type { ReactNode } from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaperPlane, faTrash, faUserCheck, faUserXmark } from '@fortawesome/free-solid-svg-icons'

export type TeamConfirmType =
  | 'cancel-invite'
  | 'resend-invite'
  | 'deactivate'
  | 'activate'

export interface TeamConfirmState {
  type: TeamConfirmType
  id: string
  name: string
}

type ConfirmTone = 'brand' | 'danger' | 'warning' | 'success'

interface ConfirmConfig {
  icon: ReactNode
  tone: ConfirmTone
  title: string
  body: ReactNode
  btn: string
}

const buildConfig = (state: TeamConfirmState): ConfirmConfig => {
  const name = <span className="font-semibold text-(--text)">{state.name}</span>
  switch (state.type) {
    case 'deactivate':
      return {
        icon: <FontAwesomeIcon icon={faUserXmark} style={{ fontSize: 16 }} />,
        tone: 'warning',
        title: 'Encerrar acesso',
        body: (
          <>
            {name} deixa de entrar no sistema e as sessões abertas caem. O
            cadastro e a autoria dos registros permanecem.
          </>
        ),
        btn: 'Encerrar acesso',
      }
    case 'activate':
      return {
        icon: <FontAwesomeIcon icon={faUserCheck} style={{ fontSize: 16 }} />,
        tone: 'success',
        title: 'Restaurar acesso',
        body: <>{name} volta a entrar no sistema com os papéis que ainda estiverem vigentes.</>,
        btn: 'Restaurar',
      }
    case 'resend-invite':
      return {
        icon: <FontAwesomeIcon icon={faPaperPlane} style={{ fontSize: 16 }} />,
        tone: 'brand',
        title: 'Reenviar convite',
        body: (
          <>
            O convite atual de {name} é cancelado e um novo é emitido com prazo
            renovado. O link anterior deixa de funcionar.
          </>
        ),
        btn: 'Reenviar',
      }
    case 'cancel-invite':
      return {
        icon: <FontAwesomeIcon icon={faTrash} style={{ fontSize: 16 }} />,
        tone: 'danger',
        title: 'Cancelar convite',
        body: <>O link enviado para {name} deixa de funcionar imediatamente.</>,
        btn: 'Cancelar convite',
      }
  }
}

interface TeamConfirmModalProps {
  state: TeamConfirmState | null
  submitting?: boolean
  onClose: () => void
  onConfirm: () => void
}

export function TeamConfirmModal({
  state,
  submitting = false,
  onClose,
  onConfirm,
}: TeamConfirmModalProps) {
  if (!state) return null
  const cfg = buildConfig(state)
  return (
    <Modal
      open
      onClose={onClose}
      size="sm"
      title={cfg.title}
      icon={cfg.icon}
      tone={cfg.tone}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button tone={cfg.tone} variant="solid" disabled={submitting} onClick={onConfirm}>
            {cfg.btn}
          </Button>
        </>
      }
    >
      <p className="text-xs text-(--text-muted)">{cfg.body}</p>
    </Modal>
  )
}
