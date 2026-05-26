import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { addDays, differenceInDays, format } from 'date-fns'
import { CalendarDays, ChevronDown, List, Power, PowerOff, Save } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { SegmentedControl, Toast } from '@/shared/components'
import { usePatientStore, derivePatientDates, type Application } from '@/features/patient/stores/usePatientStore'
import { buildPatientFromImmunotherapy } from '@/features/patient/constants/patient-profiles'
import { useImmunotherapiesStore } from '@/features/immunotherapy/stores/useImmunotherapiesStore'
import { useAuditStore } from '@/shared/stores/useAuditStore'
import { useDoctorFilter, useHasPermission, useUserStore } from '@/shared/stores/useUserStore'
import {
  calculateNextDose,
  INDUCTION_INTERVAL,
  INITIAL_DOSE,
} from '@/features/immunotherapy/constants/scit-protocol'
import { comparePtDateDesc, parsePtDate } from '@/shared/lib/dates'
import { monthIndexFromPtUpper } from '@/shared/constants/months-pt'
import { PatientInfoSidebar } from '@/features/patient/components/chart/PatientInfoSidebar'
import { SummaryCards } from '@/features/patient/components/chart/SummaryCards'
import { ApplicationsMonthFilter } from '@/features/patient/components/chart/ApplicationsMonthFilter'
import { ApplicationsTimeline } from '@/features/patient/components/chart/ApplicationsTimeline'
import { ApplicationsCalendar } from '@/features/patient/components/chart/ApplicationsCalendar'
import { ProgressIndicator, PROGRESS_INDUCTION_STEPS } from '@/features/patient/components/chart/ProgressIndicator'
import { ApplicationDetailModal } from '@/features/patient/components/chart/ApplicationDetailModal'
import { EditPatientModal } from '@/features/patient/components/chart/EditPatientModal'
import { AdjustProtocolModal } from '@/features/patient/components/chart/AdjustProtocolModal'
import { AdjustHistoryModal } from '@/features/patient/components/chart/AdjustHistoryModal'
import { InactivateModal } from '@/features/patient/components/chart/InactivateModal'
import { InactivationHistoryModal } from '@/features/patient/components/chart/InactivationHistoryModal'
import { ReactivateModal } from '@/features/patient/components/chart/ReactivateModal'
import { PortabilityModal } from '@/features/patient/components/chart/PortabilityModal'

const ALL_INDUCTION_STEPS = PROGRESS_INDUCTION_STEPS.flatMap((step) => step.vols.map((volume) => `${step.conc} - ${volume}`))

export function PatientChartPage() {
  const navigate = useNavigate()
  const { patientId } = useParams({ from: '/patient/$patientId' })
  const selectedPatient = usePatientStore((s) => s.selectedPatient)
  const applications = usePatientStore((s) => s.applications)
  const setSelectedPatient = usePatientStore((s) => s.setSelectedPatient)
  const inactivateImmunotherapy = usePatientStore((s) => s.inactivateImmunotherapy)
  const reactivateImmunotherapy = usePatientStore((s) => s.reactivateImmunotherapy)
  const addProtocolAdjustment = usePatientStore((s) => s.addProtocolAdjustment)

  const canAdjustProtocol = useHasPermission('adjust_protocol')
  const canInactivate = useHasPermission('inactivate_immunotherapy')
  const canReactivate = useHasPermission('reactivate_patient')
  const canEditPatient = useHasPermission('edit_patient_data')
  const canEvolve = useHasPermission('evolve_patient')
  const canEmitReport = useHasPermission('emit_report')
  const canLgpdPortability = useHasPermission('lgpd_portability')
  const doctorFilter = useDoctorFilter()

  useEffect(() => {
    if (doctorFilter && selectedPatient && selectedPatient.responsibleDoctor !== doctorFilter) {
      navigate({ to: '/immunotherapies' })
    }
  }, [doctorFilter, selectedPatient, navigate])

  useEffect(() => {
    if (!patientId) return
    if (selectedPatient?.id === patientId) return
    const { immunotherapies } = useImmunotherapiesStore.getState()
    const immunotherapy = immunotherapies.find((item) => item.id === patientId)
    if (immunotherapy) setSelectedPatient(buildPatientFromImmunotherapy(immunotherapy))
    else navigate({ to: '/immunotherapies' })
  }, [patientId, selectedPatient, navigate, setSelectedPatient])

  const currentUser = useUserStore((s) => s.current)
  const logAccess = useAuditStore((s) => s.logAccess)
  const loggedAccessRef = useRef<string | null>(null)
  useEffect(() => {
    if (!selectedPatient) return
    const key = `${currentUser.id}::${selectedPatient.id}`
    if (loggedAccessRef.current === key) return
    loggedAccessRef.current = key
    logAccess({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      userRegistration: currentUser.registration,
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      action: 'view_chart',
      description: 'Consultou o prontuário',
    })
  }, [selectedPatient, currentUser, logAccess])

  const [selectedApplication, setSelectedApp] = useState<Application | null>(null)
  const [monthFilter, setMonthFilter] = useState('all')
  const [showProgress, setShowProgress] = useState(false)
  const [viewMode, setViewMode] = useState<'timeline' | 'calendar'>('timeline')
  const [calMonth, setCalMonth] = useState(new Date().getMonth())
  const [calYear, setCalYear] = useState(new Date().getFullYear())
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAdjustModal, setShowAdjustModal] = useState(false)
  const [showAdjustHistory, setShowAdjustHistory] = useState(false)
  const [showInactivateModal, setShowInactivateModal] = useState(false)
  const [showPortabilityModal, setShowPortabilityModal] = useState(false)
  const [showInactivateToast, setShowInactivateToast] = useState(false)
  const [showReactivateModal, setShowReactivateModal] = useState(false)
  const [showReactivateToast, setShowReactivateToast] = useState(false)
  const [showAdjustToast, setShowAdjustToast] = useState(false)
  const [showInactivationHistory, setShowInactivationHistory] = useState(false)

  const patientApplications = useMemo(() => {
    if (!selectedPatient) return []
    return applications.filter((application) => application.patientId === selectedPatient.id)
  }, [applications, selectedPatient])

  const realizedApplications = useMemo(
    () => patientApplications.filter((application) => application.status === 'completed'),
    [patientApplications],
  )

  const lastRealized = useMemo(() => {
    if (!realizedApplications.length) return null
    return [...realizedApplications].sort((a, b) => comparePtDateDesc(a.date, b.date))[0]
  }, [realizedApplications])

  const { inductionStart, maintenanceStart } = useMemo(
    () => (selectedPatient
      ? derivePatientDates(applications, selectedPatient.id)
      : { inductionStart: null, maintenanceStart: null }),
    [applications, selectedPatient],
  )

  const currentInterval = lastRealized?.cycle.days ?? selectedPatient?.currentInterval ?? INDUCTION_INTERVAL
  const currentDose = lastRealized
    ? `${lastRealized.extractConcentration || lastRealized.dose.split(' - ')[0]} - ${lastRealized.appliedVolume || lastRealized.dose.split(' - ')[1]}`
    : selectedPatient?.currentDoseConcentration ?? '-'

  const nextCalc = useMemo(() => calculateNextDose(currentDose, currentInterval), [currentDose, currentInterval])

  const nextDate = useMemo(() => {
    if (!lastRealized) return selectedPatient?.nextApplicationDate || '-'
    try {
      const [d, m, y] = lastRealized.date.split('/')
      return format(addDays(new Date(+y, +m - 1, +d), nextCalc.interval), 'dd/MM/yyyy')
    } catch {
      return '-'
    }
  }, [lastRealized, nextCalc.interval, selectedPatient])

  const treatmentTime = useMemo(() => {
    if (!inductionStart) return null
    try {
      const start = parsePtDate(inductionStart)
      const days = differenceInDays(new Date(), start)
      const months = Math.floor(days / 30)
      const years = Math.floor(months / 12)
      if (years > 0) return `${years} ${years === 1 ? 'ano' : 'anos'}`
      if (months > 0) return `${months} ${months === 1 ? 'mês' : 'meses'}`
      return `${days} ${days === 1 ? 'dia' : 'dias'}`
    } catch {
      return null
    }
  }, [inductionStart])

  const sortedApplications = useMemo(
    () => [...patientApplications].sort((a, b) => comparePtDateDesc(a.date, b.date)),
    [patientApplications],
  )

  const availableMonths = useMemo(() => {
    const months = new Map<string, string>()
    sortedApplications.forEach((application) => {
      const key = `${application.year}-${application.month}`
      if (!months.has(key)) months.set(key, `${application.month} ${application.year}`)
    })
    return Array.from(months.entries()).map(([key, label]) => ({ key, label }))
  }, [sortedApplications])

  const filteredApplications = useMemo(() => {
    if (monthFilter === 'all') return sortedApplications
    return sortedApplications.filter((application) => `${application.year}-${application.month}` === monthFilter)
  }, [sortedApplications, monthFilter])

  const groupedByMonth = useMemo(() => {
    const byMonth: Record<string, Application[]> = {}
    filteredApplications.forEach((application) => {
      const key = `${application.month} ${application.year}`
      if (!byMonth[key]) byMonth[key] = []
      byMonth[key].push(application)
    })
    return byMonth
  }, [filteredApplications])

  const applicationsByDate = useMemo(() => {
    const byDate: Record<string, Application[]> = {}
    patientApplications.forEach((application) => {
      if (!byDate[application.date]) byDate[application.date] = []
      byDate[application.date].push(application)
    })
    return byDate
  }, [patientApplications])

  const currentDoseStr = lastRealized?.dose || selectedPatient?.currentDoseConcentration || INITIAL_DOSE
  const currentStepIndex = useMemo(() => {
    const [concentration, volume] = currentDoseStr.split(' - ').map((part) => part?.trim() ?? '')
    return ALL_INDUCTION_STEPS.findIndex((step) => {
      const [stepConcentration, stepVolume] = step.split(' - ').map((part) => part.trim())
      return concentration === stepConcentration && volume === stepVolume
    })
  }, [currentDoseStr])
  const isMaintenance = currentInterval > INDUCTION_INTERVAL
  const progressPct = isMaintenance
    ? 100
    : Math.round(((currentStepIndex >= 0 ? currentStepIndex : 0) + 1) / ALL_INDUCTION_STEPS.length * 100)

  const activeInactivation = useMemo(() => {
    if (!selectedPatient?.inactivations?.length) return null
    const last = selectedPatient.inactivations[selectedPatient.inactivations.length - 1]
    return last && !last.reactivatedAt ? last : null
  }, [selectedPatient])

  const inactivationCount = selectedPatient?.inactivations?.length ?? 0

  const suggestedNextDose = useMemo(() => {
    if (isMaintenance) return selectedPatient?.currentDoseConcentration ?? '1:10 - 0,5ml'
    if (currentStepIndex < 0) return selectedPatient?.currentDoseConcentration ?? ''
    const nextIdx = Math.min(currentStepIndex + 1, ALL_INDUCTION_STEPS.length - 1)
    return ALL_INDUCTION_STEPS[nextIdx]
  }, [isMaintenance, currentStepIndex, selectedPatient])

  const pauseDays = useMemo(() => {
    if (!activeInactivation) return 0
    try {
      const startStr = activeInactivation.startDate.split(' às ')[0]
      const start = parsePtDate(startStr)
      return Math.max(0, differenceInDays(new Date(), start))
    } catch {
      return 0
    }
  }, [activeInactivation])

  if (!selectedPatient) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-xs text-(--text-muted)">Carregando...</span>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col bg-gray-50/80 min-h-0 overflow-hidden">
      <div className="mx-4 my-4 flex flex-1 gap-4 min-h-0 min-w-0">
        <PatientInfoSidebar
          patient={selectedPatient}
          treatmentTime={treatmentTime}
          inductionStart={inductionStart}
          maintenanceStart={maintenanceStart}
          activeInactivation={activeInactivation}
          inactivationCount={inactivationCount}
          canReactivate={canReactivate}
          canEvolve={canEvolve}
          canEmitReport={canEmitReport}
          canEditPatient={canEditPatient}
          canAdjustProtocol={canAdjustProtocol}
          canInactivate={canInactivate}
          canComplete={canInactivate}
          completeDisabled={selectedPatient.currentInterval !== 28}
          canLgpdPortability={canLgpdPortability}
          onReactivate={() => setShowReactivateModal(true)}
          onEditPatient={() => setShowEditModal(true)}
          onAdjustProtocol={() => setShowAdjustModal(true)}
          onShowAdjustHistory={() => setShowAdjustHistory(true)}
          onInactivate={() => setShowInactivateModal(true)}
          onShowInactivationHistory={() => setShowInactivationHistory(true)}
          onPortability={() => setShowPortabilityModal(true)}
          onComplete={() => navigate({ to: '/patient-completion', search: { patientId: selectedPatient.id } })}
        />

        <div className="flex flex-1 flex-col gap-3 min-w-0">
          <SummaryCards currentInterval={currentInterval} nextDate={nextDate} currentDose={currentDose} />

          <div className="flex-1 flex flex-col rounded-xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden min-h-0 min-w-0">
            <div className="px-5 py-3 border-b border-(--border-custom) min-w-0">
              <div className="flex items-center justify-between mb-2.5">
                <h2 className="text-sm font-bold text-(--text)">Aplicações</h2>
                <button
                  type="button"
                  aria-expanded={showProgress}
                  onClick={() => setShowProgress(!showProgress)}
                  className="text-[0.6rem] font-semibold text-brand hover:underline cursor-pointer flex items-center gap-1"
                >
                  {showProgress ? 'Ocultar' : 'Ver'} progressão
                  <ChevronDown size={10} className={cn('transition-transform', showProgress && 'rotate-180')} />
                </button>
              </div>

              <ProgressIndicator
                open={showProgress}
                patientApplications={patientApplications}
                isMaintenance={isMaintenance}
                currentInterval={currentInterval}
                currentStepIndex={currentStepIndex}
                progressPct={progressPct}
              />

              <div className="flex items-center gap-2 min-w-0">
                <ApplicationsMonthFilter
                  months={availableMonths}
                  activeKey={monthFilter}
                  onChange={(key) => {
                    setMonthFilter(key)
                    if (key === 'all') {
                      const now = new Date()
                      setCalMonth(now.getMonth())
                      setCalYear(now.getFullYear())
                    } else {
                      const [yr, monthName] = key.split('-')
                      const mi = monthIndexFromPtUpper(monthName)
                      if (mi >= 0) { setCalMonth(mi); setCalYear(Number(yr)) }
                    }
                  }}
                />
                <SegmentedControl
                  value={viewMode}
                  onChange={setViewMode}
                  size="xs"
                  options={[
                    { value: 'timeline', label: 'Lista', icon: <List size={10} /> },
                    { value: 'calendar', label: 'Calendário', icon: <CalendarDays size={10} /> },
                  ]}
                  aria-label="Modo de visualização das aplicações"
                />
              </div>
            </div>

            {viewMode === 'timeline' ? (
              <div className="flex-1 overflow-y-auto px-5 py-4">
                <ApplicationsTimeline applicationsByMonth={groupedByMonth} onSelect={setSelectedApp} />
              </div>
            ) : (
              <ApplicationsCalendar
                month={calMonth}
                year={calYear}
                applicationsByDate={applicationsByDate}
                onMonthChange={(m, y) => { setCalMonth(m); setCalYear(y) }}
                onSelect={setSelectedApp}
              />
            )}
          </div>
        </div>
      </div>

      <EditPatientModal
        open={showEditModal}
        patient={selectedPatient}
        onClose={() => setShowEditModal(false)}
        onSave={(patch) => setSelectedPatient({ ...selectedPatient, ...patch })}
      />

      <AdjustProtocolModal
        open={showAdjustModal}
        patient={selectedPatient}
        onClose={() => setShowAdjustModal(false)}
        onConfirm={(adjustment, patch) => {
          setSelectedPatient({
            ...selectedPatient,
            immunotherapyType: patch.newType,
            administrationRoute: patch.newRoute,
            extract: patch.newExtract,
          })
          addProtocolAdjustment(adjustment)
          setShowAdjustToast(true)
        }}
      />

      <AdjustHistoryModal
        open={showAdjustHistory}
        adjustments={selectedPatient.protocolAdjustments ?? []}
        onClose={() => setShowAdjustHistory(false)}
      />

      <InactivateModal
        open={showInactivateModal}
        patient={selectedPatient}
        onClose={() => setShowInactivateModal(false)}
        onConfirm={(inactivation) => {
          inactivateImmunotherapy(inactivation)
          setShowInactivateToast(true)
        }}
      />

      <PortabilityModal
        open={showPortabilityModal}
        patient={selectedPatient}
        onClose={() => setShowPortabilityModal(false)}
      />

      <InactivationHistoryModal
        open={showInactivationHistory}
        inactivations={selectedPatient.inactivations ?? []}
        onClose={() => setShowInactivationHistory(false)}
      />

      <ReactivateModal
        open={showReactivateModal && !!activeInactivation}
        patient={selectedPatient}
        activeInactivation={activeInactivation}
        suggestedNextDose={suggestedNextDose}
        lastRealized={lastRealized}
        pauseDays={pauseDays}
        isMaintenance={isMaintenance}
        progressPct={progressPct}
        onClose={() => setShowReactivateModal(false)}
        onConfirm={(payload) => {
          reactivateImmunotherapy(payload)
          setShowReactivateToast(true)
        }}
      />

      <ApplicationDetailModal application={selectedApplication} onClose={() => setSelectedApp(null)} />

      <Toast
        open={showAdjustToast}
        onClose={() => setShowAdjustToast(false)}
        variant="success"
        icon={<Save size={16} />}
        title="Protocolo ajustado com sucesso!"
        description="A alteração foi registrada no histórico clínico e marcará as próximas aplicações como desvio de protocolo."
      />
      <Toast
        open={showInactivateToast}
        onClose={() => setShowInactivateToast(false)}
        variant="warning"
        icon={<PowerOff size={16} />}
        title="Imunoterapia inativada"
        description='As aplicações foram pausadas. Use "Reativar paciente" quando ele estiver apto a continuar o protocolo.'
      />
      <Toast
        open={showReactivateToast}
        onClose={() => setShowReactivateToast(false)}
        variant="success"
        icon={<Power size={16} />}
        title="Paciente reativado"
        description="O paciente está ativo novamente e pode continuar o protocolo a partir do ponto definido."
      />
    </div>
  )
}
