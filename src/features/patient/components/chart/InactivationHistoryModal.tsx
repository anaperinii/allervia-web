import { cn } from '@/shared/lib/utils'
import { Modal } from '@/shared/components'
import { INACTIVATION_CATEGORY_LABELS } from '@/features/patient/constants/clinical-labels'
import type { Inactivation } from '@/features/patient/stores/usePatientStore'

interface InactivationHistoryModalProps {
  open: boolean
  inactivations: Inactivation[]
  onClose: () => void
}

export function InactivationHistoryModal({ open, inactivations, onClose }: InactivationHistoryModalProps) {
  const items = [...inactivations].reverse()

  return (
    <Modal open={open && inactivations.length > 0} onClose={onClose} title="Histórico de inativações">
      <div className="relative pl-7">
        <div className="absolute left-2 top-1.5 bottom-1.5 w-px bg-gray-200" />
        {items.map((s, idx) => {
          const isActive = !s.reactivatedAt
          const isLast = idx === items.length - 1
          return (
            <div key={s.id} className={cn('relative', !isLast && 'mb-5')}>
              <div
                className={cn(
                  'absolute -left-6.25 top-1.5 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center z-10 bg-white',
                  isActive ? 'border-brand' : 'border-emerald-500',
                )}
              >
                <div
                  className={cn(
                    'w-1.5 h-1.5 rounded-full',
                    isActive ? 'bg-brand' : 'bg-emerald-500',
                  )}
                />
              </div>

              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-(--text)">{s.startDate}</span>
                <span
                  className={cn(
                    'text-[0.55rem] font-bold px-2 py-0.5 rounded-full border',
                    isActive ? 'text-brand bg-teal-50 border-teal-200' : 'text-emerald-700 bg-emerald-50 border-emerald-200',
                  )}
                >
                  {isActive ? 'Inativada' : 'Reativada'}
                </span>
              </div>

              <div className="text-[0.7rem] font-semibold text-(--text) mb-1.5">
                {INACTIVATION_CATEGORY_LABELS[s.category]}
              </div>

              <div className="text-[0.65rem] text-(--text-muted) leading-relaxed mb-1.5">{s.detail}</div>

              <div className="flex flex-col gap-0.5 text-[0.6rem] text-(--text-muted)">
                {s.expectedReturnDate && (
                  <div>Retorno previsto: <span className="font-semibold text-(--text)">{s.expectedReturnDate}</span></div>
                )}
                <div>Responsável: <span className="font-semibold text-(--text)">{s.responsibleDoctor}</span></div>
              </div>

              {s.reactivatedAt && (
                <div className="mt-3 pl-3 border-l-2 border-emerald-300 space-y-1.5">
                  <div className="text-[0.65rem] font-semibold text-emerald-700">
                    Reativada em {s.reactivatedAt}
                  </div>
                  {s.reactivateConcentration && s.reactivateInterval !== undefined && (
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[0.6rem] text-(--text-muted)">
                      <div>Ponto de retorno: <span className="font-semibold text-(--text)">{s.reactivateConcentration}</span></div>
                      <div>Intervalo: <span className="font-semibold text-(--text)">{s.reactivateInterval} dias</span></div>
                    </div>
                  )}
                  {s.reactivateJustification && (
                    <div className="text-[0.6rem] text-(--text) leading-relaxed">
                      <span className="text-(--text-muted)">Justificativa: </span>
                      {s.reactivateJustification}
                    </div>
                  )}
                  {s.reactivateNote && (
                    <div className="text-[0.6rem] text-(--text-muted) leading-relaxed">
                      <span className="text-(--text-muted)">Observação: </span>
                      <span className="text-(--text)">{s.reactivateNote}</span>
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
      </div>
    </Modal>
  )
}
