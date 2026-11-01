import { collectPages } from '@/shared/api/pagination'
import { useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Modal, SegmentedControl, TextInput, Toast } from '@/shared/components'
import { getApplicationEventColor } from '@/features/scheduling/constants/application-display'
import { useHasPermission } from '@/shared/stores/useUserStore'
import type { Application } from '@/features/patient/stores/usePatientStore'
import { scheduleItemToApplication } from '@/features/patient/adapters/clinical-presentation'
import { getDose, listAppointments, listDoseSchedule } from '@/shared/api/clinical.api'
import type { Appointment, ScheduleDoseItem } from '@/shared/api/contracts/clinical'
import {
  AppointmentActionModal,
  NewAppointmentModal,
} from '@/features/scheduling/components/AppointmentModals'
import { ApiError } from '@/shared/api/contracts/errors'
import { queryKeys } from '@/shared/api/query-keys'
import { useSession } from '@/shared/auth/useSession'
import { toZonedOffsetIso, dayInZone, timeInZone } from '@/shared/lib/dates'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { useCalendarNav } from '@/features/scheduling/hooks/useCalendarNav'
import { CalendarToolbar } from '@/features/scheduling/components/CalendarToolbar'
import { WeekView } from '@/features/scheduling/components/WeekView'
import { MonthView } from '@/features/scheduling/components/MonthView'
import { ApplicationDetailsModal } from '@/features/scheduling/components/ApplicationDetailsModal'
import { EditScheduledDoseModal } from '@/features/patient/components/chart/EditScheduledDoseModal'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck, faMagnifyingGlass, faPlus } from '@fortawesome/free-solid-svg-icons'
import { PageHeader, Pill, SelectPill, SHOWCASE } from '@/shared/components/showcase'

const MONTH_OPTIONS = [
  { value: 0, label: 'Janeiro' },
  { value: 1, label: 'Fevereiro' },
  { value: 2, label: 'Março' },
  { value: 3, label: 'Abril' },
  { value: 4, label: 'Maio' },
  { value: 5, label: 'Junho' },
  { value: 6, label: 'Julho' },
  { value: 7, label: 'Agosto' },
  { value: 8, label: 'Setembro' },
  { value: 9, label: 'Outubro' },
  { value: 10, label: 'Novembro' },
  { value: 11, label: 'Dezembro' },
]

const CURRENT_YEAR = new Date().getFullYear()
const YEAR_OPTIONS = Array.from({ length: 7 }, (_, i) => CURRENT_YEAR - 2 + i)

const SCHEDULE_PAGE_SIZE = 100
const SCHEDULE_MAX_PAGES = 5

function dayInput(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

async function fetchSchedule(
  query: { from: string; to: string; search?: string },
  signal?: AbortSignal,
): Promise<{ items: ScheduleDoseItem[]; total: number }> {
  return collectPages((page) => listDoseSchedule({ ...query, page, pageSize: SCHEDULE_PAGE_SIZE }, signal), { signal, maxPages: SCHEDULE_MAX_PAGES })
}

export function AppointmentsPage() {
  const { account } = useSession()
  const organizationId = account?.organization?.id ?? ''
  const canNewAppointment = useHasPermission('new_appointment')
  const canReschedule = useHasPermission('edit_scheduled_dose')
  const navigate = useNavigate()
  const calendar = useCalendarNav(account?.organization?.timeZone ?? 'America/Sao_Paulo')

  const [showNewModal, setShowNewModal] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [patientSearch, setPatientSearch] = useState('')
  const [dayModal, setDayModal] = useState<{ date: Date; apps: Application[] } | null>(null)
  const [rescheduleDoseId, setRescheduleDoseId] = useState<string | null>(null)
  const [showRescheduledToast, setShowRescheduledToast] = useState(false)

  const visibleDays = calendar.viewMode === 'week' ? calendar.weekDays : calendar.monthDays
  const range = useMemo(() => {
    if (visibleDays.length === 0) return null
    return {
      from: toZonedOffsetIso(dayInput(visibleDays[0]), '00:00', account?.organization?.timeZone ?? 'America/Sao_Paulo'),
      to: toZonedOffsetIso(dayInput(visibleDays[visibleDays.length - 1]), '23:59', account?.organization?.timeZone ?? 'America/Sao_Paulo'),
    }
  }, [visibleDays, account?.organization?.timeZone])


  const search = useDebouncedValue(patientSearch.trim())
  const scheduleQuery = useQuery({
    queryKey: queryKeys.schedule(organizationId, {
      ...range,
      search: search || undefined,
    }),
    queryFn: ({ signal }) =>
      fetchSchedule({ ...range!, search: search || undefined }, signal),
    enabled: organizationId !== '' && range !== null,
    placeholderData: (previous, query) => query?.queryKey[1] === organizationId ? previous : undefined,
  })

  const scheduleItems = useMemo(
    () => scheduleQuery.data?.items ?? [],
    [scheduleQuery.data],
  )
  const truncated =
    scheduleQuery.data !== undefined &&
    !scheduleQuery.isPlaceholderData &&
    scheduleQuery.data.items.length < scheduleQuery.data.total


  const appointmentsQuery = useQuery({
    queryKey: queryKeys.schedule(organizationId, {
      appointments: true,
      ...range,
    }),
    queryFn: ({ signal }) =>
      collectPages((page) => listAppointments({ ...range!, page, pageSize: 100 }, signal), { signal, maxPages: 5 }),
    enabled: organizationId !== '' && range !== null,
    placeholderData: (previous, query) => query?.queryKey[1] === organizationId ? previous : undefined,
  })
  const appointmentItems = useMemo(() => {
    const items = appointmentsQuery.data?.items ?? []
    const term = search.toLowerCase()
    return term
      ? items.filter((item) => item.patient.fullName.toLowerCase().includes(term))
      : items
  }, [appointmentsQuery.data, search])
  const appointmentById = useMemo(
    () => new Map(appointmentItems.map((item) => [item.id, item])),
    [appointmentItems],
  )
  const linkedDoseIds = useMemo(
    () =>
      new Set(
        appointmentItems
          .filter((item) => item.doseId && item.status === 'SCHEDULED')
          .map((item) => item.doseId!),
      ),
    [appointmentItems],
  )

  const applications = useMemo(() => {
    const doseApplications = scheduleItems
      .filter(
        (item) =>
          !(item.status === 'SCHEDULED' && linkedDoseIds.has(item.id)),
      )
      .map(item => scheduleItemToApplication(item, account?.organization?.timeZone ?? 'America/Sao_Paulo'))
    const appointmentApplications = appointmentItems
      .filter((item) => item.status !== 'CANCELLED')
      .map((item) => appointmentToApplication(item, account?.organization?.timeZone ?? 'America/Sao_Paulo'))
    return [...doseApplications, ...appointmentApplications]
  }, [scheduleItems, appointmentItems, linkedDoseIds, account?.organization?.timeZone])

  const applicationsByDate = useMemo(() => {
    const map = new Map<string, Application[]>()
    for (const application of applications) {
      const existing = map.get(application.date) ?? []
      existing.push(application)
      map.set(application.date, existing)
    }
    return map
  }, [applications])

  const rescheduleDoseQuery = useQuery({
    queryKey: queryKeys.dose(organizationId, rescheduleDoseId ?? ''),
    queryFn: ({ signal }) => getDose(rescheduleDoseId!, signal),
    enabled: organizationId !== '' && rescheduleDoseId !== null,
  })

  const openPatient = (patientId: string) => {
    setSelectedApplication(null)
    navigate({ to: '/patient/$patientId', params: { patientId } })
  }

  const handleSelect = (application: Application) => {
    const appointment = appointmentById.get(application.id)
    if (appointment) setSelectedAppointment(appointment)
    else setSelectedApplication(application)
  }

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden pt-0">
      <PageHeader
        title="Agendamentos"
        actions={
          <>
            <div className="relative w-72">
              <label htmlFor="appointment-search" className="sr-only">
                Pesquisar paciente
              </label>
              <FontAwesomeIcon
                icon={faMagnifyingGlass}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10"
                style={{ fontSize: 12, color: SHOWCASE.inkSoft }}
              />
              <TextInput
                id="appointment-search"
                placeholder="Pesquisar paciente"
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                className="h-9 pl-9 pr-4 text-[0.78rem]"
              />
            </div>
            <SelectPill
              aria-label="Filtrar por mês"
              value={String(calendar.currentDate.getMonth())}
              onChange={(value) => calendar.setMonth(Number(value))}
              options={MONTH_OPTIONS.map((m) => ({ value: String(m.value), label: m.label }))}
            />
            <SelectPill
              aria-label="Filtrar por ano"
              value={String(calendar.currentDate.getFullYear())}
              onChange={(value) => calendar.setYear(Number(value))}
              options={YEAR_OPTIONS.map((y) => ({ value: String(y), label: String(y) }))}
            />
            <SegmentedControl
              value={calendar.viewMode}
              onChange={calendar.setViewMode}
              size="md"
              options={[
                { value: 'week', label: 'Semana' },
                { value: 'month', label: 'Mês' },
              ]}
              aria-label="Modo de visualização"
            />
            {canNewAppointment && (
              <Pill active icon={faPlus} onClick={() => setShowNewModal(true)}>
                Novo agendamento
              </Pill>
            )}
          </>
        }
      />

      {scheduleQuery.error && (
        <p role="alert" className="px-2 pb-2 text-[0.72rem] text-red-700">
          {scheduleQuery.error instanceof ApiError
            ? scheduleQuery.error.message
            : 'Não foi possível carregar a agenda.'}
        </p>
      )}
      {appointmentsQuery.isError && <p role="alert" className="px-2 pb-2 text-red-700">
        Não foi possível carregar os compromissos. <button onClick={() => void appointmentsQuery.refetch()}>Tentar novamente</button>
      </p>}
      {appointmentsQuery.data?.truncated && <p role="alert" className="px-2 pb-2 text-amber-700">
        Exibindo {appointmentsQuery.data.items.length} de {appointmentsQuery.data.total} compromissos. Reduza o período.
      </p>}
      {truncated && (
        <p role="alert" className="px-2 pb-2 text-[0.72rem] text-amber-700">
          Exibindo {scheduleQuery.data!.items.length} de {scheduleQuery.data!.total} doses do
          período. Refine a busca ou o período para ver o restante.
        </p>
      )}

      <div className="flex flex-1 min-h-0 flex-col overflow-hidden rounded-xl border border-(--border-custom) bg-[#F6F8F8]">
        <CalendarToolbar
          monthLabel={calendar.monthLabel}
          onPrev={calendar.goToPrev}
          onNext={calendar.goToNext}
          onToday={calendar.goToToday}
        />
        <div className="flex-1 overflow-auto">
          {calendar.viewMode === 'week' ? (
            <WeekView
              weekDays={calendar.weekDays}
              selectedDate={calendar.selectedDate}
              onSelectDate={calendar.setSelectedDate}
              applicationsByDate={applicationsByDate}
              onSelectApplication={handleSelect}
            />
          ) : (
            <MonthView
              monthDays={calendar.monthDays}
              referenceDate={calendar.currentDate}
              selectedDate={calendar.selectedDate}
              onSelectDate={calendar.setSelectedDate}
              applicationsByDate={applicationsByDate}
              onSelectApplication={handleSelect}
              onOpenDay={(date, apps) => setDayModal({ date, apps })}
            />
          )}
        </div>
      </div>

      <Modal
        open={!!dayModal}
        onClose={() => setDayModal(null)}
        size="sm"
        title={
          dayModal
            ? (() => {
                const s = format(dayModal.date,"EEEE, dd 'de' MMMM", { locale: ptBR })
                return s.charAt(0).toUpperCase() + s.slice(1)
              })()
            : ''
        }
      >
        <div className="space-y-2">
          {dayModal?.apps.map((app) => {
            const c = getApplicationEventColor(app)
            return (
              <button
                key={app.id}
                type="button"
                onClick={() => { handleSelect(app); setDayModal(null) }}
                className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition hover:brightness-95 cursor-pointer"
                style={{ backgroundColor: c.bg, backgroundImage: c.grad, color: c.text }}
              >
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold">
                    {app.startTime}
                    {app.endTime ? ` – ${app.endTime}` : ''}
                  </div>
                  <div className="text-[0.7rem] font-medium opacity-90 truncate">
                    {app.patientName} · {app.dose}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </Modal>

      <ApplicationDetailsModal
        application={selectedApplication}
        onClose={() => setSelectedApplication(null)}
        onOpenPatient={openPatient}
        onReschedule={
          canReschedule
            ? (doseId) => {
                setSelectedApplication(null)
                setRescheduleDoseId(doseId)
              }
            : undefined
        }
      />

      <EditScheduledDoseModal
        open={rescheduleDoseId !== null && rescheduleDoseQuery.data !== undefined}
        dose={rescheduleDoseQuery.data ?? null}
        organizationId={organizationId}
        onClose={() => setRescheduleDoseId(null)}
        onSaved={() => setShowRescheduledToast(true)}
      />

      <NewAppointmentModal
        open={showNewModal}
        onClose={() => setShowNewModal(false)}
        onCreated={() => {}}
      />

      <AppointmentActionModal
        appointment={selectedAppointment}
        organizationId={organizationId}
        onClose={() => setSelectedAppointment(null)}
      />

      <Toast
        open={showRescheduledToast}
        onClose={() => setShowRescheduledToast(false)}
        variant="success"
        icon={<FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: 16 }} />}
        title="Previsão reagendada!"
        description="A dose pendente foi atualizada com motivo registrado. Nenhuma sucessora foi criada."
      />
    </div>
  )
}

function localTime(iso: string, timeZone = 'America/Sao_Paulo'): string {
  return timeInZone(new Date(iso), timeZone)
}

const MONTHS_UPPER = ['JANEIRO','FEVEREIRO','MARÇO','ABRIL','MAIO','JUNHO','JULHO','AGOSTO','SETEMBRO','OUTUBRO','NOVEMBRO','DEZEMBRO']

function appointmentToApplication(item: Appointment, timeZone: string): Application {
  const starts = new Date(item.startsAt)
  const day = dayInZone(starts, timeZone)
  return {
    id: item.id,
    patientId: item.patientId,
    date: `${day.slice(8, 10)}/${day.slice(5, 7)}/${day.slice(0, 4)}`,
    startTime: localTime(item.startsAt, timeZone),
    endTime: localTime(item.endsAt, timeZone),
    status:
      item.status === 'MISSED'
        ? 'missed'
        : item.status === 'COMPLETED'
          ? 'completed'
          : 'scheduled',
    dose: item.title ?? (item.dose ? 'Aplicação prevista' : 'Compromisso'),
    cycle: { number: 1, days: 0 },
    month: MONTHS_UPPER[Number(day.slice(5, 7)) - 1],
    year: Number(day.slice(0, 4)),
    patientName: item.patient.fullName,
    patientPhone: item.patient.phoneNumber,
    modality: 'subcutaneous',
  }
}

