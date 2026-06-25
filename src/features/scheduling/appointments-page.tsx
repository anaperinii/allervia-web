import { useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CheckCircle, Plus } from 'lucide-react'
import { Button, SegmentedControl, Select, Toast } from '@/shared/components'
import { useHasPermission, useDoctorFilter } from '@/shared/stores/useUserStore'
import { usePatientStore } from '@/features/patient/stores/usePatientStore'
import type { Application } from '@/features/patient/stores/usePatientStore'
import { useImmunotherapiesStore } from '@/features/immunotherapy/stores/useImmunotherapiesStore'
import { useSettingsStore } from '@/features/settings/stores/useSettingsStore'
import { useCalendarNav } from '@/features/scheduling/hooks/useCalendarNav'
import { CalendarToolbar } from '@/features/scheduling/components/CalendarToolbar'
import { WeekView } from '@/features/scheduling/components/WeekView'
import { MonthView } from '@/features/scheduling/components/MonthView'
import { SelectedDayStrip } from '@/features/scheduling/components/SelectedDayStrip'
import { ApplicationDetailsModal } from '@/features/scheduling/components/ApplicationDetailsModal'
import { NewAppointmentModal } from '@/features/scheduling/components/NewAppointmentModal'
import type { NewAppointmentForm } from '@/features/scheduling/schemas/new-appointment'

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

  const applications = useMemo(() => {
    if (!doctorFilter) return allApplications
    const ownedIds = new Set(
      immunotherapies.filter((immunotherapy) => immunotherapy.responsibleDoctor === doctorFilter).map((immunotherapy) => immunotherapy.id),
    )
    return allApplications.filter((application) => ownedIds.has(application.patientId))
  }, [allApplications, immunotherapies, doctorFilter])

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

  const selectedDayApplications = useMemo(
    () => applicationsByDate.get(format(calendar.selectedDate, 'dd/MM/yyyy')) ?? [],
    [applicationsByDate, calendar.selectedDate],
  )

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
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden px-5 pt-7 pb-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold text-(--text)">Agendamentos</h1>
        <div className="flex items-center gap-3">
          <Select
            aria-label="Filtrar por mês"
            value={calendar.currentDate.getMonth()}
            onChange={(e) => calendar.setMonth(Number(e.target.value))}
            className="h-8 bg-white w-auto"
          >
            {MONTH_OPTIONS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </Select>
          <Select
            aria-label="Filtrar por ano"
            value={calendar.currentDate.getFullYear()}
            onChange={(e) => calendar.setYear(Number(e.target.value))}
            className="h-8 bg-white w-auto"
          >
            {YEAR_OPTIONS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </Select>
          <SegmentedControl
            value={calendar.viewMode}
            onChange={calendar.setViewMode}
            size="md"
            className="bg-white"
            options={[
              { value: 'week', label: 'Semana' },
              { value: 'month', label: 'Mês' },
            ]}
            aria-label="Modo de visualização"
          />
          {canNewAppointment && (
            <Button
              tone="brand"
              variant="solid"
              prominent
              size="md"
              leftIcon={<Plus size={13} />}
              onClick={() => setShowAddModal(true)}
              className="px-3"
            >
              Novo Agendamento
            </Button>
          )}
        </div>
      </div>

      <div className="mb-4">
        <CalendarToolbar
          monthLabel={calendar.monthLabel}
          onPrev={calendar.goToPrev}
          onNext={calendar.goToNext}
          onToday={calendar.goToToday}
        />
      </div>

      <div className="flex flex-1 min-h-0 flex-col overflow-hidden rounded-xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
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
            />
          )}
        </div>

        <SelectedDayStrip
          selectedDate={calendar.selectedDate}
          applications={selectedDayApplications}
          googleConnected={googleCalendarConnected}
          onSelectApplication={setSelectedApplication}
        />
      </div>

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
        icon={<CheckCircle size={16} />}
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
