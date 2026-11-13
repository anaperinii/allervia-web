import { useEffect, useState, type ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ClinicalReviewNotice } from '@/shared/components/ClinicalReviewNotice'
import { Modal, Button, FieldLabel, Select, TextArea, TextInput, showApiErrorToast } from '@/shared/components'
import { cn } from '@/shared/lib/cn'
import { formatPhone } from '@/shared/lib/formatters'
import { openWhatsApp, sendReminder } from '@/shared/lib/whatsapp'
import { getDose, updateScheduledDose } from '@/shared/api/clinical.api'
import { ApiError } from '@/shared/api/contracts/errors'
import { queryKeys } from '@/shared/api/query-keys'
import { toZonedOffsetIso, dayInZone, timeInZone } from '@/shared/lib/dates'
import { useIdempotencyKey } from '@/shared/lib/use-idempotency-key'
import { formatStepOption } from '@/features/patient/adapters/clinical-presentation'
import { APPLICATION_STATUS_DISPLAY } from '@/features/scheduling/constants/application-display'
import { MODAL_HEADER_BACKGROUND } from '@/features/scheduling/constants/modal-header'
import { useModalityStyle } from '@/features/scheduling/components/modality-colors'
import type { Application } from '@/features/patient/stores/usePatientStore'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookmark, faCircleCheck, faCircleInfo, faCircleXmark, faClock } from '@fortawesome/free-solid-svg-icons'

const STATUS_ICON = {
  scheduled: faClock,
  completed: faCircleCheck,
  missed: faCircleXmark,
  canceled: faCircleXmark,
}

const STATUS_ICON_COLOR = {
  scheduled: 'text-gray-400',
  completed: 'text-emerald-600',
  missed: 'text-red-500',
  canceled: 'text-red-500',
}
import { HugeiconsIcon } from '@hugeicons/react'
import {
  InformationCircleIcon,
  StickyNote01Icon,
  WhatsappIcon,
} from '@hugeicons/core-free-icons'

type TabId = 'info' | 'notes' | 'manage'

const TABS: { id: TabId; label: string; icon: typeof InformationCircleIcon }[] = [
  { id: 'info', label: 'Informações', icon: InformationCircleIcon },
  { id: 'notes', label: 'Observações', icon: StickyNote01Icon },
]

function localDateInput(iso: string, timeZone: string): string {
  return dayInZone(new Date(iso), timeZone)
}
function localTimeInput(iso: string, timeZone: string): string {
  return timeInZone(new Date(iso), timeZone)
}

function daysOverdue(brDate: string): number {
  const [day, month, year] = brDate.split('/').map(Number)
  if (!day || !month || !year) return 0
  const target = new Date(year, month - 1, day)
  target.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((today.getTime() - target.getTime()) / 86400000)
}

interface ApplicationDetailsModalProps {
  application: Application | null
  organizationId: string
  onClose: () => void
  onOpenPatient: (patientId: string, doseId?: string) => void
  onSaved?: () => void
  canReschedule?: boolean
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

  return <DetailsModal key={props.application?.id ?? 'empty'} {...props} />
}

function DetailsModal({
  application,
  organizationId,
  onClose,
  onOpenPatient,
  onSaved,
  canReschedule,
}: ApplicationDetailsModalProps) {
  const [tab, setTab] = useState<TabId>('info')
  const modalityStyle = useModalityStyle()
  const categoryColor = application ? modalityStyle(application).base : undefined
  const queryClient = useQueryClient()
  const idempotencyKeyFor = useIdempotencyKey()

  const initials = (application?.patientName ?? '')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const doseQuery = useQuery({
    queryKey: queryKeys.dose(organizationId, application?.id ?? ''),
    queryFn: ({ signal }) => getDose(application!.id, signal),
    enabled: organizationId !== '' && !!application && tab === 'manage',
  })
  const dose = doseQuery.data
  const doseTimeZone = dose?.immunotherapy.currentPrescription?.resolved.timeZone ?? 'America/Sao_Paulo'

  const [stepId, setStepId] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [reason, setReason] = useState('')
  const [reviewRequired, setReviewRequired] = useState(false)

  const openManage = () => {
    setReason('')
    setReviewRequired(false)
    setTab('manage')
  }

  useEffect(() => {
    if (!dose || tab !== 'manage') return
    setStepId(dose.plannedStepId)
    setDate(localDateInput(dose.scheduledAt, doseTimeZone))
    setTime(localTimeInput(dose.scheduledAt, doseTimeZone))
  }, [dose, tab, doseTimeZone])

  const selectedStep = dose?.allowedValues.find((step) => step.id === stepId) ?? null

  const mutation = useMutation({
    mutationFn: () => {
      const command = {
        values: {
          concentration: selectedStep!.concentration,
          volume: selectedStep!.volume,
          intervalDays: selectedStep!.intervalDays,
          stepId: selectedStep!.id,
        },
        scheduledAt: toZonedOffsetIso(date, time, doseTimeZone),
        reason: reason.trim(),
        expectedRevision: dose!.revision,
        expectedTherapyRevision: dose!.therapyRevision,
      }
      return updateScheduledDose(dose!.id, {
        ...command,
        idempotencyKey: idempotencyKeyFor([dose!.id, command]),
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['clinical', organizationId] })
      onSaved?.()
      onClose()
    },
    meta: { suppressErrorToast: true },
    onError: async (error) => {
      if (error instanceof ApiError && error.code.startsWith('STALE_')) setReviewRequired(true)
      if (error instanceof ApiError && error.code === 'STALE_CLINICAL_REVISION') {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.dose(organizationId, dose?.id ?? ''),
        })
        showApiErrorToast(error, {
          title: 'Previsão desatualizada',
          description:
            'A previsão mudou desde que você abriu este formulário. Os dados foram recarregados; confirme novamente.',
        })
        return
      }
      showApiErrorToast(error)
    },
  })

  const canSubmitManage =
    !!dose && !!selectedStep && !!date && !!time && reason.trim().length > 0 && !mutation.isPending && !reviewRequired

  const action =
    !application || application.status !== 'scheduled' || !canReschedule || tab === 'manage'
      ? null
      : { label: 'Editar', run: openManage }

  const headerAction = action ? (
    <Button
      tone="brand"
      variant="outline"
      size="sm"
      className="shrink-0 self-start"
      onClick={action.run}
    >
      {action.label}
    </Button>
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
            <FontAwesomeIcon
              icon={faBookmark}
              style={{ fontSize: 15, color: categoryColor }}
              className="absolute left-4 top-0"
              title="Categoria"
            />
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
                  className="flex max-w-full items-center gap-1.5 text-left text-[1.05rem] font-bold text-(--text) transition-colors hover:text-brand"
                >
                  <span className="truncate">{application.patientName ?? ''}</span>
                  <FontAwesomeIcon
                    icon={STATUS_ICON[application.status]}
                    className={cn('shrink-0', STATUS_ICON_COLOR[application.status])}
                    style={{ fontSize: 13 }}
                    title={APPLICATION_STATUS_DISPLAY[application.status].label}
                  />
                </button>
                <div className="flex items-center gap-1.5 text-[0.82rem] text-(--text-muted)">
                  <span>
                    {application.modality === 'sublingual' ? 'Sublingual' : 'Subcutânea'} ·{' '}
                    {APPLICATION_STATUS_DISPLAY[application.status].label}
                  </span>
                  {application.status === 'scheduled' && daysOverdue(application.date) > 0 && (
                    <span className="inline-flex items-center rounded-md border border-red-200 bg-red-50 px-2 py-0.5 text-[0.65rem] font-semibold text-red-600">
                      Atrasada há {daysOverdue(application.date)} {daysOverdue(application.date) === 1 ? 'dia' : 'dias'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {tab !== 'manage' && (
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
            )}
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
            {tab !== 'manage' &&
              (application.status === 'scheduled' ? (
                <Button
                  tone="brand"
                  variant="solid"
                  leftIcon={<HugeiconsIcon icon={WhatsappIcon} size={14} strokeWidth={1.8} />}
                  onClick={() =>
                    sendReminder(
                      application.patientPhone ?? '',
                      (application.patientName ?? '').split(' ')[0],
                      application.date,
                      application.startTime,
                    )
                  }
                >
                  Enviar lembrete via WhatsApp
                </Button>
              ) : application.status === 'completed' ? (
                <Button
                  tone="brand"
                  variant="solid"
                  onClick={() => onOpenPatient(application.patientId, application.id)}
                >
                  Ver no prontuário
                </Button>
              ) : null)}
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
            {tab === 'manage' && (
              <Button
                tone="brand"
                variant="solid"
                disabled={!canSubmitManage}
                onClick={() => mutation.mutate()}
              >
                Salvar previsão
              </Button>
            )}
          </>
        ) : null
      }
    >
      {application && tab === 'manage' && (
        <>
          <ClinicalReviewNotice required={reviewRequired} onReview={() => setReviewRequired(false)} />
          <div className="flex items-start gap-2 bg-gray-100 border border-gray-200 rounded-lg px-3 py-2.5">
            <FontAwesomeIcon icon={faCircleInfo} className="text-gray-500 shrink-0 mt-0.5" style={{ fontSize: 14 }} />
            <p className="text-[0.65rem] text-gray-600 leading-relaxed">
              A edição ajusta apenas esta previsão — <span className="font-bold">nenhuma sucessora é criada</span>.
              Os valores oferecidos são os permitidos pela prescrição fixada, inclusive repetir ou reduzir.
            </p>
          </div>

          <FieldLabel label="Valor previsto">
            <Select value={stepId} onChange={(e) => setStepId(e.target.value)}>
              <option value="" disabled>Selecione o valor</option>
              {(dose?.allowedValues ?? []).map((step) => (
                <option key={step.id} value={step.id}>
                  {formatStepOption(step)} · {step.intervalDays}d
                  {step.id === dose?.plannedStepId ? ' (atual)' : ''}
                </option>
              ))}
            </Select>
          </FieldLabel>

          <div className="grid grid-cols-2 gap-3">
            <FieldLabel label="Data prevista">
              <TextInput type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </FieldLabel>
            <FieldLabel label="Hora prevista">
              <TextInput type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </FieldLabel>
          </div>

          <FieldLabel label="Motivo clínico" required>
            <TextArea
              rows={2}
              placeholder="Descreva o motivo do ajuste da sessão prevista"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </FieldLabel>
        </>
      )}

      {application && tab === 'info' && (
        <>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Data">
              {application.date}
            </Field>
            <Field label="Início">
              {application.startTime}
            </Field>
            <Field label="Fim">
              {application.endTime || '—'}
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Dose">
              {application.dose}
            </Field>
            <Field label="Intervalo">
              {application.cycle.days} dias
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
          {application.status === 'completed' && (
            <Field label="Aplicado por">
              {application.administrator || '—'}
            </Field>
          )}
          {application.sideEffect === 'yes' && (
            <Field label="Reação adversa">Sim</Field>
          )}
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
          {application.sideEffect !== 'yes' &&
            !application.reportedEffects &&
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
