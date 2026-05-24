import { Modal } from './Modal'
import { Button } from './Button'

interface CancelWizardModalProps {
  open: boolean
  title: string
  description: string
  onClose: () => void
  onConfirm: () => void
  keepEditingLabel?: string
  cancelLabel?: string
}

export function CancelWizardModal({
  open,
  title,
  description,
  onClose,
  onConfirm,
  keepEditingLabel = 'Continuar editando',
  cancelLabel = 'Cancelar',
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
          <Button tone="danger" variant="solid" onClick={onConfirm}>{cancelLabel}</Button>
        </>
      }
    >
      <p className="text-xs text-(--text-muted)">{description}</p>
    </Modal>
  )
}
