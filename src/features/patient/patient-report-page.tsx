import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowLeft, Download, Printer, ShieldCheck } from 'lucide-react'
import { Button, IconButton, Modal } from '@/shared/components'
import { usePatientStore } from '@/features/patient/stores/patient-store'
import { buildPatientFromImmunotherapy } from '@/features/patient/data/patient-profiles'
import { useImmunotherapiesStore } from '@/features/immunotherapy/stores/immunotherapies-store'
import { useHasPermission, useDoctorFilter, useUserStore } from '@/shared/identity/user-store'
import { useAuditStore } from '@/shared/audit/audit-store'
import { comparePtDateDesc } from '@/shared/lib/dates'
import {
  exportCsv,
  exportExcel,
  exportLgpd,
  exportPdf,
  type LgpdFileFormat,
  type ReportData,
  type ReportFileFormat,
  type ReportSectionId,
} from '@/features/patient/exporters'
import { maskCpf, maskName, maskPhone } from '@/features/patient/exporters/utils'
import { ReportClinicalPreview } from '@/features/patient/components/report/report-clinical-preview'
import { ReportLgpdPreview } from '@/features/patient/components/report/report-lgpd-preview'
import { ReportConfigPanel } from '@/features/patient/components/report/report-config-panel'

const DEFAULT_SECTIONS: ReportSectionId[] = ['personal', 'immunotherapy', 'applications', 'progress']

export function PatientReportPage() {
  const navigate = useNavigate()
  const { patientId } = useSearch({ from: '/patient-report' })
  const selectedPatient = usePatientStore((s) => s.selectedPatient)
  const applications = usePatientStore((s) => s.applications)
  const immunotherapies = useImmunotherapiesStore((s) => s.immunotherapies)
  const currentUser = useUserStore((s) => s.current)

  const [fileFormat, setFileFormat] = useState<ReportFileFormat>('pdf')
  const [selectedSections, setSelectedSections] = useState<ReportSectionId[]>(DEFAULT_SECTIONS)
  const [anonymized, setAnonymized] = useState(false)
  const [consentimento, setConsentimento] = useState(false)
  const [justificativa, setJustificativa] = useState('')
  const [showExportModal, setShowExportModal] = useState(false)
  const [reportMode, setReportMode] = useState<'clinico' | 'lgpd'>('clinico')
  const [lgpdFormat, setLgpdFormat] = useState<LgpdFileFormat>('json')
  const canLgpdPortability = useHasPermission('lgpd_portability')
  const canEmitReport = useHasPermission('emit_report')
  const doctorFilter = useDoctorFilter()

  useEffect(() => {
    if (!canEmitReport) navigate({ to: '/immunotherapies' })
  }, [canEmitReport, navigate])

  useEffect(() => {
    if (!canLgpdPortability && reportMode === 'lgpd') setReportMode('clinico')
  }, [canLgpdPortability, reportMode])

  useEffect(() => {
    if (!doctorFilter) return
    const targetId = selectedPatient?.id ?? patientId
    if (!targetId) return
    const patientDoctor = selectedPatient?.responsibleDoctor
      ?? immunotherapies.find((i) => i.id === targetId)?.responsibleDoctor
    if (patientDoctor && patientDoctor !== doctorFilter) navigate({ to: '/immunotherapies' })
  }, [doctorFilter, selectedPatient, patientId, immunotherapies, navigate])

  const patient = useMemo(() => {
    if (selectedPatient) return selectedPatient
    if (!patientId) return null
    const imm = immunotherapies.find((i) => i.id === patientId)
    return imm ? buildPatientFromImmunotherapy(imm) : null
  }, [selectedPatient, patientId, immunotherapies])

  const patientApps = useMemo(() => {
    if (!patient) return []
    return applications
      .filter((a) => a.patientId === patient.id)
      .sort((a, b) => comparePtDateDesc(a.date, b.date))
  }, [patient, applications])

  const realizedApps = useMemo(() => patientApps.filter((a) => a.status === 'completed'), [patientApps])
  const reactionsCount = realizedApps.filter((a) => a.sideEffect === 'yes').length

  const auditLogs = useAuditStore((s) => s.logs)
  const patientAccessLog = useMemo(() => {
    if (!patient) return []
    return auditLogs
      .filter((l) => l.patientId === patient.id)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }, [auditLogs, patient])

  const toggleSection = (id: ReportSectionId) => {
    setSelectedSections((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]))
  }

  if (!patient) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <span className="text-xs text-(--text-muted)">Paciente não encontrado</span>
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
      realizedApps,
      reactionsCount,
      generatedAt: format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }),
      anonymized,
    }
  }

  const handleExport = () => {
    const data = buildExportData()
    if (fileFormat === 'csv') exportCsv(data)
    else if (fileFormat === 'excel') exportExcel(data)
    else exportPdf(data)
  }

  const handleExportLgpd = () => {
    exportLgpd(
      {
        patient,
        applications: patientApps,
        accessLogs: patientAccessLog,
        exportedAt: new Date().toISOString(),
        exportedBy: `${currentUser.name} (${currentUser.registration})`,
        justification: justificativa.trim(),
      },
      lgpdFormat,
    )
  }

  const exportDisabled = !consentimento || !justificativa.trim()

  return (
    <div className="flex flex-1 flex-col bg-gray-50/80 min-h-0 overflow-hidden">
      <div className="flex flex-1 min-h-0 flex-col rounded-xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden m-4">
        <div className="border-b border-(--border-custom) px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <IconButton aria-label="Voltar para o prontuário" to="/patient/$patientId" params={{ patientId: patient.id }}>
              <ArrowLeft size={16} />
            </IconButton>
            <div>
              <h1 className="text-lg font-bold text-(--text)">Emitir Relatório</h1>
              <p className="text-[0.65rem] text-(--text-muted)">{patient.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Printer size={13} />}
              disabled={exportDisabled}
              onClick={() => exportPdf(buildExportData())}
            >
              Imprimir
            </Button>
            <Button
              tone="brand"
              variant="solid"
              size="sm"
              leftIcon={<Download size={13} />}
              disabled={exportDisabled}
              onClick={() => setShowExportModal(true)}
            >
              Exportar {fileFormat.toUpperCase()}
            </Button>
          </div>
        </div>

        <div className="flex flex-1 min-h-0 overflow-hidden">
          <ReportConfigPanel
            reportMode={reportMode}
            setReportMode={setReportMode}
            canLgpdPortability={canLgpdPortability}
            fileFormat={fileFormat}
            setFileFormat={setFileFormat}
            selectedSections={selectedSections}
            toggleSection={toggleSection}
            anonymized={anonymized}
            setAnonymized={setAnonymized}
            consentimento={consentimento}
            setConsentimento={setConsentimento}
            justificativa={justificativa}
            setJustificativa={setJustificativa}
            realizedAppsCount={realizedApps.length}
            reactionsCount={reactionsCount}
            intervalDays={patient.currentInterval}
            patientStatus={patient.status}
            lgpdFormat={lgpdFormat}
            setLgpdFormat={setLgpdFormat}
            lgpdDataItems={[
              { label: 'Dados cadastrais', count: 1 },
              { label: 'Dados da imunoterapia', count: 1 },
              { label: 'Aplicações', count: patientApps.length },
              { label: 'Acessos ao prontuário', count: patientAccessLog.length },
              { label: 'Ajustes de protocolo', count: patient.protocolAdjustments?.length ?? 0 },
              { label: 'Inativações', count: patient.inactivations?.length ?? 0 },
            ]}
            onExportLgpd={handleExportLgpd}
          />

          <div className="flex-1 overflow-y-auto p-5 bg-gray-50/50">
            {reportMode === 'lgpd' ? (
              <ReportLgpdPreview
                patient={patient}
                applications={patientApps}
                accessLogs={patientAccessLog}
                lgpdFormat={lgpdFormat}
                anonymized={anonymized}
              />
            ) : (
              <ReportClinicalPreview
                patient={patient}
                realizedApps={realizedApps}
                reactionsCount={reactionsCount}
                selectedSections={selectedSections}
                fileFormat={fileFormat}
                anonymized={anonymized}
              />
            )}
          </div>
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
            <ShieldCheck size={20} className="text-brand" />
          </div>
        </div>
        <p className="text-[0.7rem] text-(--text-muted) text-center leading-relaxed">
          Esta ação será registrada no log de auditoria do sistema conforme exigências da LGPD.
        </p>
        <div className="bg-gray-50 border border-(--border-custom) rounded-lg px-3.5 py-2.5 space-y-1.5">
          <ConfirmRow label="Paciente" value={anonymized ? maskName(patient.name, true) : patient.name} />
          <ConfirmRow label="Formato" value={fileFormat.toUpperCase()} />
          <ConfirmRow label="Dados anonimizados" value={anonymized ? 'Sim' : 'Não'} accent={anonymized ? 'brand' : 'warning'} />
          <ConfirmRow label="Justificativa" value={justificativa} truncate />
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
