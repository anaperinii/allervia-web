import { Modal } from './Modal'
import { Button } from '../forms/Button'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'

interface ConfirmDiscardModalProps {
  open: boolean
  onCancel: () => void
  onConfirm: () => void
  title?: string
  description?: string
}

export function ConfirmDiscardModal({
  open,
  onCancel,
  onConfirm,
  title = 'Descartar alterações?',
  description = 'Você tem alterações não salvas. Se sair agora, elas serão perdidas. Deseja continuar?',
}: ConfirmDiscardModalProps) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      size="sm"
      icon={<FontAwesomeIcon icon={faTriangleExclamation} style={{ fontSize: 16 }} />}
      tone="warning"
      footer={
        <>
          <Button variant="outline" fullWidth onClick={onCancel}>Continuar editando</Button>
          <Button tone="brand" variant="solid" fullWidth onClick={onConfirm}>Descartar e sair</Button>
        </>
      }
    >
      <p className="text-xs text-(--text-muted) leading-relaxed">{description}</p>
    </Modal>
  )
}
