import { ClinicalReviewNotice } from '@/shared/components/ClinicalReviewNotice'
import { ApiError } from '@/shared/api/contracts/errors'
import { collectAccentTolerantPages } from '@/shared/api/search'
import { searchVariants } from '@/shared/lib/search-terms'
import { useState, type ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cn } from '@/shared/lib/cn'
import { MODAL_HEADER_BACKGROUND } from '@/features/scheduling/constants/modal-header'
import { HugeiconsIcon } from '@hugeicons/react'
import { InformationCircleIcon, WhatsappIcon } from '@hugeicons/core-free-icons'
import { formatPhone } from '@/shared/lib/formatters'
import { openWhatsApp, sendReminder } from '@/shared/lib/whatsapp'
import { Button, FieldLabel, Modal, Select, TextArea, TextInput, toast } from '@/shared/components'
import {
  createAppointment,
  getAppointment,
  listPatients,
  listTherapiesForPatient,
  updateAppointment,
} from '@/shared/api/clinical.api'
import type { Appointment } from '@/shared/api/contracts/clinical'
import { queryKeys } from '@/shared/api/query-keys'
import { useSession } from '@/shared/auth/useSession'
import { useProfessionalDirectory } from '@/shared/hooks/useProfessionalDirectory'
import { useKeyboardAutocomplete } from '@/shared/hooks/useKeyboardAutocomplete'
import { appointmentWindow, dayInZone, timeInZone, addMinutesToTime } from '@/shared/lib/dates'
import { formatInstantDate } from '@/features/patient/adapters/clinical-presentation'
import { APPLICATION_STATUS_DISPLAY, appointmentStatusToApplicationStatus } from '@/features/scheduling/constants/application-display'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBookmark,
  faCheck,
  faCircleCheck,
  faCircleInfo,
  faClock,
  faMagnifyingGlass,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'
import { useSettingsStore } from '@/features/settings/stores/useSettingsStore'

const STATUS_ICON = {
  scheduled: faClock,
  completed: faCheck,
  missed: faXmark,
  canceled: faXmark,
}

const STATUS_ICON_COLOR = {
  scheduled: 'text-gray-400',
  completed: 'text-emerald-600',
  missed: 'text-red-500',
  canceled: 'text-red-500',
}
import { FALLBACK_EVENT_COLORS } from '@/features/scheduling/components/modality-colors'

function appointmentStatusLabel(status: Appointment['status']): string {
  return APPLICATION_STATUS_DISPLAY[appointmentStatusToApplicationStatus(status)].label
}

type AppointmentTabId = 'info' | 'manage'


const APPOINTMENT_TABS: {
  id: AppointmentTabId
  label: string
  icon: typeof InformationCircleIcon
}[] = [{ id: 'info', label: 'Informações', icon: InformationCircleIcon }]

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <div className="mb-1 text-[0.75rem] font-medium text-(--text-muted)">{label}</div>
      <div className="flex min-h-9 items-center rounded-lg border border-(--border-custom) bg-white px-3 py-1.5">
        <div className="min-w-0 flex-1 text-xs font-medium text-(--text)">{children}</div>
      </div>
    </div>
  )
}

export function NewAppointmentModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  onCreated: () => void
}) {
  if (!open) return null
  return <NewAppointmentForm onClose={onClose} onCreated={onCreated} />
}

function NewAppointmentForm({
  onClose,
  onCreated,
}: {
  onClose: () => void
  onCreated: () => void
}) {
  const { account } = useSession()
  const organizationId = account?.organization?.id ?? ''
  const timeZone = account?.organization?.timeZone ?? 'America/Sao_Paulo'
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [patientId, setPatientId] = useState('')
  const [professionalId, setProfessionalId] = useState(account?.professional?.id ?? '')
  const [doseId, setDoseId] = useState('')
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(dayInZone(new Date(), timeZone))
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [notes, setNotes] = useState('')

  const searchTerms = searchVariants(search)
  const patientsQuery = useQuery({
    queryKey: queryKeys.patients(organizationId, {
      picker: 'appointment',
      search: searchTerms.join('|') || undefined,
    }),
    queryFn: ({ signal }) =>
      collectAccentTolerantPages({
        term: search,
        signal,
        load: (page, term) => listPatients({ page, pageSize: 100, isActive: true, search: term }, signal),
        getId: (patient) => patient.id,
        getSearchableText: (patient) => patient.fullName,
      }),
    enabled: organizationId !== '',
  })
  const patientOptions = patientsQuery.data?.items ?? []
  const { highlightedIndex, suggestionsRef, handleKeyDown } = useKeyboardAutocomplete({
    isOpen: showSuggestions,
    itemCount: patientOptions.length,
    resetKey: JSON.stringify([search, patientOptions.map((p) => p.id)]),
    onClose: () => setShowSuggestions(false),
    onSelect: (idx) => {
      const patient = patientOptions[idx]
      if (patient) {
        setPatientId(patient.id)
        setDoseId('')
        setSearch(patient.fullName)
        setShowSuggestions(false)
      }
    },
  })
  const professionals = useProfessionalDirectory()
  const therapiesQuery = useQuery({
    queryKey: [...queryKeys.patient(organizationId, patientId), 'therapies'],
    queryFn: ({ signal }) => listTherapiesForPatient(patientId, signal),
    enabled: organizationId !== '' && patientId !== '',
  })
  const pendingDoses = (therapiesQuery.data ?? [])
    .filter((therapy) => therapy.nextDose?.status === 'SCHEDULED')
    .map((therapy) => ({
      therapy,
      dose: therapy.nextDose!,
    }))

  const mutation = useMutation({
    mutationFn: () =>
      createAppointment({
        patientId,
        professionalId,
        ...(doseId ? { doseId } : {}),
        ...(title.trim() ? { title: title.trim() } : {}),
        ...appointmentWindow(date, startTime, endTime, timeZone),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['clinical', organizationId] })
      toast.success({
        icon: <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: 16 }} />,
        title: 'Compromisso agendado!',
        description: 'O compromisso é da agenda; a previsão clínica continua no tratamento.',
        autoDismissMs: 6000,
      })
      onCreated()
      onClose()
    },
  })

  const canSubmit =
    !!patientId &&
    !!professionalId &&
    !!date &&
    !!startTime &&
    !!endTime &&
    !mutation.isPending

  return (
    <Modal
      open
      onClose={onClose}
      ariaLabel="Novo agendamento"
      size="lg"
      headerSlot={
        <div className="min-w-0 flex-1">
          <div className="truncate text-[1.05rem] font-bold text-(--text)">Novo agendamento</div>
          <div className="text-[0.82rem] text-(--text-muted)">Compromisso de agenda</div>
        </div>
      }
      headerStyle={{
        background: MODAL_HEADER_BACKGROUND,
        borderBottom: 'none',
        paddingTop: '1.4rem',
      }}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Voltar</Button>
          <Button tone="brand" variant="solid" disabled={!canSubmit} onClick={() => mutation.mutate()}>
            Agendar compromisso
          </Button>
        </>
      }
    >
      {patientsQuery.isError && <p role="alert">Não foi possível carregar pacientes. <button onClick={() => void patientsQuery.refetch()}>Tentar novamente</button></p>}
      {patientsQuery.data?.truncated && <p role="status">Lista limitada: {patientsQuery.data.items.length}/{patientsQuery.data.total}. Refine a busca.</p>}
      <FieldLabel label="Paciente" required>
        <div className="relative">
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-muted)"
            style={{ fontSize: 14 }}
          />
          <TextInput
            id="appointment-patient-search"
            placeholder="Buscar paciente por nome"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setShowSuggestions(true)
              if (patientId) {
                setPatientId('')
                setDoseId('')
              }
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            onKeyDown={handleKeyDown}
            role="combobox"
            aria-expanded={showSuggestions && patientOptions.length > 0}
            aria-controls="appointment-patient-suggestions"
            aria-autocomplete="list"
            aria-activedescendant={highlightedIndex >= 0 ? `appointment-patient-suggestions-${highlightedIndex}` : undefined}
            className="pl-8"
          />
          {showSuggestions && patientOptions.length > 0 && (
            <div
              ref={suggestionsRef}
              id="appointment-patient-suggestions"
              role="listbox"
              className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-(--border-custom) bg-white shadow-lg"
            >
              {patientOptions.map((patient, idx) => (
                <button
                  key={patient.id}
                  id={`appointment-patient-suggestions-${idx}`}
                  type="button"
                  role="option"
                  aria-selected={highlightedIndex === idx}
                  data-suggestion-item
                  onClick={() => {
                    setPatientId(patient.id)
                    setDoseId('')
                    setSearch(patient.fullName)
                    setShowSuggestions(false)
                  }}
                  className={cn(
                    'flex w-full items-center justify-between px-4 py-2.5 text-left transition-colors',
                    highlightedIndex === idx ? 'bg-teal-50' : 'hover:bg-teal-50',
                  )}
                >
                  <span className="text-xs font-medium text-(--text)">{patient.fullName}</span>
                  <span className="text-[0.65rem] text-(--text-muted)">{formatPhone(patient.phoneNumber)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </FieldLabel>
      <FieldLabel
        label="Profissional responsável"
        required
        hint="(dono da agenda do compromisso)"
      >
        <Select
          value={professionalId}
          onChange={(e) => setProfessionalId(e.target.value)}
        >
          <option value="" disabled>
            {professionals.isLoading ? 'Carregando…' : 'Selecione o profissional'}
          </option>
          {professionals.members.map((member) => (
            <option key={member.professionalId} value={member.professionalId}>
              {member.fullName}
            </option>
          ))}
        </Select>
      </FieldLabel>
      {patientId && (
        <FieldLabel
          label="Previsão clínica vinculada"
          hint="(opcional — compromissos livres também existem)"
        >
          <Select value={doseId} onChange={(e) => setDoseId(e.target.value)}>
            <option value="">Sem vínculo com previsão</option>
            {pendingDoses.map(({ therapy, dose }) => (
              <option key={dose.id} value={dose.id}>
                {therapy.immunoType} — previsão de {formatInstantDate(dose.scheduledAt)}
              </option>
            ))}
          </Select>
        </FieldLabel>
      )}
      <div className="grid grid-cols-3 gap-3">
        <FieldLabel label="Data" required>
          <TextInput type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </FieldLabel>
        <FieldLabel label="Início" required>
          <TextInput
            type="time"
            value={startTime}
            onChange={(e) => {
              setStartTime(e.target.value)
              if (e.target.value && !endTime) setEndTime(addMinutesToTime(e.target.value, 30))
            }}
          />
        </FieldLabel>
        <FieldLabel label="Fim" required>
          <TextInput type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
        </FieldLabel>
      </div>
      <FieldLabel label="Título" hint="(opcional)">
        <TextInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Aplicação SCIT / Avaliação" />
      </FieldLabel>
      <FieldLabel label="Observações" hint="(opcional)">
        <TextArea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </FieldLabel>
    </Modal>
  )
}

interface AppointmentActionModalProps {
  appointment: Appointment | null
  organizationId: string
  onClose: () => void
  onOpenPatient?: (patientId: string) => void
}

export function AppointmentActionModal(props: AppointmentActionModalProps) {
  if (!props.appointment) return null

  return <AppointmentActionForm key={props.appointment.id} {...props} />
}

function AppointmentActionForm({
  appointment,
  organizationId,
  onClose,
  onOpenPatient,
}: AppointmentActionModalProps) {
  const { account } = useSession()
  const timeZone = account?.organization?.timeZone ?? 'America/Sao_Paulo'
  const eventColors = useSettingsStore((s) => s.eventColors)
  const categoryColor =
    eventColors.find((entry) => entry.id === 'appointment')?.color ?? FALLBACK_EVENT_COLORS.appointment
  const [reviewRequired, setReviewRequired] = useState(false)
  const [currentRecord, setCurrentRecord] = useState(appointment)
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<AppointmentTabId>('info')
  const [action, setAction] = useState<'CANCELLED' | 'MISSED' | 'COMPLETED' | ''>('')
  const [statusReason, setStatusReason] = useState('')
  const [date, setDate] = useState(() => dateInputValue(appointment?.startsAt, timeZone))
  const [startTime, setStartTime] = useState(() => timeInputValue(appointment?.startsAt, timeZone))
  const [endTime, setEndTime] = useState(() => timeInputValue(appointment?.endsAt, timeZone))
  const [title, setTitle] = useState(appointment?.title ?? '')
  const [notes, setNotes] = useState(appointment?.notes ?? '')

  const mutation = useMutation({
    mutationFn: () =>
      updateAppointment(appointment!.id, {
        expectedRevision: currentRecord!.revision,
        ...(action ? { status: action as 'CANCELLED' | 'MISSED' | 'COMPLETED' } : {}),
        ...(statusReason.trim() ? { statusReason: statusReason.trim() } : {}),
        ...appointmentWindow(date, startTime, endTime, timeZone),
        title: title.trim(),
        notes: notes.trim(),
      }),
    onError: async (error) => { if (error instanceof ApiError && error.code === 'STALE_APPOINTMENT_REVISION') { setReviewRequired(true); setCurrentRecord(null); try { setCurrentRecord(await getAppointment(appointment!.id)) } catch { return }; await queryClient.invalidateQueries({ queryKey: queryKeys.clinical(organizationId) }) } },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['clinical', organizationId] })
      toast.success({
        icon: <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: 16 }} />,
        title: 'Compromisso atualizado',
        description:
          action === 'MISSED'
            ? 'Falta registrada na agenda; a previsão clínica permanece pendente para decisão médica.'
            : 'Registro de agenda atualizado.',
        autoDismissMs: 6000,
      })
      onClose()
    },
  })

  if (!appointment) return null
  const isOpen = (currentRecord ?? appointment).status === 'SCHEDULED'
  const needsReason = action === 'CANCELLED' || action === 'MISSED'
  const canSubmit =
    !!date &&
    !!startTime &&
    !!endTime &&
    (!needsReason || statusReason.trim().length > 0) &&
    !mutation.isPending && !reviewRequired && currentRecord?.status === 'SCHEDULED'

  const initials = appointment.patient.fullName
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <Modal
      open
      pending={mutation.isPending}
      dirty={tab === 'manage'}
      onClose={onClose}
      ariaLabel="Detalhes do compromisso"
      size="md"
      headerSlot={
        <div className="min-w-0 flex-1">
          <FontAwesomeIcon
            icon={faBookmark}
            style={{ fontSize: 15, color: categoryColor }}
            className="absolute left-4 top-0"
            title="Compromisso"
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
              {onOpenPatient ? (
                <button
                  type="button"
                  onClick={() => onOpenPatient(appointment.patientId)}
                  className="flex max-w-full items-center gap-1.5 text-left text-[1.05rem] font-bold text-(--text) transition-colors hover:text-brand"
                >
                  <span className="truncate">{appointment.patient.fullName}</span>
                  <FontAwesomeIcon
                    icon={STATUS_ICON[appointmentStatusToApplicationStatus(appointment.status)]}
                    className={cn('shrink-0', STATUS_ICON_COLOR[appointmentStatusToApplicationStatus(appointment.status)])}
                    style={{ fontSize: 13 }}
                    title={appointmentStatusLabel(appointment.status)}
                  />
                </button>
              ) : (
                <div className="flex max-w-full items-center gap-1.5 text-[1.05rem] font-bold text-(--text)">
                  <span className="truncate">{appointment.patient.fullName}</span>
                  <FontAwesomeIcon
                    icon={STATUS_ICON[appointmentStatusToApplicationStatus(appointment.status)]}
                    className={cn('shrink-0', STATUS_ICON_COLOR[appointmentStatusToApplicationStatus(appointment.status)])}
                    style={{ fontSize: 13 }}
                    title={appointmentStatusLabel(appointment.status)}
                  />
                </div>
              )}
              <div className="text-[0.82rem] text-(--text-muted)">
                {appointment.title ?? 'Compromisso'} · {appointmentStatusLabel(appointment.status)}
              </div>
            </div>
          </div>

          <div className="-mb-3.5 mt-4 flex items-center gap-1" role="tablist">
            {APPOINTMENT_TABS.map((item) => {
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
      }
      headerStyle={{
        background: MODAL_HEADER_BACKGROUND,
        borderBottom: 'none',
        paddingTop: '1.75rem',
      }}
      headerAction={
        isOpen ? (
          <Button
            tone="brand"
            variant="outline"
            size="sm"
            className="shrink-0 self-start"
            onClick={() => setTab(tab === 'manage' ? 'info' : 'manage')}
          >
            {tab === 'manage' ? 'Ver detalhes' : 'Editar'}
          </Button>
        ) : (
          <span />
        )
      }
      footer={
        <>
          {tab !== 'manage' && (
            isOpen ? (
              <Button
                tone="brand"
                variant="solid"
                leftIcon={<HugeiconsIcon icon={WhatsappIcon} size={14} strokeWidth={1.8} />}
                onClick={() =>
                  sendReminder(
                    appointment.patient.phoneNumber,
                    appointment.patient.fullName.split(' ')[0],
                    formatInstantDate(appointment.startsAt, timeZone),
                    timeInputValue(appointment.startsAt, timeZone),
                  )
                }
              >
                Enviar lembrete via WhatsApp
              </Button>
            ) : (
              onOpenPatient && (
                <Button tone="brand" variant="solid" onClick={() => onOpenPatient(appointment.patientId)}>
                  Ver no prontuário
                </Button>
              )
            )
          )}
          <Button variant="outline" onClick={onClose}>Fechar</Button>
          {isOpen && tab === 'manage' && (
            <Button tone="brand" variant="solid" disabled={!canSubmit} onClick={() => mutation.mutate()}>
              Confirmar
            </Button>
          )}
        </>
      }
    >
      {reviewRequired && !currentRecord && <div role="alert"><p>Não foi possível carregar o registro atual. Seu rascunho está preservado.</p><button type="button" onClick={async () => { try { setCurrentRecord(await getAppointment(appointment.id)) } catch { toast.danger({ icon: null, title: 'Falha ao recarregar compromisso', description: 'Tente novamente antes de confirmar.' }) } }}>Recarregar registro atual</button></div>}
      <ClinicalReviewNotice required={reviewRequired && currentRecord !== null} onReview={() => { if (currentRecord) setReviewRequired(false) }} />
      {reviewRequired && currentRecord && <p role="status">Registro atual: revisão {currentRecord.revision}, {appointmentStatusLabel(currentRecord.status)}, início {formatInstantDate(currentRecord.startsAt, timeZone)} às {timeInputValue(currentRecord.startsAt, timeZone)}, término {formatInstantDate(currentRecord.endsAt, timeZone)} às {timeInputValue(currentRecord.endsAt, timeZone)}. Seu formulário continua com a intenção anterior.</p>}
      {tab === 'info' && (
        <>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Data">{formatInstantDate(appointment.startsAt, timeZone)}</Field>
            <Field label="Início">{timeInputValue(appointment.startsAt, timeZone)}</Field>
            <Field label="Fim">{timeInputValue(appointment.endsAt, timeZone)}</Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Médico responsável">
              {appointment.professional?.fullName ?? '—'}
            </Field>
            <Field label="Contato">
              <button
                type="button"
                onClick={() => openWhatsApp(appointment.patient.phoneNumber)}
                className="cursor-pointer truncate border-none bg-transparent p-0 text-xs font-medium text-(--text) transition-colors hover:text-brand"
              >
                {appointment.patient.phoneNumber
                  ? formatPhone(appointment.patient.phoneNumber)
                  : '—'}
              </button>
            </Field>
          </div>

          <Field label="Previsão vinculada">
            {appointment.dose ? formatInstantDate(appointment.dose.scheduledAt, timeZone) : 'Nenhuma'}
          </Field>
          <Field label="Observações">{appointment.notes ?? '—'}</Field>
          {appointment.statusReason && (
            <Field label="Motivo registrado">{appointment.statusReason}</Field>
          )}
        </>
      )}

      {tab === 'manage' && (
        <>
          <div className="grid grid-cols-3 gap-3">
            <FieldLabel label="Data" required>
              <TextInput type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </FieldLabel>
            <FieldLabel label="Início" required>
              <TextInput
                type="time"
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value)
                  if (e.target.value && !endTime) {
                    setEndTime(addMinutesToTime(e.target.value, 30))
                  }
                }}
              />
            </FieldLabel>
            <FieldLabel label="Fim" required>
              <TextInput type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </FieldLabel>
          </div>
          <FieldLabel label="Título" hint="(opcional)">
            <TextInput
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Aplicação SCIT / Avaliação"
            />
          </FieldLabel>
          <FieldLabel label="Observações" hint="(opcional)">
            <TextArea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </FieldLabel>
          <FieldLabel label="Ação" hint="(opcional)">
            <Select value={action} onChange={(e) => setAction(e.target.value as typeof action)}>
              <option value="" disabled>Selecione a ação</option>
              <option value="COMPLETED">Concluir compromisso</option>
              <option value="CANCELLED">Cancelar compromisso</option>
              <option value="MISSED">Registrar falta</option>
            </Select>
          </FieldLabel>
          {needsReason && (
            <FieldLabel label="Motivo" required>
              <TextArea
                rows={2}
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                placeholder={action === 'MISSED' ? 'Ex: não compareceu nem avisou.' : 'Ex: paciente remarcou.'}
              />
            </FieldLabel>
          )}
          {action === 'MISSED' && (
            <div className="flex items-start gap-2 rounded-lg border border-brand/25 bg-brand/10 px-3 py-2">
              <FontAwesomeIcon icon={faCircleInfo} className="mt-0.5 shrink-0 text-brand" style={{ fontSize: 13 }} />
              <p className="text-[0.65rem] leading-relaxed text-brand-dark">
                A falta é um fato da agenda: a previsão clínica vinculada permanece
                pendente até a decisão médica (reagendar ou administrar).
              </p>
            </div>
          )}
        </>
      )}
    </Modal>
  )
}

function dateInputValue(iso?: string, timeZone = 'America/Sao_Paulo'): string {
  if (!iso) return dayInZone(new Date(), timeZone)
  const date = new Date(iso)
  return dayInZone(date, timeZone)
}

function timeInputValue(iso?: string, timeZone = 'America/Sao_Paulo'): string {
  if (!iso) return ''
  const date = new Date(iso)
  return timeInZone(date, timeZone)
}

