import { buildClinicalSummary } from '@/features/patient/adapters/clinical-summary'
import { useBlobPreview } from '@/shared/hooks/useBlobPreview'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button, Modal } from '@/shared/components'
import { getPatient, getDose, listDosesForTherapy, getPatientClinicalRecord } from '@/shared/api/clinical.api'
import { ApiError } from '@/shared/api/contracts/errors'
import { queryKeys } from '@/shared/api/query-keys'
import { useSession } from '@/shared/auth/useSession'
import {
  buildLegacyPatient,
  doseToLegacyApplication,
  formatInstantDate,
} from '@/features/patient/adapters/clinical-presentation'
import { useHasPermission } from '@/shared/stores/useUserStore'
import {
  buildPatientReportPdf,
  exportCsv,
  exportPdf,
  type ReportData,
  type ReportFileFormat,
  type ReportSectionId,
} from '@/features/patient/exporters'
import { maskCpf, maskName, maskPhone } from '@/shared/lib/mask'
import { ReportClinicalPreview } from '@/features/patient/components/report/ReportClinicalPreview'
import { ReportConfigPanel } from '@/features/patient/components/report/ReportConfigPanel'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDownload, faPrint, faShieldHalved } from '@fortawesome/free-solid-svg-icons'
import { PageHeader, Pill } from '@/shared/components/showcase'

const DEFAULT_SECTIONS: ReportSectionId[] = [
  'personal',
  'immunotherapy',
  'applications',
  'reactions',
  'progress',
  'adjustments',
  'inactivations',
]

export function PatientReportPage() {
  const navigate = useNavigate()
  const { patientId, therapy: therapyParam } = useSearch({ from: '/patient-report' })
  const { account } = useSession()
  const organizationId = account?.organization?.id ?? ''

  const [fileFormat, setFileFormat] = useState<ReportFileFormat>('pdf')
  const [selectedSections, setSelectedSections] = useState<ReportSectionId[]>(DEFAULT_SECTIONS)
  const [anonymized, setAnonymized] = useState(false)
  const [consented, setConsented] = useState(false)
  const [justification, setJustification] = useState('')
  const [showExportModal, setShowExportModal] = useState(false)
  const canEmitReport = useHasPermission('emit_report')

  useEffect(() => {
    if (!canEmitReport) navigate({ to: '/immunotherapies' })
  }, [canEmitReport, navigate])

  const patientQuery = useQuery({
    queryKey: queryKeys.patient(organizationId, patientId ?? ''),
    queryFn: ({ signal }) => getPatient(patientId!, signal),
    enabled: organizationId !== '' && !!patientId,
  })
  const detail = patientQuery.data ?? null
  const selectedTherapy = useMemo(() => {
    if (!detail) return null
    if (therapyParam)
      return detail.therapies.find((item) => item.id === therapyParam) ?? null
    return detail.therapies[0] ?? null
  }, [detail, therapyParam])

  const dosesQuery = useQuery({
    queryKey: queryKeys.doses(organizationId, selectedTherapy?.id ?? ''),
    queryFn: ({ signal }) => listDosesForTherapy(selectedTherapy!.id, signal),
    enabled: organizationId !== '' && selectedTherapy !== null,
  })

  const sourceSummary = useMemo(() => buildClinicalSummary(dosesQuery.data ?? [], null), [dosesQuery.data])
  const doseDetailQuery = useQuery({
    queryKey: queryKeys.dose(organizationId, sourceSummary.detailDoseId ?? ''),
    queryFn: ({ signal }) => getDose(sourceSummary.detailDoseId!, signal),
    enabled: organizationId !== '' && sourceSummary.detailDoseId !== null,
  })
  const recordQuery = useQuery({
    queryKey: queryKeys.patientRecord(organizationId, patientId ?? ''),
    queryFn: ({ signal }) => getPatientClinicalRecord(patientId!, signal),
    enabled: organizationId !== '' && !!patientId,
  })
  const observationByDose = useMemo(() => new Map((recordQuery.data?.therapies.find(therapy => therapy.id === selectedTherapy?.id)?.doses ?? []).map(dose => [dose.id, dose])), [recordQuery.data, selectedTherapy?.id])
  const clinicalSummary = useMemo(() => buildClinicalSummary(dosesQuery.data ?? [], doseDetailQuery.data ?? null), [dosesQuery.data, doseDetailQuery.data])
  const sourcesReady = recordQuery.isSuccess && !recordQuery.isFetching && dosesQuery.isSuccess && !dosesQuery.isFetching &&
    (sourceSummary.detailDoseId === null || (doseDetailQuery.isSuccess && !doseDetailQuery.isFetching))
  const patient = useMemo(() => {
    if (!detail) return null
    return {
      ...buildLegacyPatient(detail, selectedTherapy, doseDetailQuery.data?.immunotherapy.currentPrescription?.resolved.timeZone ?? account?.organization?.timeZone ?? 'America/Sao_Paulo'),
      targetConcentrationVolume: clinicalSummary.targetPresentation ?? 'Indisponível',
      currentDoseConcentration: clinicalSummary.currentPresentation ?? 'Indisponível',
      currentInterval: clinicalSummary.intervalDays ?? -1,
      targetReached: clinicalSummary.targetReached === true,
    }
  }, [detail, selectedTherapy, clinicalSummary, doseDetailQuery.data, account?.organization?.timeZone])

  const realizedApplications = useMemo(
    () =>
      (dosesQuery.data ?? [])
        .filter((dose) => dose.administeredAt !== null && dose.status !== 'ENTERED_IN_ERROR')
        .sort((a, b) => (b.administeredAt ?? '').localeCompare(a.administeredAt ?? ''))
        .map((dose) =>
          doseToLegacyApplication(dose, detail?.id ?? '', {
            timeZone: doseDetailQuery.data?.immunotherapy.currentPrescription?.resolved.timeZone ?? account?.organization?.timeZone ?? 'America/Sao_Paulo',
            hasReaction: [...(observationByDose.get(dose.id)?.observations ?? []), ...(observationByDose.get(dose.id)?.observationAddenda ?? [])].some(observation => observation.reportedSideEffects.length > 0),
          }),
        ),
    [dosesQuery.data, detail, observationByDose, doseDetailQuery.data, account?.organization?.timeZone],
  )

  const reactionsCount = recordQuery.isSuccess && realizedApplications.every(application => { const source = observationByDose.get(application.id); return source && source.observations.length + source.observationAddenda.length > 0 }) ? realizedApplications.filter(application => application.sideEffect === 'yes').length : null

  const toggleSection = (id: ReportSectionId) => {
    setSelectedSections((previous) => (previous.includes(id) ? previous.filter((sectionId) => sectionId !== id) : [...previous, id]))
  }

  const reportData = useMemo<ReportData | null>(() => {
    if (!patient || !selectedTherapy || !sourcesReady) return null
    const masked = anonymized
      ? {
          ...patient,
          name: maskName(patient.name, true),
          cpf: maskCpf(patient.cpf, true),
          phone: maskPhone(patient.phone, true),
        }
      : patient
    return {
      patient: masked,
      inductionStart: formatInstantDate(selectedTherapy.inductionStartDate),
      maintenanceStart: selectedTherapy.maintenanceStartDate ? formatInstantDate(selectedTherapy.maintenanceStartDate) : null,
      sections: selectedSections,
      realizedApplications: realizedApplications.map(application => {
        const source = observationByDose.get(application.id)
        const observations = [...(source?.observations ?? []), ...(source?.observationAddenda ?? [])]
        return { ...application,
          sideEffect: source && observations.length ? (observations.some(observation => observation.reportedSideEffects.length > 0) ? 'yes' as const : 'no' as const) : undefined,
          administrator: (source?.administeredBy as { professional?: { fullName?: string } } | null)?.professional?.fullName ?? 'Indisponível',
          administratorNote: anonymized ? '[Texto livre ocultado]' : observations.map(observation => [observation.reportedSideEffects.join('; '), observation.administeredMedications.join('; '), observation.notes].filter(Boolean).join(' · ')).join(' | '),
          medicationNeeded: observations.some(observation => observation.administeredMedications.length > 0) ? 'yes' as const : 'no' as const,
        }
      }),
      reactionsCount,
      generatedAt: format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }),
      anonymized,
    }
  }, [patient, selectedTherapy, sourcesReady, anonymized, selectedSections, realizedApplications, reactionsCount, observationByDose])


  const previewUrl = useBlobPreview(reportData, fileFormat === 'pdf', buildPatientReportPdf)

  if (!patientId) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <span className="text-xs text-(--text-muted)">Abra o relatório pelo prontuário do paciente.</span>
      </div>
    )
  }
  if (patientQuery.isPending) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <span className="text-xs text-(--text-muted)">Carregando dados do relatório…</span>
      </div>
    )
  }
  if (patientQuery.error || !patient) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <span className="text-xs text-(--text-muted)" role="alert">
          {patientQuery.error instanceof ApiError
            ? patientQuery.error.message
            : 'Paciente não encontrado'}
        </span>
      </div>
    )
  }

  const handleExport = () => {
    if (!reportData || !consented || !justification.trim()) return
    if (fileFormat === 'csv') exportCsv(reportData)
    else exportPdf(reportData)
  }

  const exportDisabled = !consented || !justification.trim() || !reportData

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden pt-0">
      {(dosesQuery.isError || doseDetailQuery.isError || recordQuery.isError) && <p role="alert">
        Não foi possível carregar as doses. Relatório bloqueado.
        <button type="button" onClick={() => { void dosesQuery.refetch(); void recordQuery.refetch(); if (sourceSummary.detailDoseId) void doseDetailQuery.refetch() }}>Tentar novamente</button>
      </p>}
      <PageHeader
        breadcrumb={['Prontuário', patient.name]}
        title="Emitir Relatório"
        actions={
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1.5">
            <Pill
              icon={faPrint}
              onClick={() => !exportDisabled && reportData && exportPdf(reportData)}
              disabled={exportDisabled}
              className={exportDisabled ? 'opacity-50 cursor-not-allowed' : undefined}
            >
              Imprimir
            </Pill>
            <Pill
              icon={faDownload}
              active
              onClick={() => !exportDisabled && setShowExportModal(true)}
              disabled={exportDisabled}
              className={exportDisabled ? 'opacity-50 cursor-not-allowed' : undefined}
            >
              Exportar {fileFormat.toUpperCase()}
            </Pill>
            </div>
            {!consented && (
              <span className="text-[0.68rem] font-medium" style={{ color: '#E0453C' }}>
                Aceite a declaração LGPD para habilitar a exportação
              </span>
            )}
          </div>
        }
      />

      <div className="flex flex-1 min-h-0 overflow-hidden gap-4">
        <ReportConfigPanel
          fileFormat={fileFormat}
          setFileFormat={setFileFormat}
          selectedSections={selectedSections}
          toggleSection={toggleSection}
          anonymized={anonymized}
          setAnonymized={setAnonymized}
          consented={consented}
          setConsented={setConsented}
          justification={justification}
          setJustification={setJustification}
          realizedApplicationsCount={realizedApplications.length}
          reactionsCount={reactionsCount}
          intervalDays={realizedApplications[0]?.cycle.days ?? 0}
          patientStatus={selectedTherapy?.status === 'IN_PROGRESS' ? 'active' : 'inactive'}
        />

        {fileFormat === 'pdf' ? (
          <div className="flex w-full min-w-0 flex-1 min-h-0 flex-col gap-2">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-[0.8rem] font-semibold text-(--text)">Pré-visualização</h2>
              <span className="text-[0.66rem] text-(--text-muted)">
                Documento idêntico ao do download
              </span>
            </div>
            {previewUrl ? (
              <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-(--border-custom) bg-white">
                <iframe
                  key={previewUrl}
                  src={`${previewUrl}#toolbar=0&navpanes=0&view=FitH`}
                  title="Pré-visualização do relatório em PDF"
                  className="h-full w-full"
                />
              </div>
            ) : (
              <div className="flex min-h-0 flex-1 items-center justify-center rounded-xl border border-(--border-custom) bg-gray-50 px-6 text-center text-[0.72rem] text-(--text-muted)">
                Pré-visualização indisponível
              </div>
            )}
          </div>
        ) : (
          <div className="ml-auto w-full max-w-3xl flex-1 overflow-y-auto rounded-xl border border-(--border-custom) bg-gray-50/50 p-5">
            <ReportClinicalPreview
              patient={patient}
              realizedApplications={realizedApplications}
              inductionStart={
                selectedTherapy
                  ? formatInstantDate(selectedTherapy.inductionStartDate)
                  : null
              }
              reactionsCount={reactionsCount}
              selectedSections={selectedSections}
              fileFormat={fileFormat}
              anonymized={anonymized}
            />
          </div>
        )}
      </div>

      <Modal
        open={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Confirmar exportação"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowExportModal(false)}>Cancelar</Button>
            <Button tone="brand" variant="solid" onClick={() => { setShowExportModal(false); handleExport() }}>
              Confirmar e exportar
            </Button>
          </>
        }
      >
        <div className="flex justify-center">
          <div className="h-11 w-11 rounded-full bg-brand/10 flex items-center justify-center">
            <FontAwesomeIcon icon={faShieldHalved} className="text-brand" style={{ fontSize: 20 }} />
          </div>
        </div>
        <p className="text-[0.7rem] text-(--text-muted) text-center leading-relaxed">
          Os dados exportados vêm dos registros persistidos no momento da geração.
          Este relatório local não registra um recibo de auditoria do download.
        </p>
        <div className="bg-gray-50 border border-(--border-custom) rounded-lg px-3.5 py-2.5 space-y-1.5">
          <ConfirmRow label="Paciente" value={anonymized ? maskName(patient.name, true) : patient.name} />
          <ConfirmRow label="Formato" value={fileFormat.toUpperCase()} />
          <ConfirmRow label="Identificadores mascarados" value={anonymized ? 'Sim' : 'Não'} accent={anonymized ? 'brand' : 'warning'} />
          <ConfirmRow label="Justificativa" value={justification} truncate />
        </div>
      </Modal>
    </div>
  )
}

function ConfirmRow({ label, value, accent, truncate }: { label: string; value: string; accent?: 'brand' | 'warning'; truncate?: boolean }) {
  const accentClass = accent === 'brand' ? 'text-brand' : accent === 'warning' ? 'text-amber-600' : 'text-(--text)'
  return (
    <div className="flex justify-between">
      <span className="text-[0.6rem] text-(--text-muted)">{label}</span>
      <span className={`text-[0.6rem] font-semibold ${accentClass} ${truncate ? 'text-right max-w-[60%] truncate' : ''}`}>{value}</span>
    </div>
  )
}
