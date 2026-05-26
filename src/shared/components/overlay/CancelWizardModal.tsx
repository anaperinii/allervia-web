import type { ButtonTone } from '../forms/Button'
import { Modal } from './Modal'
import { Button } from '../forms/Button'

interface CancelWizardModalProps {
  open: boolean
  title: string
  description: string
  onClose: () => void
  onConfirm: () => void
  keepEditingLabel?: string
  cancelLabel?: string
  cancelTone?: ButtonTone
}

export function CancelWizardModal({
  open,
  title,
  description,
  onClose,
  onConfirm,
  keepEditingLabel = 'Continuar editando',
  cancelLabel = 'Cancelar',
  cancelTone = 'danger',
}: CancelWizardModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>{keepEditingLabel}</Button>
          <Button tone={cancelTone} variant="solid" onClick={onConfirm}>{cancelLabel}</Button>
        </>
      }
    >
      <p className="text-xs text-(--text-muted)">{description}</p>
    </Modal>
  )
}
