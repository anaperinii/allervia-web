import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { addDays, differenceInDays, format } from 'date-fns'
import { CalendarDays, ChevronDown, List, Power, PowerOff, Save } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { SegmentedControl, Toast } from '@/shared/components'
import { usePatientStore, type Application } from '@/features/patient/stores/patient-store'
import { isApplicationPast } from '@/shared/lib/dates'
import { buildPatientFromImmunotherapy } from '@/features/patient/constants/patient-profiles'
import { useImmunotherapiesStore } from '@/features/immunotherapy/stores/immunotherapies-store'
import { useAuditStore } from '@/shared/audit/audit-store'
import { useDoctorFilter, useHasPermission, useUserStore } from '@/shared/identity/user-store'
import {
  calculateNextDose,
  INDUCTION_INTERVAL,
  INITIAL_DOSE,
  META_DOSE,
} from '@/features/immunotherapy/constants/scit-protocol'
import { comparePtDateAsc, comparePtDateDesc, parsePtDate } from '@/shared/lib/dates'
import { monthIndexFromPtUpper } from '@/shared/constants/months-pt'
import { PatientInfoSidebar } from '@/features/patient/components/chart/patient-info-sidebar'
import { SummaryCards } from '@/features/patient/components/chart/summary-cards'
import { ApplicationsMonthFilter } from '@/features/patient/components/chart/applications-month-filter'
import { ApplicationsTimeline } from '@/features/patient/components/chart/applications-timeline'
import { ApplicationsCalendar } from '@/features/patient/components/chart/applications-calendar'
import { ProgressIndicator, PROGRESS_INDUCTION_STEPS } from '@/features/patient/components/chart/progress-indicator'
import { ApplicationDetailModal } from '@/features/patient/components/chart/application-detail-modal'
import { EditPatientModal } from '@/features/patient/components/chart/edit-patient-modal'
import { AdjustProtocolModal } from '@/features/patient/components/chart/adjust-protocol-modal'
import { AdjustHistoryModal } from '@/features/patient/components/chart/adjust-history-modal'
import { InactivateModal } from '@/features/patient/components/chart/inactivate-modal'
import { InactivationHistoryModal } from '@/features/patient/components/chart/inactivation-history-modal'
import { ReactivateModal } from '@/features/patient/components/chart/reactivate-modal'
import { PortabilityModal } from '@/features/patient/components/chart/portability-modal'

const ALL_INDUCTION_STEPS = PROGRESS_INDUCTION_STEPS.flatMap((s) => s.vols.map((v) => `${s.conc} - ${v}`))

export function PatientChartPage() {
  const navigate = useNavigate()
  const { patientId } = useParams({ from: '/patient/$patientId' })
  const selectedPatient = usePatientStore((s) => s.selectedPatient)
  const applications = usePatientStore((s) => s.applications)
  const setSelectedPatient = usePatientStore((s) => s.setSelectedPatient)
  const setApplicationStatus = usePatientStore((s) => s.setApplicationStatus)

  // Auto-completa agendamentos passados ao abrir o perfil
  useEffect(() => {
    const autoUpdate = () => {
      const { applications: current } = usePatientStore.getState()
      current.forEach((app) => {
        if (app.status === 'scheduled' && isApplicationPast(app.date, app.endTime)) {
          setApplicationStatus(app.id, 'completed')
        }
      })
    }
    autoUpdate()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
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
    if (!selectedPatient && patientId) {
      const { immunotherapies } = useImmunotherapiesStore.getState()
      const imm = immunotherapies.find((i) => i.id === patientId)
      if (imm) setSelectedPatient(buildPatientFromImmunotherapy(imm))
      else navigate({ to: '/immunotherapies' })
    }
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

  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
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

  const patientApps = useMemo(() => {
    if (!selectedPatient) return []
    return applications.filter((a) => a.patientId === selectedPatient.id)
  }, [applications, selectedPatient])

  const realizedApps = useMemo(() => patientApps.filter((a) => a.status === 'completed'), [patientApps])

  const lastRealized = useMemo(() => {
    if (!realizedApps.length) return null
    return [...realizedApps].sort((a, b) => comparePtDateDesc(a.date, b.date))[0]
  }, [realizedApps])

  const inicioInducao = useMemo(() => {
    if (!realizedApps.length) return null
    return [...realizedApps].sort((a, b) => comparePtDateAsc(a.date, b.date))[0].date
  }, [realizedApps])

  const inicioManutencao = useMemo(() => {
    const meta = realizedApps.filter((a) => a.dose === META_DOSE)
    if (!meta.length) return null
    return [...meta].sort((a, b) => comparePtDateAsc(a.date, b.date))[0].date
  }, [realizedApps])

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
    const inicio = inicioInducao || selectedPatient?.inductionStart
    if (!inicio) return null
    try {
      const start = parsePtDate(inicio)
      const days = differenceInDays(new Date(), start)
      const months = Math.floor(days / 30)
      const years = Math.floor(months / 12)
      if (years > 0) return `${years} ${years === 1 ? 'ano' : 'anos'}`
      if (months > 0) return `${months} ${months === 1 ? 'mês' : 'meses'}`
      return `${days} ${days === 1 ? 'dia' : 'dias'}`
    } catch {
      return null
    }
  }, [inicioInducao, selectedPatient])

  const sortedApps = useMemo(
    () => [...patientApps].sort((a, b) => comparePtDateDesc(a.date, b.date)),
    [patientApps],
  )

  const availableMonths = useMemo(() => {
    const set = new Map<string, string>()
    sortedApps.forEach((a) => {
      const key = `${a.year}-${a.month}`
      if (!set.has(key)) set.set(key, `${a.month} ${a.year}`)
    })
    return Array.from(set.entries()).map(([key, label]) => ({ key, label }))
  }, [sortedApps])

  const filteredApps = useMemo(() => {
    if (monthFilter === 'all') return sortedApps
    return sortedApps.filter((a) => `${a.year}-${a.month}` === monthFilter)
  }, [sortedApps, monthFilter])

  const grouped = useMemo(() => {
    const g: Record<string, Application[]> = {}
    filteredApps.forEach((a) => {
      const key = `${a.month} ${a.year}`
      if (!g[key]) g[key] = []
      g[key].push(a)
    })
    return g
  }, [filteredApps])

  const appsByDate = useMemo(() => {
    const m: Record<string, Application[]> = {}
    patientApps.forEach((a) => {
      if (!m[a.date]) m[a.date] = []
      m[a.date].push(a)
    })
    return m
  }, [patientApps])

  const currentDoseStr = lastRealized?.dose || selectedPatient?.currentDoseConcentration || INITIAL_DOSE
  const currentStepIndex = useMemo(() => {
    const [conc, vol] = currentDoseStr.split(' - ').map((s) => s?.trim() ?? '')
    return ALL_INDUCTION_STEPS.findIndex((s) => {
      const [sc, sv] = s.split(' - ').map((p) => p.trim())
      return conc === sc && vol === sv
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
          inicioInducao={inicioInducao || ''}
          inicioManutencao={inicioManutencao}
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
                patientApps={patientApps}
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
                    if (key !== 'all') {
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
                <ApplicationsTimeline grouped={grouped} onSelect={setSelectedApp} />
              </div>
            ) : (
              <ApplicationsCalendar
                month={calMonth}
                year={calYear}
                appsByDate={appsByDate}
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

      <ApplicationDetailModal application={selectedApp} onClose={() => setSelectedApp(null)} />

      <PortabilityModal
        open={showPortabilityModal}
        patient={selectedPatient}
        onClose={() => setShowPortabilityModal(false)}
      />

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
