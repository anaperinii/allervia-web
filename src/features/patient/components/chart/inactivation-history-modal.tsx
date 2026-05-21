import { cn } from '@/shared/lib/utils'
import { Modal } from '@/shared/components'
import { INACTIVATION_CATEGORY_LABELS } from '@/features/patient/constants/clinical-labels'
import type { Inactivation } from '@/features/patient/stores/patient-store'

interface InactivationHistoryModalProps {
  open: boolean
  inactivations: Inactivation[]
  onClose: () => void
}

export function InactivationHistoryModal({ open, inactivations, onClose }: InactivationHistoryModalProps) {
  return (
    <Modal open={open && inactivations.length > 0} onClose={onClose} title="Histórico de inativações">
      {[...inactivations].reverse().map((s) => {
        const isActive = !s.reactivatedAt
        return (
          <div key={s.id} className={cn('border rounded-lg p-3', isActive ? 'border-teal-200 bg-teal-50/40' : 'border-(--border-custom)')}>
            <div className="flex items-center justify-between mb-2">
              <span className={cn('text-[0.6rem] font-bold px-2 py-0.5 rounded-full border', isActive ? 'text-brand bg-teal-50 border-teal-200' : 'text-emerald-700 bg-emerald-50 border-emerald-200')}>
                {isActive ? 'Inativada' : 'Reativada'}
              </span>
              <span className="text-[0.55rem] text-(--text-muted)">{s.startDate}</span>
            </div>
            <div className="text-[0.65rem] font-bold text-(--text) mb-1">{INACTIVATION_CATEGORY_LABELS[s.category]}</div>
            <div className="bg-gray-50 rounded px-2.5 py-1.5 border-l-2 border-teal-400 mb-2">
              <div className="text-[0.55rem] font-semibold text-(--text-muted) uppercase tracking-wider mb-0.5">Motivo</div>
              <div className="text-[0.65rem] text-(--text) leading-relaxed">{s.detail}</div>
            </div>
            {s.expectedReturnDate && (
              <div className="text-[0.6rem] text-(--text-muted) mb-1">
                Retorno previsto: <span className="font-semibold text-(--text)">{s.expectedReturnDate}</span>
              </div>
            )}
            <div className="text-[0.55rem] text-(--text-muted)">
              Responsável: <span className="font-semibold text-(--text)">{s.responsibleDoctor}</span>
            </div>
            {s.reactivatedAt && (
              <div className="mt-2 pt-2 border-t border-(--border-custom) space-y-1.5">
                <div className="text-[0.6rem] text-emerald-700 font-semibold">Reativado em {s.reactivatedAt}</div>
                {s.reactivateConcentration && s.reactivateInterval !== undefined && (
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="bg-gray-50 rounded px-2 py-1">
                      <div className="text-[0.5rem] text-(--text-muted) font-semibold uppercase tracking-wider">Ponto de retorno</div>
                      <div className="text-[0.6rem] font-medium text-(--text)">{s.reactivateConcentration}</div>
                    </div>
                    <div className="bg-gray-50 rounded px-2 py-1">
                      <div className="text-[0.5rem] text-(--text-muted) font-semibold uppercase tracking-wider">Intervalo</div>
                      <div className="text-[0.6rem] font-medium text-(--text)">{s.reactivateInterval} dias</div>
                    </div>
                  </div>
                )}
                {s.reactivateJustification && (
                  <div className="bg-emerald-50/50 border-l-2 border-emerald-300 rounded px-2.5 py-1.5">
                    <div className="text-[0.5rem] font-semibold text-emerald-700 uppercase tracking-wider mb-0.5">Justificativa</div>
                    <div className="text-[0.6rem] text-(--text) leading-relaxed">{s.reactivateJustification}</div>
                  </div>
                )}
                {s.reactivateNote && (
                  <div className="bg-gray-50 border-l-2 border-gray-300 rounded px-2.5 py-1.5">
                    <div className="text-[0.5rem] font-semibold text-(--text-muted) uppercase tracking-wider mb-0.5">Observação</div>
                    <div className="text-[0.6rem] text-(--text) leading-relaxed">{s.reactivateNote}</div>
                  </div>
                )}
                {s.reactivatedBy && (
                  <div className="text-[0.55rem] text-(--text-muted)">
                    Por: <span className="font-semibold text-(--text)">{s.reactivatedBy}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </Modal>
  )
}
