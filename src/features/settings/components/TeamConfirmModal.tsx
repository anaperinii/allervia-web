import { Modal, Button } from '@/shared/components'
import type { ReactNode } from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaperPlane, faTrash, faUserCheck, faUserXmark } from '@fortawesome/free-solid-svg-icons'

export type TeamConfirmType =
  | 'remove-member'
  | 'delete-invite'
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
    case 'remove-member':
      return {
        icon: <FontAwesomeIcon icon={faTrash} style={{ fontSize: 16 }} />,
        tone: 'danger',
        title: 'Remover membro',
        body: <>Tem certeza que deseja remover {name} da equipe? Esta ação não pode ser desfeita.</>,
        btn: 'Remover',
      }
    case 'deactivate':
      return {
        icon: <FontAwesomeIcon icon={faUserXmark} style={{ fontSize: 16 }} />,
        tone: 'warning',
        title: 'Desativar membro',
        body: <>{name} perderá o acesso ao sistema até ser reativado. Os dados não serão removidos.</>,
        btn: 'Desativar',
      }
    case 'activate':
      return {
        icon: <FontAwesomeIcon icon={faUserCheck} style={{ fontSize: 16 }} />,
        tone: 'success',
        title: 'Reativar membro',
        body: <>{name} terá o acesso ao sistema restaurado com as mesmas permissões anteriores.</>,
        btn: 'Reativar',
      }
    case 'resend-invite':
      return {
        icon: <FontAwesomeIcon icon={faPaperPlane} style={{ fontSize: 16 }} />,
        tone: 'brand',
        title: 'Reenviar convite',
        body: <>Um novo e-mail de convite será enviado para {name}. O convite anterior será invalidado.</>,
        btn: 'Reenviar',
      }
    case 'delete-invite':
      return {
        icon: <FontAwesomeIcon icon={faTrash} style={{ fontSize: 16 }} />,
        tone: 'danger',
        title: 'Excluir convite',
        body: <>O convite para {name} será excluído permanentemente e não poderá mais ser utilizado.</>,
        btn: 'Excluir',
      }
  }
}

interface TeamConfirmModalProps {
  state: TeamConfirmState | null
  onClose: () => void
  onConfirm: () => void
}

export function TeamConfirmModal({ state, onClose, onConfirm }: TeamConfirmModalProps) {
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
          <Button tone={cfg.tone} variant="solid" onClick={onConfirm}>{cfg.btn}</Button>
        </>
      }
    >
      <p className="text-xs text-(--text-muted)">{cfg.body}</p>
    </Modal>
  )
}
