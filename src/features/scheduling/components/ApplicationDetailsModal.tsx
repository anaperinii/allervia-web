import { useState, type ReactNode } from 'react'
import { Modal, Button } from '@/shared/components'
import { cn } from '@/shared/lib/cn'
import { formatPhone } from '@/shared/lib/formatters'
import { getIntervalColor } from '@/features/immunotherapy/constants/interval-colors'
import { openWhatsApp, sendReminder } from '@/shared/lib/whatsapp'
import { APPLICATION_STATUS_DISPLAY } from '@/features/scheduling/constants/application-display'
import { MODAL_HEADER_BACKGROUND } from '@/features/scheduling/constants/modal-header'
import type { Application } from '@/features/patient/stores/usePatientStore'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  InformationCircleIcon,
  StickyNote01Icon,
  WhatsappIcon,
} from '@hugeicons/core-free-icons'

type TabId = 'info' | 'notes'

const TABS: { id: TabId; label: string; icon: typeof InformationCircleIcon }[] = [
  { id: 'info', label: 'Informações', icon: InformationCircleIcon },
  { id: 'notes', label: 'Observações', icon: StickyNote01Icon },
]

interface ApplicationDetailsModalProps {
  application: Application | null
  onClose: () => void
  onOpenPatient: (patientId: string) => void
  onReschedule?: (doseId: string) => void
}


function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <div className="mb-1 text-[0.75rem] font-medium text-(--text-muted)">{label}</div>
      <div className="flex h-9 items-center rounded-lg border border-(--border-custom) bg-white px-3">
        <div className="min-w-0 flex-1 truncate text-xs font-medium text-(--text)">{children}</div>
      </div>
    </div>
  )
}

export function ApplicationDetailsModal(props: ApplicationDetailsModalProps) {
  // Remonta a cada agendamento para a aba voltar ao início.
  return <DetailsModal key={props.application?.id ?? 'empty'} {...props} />
}

function DetailsModal({
  application,
  onClose,
  onOpenPatient,
  onReschedule,
}: ApplicationDetailsModalProps) {
  const [tab, setTab] = useState<TabId>('info')

  const initials = (application?.patientName ?? '')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  // Aplicação realizada abre o prontuário; previsão pendente abre a edição.
  const action = !application
    ? null
    : application.status === 'completed'
      ? { label: 'Ver no prontuário', run: () => onOpenPatient(application.patientId) }
      : application.status === 'scheduled' && onReschedule
        ? { label: 'Editar', run: () => onReschedule(application.id) }
        : null

  const headerAction = action ? (
    <button
      type="button"
      onClick={action.run}
      className="shrink-0 cursor-pointer self-start rounded-lg border border-transparent px-3 py-1.5 text-[0.7rem] font-semibold text-white transition-[filter] duration-200 hover:brightness-110"
      style={{ background: '#12333a' }}
    >
      {action.label}
    </button>
  ) : (
    <span />
  )

  return (
    <Modal
      open={!!application}
      onClose={onClose}
      ariaLabel="Detalhes do agendamento"
      size="md"
      headerSlot={
        application ? (
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-3">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{
                  background: 'linear-gradient(160deg, #6C9EA5 0%, #4d7e85 100%)',
                  boxShadow: '0 6px 14px -8px rgba(16,60,68,0.55)',
                }}
              >
                {initials}
              </div>
              <div className="min-w-0">
                <button
                  onClick={() => onOpenPatient(application.patientId)}
                  className="block max-w-full truncate text-left text-[1.05rem] font-bold text-(--text) transition-colors hover:text-brand"
                >
                  {application.patientName ?? ''}
                </button>
                <div className="text-[0.82rem] text-(--text-muted)">
                  {application.modality === 'sublingual' ? 'Sublingual' : 'Subcutânea'} ·{' '}
                  {APPLICATION_STATUS_DISPLAY[application.status].label}
                </div>
              </div>
            </div>

            <div className="-mb-3.5 mt-4 flex items-center gap-1" role="tablist">
              {TABS.map((item) => {
                const active = item.id === tab
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setTab(item.id)}
                    className={cn(
                      'flex cursor-pointer items-center gap-1.5 rounded-t-lg px-3 py-1.5 text-[0.7rem] font-medium transition-colors',
                      active
                        ? 'bg-white text-(--text)'
                        : 'text-(--text-muted) hover:text-(--text)',
                    )}
                    style={
                      active
                        ? { border: '1px solid var(--border-custom)', borderBottomColor: '#ffffff' }
                        : { border: '1px solid transparent' }
                    }
                  >
                    <HugeiconsIcon icon={item.icon} size={13} strokeWidth={1.8} />
                    {item.label}
                  </button>
                )
              })}
            </div>
          </div>
        ) : undefined
      }
      headerStyle={{
        background: MODAL_HEADER_BACKGROUND,
        borderBottom: 'none',
        paddingTop: '1.75rem',
      }}
      headerAction={headerAction}
      footer={
        application ? (
          <>
            <button
              type="button"
              onClick={() =>
                sendReminder(
                  application.patientPhone ?? '',
                  (application.patientName ?? '').split(' ')[0],
                  application.date,
                  application.startTime,
                )
              }
              className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-transparent bg-emerald-500 px-3 py-1.5 text-[0.7rem] font-semibold text-white transition-colors hover:bg-emerald-600"
            >
              <HugeiconsIcon icon={WhatsappIcon} size={14} strokeWidth={1.8} />
              Enviar lembrete via WhatsApp
            </button>
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </>
        ) : null
      }
    >
      {application && tab === 'info' && (
        <>
          <Field label="Data">
            {application.date}
          </Field>

          <div className="flex items-end gap-2">
            <div className="min-w-0 flex-1">
              <Field label="Início">
                {application.startTime}
              </Field>
            </div>
            <div className="flex h-9 shrink-0 items-center text-(--text-muted)">
              <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 11 }} />
            </div>
            <div className="min-w-0 flex-1">
              <Field label="Fim">
                {application.endTime || '—'}
              </Field>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Dose">
              {application.dose}
            </Field>
            <Field label="Intervalo">
              {(() => {
                const intervalColor = getIntervalColor(application.cycle.days)
                return (
                  <span
                    className="inline-flex items-center rounded-md border px-2 py-0.5 text-[0.65rem] font-semibold"
                    style={{
                      backgroundColor: intervalColor.bg + '4D',
                      color: intervalColor.text,
                      borderColor: intervalColor.dot + '30',
                    }}
                  >
                    {application.cycle.days} dias
                  </span>
                )
              })()}
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Médico responsável">
              {application.administrator || '—'}
            </Field>
            <Field label="Contato">
              <button
                onClick={() => openWhatsApp(application.patientPhone ?? '')}
                className="cursor-pointer truncate border-none bg-transparent p-0 text-xs font-medium text-(--text) transition-colors hover:text-brand"
              >
                {application.patientPhone ? formatPhone(application.patientPhone) : '—'}
              </button>
            </Field>
          </div>

        </>
      )}

      {application && tab === 'notes' && (
        <>
          <Field label="Reação adversa">
            {application.sideEffect === 'yes' ? 'Sim' : 'Não registrada'}
          </Field>
          {application.reportedEffects && (
            <div>
              <div className="mb-1 text-[0.75rem] font-medium text-(--text-muted)">
                Efeitos relatados
              </div>
              <p className="rounded-lg border border-(--border-custom) bg-white px-3 py-2 text-xs leading-relaxed text-(--text)">
                {application.reportedEffects}
              </p>
            </div>
          )}
          {application.medications && (
            <div>
              <div className="mb-1 text-[0.75rem] font-medium text-(--text-muted)">
                Medicação utilizada
              </div>
              <p className="rounded-lg border border-(--border-custom) bg-white px-3 py-2 text-xs leading-relaxed text-(--text)">
                {application.medications}
              </p>
            </div>
          )}
          {application.administratorNote && (
            <div>
              <div className="mb-1 text-[0.75rem] font-medium text-(--text-muted)">
                Observação do profissional
              </div>
              <p className="rounded-lg border border-(--border-custom) bg-white px-3 py-2 text-xs leading-relaxed text-(--text)">
                {application.administratorNote}
              </p>
            </div>
          )}
          {!application.reportedEffects &&
            !application.medications &&
            !application.administratorNote && (
              <p className="py-6 text-center text-xs text-(--text-muted)">
                Nenhuma observação registrada para esta aplicação.
              </p>
            )}
        </>
      )}
    </Modal>
  )
}
