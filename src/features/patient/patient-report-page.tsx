import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button, Modal } from '@/shared/components'
import { getPatient, listDosesForTherapy } from '@/shared/api/clinical.api'
import { ApiError } from '@/shared/api/contracts/errors'
import { queryKeys } from '@/shared/api/query-keys'
import { useSession } from '@/shared/auth/useSession'
import {
  buildLegacyPatient,
  doseToLegacyApplication,
} from '@/features/patient/adapters/clinical-presentation'
import { useHasPermission } from '@/shared/stores/useUserStore'
import {
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

const DEFAULT_SECTIONS: ReportSectionId[] = ['personal', 'immunotherapy', 'applications', 'progress']

/**
 * Relatório individual sobre os registros persistidos: paciente, tratamento e
 * doses vêm do servidor no momento da geração — nada sai de stores locais.
 */
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

  const patient = useMemo(
    () => (detail ? buildLegacyPatient(detail, selectedTherapy) : null),
    [detail, selectedTherapy],
  )

  const realizedApplications = useMemo(
    () =>
      (dosesQuery.data ?? [])
        .filter((dose) => dose.administeredAt !== null)
        .sort((a, b) => (b.administeredAt ?? '').localeCompare(a.administeredAt ?? ''))
        .map((dose) =>
          doseToLegacyApplication(dose, detail?.id ?? '', {
            hasReaction: dose.immediateConduct !== null,
          }),
        ),
    [dosesQuery.data, detail],
  )
  // Reação = conduta imediata registrada junto da aplicação (fato persistido).
  const reactionsCount = useMemo(
    () =>
      (dosesQuery.data ?? []).filter(
        (dose) => dose.administeredAt !== null && dose.immediateConduct !== null,
      ).length,
    [dosesQuery.data],
  )

  const toggleSection = (id: ReportSectionId) => {
    setSelectedSections((previous) => (previous.includes(id) ? previous.filter((sectionId) => sectionId !== id) : [...previous, id]))
  }

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

  const buildExportData = (): ReportData => {
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
      sections: selectedSections,
      realizedApplications,
      reactionsCount,
      generatedAt: format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }),
      anonymized,
    }
  }

  const handleExport = () => {
    const data = buildExportData()
    if (fileFormat === 'csv') exportCsv(data)
    else exportPdf(data)
  }

  const exportDisabled = !consented || !justification.trim() || dosesQuery.isPending

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden pt-0">
      <PageHeader
        breadcrumb={['Prontuário', patient.name]}
        title="Emitir Relatório"
        actions={
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1.5">
            <Pill
              icon={faPrint}
              onClick={() => !exportDisabled && exportPdf(buildExportData())}
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
          patientStatus={patient.status}
        />

        <div className="flex-1 overflow-y-auto p-5 bg-gray-50/50 rounded-2xl border border-(--border-custom)">
          <ReportClinicalPreview
            patient={patient}
            realizedApplications={realizedApplications}
            reactionsCount={reactionsCount}
            selectedSections={selectedSections}
            fileFormat={fileFormat}
            anonymized={anonymized}
          />
        </div>
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
          O registro oficial de exportações do conjunto clínico é feito pelo servidor.
        </p>
        <div className="bg-gray-50 border border-(--border-custom) rounded-lg px-3.5 py-2.5 space-y-1.5">
          <ConfirmRow label="Paciente" value={anonymized ? maskName(patient.name, true) : patient.name} />
          <ConfirmRow label="Formato" value={fileFormat.toUpperCase()} />
          <ConfirmRow label="Dados anonimizados" value={anonymized ? 'Sim' : 'Não'} accent={anonymized ? 'brand' : 'warning'} />
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
