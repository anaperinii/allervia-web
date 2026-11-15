import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, FieldLabel, Modal, Select, showApiErrorToast, TextArea, TextInput, toast } from '@/shared/components'
import { ClinicalReviewNotice } from '@/shared/components/ClinicalReviewNotice'
import { cn } from '@/shared/lib/cn'
import { MODAL_HEADER_BACKGROUND } from '@/features/scheduling/constants/modal-header'
import { useProfessionalDirectory } from '@/shared/hooks/useProfessionalDirectory'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  InjectionIcon,
  StethoscopeIcon,
  StickyNote01Icon,
} from '@hugeicons/core-free-icons'
import { addLateObservation, getDose } from '@/shared/api/clinical.api'
import { ApiError } from '@/shared/api/contracts/errors'
import { queryKeys } from '@/shared/api/query-keys'
import { toZonedOffsetIso, todayStr } from '@/shared/lib/dates'
import { useIdempotencyKey } from '@/shared/lib/use-idempotency-key'
import { formatInstantDate } from '@/features/patient/adapters/clinical-presentation'
import type { DoseObservationAddendum } from '@/shared/api/contracts/clinical'
import type { Application } from '@/features/patient/stores/usePatientStore'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons'

function localTime(iso: string, timeZone = 'America/Sao_Paulo'): string {
  return new Intl.DateTimeFormat('en-GB', { timeZone, hourCycle: 'h23', hour: '2-digit', minute: '2-digit' }).format(new Date(iso))
}

function toList(text: string): string[] {
  return text
    .split(/[;,\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

const CONDUCT_LABELS: Record<string, string> = {
  MAINTAIN: 'Manter protocolo',
  REQUEST_PHYSICIAN_REVIEW: 'Solicitar avaliação médica',
  SUSPEND_TREATMENT: 'Suspender tratamento',
}

type TabId = 'pre' | 'post' | 'late' | 'addenda'

const TABS: { id: TabId; label: string; icon: typeof StethoscopeIcon }[] = [
  { id: 'pre', label: 'Pré-Aplicação', icon: StethoscopeIcon },
  { id: 'post', label: 'Pós-Aplicação', icon: InjectionIcon },
  { id: 'late', label: 'Observação tardia', icon: StickyNote01Icon },
  { id: 'addenda', label: 'Observações tardias', icon: StickyNote01Icon },
]

interface ApplicationDetailModalProps {
  application: Application | null
  organizationId: string
  onClose: () => void
  onRetract?: (doseId: string) => void
  canLateObservation?: boolean
}

export function ApplicationDetailModal(props: ApplicationDetailModalProps) {

  return <DetailModal key={props.application?.id ?? 'empty'} {...props} />
}

function DetailModal({
  application,
  organizationId,
  onClose,
  onRetract,
  canLateObservation,
}: ApplicationDetailModalProps) {
  const [tab, setTab] = useState<TabId>('pre')
  const completed = application?.status === 'completed'
  const queryClient = useQueryClient()
  const idempotencyKeyFor = useIdempotencyKey()

  const doseQuery = useQuery({
    queryKey: queryKeys.dose(organizationId, application?.id ?? ''),
    queryFn: ({ signal }) => getDose(application!.id, signal),
    enabled: organizationId !== '' && !!application && completed,
  })
  const dose = doseQuery.data ?? null
  const addenda = dose?.observationAddenda ?? []

  const [lateEffects, setLateEffects] = useState('')
  const [lateMedications, setLateMedications] = useState('')
  const [lateNotes, setLateNotes] = useState('')
  const [lateDate, setLateDate] = useState(todayStr())
  const [lateTime, setLateTime] = useState('12:00')
  const [lateConduct, setLateConduct] = useState('')
  const [lateConductJustification, setLateConductJustification] = useState('')
  const [lateReviewRequired, setLateReviewRequired] = useState(false)

  const lateObservationMutation = useMutation({
    mutationFn: () => {
      const command = {
        reportedSideEffects: toList(lateEffects),
        administeredMedications: toList(lateMedications),
        ...(lateNotes.trim() ? { notes: lateNotes.trim() } : {}),
        observedAt: toZonedOffsetIso(lateDate, lateTime, dose?.immunotherapy.currentPrescription?.resolved.timeZone ?? 'America/Sao_Paulo'),
        ...(lateConduct
          ? {
              conduct: {
                type: lateConduct as 'MAINTAIN' | 'REQUEST_PHYSICIAN_REVIEW' | 'SUSPEND_TREATMENT',
                justification: lateConductJustification.trim() || undefined,
              },
            }
          : {}),
        expectedTherapyRevision: dose!.therapyRevision,
      }
      return addLateObservation(application!.id, {
        ...command,
        idempotencyKey: idempotencyKeyFor([application!.id, command]),
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['clinical', organizationId] })
      toast.success({
        icon: <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: 16 }} />,
        title: 'Observação tardia registrada',
        description: 'Registro adicional imutável com sua autoria e o instante observado.',
        autoDismissMs: 8000,
      })
      setLateEffects(''); setLateMedications(''); setLateNotes(''); setLateConduct(''); setLateConductJustification('')
      setTab('addenda')
    },
    meta: { suppressErrorToast: true },
    onError: async (error) => {
      if (error instanceof ApiError && error.code.startsWith('STALE_')) { setLateReviewRequired(true); await queryClient.invalidateQueries({ queryKey: queryKeys.clinical(organizationId) }) }
      showApiErrorToast(
        error,
        error instanceof ApiError && error.code === 'CONDUCT_REQUIRES_PHYSICIAN'
          ? {
              title: 'Conduta exige revisão médica',
              description:
                'Suspender o tratamento exige poder de revisão clínica. Registre a observação e solicite avaliação médica.',
            }
          : {},
      )
    },
  })

  const canSubmitLateObservation =
    !!dose &&
    (toList(lateEffects).length > 0 || toList(lateMedications).length > 0 || lateNotes.trim().length > 0) &&
    (!lateConduct || lateConduct === 'MAINTAIN' || lateConductJustification.trim().length > 0) &&
    !lateObservationMutation.isPending && !lateReviewRequired

  const professionals = useProfessionalDirectory()
  const performer =
    professionals.members.find(
      (member) => member.professionalId === dose?.administeredById,
    )?.fullName ?? application?.administrator ?? null
  const endTime = dose?.administrationEndedAt
    ? localTime(dose.administrationEndedAt, application?.timeZone ?? dose.immunotherapy.currentPrescription?.resolved.timeZone)
    : application?.endTime || null

  const tabs = TABS.filter((item) => item.id !== 'addenda' || addenda.length > 0).filter(
    (item) => item.id !== 'late' || canLateObservation,
  )

  return (
    <Modal
      open={!!application}
      onClose={onClose}
      ariaLabel="Dados da aplicação"
      size="lg"
      headerSlot={
        application ? (
          <div className="min-w-0 flex-1">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 truncate text-[0.95rem] font-bold text-(--text)">
                <span className="truncate">Aplicação de {application.date}</span>
                {completed && (
                  <FontAwesomeIcon icon={faCircleCheck} className="shrink-0 text-emerald-600" style={{ fontSize: 13 }} title="Realizado" />
                )}
              </div>
              <div className="text-[0.82rem] text-(--text-muted)">
                {application.startTime}
                {endTime ? ` – ${endTime}` : ''} ·{' '}
                {completed ? 'Realizado' : 'Previsto'}
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
                      'flex shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-t-lg px-3 py-1.5 text-[0.7rem] font-medium transition-colors',
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
        completed && onRetract ? (
          <button
            type="button"
            onClick={() => onRetract(application!.id)}
            className="cursor-pointer rounded-lg border border-[#A41517]/40 bg-[#A41517]/6 px-3 py-1.5 text-[0.7rem] font-semibold text-[#A41517] transition-colors hover:border-[#A41517]/70 hover:bg-[#A41517]/12 shrink-0 self-start"
          >
            Registrar em erro
          </button>
        ) : (
          <span />
        )
      }
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Fechar</Button>
          {tab === 'late' && (
            <Button
              tone="brand"
              variant="solid"
              disabled={!canSubmitLateObservation}
              onClick={() => lateObservationMutation.mutate()}
            >
              Registrar observação
            </Button>
          )}
        </>
      }
    >
      {application && tab === 'pre' && (
        <div className="grid min-h-[18rem] grid-cols-2 content-start gap-x-4 gap-y-3">
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
        <div className="grid min-h-[18rem] grid-cols-2 content-start gap-x-4 gap-y-3">
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

      {application && tab === 'late' && (
        <div className="min-h-[18rem] space-y-3.5">
          <ClinicalReviewNotice required={lateReviewRequired} onReview={() => setLateReviewRequired(false)} />
          <div className="grid grid-cols-2 gap-3">
            <FieldLabel label="Efeitos relatados" hint="(separe por vírgula)">
              <TextInput value={lateEffects} onChange={(e) => setLateEffects(e.target.value)} placeholder="Ex: urticária, prurido" />
            </FieldLabel>
            <FieldLabel label="Medicações administradas" hint="(separe por vírgula)">
              <TextInput value={lateMedications} onChange={(e) => setLateMedications(e.target.value)} placeholder="Ex: anti-histamínico" />
            </FieldLabel>
            <FieldLabel label="Data observada">
              <TextInput type="date" value={lateDate} onChange={(e) => setLateDate(e.target.value)} />
            </FieldLabel>
            <FieldLabel label="Hora observada">
              <TextInput type="time" value={lateTime} onChange={(e) => setLateTime(e.target.value)} />
            </FieldLabel>
          </div>
          <FieldLabel label="Notas">
            <TextArea rows={2} value={lateNotes} onChange={(e) => setLateNotes(e.target.value)} placeholder="Contexto do relato (ex: paciente ligou à noite)" />
          </FieldLabel>
          <FieldLabel label="Conduta decorrente" hint="(opcional)">
            <Select value={lateConduct} onChange={(e) => setLateConduct(e.target.value)}>
              <option value="">Sem conduta registrada</option>
              <option value="MAINTAIN">Manter protocolo</option>
              <option value="REQUEST_PHYSICIAN_REVIEW">Solicitar avaliação médica</option>
              <option value="SUSPEND_TREATMENT">Suspender tratamento (exige revisão clínica)</option>
            </Select>
          </FieldLabel>
          {lateConduct && lateConduct !== 'MAINTAIN' && (
            <FieldLabel label="Justificativa da conduta" required>
              <TextArea
                rows={2}
                value={lateConductJustification}
                onChange={(e) => setLateConductJustification(e.target.value)}
                placeholder="Contexto clínico da conduta"
              />
            </FieldLabel>
          )}
        </div>
      )}

      {application && tab === 'addenda' && (
        <div className="min-h-[18rem] space-y-3">
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
