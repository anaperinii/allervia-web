import type { ButtonTone } from '../forms/Button'
import { Modal } from './Modal'
import { Button } from '../forms/Button'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'

interface CancelWizardModalProps {
  open: boolean
  title: string
  description: string
  onClose: () => void
  onConfirm: () => void
  keepEditingLabel?: string
  cancelLabel?: string
  cancelTone?: ButtonTone
  secondaryLabel?: string
  onSecondary?: () => void
  secondaryTone?: ButtonTone
}

export function CancelWizardModal({
  open,
  title,
  description,
  onClose,
  onConfirm,
  keepEditingLabel = 'Continuar editando',
  cancelLabel = 'Cancelar',
  cancelTone = 'brand',
  secondaryLabel,
  onSecondary,
  secondaryTone = 'brand',
}: CancelWizardModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      icon={<FontAwesomeIcon icon={faTriangleExclamation} style={{ fontSize: 16 }} />}
      tone="warning"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>{keepEditingLabel}</Button>
          {secondaryLabel && onSecondary && (
            <Button tone={secondaryTone} variant="outline" onClick={onSecondary}>{secondaryLabel}</Button>
          )}
          <Button tone={cancelTone} variant="solid" onClick={onConfirm}>{cancelLabel}</Button>
        </>
      }
    >
      <p className="text-xs text-(--text-muted)">{description}</p>
    </Modal>
  )
}
