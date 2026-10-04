import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button, Modal } from '@/shared/components'
import { cn } from '@/shared/lib/cn'
import { MODAL_HEADER_BACKGROUND } from '@/features/scheduling/constants/modal-header'
import { useProfessionalDirectory } from '@/shared/hooks/useProfessionalDirectory'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  InjectionIcon,
  StethoscopeIcon,
  StickyNote01Icon,
} from '@hugeicons/core-free-icons'
import { getDose } from '@/shared/api/clinical.api'
import { queryKeys } from '@/shared/api/query-keys'
import { formatInstantDate } from '@/features/patient/adapters/clinical-presentation'
import type { DoseObservationAddendum } from '@/shared/api/contracts/clinical'
import type { Application } from '@/features/patient/stores/usePatientStore'

function localTime(iso: string): string {
  const date = new Date(iso)
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

const CONDUCT_LABELS: Record<string, string> = {
  MAINTAIN: 'Manter protocolo',
  REQUEST_PHYSICIAN_REVIEW: 'Solicitar avaliação médica',
  SUSPEND_TREATMENT: 'Suspender tratamento',
}

type TabId = 'pre' | 'post' | 'addenda'

const TABS: { id: TabId; label: string; icon: typeof StethoscopeIcon }[] = [
  { id: 'pre', label: 'Pré-Aplicação', icon: StethoscopeIcon },
  { id: 'post', label: 'Pós-Aplicação', icon: InjectionIcon },
  { id: 'addenda', label: 'Observações tardias', icon: StickyNote01Icon },
]

interface ApplicationDetailModalProps {
  application: Application | null
  organizationId: string
  onClose: () => void
  onRetract?: (doseId: string) => void
  onLateObservation?: (doseId: string) => void
}

export function ApplicationDetailModal(props: ApplicationDetailModalProps) {
  // Remonta a cada aplicação para a aba voltar ao início.
  return <DetailModal key={props.application?.id ?? 'empty'} {...props} />
}

function DetailModal({
  application,
  organizationId,
  onClose,
  onRetract,
  onLateObservation,
}: ApplicationDetailModalProps) {
  const [tab, setTab] = useState<TabId>('pre')
  const completed = application?.status === 'completed'

  // As observações tardias só existem no detalhe da dose; a listagem que
  // alimenta `application` não as carrega.
  const doseQuery = useQuery({
    queryKey: queryKeys.dose(organizationId, application?.id ?? ''),
    queryFn: ({ signal }) => getDose(application!.id, signal),
    enabled: organizationId !== '' && !!application && completed,
  })
  const dose = doseQuery.data ?? null
  const addenda = dose?.observationAddenda ?? []

  // O adapter da listagem não resolve executor nem relato; o detalhe da dose sim.
  const professionals = useProfessionalDirectory()
  const performer =
    professionals.members.find(
      (member) => member.professionalId === dose?.administeredById,
    )?.fullName ?? application?.administrator ?? null
  const endTime = dose?.administrationEndedAt
    ? localTime(dose.administrationEndedAt)
    : application?.endTime || null

  const tabs = TABS.filter((item) => item.id !== 'addenda' || addenda.length > 0)

  return (
    <Modal
      open={!!application}
      onClose={onClose}
      ariaLabel="Dados da aplicação"
      size="2xl"
      headerSlot={
        application ? (
          <div className="min-w-0 flex-1">
            <div className="min-w-0">
              <div className="truncate text-[1.05rem] font-bold text-(--text)">
                Aplicação de {application.date}
              </div>
              <div className="text-[0.82rem] text-(--text-muted)">
                {application.startTime}
                {endTime ? ` – ${endTime}` : ''}
                {performer ? ` · ${performer}` : ''} ·{' '}
                {completed ? 'Realizada' : 'Prevista'}
              </div>
            </div>

            <div className="-mb-3.5 mt-4 flex items-center gap-1" role="tablist">
              {tabs.map((item) => {
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
                      active ? 'bg-white text-(--text)' : 'text-(--text-muted) hover:text-(--text)',
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
      headerAction={
        completed && (onRetract || onLateObservation) ? (
          <div className="flex shrink-0 items-center gap-1.5 self-start">
            {onLateObservation && (
              <button
                type="button"
                onClick={() => onLateObservation(application!.id)}
                className="cursor-pointer rounded-lg border border-transparent px-3 py-1.5 text-[0.7rem] font-semibold text-white transition-[filter] duration-200 hover:brightness-110"
                style={{ background: '#12333a' }}
              >
                Observação tardia
              </button>
            )}
            {onRetract && (
              <button
                type="button"
                onClick={() => onRetract(application!.id)}
                className="cursor-pointer rounded-lg border border-[#A41517]/40 bg-[#A41517]/6 px-3 py-1.5 text-[0.7rem] font-semibold text-[#A41517] transition-colors hover:border-[#A41517]/70 hover:bg-[#A41517]/12"
              >
                Registrar em erro
              </button>
            )}
          </div>
        ) : (
          <span />
        )
      }
      footer={<Button variant="outline" onClick={onClose}>Fechar</Button>}
    >
      {application && tab === 'pre' && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <Field colSpan label="Como o paciente passou durante o intervalo da última aplicação?">
            {dose?.betweenDosesReport ||
              application.administratorNote ||
              'Sem intercorrências relatadas durante o intervalo.'}
          </Field>
          <Field label="Presença de efeito colateral">
            {application.sideEffect === 'yes' ? 'Sim' : 'Não'}
          </Field>
          <Field label="Necessidade de medicação">
            {application.medicationNeeded === 'yes' ? 'Sim' : 'Não'}
          </Field>
          {application.sideEffect === 'yes' && (
            <Field colSpan label="Efeitos colaterais relatados">
              {application.reportedEffects || '—'}
            </Field>
          )}
          {application.medicationNeeded === 'yes' && (
            <Field colSpan label="Medicações administradas">
              {application.medications || '—'}
            </Field>
          )}
        </div>
      )}

      {application && tab === 'post' && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <Field label="Data">{application.date}</Field>
          <Field label="Horário">
            {application.startTime}
            {endTime ? ` – ${endTime}` : ''}
          </Field>
          <Field label="Volume aplicado">{application.appliedVolume || '-'}</Field>
          <Field label="Concentração aplicada">{application.extractConcentration || '-'}</Field>
          <Field label="Intervalo associado da dose">{application.cycle.days} dias</Field>
          <Field label="Responsável pela aplicação">{performer || '-'}</Field>
          {dose?.immediateConduct && (
            <Field colSpan label="Conduta imediata">
              {CONDUCT_LABELS[dose.immediateConduct] ?? dose.immediateConduct}
              {dose.immediateConductJustification
                ? ` — ${dose.immediateConductJustification}`
                : ''}
            </Field>
          )}
          <Field colSpan label="Notas do responsável">
            {application.administratorNote || '-'}
          </Field>
        </div>
      )}

      {application && tab === 'addenda' && (
        <div className="space-y-3">
          {addenda.map((addendum) => (
            <Addendum key={addendum.id} addendum={addendum} />
          ))}
        </div>
      )}
    </Modal>
  )
}

function Addendum({ addendum }: { addendum: DoseObservationAddendum }) {
  return (
    <div className="rounded-lg border border-(--border-custom) bg-gray-50/60 px-3 py-2.5">
      <div className="mb-1.5 text-[0.65rem] font-semibold text-(--text-muted)">
        Observado em {formatInstantDate(addendum.observedAt)}
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        <Field label="Efeitos colaterais relatados">
          {addendum.reportedSideEffects.join(', ') || '—'}
        </Field>
        <Field label="Medicações administradas">
          {addendum.administeredMedications.join(', ') || '—'}
        </Field>
        {addendum.conduct && (
          <Field label="Conduta imediata">
            {CONDUCT_LABELS[addendum.conduct] ?? addendum.conduct}
          </Field>
        )}
        {addendum.conductJustification && (
          <Field label="Justificativa da conduta">{addendum.conductJustification}</Field>
        )}
        {addendum.notes && <Field colSpan label="Notas">{addendum.notes}</Field>}
      </div>
    </div>
  )
}

function Field({ label, children, colSpan }: { label: string; children: React.ReactNode; colSpan?: boolean }) {
  return (
    <div className={colSpan ? 'col-span-2' : undefined}>
      <div className="mb-1 text-[0.75rem] font-medium text-(--text-muted)">{label}</div>
      <div className="text-xs text-(--text) leading-relaxed">{children}</div>
    </div>
  )
}
