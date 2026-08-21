import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button, Modal } from '@/shared/components'
import { usePatientStore } from '@/features/patient/stores/usePatientStore'
import { buildPatientFromImmunotherapy } from '@/features/patient/constants/patient-profiles'
import { useImmunotherapiesStore } from '@/features/immunotherapy/stores/useImmunotherapiesStore'
import { useHasPermission, useDoctorFilter } from '@/shared/stores/useUserStore'
import { comparePtDateDesc } from '@/shared/lib/dates'
import {
  exportCsv,
  exportExcel,
  exportPdf,
  type ReportData,
  type ReportFileFormat,
  type ReportSectionId,
} from '@/features/patient/exporters'
import { maskCpf, maskName, maskPhone } from '@/shared/lib/mask'
import { ReportClinicalPreview } from '@/features/patient/components/report/ReportClinicalPreview'
import { ReportConfigPanel } from '@/features/patient/components/report/ReportConfigPanel'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faDownload, faPrint, faShieldHalved } from '@fortawesome/free-solid-svg-icons'

const DEFAULT_SECTIONS: ReportSectionId[] = ['personal', 'immunotherapy', 'applications', 'progress']

export function PatientReportPage() {
  const navigate = useNavigate()
  const { patientId } = useSearch({ from: '/patient-report' })
  const selectedPatient = usePatientStore((s) => s.selectedPatient)
  const applications = usePatientStore((s) => s.applications)
  const immunotherapies = useImmunotherapiesStore((s) => s.immunotherapies)

  const [fileFormat, setFileFormat] = useState<ReportFileFormat>('pdf')
  const [selectedSections, setSelectedSections] = useState<ReportSectionId[]>(DEFAULT_SECTIONS)
  const [anonymized, setAnonymized] = useState(false)
  const [consented, setConsented] = useState(false)
  const [justification, setJustification] = useState('')
  const [showExportModal, setShowExportModal] = useState(false)
  const canEmitReport = useHasPermission('emit_report')
  const doctorFilter = useDoctorFilter()

  useEffect(() => {
    if (!canEmitReport) navigate({ to: '/immunotherapies' })
  }, [canEmitReport, navigate])

  useEffect(() => {
    if (!doctorFilter) return
    const targetId = selectedPatient?.id ?? patientId
    if (!targetId) return
    const patientDoctor = selectedPatient?.responsibleDoctor
      ?? immunotherapies.find((immunotherapy) => immunotherapy.id === targetId)?.responsibleDoctor
    if (patientDoctor && patientDoctor !== doctorFilter) navigate({ to: '/immunotherapies' })
  }, [doctorFilter, selectedPatient, patientId, immunotherapies, navigate])

  const patient = useMemo(() => {
    if (selectedPatient && (!patientId || selectedPatient.id === patientId)) return selectedPatient
    if (!patientId) return null
    const immunotherapy = immunotherapies.find((item) => item.id === patientId)
    return immunotherapy ? buildPatientFromImmunotherapy(immunotherapy) : null
  }, [selectedPatient, patientId, immunotherapies])

  const patientApplications = useMemo(() => {
    if (!patient) return []
    return applications
      .filter((application) => application.patientId === patient.id)
      .sort((a, b) => comparePtDateDesc(a.date, b.date))
  }, [patient, applications])

  const realizedApplications = useMemo(
    () => patientApplications.filter((application) => application.status === 'completed'),
    [patientApplications],
  )
  const reactionsCount = realizedApplications.filter((application) => application.sideEffect === 'yes').length

  const toggleSection = (id: ReportSectionId) => {
    setSelectedSections((previous) => (previous.includes(id) ? previous.filter((sectionId) => sectionId !== id) : [...previous, id]))
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
      realizedApplications,
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

  const exportDisabled = !consented || !justification.trim()

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden pt-0 pb-5">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-medium text-(--text)">Emitir Relatório</h1>
          <Link
            to="/patient/$patientId"
            params={{ patientId: patient.id }}
            className="mt-1.5 inline-flex items-center gap-1 text-sm font-medium text-(--text-muted) hover:text-(--text) transition-colors cursor-pointer no-underline"
          >
            <FontAwesomeIcon icon={faChevronLeft} style={{ fontSize: 15 }} />
            Prontuário
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<FontAwesomeIcon icon={faPrint} style={{ fontSize: 13 }} />}
            disabled={exportDisabled}
            onClick={() => exportPdf(buildExportData())}
          >
            Imprimir
          </Button>
          <Button
            tone="brand"
            variant="solid"
            size="sm"
            leftIcon={<FontAwesomeIcon icon={faDownload} style={{ fontSize: 13 }} />}
            disabled={exportDisabled}
            onClick={() => setShowExportModal(true)}
          >
            Exportar {fileFormat.toUpperCase()}
          </Button>
        </div>
      </div>

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
          intervalDays={patient.currentInterval}
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
          Esta ação será registrada no log de auditoria do sistema conforme exigências da LGPD.
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
