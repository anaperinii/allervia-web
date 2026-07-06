import { Calendar, Clock, ExternalLink, Phone, Syringe, User } from 'lucide-react'
import { Modal, Button } from '@/shared/components'
import { cn } from '@/shared/lib/cn'
import { getIntervalColor } from '@/features/immunotherapy/constants/interval-colors'
import { useImmunotherapyLookup } from '@/features/immunotherapy/stores/useImmunotherapiesStore'
import { openWhatsApp, sendReminder } from '@/shared/lib/whatsapp'
import { APPLICATION_STATUS_DISPLAY } from '@/features/scheduling/constants/application-display'
import type { Application } from '@/features/patient/stores/usePatientStore'

interface ApplicationDetailsModalProps {
  application: Application | null
  googleConnected: boolean
  onClose: () => void
  onOpenPatient: (patientId: string) => void
}

export function ApplicationDetailsModal({
  application,
  googleConnected,
  onClose,
  onOpenPatient,
}: ApplicationDetailsModalProps) {
  const { getFullName, getPhone } = useImmunotherapyLookup()

  return (
    <Modal
      open={!!application}
      onClose={onClose}
      title="Detalhes do Agendamento"
      size="md"
      footer={
        application ? (
          <>
            <button
              onClick={() =>
                sendReminder(
                  getPhone(application.patientId),
                  getFullName(application.patientId).split(' ')[0],
                  application.date,
                  application.startTime,
                )
              }
              className="text-[0.65rem] font-medium text-[#25D366] hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-none mr-auto"
            >
              <Phone size={11} />
              Enviar lembrete via WhatsApp
            </button>
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </>
        ) : null
      }
    >
      {application && (
        <>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-brand to-brand-dark text-sm font-bold text-white shrink-0">
              {getFullName(application.patientId)
                .split(' ')
                .map((part) => part[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <button
                onClick={() => onOpenPatient(application.patientId)}
                className="text-sm font-bold text-(--text) hover:text-brand hover:underline transition-colors text-left truncate"
              >
                {getFullName(application.patientId)}
              </button>
              <div className="text-[0.65rem] text-(--text-muted)">{getPhone(application.patientId)}</div>
            </div>
            <button
              onClick={() => openWhatsApp(getPhone(application.patientId))}
              className="h-8 px-3 flex items-center gap-1.5 rounded-lg bg-[#25D366] text-white text-[0.65rem] font-semibold hover:bg-[#20BD5A] transition-all shrink-0"
            >
              <Phone size={12} />
              WhatsApp
            </button>
          </div>

          <div className="grid grid-cols-2 gap-px bg-(--border-custom) rounded-lg overflow-hidden border border-(--border-custom)">
            <div className="bg-white px-3.5 py-2.5">
              <div className="flex items-center gap-1.5 text-[0.55rem] font-semibold uppercase tracking-wider text-(--text-muted) mb-0.5">
                <Calendar size={9} />
                Data
              </div>
              <div className="text-xs font-medium text-(--text)">{application.date}</div>
            </div>
            <div className="bg-white px-3.5 py-2.5">
              <div className="flex items-center gap-1.5 text-[0.55rem] font-semibold uppercase tracking-wider text-(--text-muted) mb-0.5">
                <Clock size={9} />
                Horário
              </div>
              <div className="text-xs font-medium text-(--text)">
                {application.startTime} – {application.endTime}
              </div>
            </div>
            <div className="bg-white px-3.5 py-2.5">
              <div className="flex items-center gap-1.5 text-[0.55rem] font-semibold uppercase tracking-wider text-(--text-muted) mb-0.5">
                <Syringe size={9} />
                Dose
              </div>
              <div className="text-xs font-medium text-(--text)">{application.dose}</div>
            </div>
            <div className="bg-white px-3.5 py-2.5">
              <div className="text-[0.55rem] font-semibold uppercase tracking-wider text-(--text-muted) mb-0.5">
                Intervalo
              </div>
              <div className="text-xs font-medium text-(--text)">
                {(() => {
                  const intervalColor = getIntervalColor(application.cycle.days)
                  return (
                    <span
                      className="inline-flex items-center gap-1 px-2 py-px rounded-full text-[0.6rem] font-semibold border"
                      style={{ backgroundColor: intervalColor.bg, color: intervalColor.text, borderColor: intervalColor.dot + '30' }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: intervalColor.dot }} />
                      {application.cycle.days} dias
                    </span>
                  )
                })()}
              </div>
            </div>
            <div className="bg-white px-3.5 py-2.5">
              <div className="text-[0.55rem] font-semibold uppercase tracking-wider text-(--text-muted) mb-0.5">Status</div>
              <div className="text-xs font-medium">
                <span className={cn('px-2 py-0.5 rounded-full text-[0.6rem] font-semibold', APPLICATION_STATUS_DISPLAY[application.status].className)}>
                  {APPLICATION_STATUS_DISPLAY[application.status].label}
                </span>
              </div>
            </div>
            <div className="bg-white px-3.5 py-2.5">
              <div className="flex items-center gap-1.5 text-[0.55rem] font-semibold uppercase tracking-wider text-(--text-muted) mb-0.5">
                <User size={9} />
                Modalidade
              </div>
              <div className="text-xs font-medium text-(--text)">
                {application.modality === 'sublingual' ? 'Sublingual' : 'Subcutânea'}
              </div>
            </div>
          </div>

          {googleConnected && (
            <div className="flex items-center gap-2 bg-brand/5 border border-brand/20 rounded-lg px-3 py-2">
              <Calendar size={13} className="text-brand shrink-0" />
              <div className="flex-1">
                <p className="text-[0.6rem] text-brand font-medium">Sincronizado com Google Agenda</p>
                <p className="text-[0.5rem] text-brand/60">
                  Este evento está visível na agenda do profissional responsável.
                </p>
              </div>
              <a
                href="#"
                className="text-[0.55rem] text-brand font-semibold hover:underline no-underline flex items-center gap-0.5 shrink-0"
              >
                <ExternalLink size={9} />
                Abrir
              </a>
            </div>
          )}
        </>
      )}
    </Modal>
  )
}
