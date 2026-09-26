import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, FieldLabel, Modal, Select, TextArea, TextInput, toast } from '@/shared/components'
import {
  createAppointment,
  listPatients,
  listTherapiesForPatient,
  updateAppointment,
} from '@/shared/api/clinical.api'
import { ApiError } from '@/shared/api/contracts/errors'
import type { Appointment } from '@/shared/api/contracts/clinical'
import { queryKeys } from '@/shared/api/query-keys'
import { useSession } from '@/shared/auth/useSession'
import { toOffsetIso, todayStr, addMinutesToTime } from '@/shared/lib/dates'
import { formatInstantDate } from '@/features/patient/adapters/clinical-presentation'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck, faCircleInfo } from '@fortawesome/free-solid-svg-icons'

const STATUS_LABELS: Record<Appointment['status'], string> = {
  SCHEDULED: 'Agendado',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
  MISSED: 'Faltou',
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
  const [patientId, setPatientId] = useState('')
  const [doseId, setDoseId] = useState('')
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(todayStr())
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [notes, setNotes] = useState('')
  const [failure, setFailure] = useState<string | null>(null)

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
    onError: (error) => {
      setFailure(
        error instanceof ApiError && error.code === 'DOSE_ALREADY_SCHEDULED'
          ? 'Esta previsão já tem um compromisso agendado.'
          : error instanceof ApiError
            ? error.message
            : 'Não foi possível criar o compromisso.',
      )
    },
  })

  const canSubmit =
    !!patientId && !!date && !!startTime && !!endTime && !mutation.isPending

  return (
    <Modal
      open
      onClose={onClose}
      title="Novo compromisso"
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Voltar</Button>
          <Button tone="brand" variant="solid" disabled={!canSubmit} onClick={() => { setFailure(null); mutation.mutate() }}>
            Agendar compromisso
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <FieldLabel label="Buscar paciente">
          <TextInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nome ou telefone" />
        </FieldLabel>
        <FieldLabel label="Paciente" required>
          <Select value={patientId} onChange={(e) => { setPatientId(e.target.value); setDoseId('') }}>
            <option value="" disabled>
              {patientsQuery.isPending ? 'Carregando…' : 'Selecione o paciente'}
            </option>
            {(patientsQuery.data?.items ?? []).map((patient) => (
              <option key={patient.id} value={patient.id}>{patient.fullName}</option>
            ))}
          </Select>
        </FieldLabel>
      </div>
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
      {failure && <p role="alert" className="text-[0.7rem] text-red-700">{failure}</p>}
    </Modal>
  )
}

export function AppointmentActionModal({
  appointment,
  organizationId,
  onClose,
}: {
  appointment: Appointment | null
  organizationId: string
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const [action, setAction] = useState<'CANCELLED' | 'MISSED' | 'COMPLETED' | ''>('')
  const [statusReason, setStatusReason] = useState('')
  const [failure, setFailure] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () =>
      updateAppointment(appointment!.id, {
        expectedRevision: appointment!.revision,
        status: action as 'CANCELLED' | 'MISSED' | 'COMPLETED',
        ...(statusReason.trim() ? { statusReason: statusReason.trim() } : {}),
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
    onError: (error) => {
      setFailure(
        error instanceof ApiError && error.code === 'MISS_BEFORE_START'
          ? 'Falta só pode ser registrada após o horário de início.'
          : error instanceof ApiError
            ? error.message
            : 'Não foi possível atualizar o compromisso.',
      )
    },
  })

  if (!appointment) return null
  const open = appointment.status === 'SCHEDULED'
  const needsReason = action === 'CANCELLED' || action === 'MISSED'
  const canSubmit =
    !!action && (!needsReason || statusReason.trim().length > 0) && !mutation.isPending

  return (
    <Modal
      open
      onClose={onClose}
      title={appointment.title ?? 'Compromisso'}
      footer={
        open ? (
          <>
            <Button variant="outline" onClick={onClose}>Fechar</Button>
            <Button tone="brand" variant="solid" disabled={!canSubmit} onClick={() => { setFailure(null); mutation.mutate() }}>
              Confirmar
            </Button>
          </>
        ) : (
          <Button variant="outline" onClick={onClose}>Fechar</Button>
        )
      }
    >
      <div className="grid grid-cols-2 gap-px bg-(--border-custom) rounded-lg overflow-hidden border border-(--border-custom)">
        <Cell label="Paciente" value={appointment.patient.fullName} />
        <Cell label="Situação" value={STATUS_LABELS[appointment.status]} />
        <Cell label="Início" value={formatInstant(appointment.startsAt)} />
        <Cell label="Fim" value={formatInstant(appointment.endsAt)} />
        <Cell
          label="Previsão vinculada"
          value={appointment.dose ? formatInstantDate(appointment.dose.scheduledAt) : 'Nenhuma'}
        />
        <Cell label="Observações" value={appointment.notes ?? '—'} />
      </div>
      {appointment.statusReason && (
        <p className="text-[0.68rem] text-(--text-muted)">
          Motivo registrado: <span className="font-semibold text-(--text)">{appointment.statusReason}</span>
        </p>
      )}
      {open && (
        <>
          <FieldLabel label="Ação">
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
            <div className="flex items-start gap-2 bg-brand/10 border border-brand/25 rounded-lg px-3 py-2">
              <FontAwesomeIcon icon={faCircleInfo} className="text-brand shrink-0 mt-0.5" style={{ fontSize: 13 }} />
              <p className="text-[0.65rem] text-brand-dark leading-relaxed">
                A falta é um fato da agenda: a previsão clínica vinculada permanece
                pendente até a decisão médica (reagendar ou administrar).
              </p>
            </div>
          )}
        </>
      )}
      {failure && <p role="alert" className="text-[0.7rem] text-red-700">{failure}</p>}
    </Modal>
  )
}

function formatInstant(iso: string): string {
  const date = new Date(iso)
  return `${formatInstantDate(iso)} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white px-3 py-2">
      <div className="text-[0.6rem] font-semibold text-(--text-muted) mb-0.5">{label}</div>
      <div className="text-[0.72rem] font-medium text-(--text)">{value}</div>
    </div>
  )
}
