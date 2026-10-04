import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { cn } from '@/shared/lib/cn'
import { SegmentedControl, TextArea } from '@/shared/components'
import type {
  ReportFileFormat,
  ReportSectionId,
} from '@/features/patient/exporters/types'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileArrowDown, faFileLines } from '@fortawesome/free-solid-svg-icons'

const REPORT_FORMATS: { id: ReportFileFormat; label: string; icon: IconDefinition }[] = [
  { id: 'pdf', label: 'PDF', icon: faFileLines },
  { id: 'csv', label: 'CSV', icon: faFileArrowDown },
]

const REPORT_SECTIONS: { id: ReportSectionId; label: string }[] = [
  { id: 'personal', label: 'Dados Pessoais' },
  { id: 'immunotherapy', label: 'Dados da Imunoterapia' },
  { id: 'applications', label: 'Histórico de Aplicações' },
  { id: 'reactions', label: 'Reações Adversas' },
  { id: 'progress', label: 'Progressão do Protocolo' },
  { id: 'adjustments', label: 'Ajustes de Protocolo' },
  { id: 'inactivations', label: 'Histórico de Inativações' },
]

interface ReportConfigPanelProps {
  fileFormat: ReportFileFormat
  setFileFormat: (format: ReportFileFormat) => void
  selectedSections: ReportSectionId[]
  toggleSection: (id: ReportSectionId) => void
  anonymized: boolean
  setAnonymized: (value: boolean) => void
  consented: boolean
  setConsented: (value: boolean) => void
  justification: string
  setJustification: (value: string) => void
  realizedApplicationsCount: number
  reactionsCount: number
  intervalDays: number
  patientStatus: 'active' | 'inactive'
}

export function ReportConfigPanel({
  fileFormat,
  setFileFormat,
  selectedSections,
  toggleSection,
  anonymized,
  setAnonymized,
  consented,
  setConsented,
  justification,
  setJustification,
  realizedApplicationsCount,
  reactionsCount,
  intervalDays,
  patientStatus,
}: ReportConfigPanelProps) {
  return (
    <div className="w-[34rem] min-w-[18rem] max-w-[45%] shrink border-r border-(--border-custom) px-5 pt-0 pb-5 overflow-y-auto space-y-5">
      <div className="space-y-2">
        <span className="block text-xs font-bold" style={{ color: '#12333a' }}>Resumo</span>
        <div className="space-y-1.5 text-[0.78rem] text-(--text-muted)">
          <Row label="Aplicações realizadas" value={String(realizedApplicationsCount)} />
          <Row label="Reações adversas" value={String(reactionsCount)} />
          <Row label="Intervalo atual" value={`${intervalDays} dias`} />
          <Row
            label="Status"
            value={patientStatus === 'active' ? 'Ativo' : 'Inativo'}
            valueClass={patientStatus === 'active' ? 'text-green-600' : 'text-(--text-muted)'}
          />
        </div>
      </div>

      <div>
        <span className="text-xs font-semibold text-(--text-muted) mb-2 block">Formato</span>
        <SegmentedControl
          value={fileFormat}
          onChange={setFileFormat}
          options={REPORT_FORMATS.map((format) => {
            const Icon = format.icon
            return { value: format.id, label: format.label, icon: <FontAwesomeIcon icon={Icon} style={{ fontSize: 13 }} /> }
          })}
          fullWidth
          aria-label="Formato do relatório"
          className="bg-white"
        />
      </div>

      <div>
        <span className="text-xs font-semibold text-(--text-muted) mb-2 block">Seções incluídas</span>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          {REPORT_SECTIONS.map((section) => (
            <label
              key={section.id}
              className="flex items-center gap-2 text-[0.7rem] text-(--text) cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedSections.includes(section.id)}
                onChange={() => toggleSection(section.id)}
              />
              {section.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <span className="text-xs font-semibold text-(--text-muted) mb-2 block">Privacidade e LGPD</span>
        <div className="grid grid-cols-2 gap-2">
          <ConsentCheckbox
            checked={anonymized}
            onChange={() => setAnonymized(!anonymized)}
            title="Anonimizar dados pessoais"
            description="Nome, CPF e telefone serão mascarados"
          />
          <ConsentCheckbox
            checked={consented}
            onChange={() => setConsented(!consented)}
            title="Declaro ciência da LGPD"
            description="Responsabilizo-me pelo uso dos dados"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">
          Justificativa <span className="text-red-400">*</span>
        </label>
        <TextArea
          rows={2}
          placeholder="Ex: Acompanhamento clínico do paciente"
          value={justification}
          onChange={(event) => setJustification(event.target.value)}
        />
      </div>

    </div>
  )
}

function Row({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span className={cn('font-semibold text-(--text)', valueClass)}>{value}</span>
    </div>
  )
}

function ConsentCheckbox({
  checked,
  onChange,
  title,
  description,
}: {
  checked: boolean
  onChange: () => void
  title: string
  description: string
}) {
  return (
    <label className="flex items-start gap-2 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={onChange} className="mt-0.5" />
      <span>
        <span className="block text-[0.72rem] text-(--text)">{title}</span>
        <span className="text-[0.66rem] leading-snug text-(--text-muted)">{description}</span>
      </span>
    </label>
  )
}
