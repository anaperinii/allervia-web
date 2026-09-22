import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams, useSearch } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cn } from '@/shared/lib/cn'
import { SegmentedControl, Toast } from '@/shared/components'
import { sendReminder } from '@/shared/lib/whatsapp'
import { usePatientStore, type Application } from '@/features/patient/stores/usePatientStore'
import {
  buildLegacyPatient,
  doseToLegacyApplication,
  formatInstantDate,
  formatStepPresentation,
  THERAPY_STATUS_LABELS,
} from '@/features/patient/adapters/clinical-presentation'
import {
  getDose,
  getPatient,
  listDosesForTherapy,
  updatePatient,
} from '@/shared/api/clinical.api'
import { ApiError } from '@/shared/api/contracts/errors'
import { queryKeys } from '@/shared/api/query-keys'
import { useSession } from '@/shared/auth/useSession'
import { useAuditStore } from '@/shared/stores/useAuditStore'
import { useCurrentUser, useHasPermission } from '@/shared/stores/useUserStore'
import { formatDurationFromDays } from '@/shared/lib/dates'
import { monthIndexFromPtUpper } from '@/shared/constants/months-pt'
import { PatientInfoSidebar } from '@/features/patient/components/chart/PatientInfoSidebar'
import { SummaryCards } from '@/features/patient/components/chart/SummaryCards'
import { ApplicationsMonthFilter } from '@/features/patient/components/chart/ApplicationsMonthFilter'
import { ApplicationsTimeline } from '@/features/patient/components/chart/ApplicationsTimeline'
import { ApplicationsCalendar } from '@/features/patient/components/chart/ApplicationsCalendar'
import { ProgressIndicator } from '@/features/patient/components/chart/ProgressIndicator'
import { TreatmentTimeline } from '@/features/patient/components/treatment-completion/TreatmentTimeline'
import { ApplicationDetailModal } from '@/features/patient/components/chart/ApplicationDetailModal'
import { EditPatientModal } from '@/features/patient/components/chart/EditPatientModal'
import { EditScheduledDoseModal } from '@/features/patient/components/chart/EditScheduledDoseModal'
import {
  LifecycleHistoryModal,
  ResumeTherapyModal,
  SuspendTherapyModal,
} from '@/features/patient/components/chart/TherapyLifecycleModals'
import { RevisePrescriptionModal } from '@/features/patient/components/chart/RevisePrescriptionModal'
import {
  LateObservationModal,
  RetractDoseModal,
} from '@/features/patient/components/chart/DoseCorrectionModals'
import { PortabilityModal } from '@/features/patient/components/chart/PortabilityModal'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendarDays, faFloppyDisk, faList, faPowerOff } from '@fortawesome/free-solid-svg-icons'

export function PatientChartPage() {
  const navigate = useNavigate()
  const { patientId } = useParams({ from: '/patient/$patientId' })
  const { therapy: therapyParam } = useSearch({ from: '/patient/$patientId' })
  const { account } = useSession()
  const organizationId = account?.organization?.id ?? ''
  const queryClient = useQueryClient()
  const selectedPatient = usePatientStore((s) => s.selectedPatient)
  const setSelectedPatient = usePatientStore((s) => s.setSelectedPatient)

  // O prontuário nasce da consulta real: URL direta e reload funcionam sem
  // depender de estado deixado por outra tela.
  const patientQuery = useQuery({
    queryKey: queryKeys.patient(organizationId, patientId),
    queryFn: ({ signal }) => getPatient(patientId, signal),
    enabled: organizationId !== '' && patientId !== '',
  })
  const patientDetail = patientQuery.data ?? null

  // Seleção do tratamento pela URL; sem parâmetro, o mais recente.
  const selectedTherapy = useMemo(() => {
    if (!patientDetail) return null
    if (therapyParam) {
      return (
        patientDetail.therapies.find((item) => item.id === therapyParam) ?? null
      )
    }
    return patientDetail.therapies[0] ?? null
  }, [patientDetail, therapyParam])

  // Histórico persistido de doses: previsto e realizado vêm do servidor.
  const dosesQuery = useQuery({
    queryKey: queryKeys.doses(organizationId, selectedTherapy?.id ?? ''),
    queryFn: ({ signal }) => listDosesForTherapy(selectedTherapy!.id, signal),
    enabled: organizationId !== '' && selectedTherapy !== null,
  })
  const doseRecords = useMemo(() => dosesQuery.data ?? [], [dosesQuery.data])

  const lastAdministered = useMemo(() => {
    const administered = doseRecords.filter((record) => record.administeredAt !== null)
    if (administered.length === 0) return null
    return [...administered].sort((a, b) =>
      (b.administeredAt ?? '').localeCompare(a.administeredAt ?? ''),
    )[0]
  }, [doseRecords])

  const pendingRecord = useMemo(
    () =>
      doseRecords.find(
        (record) => record.status === 'SCHEDULED' && !record.isArchived,
      ) ?? null,
    [doseRecords],
  )

  // Detalhe da pendente: valores permitidos e revisões para edição/progresso.
  const pendingDoseQuery = useQuery({
    queryKey: queryKeys.dose(organizationId, pendingRecord?.id ?? ''),
    queryFn: ({ signal }) => getDose(pendingRecord!.id, signal),
    enabled: organizationId !== '' && pendingRecord !== null,
  })
  const pendingDose = pendingDoseQuery.data ?? null

  const savePatientMutation = useMutation({
    mutationFn: (patch: {
      name: string
      phone: string
      weight: string
      responsibleDoctor: string
    }) =>
      updatePatient(patientId, {
        fullName: patch.name,
        phoneNumber: patch.phone.replace(/\D/g, ''),
        weightInKg: Number(
          patch.weight.replace(',', '.').replace(/[^0-9.]/g, ''),
        ),
        ...(patch.responsibleDoctor &&
        patch.responsibleDoctor !== patientDetail?.responsiblePhysician.id
          ? { responsiblePhysicianId: patch.responsibleDoctor }
          : {}),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.patient(organizationId, patientId),
      })
      await queryClient.invalidateQueries({
        queryKey: ['clinical', organizationId, 'patients'],
      })
    },
  })

  const canAdjustProtocol = useHasPermission('edit_scheduled_dose')
  const canInactivate = useHasPermission('inactivate_immunotherapy')
  const canReactivate = useHasPermission('reactivate_patient')
  const canEditPatient = useHasPermission('edit_patient_data')
  const canEvolve = useHasPermission('evolve_patient')
  const canEmitReport = useHasPermission('emit_report')
  const canLgpdPortability = useHasPermission('lgpd_portability')

  // O modelo legado alimenta os modais ainda não migrados (edição de dados,
  // portabilidade). A fonte é sempre a consulta real acima.
  useEffect(() => {
    if (!patientDetail) return
    setSelectedPatient(buildLegacyPatient(patientDetail, selectedTherapy))
  }, [patientDetail, selectedTherapy, setSelectedPatient])

  const currentUser = useCurrentUser()
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
  const [activeTab, setActiveTab] = useState<'applications' | 'progress'>('applications')
  const [viewMode, setViewMode] = useState<'timeline' | 'calendar'>('timeline')
  const [calMonth, setCalMonth] = useState(new Date().getMonth())
  const [calYear, setCalYear] = useState(new Date().getFullYear())
  const [showEditModal, setShowEditModal] = useState(false)
  const [showEditDoseModal, setShowEditDoseModal] = useState(false)
  const [showSuspendModal, setShowSuspendModal] = useState(false)
  const [showResumeModal, setShowResumeModal] = useState(false)
  const [showLifecycleHistory, setShowLifecycleHistory] = useState(false)
  const [showReviseModal, setShowReviseModal] = useState(false)
  const [retractDoseId, setRetractDoseId] = useState<string | null>(null)
  const [lateObsDoseId, setLateObsDoseId] = useState<string | null>(null)
  const [showPortabilityModal, setShowPortabilityModal] = useState(false)
  const [showInactivateToast, setShowInactivateToast] = useState(false)
  const [showReactivateToast, setShowReactivateToast] = useState(false)
  const [showAdjustToast, setShowAdjustToast] = useState(false)

  const patientApplications = useMemo(
    () => doseRecords.map((record) => doseToLegacyApplication(record, patientId)),
    [doseRecords, patientId],
  )

  const currentInterval = lastAdministered?.administeredValues
    ? `${lastAdministered.administeredValues.intervalDays} dias`
    : '-'
  const currentDose = lastAdministered?.administeredValues
    ? formatStepPresentation(lastAdministered.administeredValues)
    : '-'
  const nextDate = pendingRecord
    ? formatInstantDate(pendingRecord.scheduledAt)
    : '-'

  const inductionStart = selectedTherapy
    ? formatInstantDate(selectedTherapy.inductionStartDate)
    : null
  const maintenanceStart = selectedTherapy?.maintenanceStartDate
    ? formatInstantDate(selectedTherapy.maintenanceStartDate)
    : null

  const treatmentTime = useMemo(() => {
    if (!selectedTherapy) return null
    const start = new Date(selectedTherapy.inductionStartDate)
    const days = Math.floor((Date.now() - start.getTime()) / 86_400_000)
    if (days < 0) return null
    return formatDurationFromDays(days)
  }, [selectedTherapy])

  const sortedApplications = useMemo(
    () =>
      [...patientApplications].sort((a, b) => {
        const [da, ma, ya] = a.date.split('/')
        const [db, mb, yb] = b.date.split('/')
        return `${yb}${mb}${db}`.localeCompare(`${ya}${ma}${da}`)
      }),
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

  if (patientQuery.isPending || (patientDetail && !selectedPatient)) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-xs text-(--text-muted)">Carregando prontuário…</span>
      </div>
    )
  }

  if (patientQuery.error || !patientDetail || !selectedPatient) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2">
        <span className="text-xs text-(--text-muted)" role="alert">
          {patientQuery.error instanceof ApiError
            ? patientQuery.error.message
            : 'Não foi possível carregar o prontuário.'}
        </span>
        <button
          type="button"
          onClick={() => navigate({ to: '/immunotherapies' })}
          className="text-xs font-semibold text-brand underline cursor-pointer bg-transparent border-none"
        >
          Voltar para a lista
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
      <div className="ml-1 mr-1 mt-1 mb-1 flex flex-1 gap-4 min-h-0 min-w-0">
        <PatientInfoSidebar
          patient={selectedPatient}
          therapyStatus={selectedTherapy?.status ?? null}
          evolutionTherapyId={selectedTherapy?.id ?? null}
          treatmentTime={treatmentTime}
          inductionStart={inductionStart}
          maintenanceStart={maintenanceStart}
          activeInactivation={null}
          inactivationCount={0}
          canReactivate={canReactivate}
          canEvolve={canEvolve}
          canEmitReport={canEmitReport}
          canEditPatient={canEditPatient}
          canAdjustProtocol={canAdjustProtocol && pendingDose !== null}
          canInactivate={canInactivate && selectedTherapy?.status === 'IN_PROGRESS'}
          canComplete={canInactivate}
          completeDisabled={selectedTherapy?.status !== 'IN_PROGRESS'}
          canLgpdPortability={canLgpdPortability}
          canRevisePrescription={canInactivate && pendingDose !== null}
          onRevisePrescription={() => setShowReviseModal(true)}
          onShowLifecycleHistory={() => setShowLifecycleHistory(true)}
          onReactivate={() => setShowResumeModal(true)}
          onEditPatient={() => setShowEditModal(true)}
          onAdjustProtocol={() => setShowEditDoseModal(true)}
          onInactivate={() => setShowSuspendModal(true)}
          onPortability={() => setShowPortabilityModal(true)}
          onComplete={() =>
            navigate({
              to: '/patient-completion',
              search: { patientId, therapy: selectedTherapy?.id },
            })
          }
        />

        <div className="flex flex-1 flex-col gap-3 min-w-0">
          {patientDetail.therapies.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[0.7rem] font-semibold text-(--text-muted)">
                Tratamento:
              </span>
              {patientDetail.therapies.map((therapy) => {
                const active = therapy.id === selectedTherapy?.id
                return (
                  <button
                    key={therapy.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() =>
                      navigate({
                        to: '/patient/$patientId',
                        params: { patientId },
                        search: { therapy: therapy.id },
                      })
                    }
                    className={cn(
                      'rounded-full border px-3 py-1 text-[0.7rem] font-semibold transition-colors cursor-pointer',
                      active
                        ? 'border-brand bg-brand-50 text-brand-dark'
                        : 'border-(--border-custom) bg-white text-(--text-muted) hover:border-brand/50',
                    )}
                  >
                    {therapy.immunoType} - {therapy.extract}
                    <span className="ml-1.5 font-normal opacity-70">
                      {THERAPY_STATUS_LABELS[therapy.status]}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
          {pendingDose?.migrationRequired && (
            <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 rounded-lg px-3.5 py-2.5">
              <span className="text-xs text-amber-800">
                Tratamento legado sem prescrição vinculada: novos comandos clínicos
                ficam bloqueados até a migração assistida.
              </span>
              {canAdjustProtocol && (
                <button
                  type="button"
                  onClick={() => navigate({ to: '/migration' })}
                  className="ml-auto text-xs font-semibold text-amber-800 underline cursor-pointer bg-transparent border-none shrink-0"
                >
                  Abrir migração
                </button>
              )}
            </div>
          )}
          <SummaryCards currentInterval={currentInterval} nextDate={nextDate} currentDose={currentDose} />

          <div className="flex flex-1 flex-col min-h-0 min-w-0">
          <div className="relative z-10 flex items-end justify-between gap-2">
            <div className="flex items-end gap-1">
            {([
              { key: 'applications', label: 'Aplicações', first: true },
              { key: 'progress', label: 'Gráficos de Progressão', first: false },
            ] as const).map((t) => {
              const active = activeTab === t.key
              return (
                <button
                  key={t.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveTab(t.key)}
                  className={cn(
                    'relative rounded-t-xl px-5 py-2 text-xs font-semibold transition-colors cursor-pointer',
                    active ? 'bg-white text-slate-800 z-10' : 'bg-gray-100/70 text-slate-400 hover:bg-gray-100 hover:text-slate-600',
                  )}
                >
                  {active && (
                    <>
                      {!t.first && (
                        <span aria-hidden="true" className="pointer-events-none absolute -left-3 bottom-0 h-3 w-3" style={{ background: 'radial-gradient(circle at 0% 0%, transparent 11.5px, #ffffff 12.5px)' }} />
                      )}
                      <span aria-hidden="true" className="pointer-events-none absolute -right-3 bottom-0 h-3 w-3" style={{ background: 'radial-gradient(circle at 100% 0%, transparent 11.5px, #ffffff 12.5px)' }} />
                    </>
                  )}
                  {t.label}
                </button>
              )
            })}
            </div>
            {activeTab === 'applications' && (
              <SegmentedControl
                value={viewMode}
                onChange={setViewMode}
                size="sm"
                options={[
                  { value: 'timeline', label: 'Lista', icon: <FontAwesomeIcon icon={faList} style={{ fontSize: 11 }} /> },
                  { value: 'calendar', label: 'Calendário', icon: <FontAwesomeIcon icon={faCalendarDays} style={{ fontSize: 11 }} /> },
                ]}
                aria-label="Modo de visualização das aplicações"
                className="mb-1 bg-white"
              />
            )}
          </div>

          <div className="flex-1 flex flex-col rounded-tr-xl rounded-b-xl bg-white overflow-hidden min-h-0 min-w-0">
            {activeTab === 'applications' ? (
              <>
                <div className="px-5 py-3 border-b border-(--border-custom) min-w-0">
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
                </div>

                {viewMode === 'timeline' ? (
                  <div className="flex-1 overflow-y-auto px-5 py-4">
                    <ApplicationsTimeline
                      applicationsByMonth={groupedByMonth}
                      onSelect={setSelectedApp}
                      onEditScheduled={() => setShowEditDoseModal(true)}
                      onSendReminder={(app) => sendReminder(selectedPatient.phone, selectedPatient.name.split(' ')[0], app.date, app.startTime)}
                    />
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
              </>
            ) : (
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                <ProgressIndicator
                  steps={pendingDose?.allowedValues ?? []}
                  currentStepId={lastAdministered?.administeredStepId ?? null}
                />
                <TreatmentTimeline
                  applications={patientApplications}
                  inductionStart={inductionStart ?? '—'}
                  maintenanceStart={maintenanceStart}
                  flat
                />
              </div>
            )}
          </div>
          </div>
        </div>
      </div>

      <EditPatientModal
        open={showEditModal}
        patient={selectedPatient}
        onClose={() => setShowEditModal(false)}
        onSave={(patch) => savePatientMutation.mutate(patch)}
      />

      <EditScheduledDoseModal
        open={showEditDoseModal}
        dose={pendingDose}
        organizationId={organizationId}
        onClose={() => setShowEditDoseModal(false)}
        onSaved={() => setShowAdjustToast(true)}
      />

      {selectedTherapy && (
        <>
          <SuspendTherapyModal
            open={showSuspendModal}
            therapyId={selectedTherapy.id}
            therapyRevision={selectedTherapy.revision}
            organizationId={organizationId}
            onClose={() => setShowSuspendModal(false)}
            onDone={() => setShowInactivateToast(true)}
          />
          <ResumeTherapyModal
            open={showResumeModal}
            therapyId={selectedTherapy.id}
            therapyRevision={selectedTherapy.revision}
            organizationId={organizationId}
            onClose={() => setShowResumeModal(false)}
            onDone={() => setShowReactivateToast(true)}
          />
          <LifecycleHistoryModal
            open={showLifecycleHistory}
            therapyId={selectedTherapy.id}
            organizationId={organizationId}
            onClose={() => setShowLifecycleHistory(false)}
          />
          <RevisePrescriptionModal
            open={showReviseModal}
            therapyId={selectedTherapy.id}
            therapyRevision={selectedTherapy.revision}
            currentVersionId={selectedTherapy.prescription?.versionId ?? null}
            organizationId={organizationId}
            onClose={() => setShowReviseModal(false)}
          />
        </>
      )}

      <RetractDoseModal
        doseId={retractDoseId}
        organizationId={organizationId}
        onClose={() => setRetractDoseId(null)}
      />
      <LateObservationModal
        doseId={lateObsDoseId}
        organizationId={organizationId}
        onClose={() => setLateObsDoseId(null)}
      />

      <PortabilityModal
        open={showPortabilityModal}
        patient={selectedPatient}
        therapyId={selectedTherapy?.id ?? null}
        onClose={() => setShowPortabilityModal(false)}
      />

      <ApplicationDetailModal
        application={selectedApplication}
        onClose={() => setSelectedApp(null)}
        onRetract={
          canAdjustProtocol
            ? (doseId) => { setSelectedApp(null); setRetractDoseId(doseId) }
            : undefined
        }
        onLateObservation={
          canAdjustProtocol
            ? (doseId) => { setSelectedApp(null); setLateObsDoseId(doseId) }
            : undefined
        }
      />

      <Toast
        open={showAdjustToast}
        onClose={() => setShowAdjustToast(false)}
        variant="success"
        icon={<FontAwesomeIcon icon={faFloppyDisk} style={{ fontSize: 16 }} />}
        title="Previsão atualizada!"
        description="A sessão prevista foi ajustada com motivo registrado. Nenhuma sucessora foi criada."
      />
      <Toast
        open={showInactivateToast}
        onClose={() => setShowInactivateToast(false)}
        variant="warning"
        icon={<FontAwesomeIcon icon={faPowerOff} style={{ fontSize: 16 }} />}
        title="Tratamento suspenso"
        description="Novos comandos clínicos ficam bloqueados até a retomada."
      />
      <Toast
        open={showReactivateToast}
        onClose={() => setShowReactivateToast(false)}
        variant="success"
        icon={<FontAwesomeIcon icon={faPowerOff} style={{ fontSize: 16 }} />}
        title="Tratamento retomado"
        description="O tratamento está ativo novamente a partir da previsão preservada."
      />
    </div>
  )
}
