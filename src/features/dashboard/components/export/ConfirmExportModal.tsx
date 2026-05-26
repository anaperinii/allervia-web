import { ShieldCheck } from 'lucide-react'
import { Modal, Button } from '@/shared/components'
import { cn } from '@/shared/lib/cn'

interface ConfirmExportModalProps {
  open: boolean
  format: string
  anonymize: boolean
  justification: string
  onClose: () => void
  onConfirm: () => void
}

export function ConfirmExportModal({
  open,
  format,
  anonymize,
  justification,
  onClose,
  onConfirm,
}: ConfirmExportModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Confirmar exportação"
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={onConfirm}>Confirmar e exportar</Button>
        </>
      }
    >
      <div className="flex justify-center">
        <div className="h-11 w-11 rounded-full bg-brand/10 flex items-center justify-center">
          <ShieldCheck size={20} className="text-brand" />
        </div>
      </div>
      <p className="text-[0.7rem] text-(--text-muted) text-center leading-relaxed">
        Ao confirmar, um registro desta exportação será salvo no log de auditoria do sistema, incluindo data, hora, responsável e justificativa informada.
      </p>
      <div className="bg-gray-50 border border-(--border-custom) rounded-lg px-3.5 py-2.5 space-y-1.5">
        <div className="flex justify-between">
          <span className="text-[0.6rem] text-(--text-muted)">Formato</span>
          <span className="text-[0.6rem] font-semibold text-(--text)">{format.toUpperCase()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[0.6rem] text-(--text-muted)">Dados anonimizados</span>
          <span className={cn('text-[0.6rem] font-semibold', anonymize ? 'text-brand' : 'text-amber-600')}>
            {anonymize ? 'Sim' : 'Não'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[0.6rem] text-(--text-muted)">Justificativa</span>
          <span className="text-[0.6rem] font-semibold text-(--text) text-right max-w-[60%] truncate">{justification}</span>
        </div>
      </div>
    </Modal>
  )
}
