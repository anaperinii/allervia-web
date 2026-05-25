import { useEffect, useMemo, useState } from 'react'
import { Check, CheckSquare, Download, FileJson, FileSpreadsheet, Info } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button, ConfirmDiscardModal, Modal, SegmentedControl, TextArea } from '@/shared/components'
import { usePatientStore } from '@/features/patient/stores/patient-store'
import { useAuditStore } from '@/shared/audit/audit-store'
import { useUserStore } from '@/shared/identity/user-store'
import { useUnsavedChangesGuard } from '@/shared/hooks/use-unsaved-changes-guard'
import { exportLgpd, type LgpdFileFormat } from '@/features/patient/exporters'
import type { Patient } from '@/features/patient/stores/patient-store'

interface PortabilityModalProps {
  open: boolean
  patient: Patient
  onClose: () => void
}

export function PortabilityModal({ open, patient, onClose }: PortabilityModalProps) {
  const applications = usePatientStore((s) => s.applications)
  const auditLogs = useAuditStore((s) => s.logs)
  const currentUser = useUserStore((s) => s.current)

  const [lgpdFormat, setLgpdFormat] = useState<LgpdFileFormat>('json')
  const [justification, setJustification] = useState('')
  const [consented, setConsented] = useState(false)

  useEffect(() => {
    if (open) {
      setLgpdFormat('json')
      setJustification('')
      setConsented(false)
    }
  }, [open])

  const isDirty = !!justification.trim() || consented
  const { requestClose, guardOpen, cancelDiscard, confirmDiscard } = useUnsavedChangesGuard({
    open,
    isDirty,
    onClose,
  })

  const patientApplications = useMemo(
    () => applications.filter((application) => application.patientId === patient.id),
    [applications, patient.id],
  )
  const patientAccessLog = useMemo(
    () => auditLogs.filter((log) => log.patientId === patient.id),
    [auditLogs, patient.id],
  )

  const dataItems = [
    { label: 'Dados cadastrais', count: 1 },
    { label: 'Dados da imunoterapia', count: 1 },
    { label: 'Aplicações', count: patientApplications.length },
    { label: 'Acessos ao prontuário', count: patientAccessLog.length },
    { label: 'Ajustes de protocolo', count: patient.protocolAdjustments?.length ?? 0 },
    { label: 'Inativações', count: patient.inactivations?.length ?? 0 },
  ]

  const exportDisabled = !consented || !justification.trim()

  const handleExport = () => {
    exportLgpd(
      {
        patient,
        applications: patientApplications,
        accessLogs: patientAccessLog,
        exportedAt: new Date().toISOString(),
        exportedBy: `${currentUser.name} (${currentUser.registration})`,
        justification: justification.trim(),
      },
      lgpdFormat,
    )
    onClose()
  }

  return (
    <>
    <Modal
      open={open}
      onClose={requestClose}
      title="Portabilidade LGPD"
      size="lg"
      footer={
        <Button
          tone="brand"
          variant="solid"
          leftIcon={<Download size={13} />}
          disabled={exportDisabled}
          onClick={handleExport}
        >
          Exportar {lgpdFormat.toUpperCase()}
        </Button>
      }
    >
      <div className="flex items-start gap-2 bg-teal-50 border border-teal-200 rounded-lg px-3 py-2.5">
        <Info size={14} className="text-brand shrink-0 mt-0.5" />
        <p className="text-[0.65rem] text-teal-800 leading-relaxed">
          Exportação estruturada de todos os dados em atendimento ao <span className="font-bold">Art. 18, V da LGPD</span> (Direito à portabilidade). A ação será registrada no log de auditoria.
        </p>
      </div>

      <div>
        <span className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Formato</span>
        <SegmentedControl
          value={lgpdFormat}
          onChange={setLgpdFormat}
          fullWidth
          options={[
            { value: 'json', label: 'JSON', icon: <FileJson size={13} /> },
            { value: 'csv', label: 'CSV', icon: <FileSpreadsheet size={13} /> },
          ]}
          aria-label="Formato do pacote LGPD"
        />
      </div>

      <div>
        <span className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Dados incluídos</span>
        <div className="grid grid-cols-2 gap-1.5">
          {dataItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between gap-1.5 text-[0.65rem] text-(--text) bg-teal-50/50 border border-teal-100 rounded px-2 py-1"
            >
              <span className="flex items-center gap-1.5 min-w-0">
                <CheckSquare size={10} className="text-brand shrink-0" />
                <span className="truncate">{item.label}</span>
              </span>
              <span className="text-(--text-muted) font-semibold shrink-0">{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">
          Motivo da solicitação <span className="text-red-400">*</span>
        </label>
        <TextArea
          rows={2}
          placeholder="Ex: Solicitação formal do paciente"
          value={justification}
          onChange={(event) => setJustification(event.target.value)}
        />
      </div>

      <button
        type="button"
        aria-pressed={consented}
        onClick={() => setConsented(!consented)}
        className={cn(
          'flex w-full items-center gap-2.5 rounded-lg border p-2.5 text-left transition-all cursor-pointer',
          consented ? 'border-brand bg-brand/5' : 'border-(--border-custom) hover:border-brand/40',
        )}
      >
        <div className={cn('flex h-4 w-4 items-center justify-center rounded border transition-all shrink-0 mt-px', consented ? 'bg-brand border-brand' : 'border-gray-300')}>
          {consented && <Check size={10} className="text-white" />}
        </div>
        <div>
          <span className="text-[0.7rem] font-medium text-(--text) block">Declaro ciência dos termos LGPD</span>
          <span className="text-[0.55rem] text-(--text-muted)">Confirmo que há solicitação formal do titular.</span>
        </div>
      </button>
    </Modal>

    <ConfirmDiscardModal
      open={guardOpen}
      onCancel={cancelDiscard}
      onConfirm={confirmDiscard}
    />
    </>
  )
}
