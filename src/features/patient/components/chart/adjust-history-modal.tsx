import { Modal } from '@/shared/components'
import { ADJUSTMENT_TYPE_LABELS } from '@/features/patient/constants/clinical-labels'
import type { ProtocolAdjustment } from '@/features/patient/stores/patient-store'

interface AdjustHistoryModalProps {
  open: boolean
  adjustments: ProtocolAdjustment[]
  onClose: () => void
}

export function AdjustHistoryModal({ open, adjustments, onClose }: AdjustHistoryModalProps) {
  return (
    <Modal open={open && adjustments.length > 0} onClose={onClose} title="Histórico de ajustes">
      {[...adjustments].reverse().map((adj) => (
        <div key={adj.id} className="border border-(--border-custom) rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[0.6rem] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              {ADJUSTMENT_TYPE_LABELS[adj.type]}
            </span>
            <span className="text-[0.55rem] text-(--text-muted)">{adj.date}</span>
          </div>
          <div className="space-y-1 mb-2">
            <div className="flex items-center justify-between text-[0.65rem]">
              <span className="text-(--text-muted)">Concentração:</span>
              <span className="font-medium">
                <span className="text-(--text-muted) line-through">{adj.previousConcentration}</span> → <span className="text-brand font-bold">{adj.newConcentration}</span>
              </span>
            </div>
            <div className="flex items-center justify-between text-[0.65rem]">
              <span className="text-(--text-muted)">Intervalo:</span>
              <span className="font-medium">
                <span className="text-(--text-muted) line-through">{adj.previousInterval}d</span> → <span className="text-brand font-bold">{adj.newInterval}d</span>
              </span>
            </div>
          </div>
          <div className="bg-gray-50 rounded px-2.5 py-1.5 border-l-2 border-amber-400">
            <div className="text-[0.55rem] font-semibold text-(--text-muted) uppercase tracking-wider mb-0.5">Justificativa</div>
            <div className="text-[0.65rem] text-(--text) leading-relaxed">{adj.justification}</div>
          </div>
          <div className="text-[0.55rem] text-(--text-muted) mt-1.5">
            Responsável: <span className="font-semibold text-(--text)">{adj.responsibleDoctor}</span>
          </div>
        </div>
      ))}
    </Modal>
  )
}
