import { Modal, Button } from '@/shared/components'

interface CancelExportModalProps {
  open: boolean
  onClose: () => void
  onConfirmCancel: () => void
}

export function CancelExportModal({ open, onClose, onConfirmCancel }: CancelExportModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Cancelar exportação?"
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Continuar editando</Button>
          <Button variant="danger" onClick={onConfirmCancel}>Cancelar</Button>
        </>
      }
    >
      <p className="text-xs text-(--text-muted)">As configurações do relatório serão perdidas.</p>
    </Modal>
  )
}
