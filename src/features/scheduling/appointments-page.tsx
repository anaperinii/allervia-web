import { useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Modal, SegmentedControl, TextInput, Toast } from '@/shared/components'
import { getApplicationEventColor } from '@/features/scheduling/constants/application-display'
import { useImmunotherapyLookup } from '@/features/immunotherapy/stores/useImmunotherapiesStore'
import { useHasPermission, useDoctorFilter } from '@/shared/stores/useUserStore'
import { usePatientStore } from '@/features/patient/stores/usePatientStore'
import type { Application } from '@/features/patient/stores/usePatientStore'
import { useImmunotherapiesStore } from '@/features/immunotherapy/stores/useImmunotherapiesStore'
import { useSettingsStore } from '@/features/settings/stores/useSettingsStore'
import { useCalendarNav } from '@/features/scheduling/hooks/useCalendarNav'
import { CalendarToolbar } from '@/features/scheduling/components/CalendarToolbar'
import { WeekView } from '@/features/scheduling/components/WeekView'
import { MonthView } from '@/features/scheduling/components/MonthView'
import { ApplicationDetailsModal } from '@/features/scheduling/components/ApplicationDetailsModal'
import { NewAppointmentModal } from '@/features/scheduling/components/NewAppointmentModal'
import type { NewAppointmentForm } from '@/features/scheduling/schemas/new-appointment'

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

export function AppointmentsPage() {
  const { applications: allApplications, scheduleApplication } = usePatientStore()
  const { immunotherapies } = useImmunotherapiesStore()
  const googleCalendarConnected = useSettingsStore((state) => state.googleCalendarConnected)
  const canNewAppointment = useHasPermission('new_appointment')
  const doctorFilter = useDoctorFilter()
  const navigate = useNavigate()
  const calendar = useCalendarNav()

  const [showAddModal, setShowAddModal] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [patientSearch, setPatientSearch] = useState('')
  const [dayModal, setDayModal] = useState<{ date: Date; apps: Application[] } | null>(null)
  const { getName } = useImmunotherapyLookup()

  const applications = useMemo(() => {
    let list = allApplications
    if (doctorFilter) {
      const ownedIds = new Set(
        immunotherapies.filter((immunotherapy) => immunotherapy.responsibleDoctor === doctorFilter).map((immunotherapy) => immunotherapy.id),
      )
      list = list.filter((application) => ownedIds.has(application.patientId))
    }
    const term = patientSearch.trim().toLowerCase()
    if (term) {
      const nameById = new Map(immunotherapies.map((immunotherapy) => [immunotherapy.id, immunotherapy.name.toLowerCase()]))
      list = list.filter((application) => (nameById.get(application.patientId) ?? '').includes(term))
    }
    return list
  }, [allApplications, immunotherapies, doctorFilter, patientSearch])

  const scheduled = useMemo(
    () => applications.filter((application) => application.status === 'scheduled' || application.status === 'missed'),
    [applications],
  )

  const applicationsByDate = useMemo(() => {
    const map = new Map<string, Application[]>()
    for (const application of scheduled) {
      const existing = map.get(application.date) ?? []
      existing.push(application)
      map.set(application.date, existing)
    }
    return map
  }, [scheduled])


  const openPatient = (patientId: string) => {
    setSelectedApplication(null)
    navigate({ to: '/patient/$patientId', params: { patientId } })
  }

  const handleNewAppointmentSubmit = (data: NewAppointmentForm) => {
    const immunotherapy = immunotherapies.find((candidate) => candidate.id === data.patientId)
    if (!immunotherapy) return

    const [yyyy, mm, dd] = data.date.split('-')
    const parsedDate = new Date(parseInt(yyyy, 10), parseInt(mm, 10) - 1, parseInt(dd, 10))
    const monthName = format(parsedDate, 'MMMM', { locale: ptBR }).toUpperCase()

    scheduleApplication({
      id: `app-new-${Date.now()}`,
      patientId: data.patientId,
      date: `${dd}/${mm}/${yyyy}`,
      startTime: data.startTime,
      endTime: data.endTime,
      status: 'scheduled',
      dose: data.dose,
      cycle: { number: 1, days: parseInt(data.interval.trim(), 10) },
      month: monthName,
      year: parseInt(yyyy, 10),
      modality: immunotherapy.modality,
    })

    setShowAddModal(false)
    setShowToast(true)
  }

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden pt-0 pb-1">
      <PageHeader
        breadcrumb={['Allervia', 'Agenda Clínica']}
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
                className="h-9 rounded-full! bg-white! pl-9 pr-4 text-[0.78rem]"
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
              <Pill active icon={faPlus} onClick={() => setShowAddModal(true)}>
                Novo Agendamento
              </Pill>
            )}
          </>
        }
      />

      <div className="flex flex-1 min-h-0 flex-col overflow-hidden rounded-3xl border border-(--border-custom) bg-[#F6F8F8]">
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
              onSelectApplication={setSelectedApplication}
            />
          ) : (
            <MonthView
              monthDays={calendar.monthDays}
              referenceDate={calendar.currentDate}
              selectedDate={calendar.selectedDate}
              onSelectDate={calendar.setSelectedDate}
              applicationsByDate={applicationsByDate}
              onSelectApplication={setSelectedApplication}
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
                onClick={() => { setSelectedApplication(app); setDayModal(null) }}
                className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition hover:brightness-95 cursor-pointer ${app.status === 'missed' ? 'opacity-60' : ''}`}
                style={{
                  backgroundColor: c.bg,
                  backgroundImage:
                    app.status === 'missed'
                      ? `repeating-linear-gradient(45deg, rgba(100,116,139,0.22) 0 1.5px, transparent 1.5px 6px), ${c.grad}`
                      : c.grad,
                  color: c.text,
                }}
              >
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold">{app.startTime} – {app.endTime}</div>
                  <div className="text-[0.7rem] font-medium opacity-90 truncate">{getName(app.patientId)} · {app.dose}</div>
                </div>
              </button>
            )
          })}
        </div>
      </Modal>

      <ApplicationDetailsModal
        application={selectedApplication}
        googleConnected={googleCalendarConnected}
        onClose={() => setSelectedApplication(null)}
        onOpenPatient={openPatient}
      />

      <NewAppointmentModal
        open={showAddModal}
        googleConnected={googleCalendarConnected}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleNewAppointmentSubmit}
      />

      <Toast
        open={showToast}
        onClose={() => setShowToast(false)}
        variant="success"
        icon={<FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: 16 }} />}
        title="Agendamento criado com sucesso!"
        description={
          googleCalendarConnected
            ? 'O agendamento foi registrado e sincronizado automaticamente com o Google Agenda.'
            : 'O agendamento foi registrado. O paciente será notificado conforme as configurações definidas.'
        }
      />
    </div>
  )
}
