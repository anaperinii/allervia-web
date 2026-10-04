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
  listPatients,
  listTherapiesForPatient,
  updateAppointment,
} from '@/shared/api/clinical.api'
import type { Appointment } from '@/shared/api/contracts/clinical'
import { queryKeys } from '@/shared/api/query-keys'
import { useSession } from '@/shared/auth/useSession'
import { useProfessionalDirectory } from '@/shared/hooks/useProfessionalDirectory'
import { toOffsetIso, todayStr, addMinutesToTime } from '@/shared/lib/dates'
import { formatInstantDate } from '@/features/patient/adapters/clinical-presentation'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowRight,
  faCircleCheck,
  faCircleInfo,
  faMagnifyingGlass,
} from '@fortawesome/free-solid-svg-icons'

const STATUS_LABELS: Record<Appointment['status'], string> = {
  SCHEDULED: 'Agendado',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
  MISSED: 'Faltou',
}

type AppointmentTabId = 'info' | 'manage'

// "Gerenciar" não é uma aba: entra pelo botão Editar no topo do modal.
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
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [patientId, setPatientId] = useState('')
  const [professionalId, setProfessionalId] = useState(account?.professional?.id ?? '')
  const [doseId, setDoseId] = useState('')
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(todayStr())
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [notes, setNotes] = useState('')

  const patientsQuery = useQuery({
    queryKey: queryKeys.patients(organizationId, {
      picker: 'appointment',
      search: search.trim() || undefined,
    }),
    queryFn: ({ signal }) =>
      listPatients(
        { pageSize: 50, isActive: true, search: search.trim() || undefined },
        signal,
      ),
    enabled: organizationId !== '',
  })
  const patientOptions = (patientsQuery.data?.items ?? []).slice(0, 8)
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
        startsAt: toOffsetIso(date, startTime),
        endsAt: toOffsetIso(date, endTime),
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
      title="Novo agendamento"
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Voltar</Button>
          <Button tone="brand" variant="solid" disabled={!canSubmit} onClick={() => mutation.mutate()}>
            Agendar compromisso
          </Button>
        </>
      }
    >
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
            role="combobox"
            aria-expanded={showSuggestions && patientOptions.length > 0}
            aria-controls="appointment-patient-suggestions"
            aria-autocomplete="list"
            className="pl-8"
          />
          {showSuggestions && patientOptions.length > 0 && (
            <div
              id="appointment-patient-suggestions"
              role="listbox"
              className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-(--border-custom) bg-white shadow-lg"
            >
              {patientOptions.map((patient) => (
                <button
                  key={patient.id}
                  type="button"
                  role="option"
                  aria-selected={patient.id === patientId}
                  onClick={() => {
                    setPatientId(patient.id)
                    setDoseId('')
                    setSearch(patient.fullName)
                    setShowSuggestions(false)
                  }}
                  className="flex w-full items-center justify-between px-4 py-2.5 text-left transition-colors hover:bg-teal-50"
                >
                  <span className="text-xs font-medium text-(--text)">{patient.fullName}</span>
                  <span className="text-[0.65rem] text-(--text-muted)">{patient.phoneNumber}</span>
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
}

export function AppointmentActionModal(props: AppointmentActionModalProps) {
  if (!props.appointment) return null
  // Remonta a cada compromisso para os campos partirem dos valores atuais.
  return <AppointmentActionForm key={props.appointment.id} {...props} />
}

function AppointmentActionForm({
  appointment,
  organizationId,
  onClose,
}: AppointmentActionModalProps) {
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<AppointmentTabId>('info')
  const [action, setAction] = useState<'CANCELLED' | 'MISSED' | 'COMPLETED' | ''>('')
  const [statusReason, setStatusReason] = useState('')
  const [date, setDate] = useState(() => dateInputValue(appointment?.startsAt))
  const [startTime, setStartTime] = useState(() => timeInputValue(appointment?.startsAt))
  const [endTime, setEndTime] = useState(() => timeInputValue(appointment?.endsAt))
  const [title, setTitle] = useState(appointment?.title ?? '')
  const [notes, setNotes] = useState(appointment?.notes ?? '')

  const mutation = useMutation({
    mutationFn: () =>
      updateAppointment(appointment!.id, {
        expectedRevision: appointment!.revision,
        ...(action ? { status: action as 'CANCELLED' | 'MISSED' | 'COMPLETED' } : {}),
        ...(statusReason.trim() ? { statusReason: statusReason.trim() } : {}),
        startsAt: toOffsetIso(date, startTime),
        endsAt: toOffsetIso(date, endTime),
        title: title.trim(),
        notes: notes.trim(),
      }),
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
  const isOpen = appointment.status === 'SCHEDULED'
  const needsReason = action === 'CANCELLED' || action === 'MISSED'
  const canSubmit =
    !!date &&
    !!startTime &&
    !!endTime &&
    (!needsReason || statusReason.trim().length > 0) &&
    !mutation.isPending

  const initials = appointment.patient.fullName
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <Modal
      open
      onClose={onClose}
      ariaLabel="Detalhes do compromisso"
      size="md"
      headerSlot={
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
              <div className="truncate text-[1.05rem] font-bold text-(--text)">
                {appointment.patient.fullName}
              </div>
              <div className="text-[0.82rem] text-(--text-muted)">
                {appointment.title ?? 'Compromisso'} · {STATUS_LABELS[appointment.status]}
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
          <button
            type="button"
            onClick={() => setTab(tab === 'manage' ? 'info' : 'manage')}
            className="shrink-0 cursor-pointer self-start rounded-lg border border-transparent px-3 py-1.5 text-[0.7rem] font-semibold text-white transition-[filter] duration-200 hover:brightness-110"
            style={{ background: '#12333a' }}
          >
            {tab === 'manage' ? 'Ver detalhes' : 'Editar'}
          </button>
        ) : (
          <span />
        )
      }
      footer={
        <>
          <button
            type="button"
            onClick={() =>
              sendReminder(
                appointment.patient.phoneNumber,
                appointment.patient.fullName.split(' ')[0],
                formatInstantDate(appointment.startsAt),
                timeInputValue(appointment.startsAt),
              )
            }
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-transparent bg-emerald-500 px-3 py-1.5 text-[0.7rem] font-semibold text-white transition-colors hover:bg-emerald-600"
          >
            <HugeiconsIcon icon={WhatsappIcon} size={14} strokeWidth={1.8} />
            Enviar lembrete via WhatsApp
          </button>
          <Button variant="outline" onClick={onClose}>Fechar</Button>
          {isOpen && tab === 'manage' && (
            <Button tone="brand" variant="solid" disabled={!canSubmit} onClick={() => mutation.mutate()}>
              Confirmar
            </Button>
          )}
        </>
      }
    >
      {tab === 'info' && (
        <>
          <Field label="Data">{formatInstantDate(appointment.startsAt)}</Field>

          <div className="flex items-end gap-2">
            <div className="min-w-0 flex-1">
              <Field label="Início">{timeInputValue(appointment.startsAt)}</Field>
            </div>
            <div className="flex h-9 shrink-0 items-center text-(--text-muted)">
              <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 11 }} />
            </div>
            <div className="min-w-0 flex-1">
              <Field label="Fim">{timeInputValue(appointment.endsAt)}</Field>
            </div>
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
            {appointment.dose ? formatInstantDate(appointment.dose.scheduledAt) : 'Nenhuma'}
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

function dateInputValue(iso?: string): string {
  if (!iso) return todayStr()
  const date = new Date(iso)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function timeInputValue(iso?: string): string {
  if (!iso) return ''
  const date = new Date(iso)
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

