import {
  Check,
  CheckSquare,
  Download,
  FileDown,
  FileJson,
  FileSpreadsheet,
  FileText,
  Info,
} from 'lucide-react'
import type { ComponentType } from 'react'
import { cn } from '@/shared/lib/utils'
import { Button, SegmentedControl, TextArea } from '@/shared/components'
import type {
  LgpdFileFormat,
  ReportFileFormat,
  ReportSectionId,
} from '@/features/patient/exporters/types'

const REPORT_FORMATS: { id: ReportFileFormat; label: string; icon: ComponentType<{ size?: number }> }[] = [
  { id: 'pdf', label: 'PDF', icon: FileText },
  { id: 'excel', label: 'Excel', icon: FileSpreadsheet },
  { id: 'csv', label: 'CSV', icon: FileDown },
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
  reportMode: 'clinico' | 'lgpd'
  setReportMode: (m: 'clinico' | 'lgpd') => void
  canLgpdPortability: boolean
  fileFormat: ReportFileFormat
  setFileFormat: (f: ReportFileFormat) => void
  selectedSections: ReportSectionId[]
  toggleSection: (id: ReportSectionId) => void
  anonymized: boolean
  setAnonymized: (v: boolean) => void
  consentimento: boolean
  setConsentimento: (v: boolean) => void
  justificativa: string
  setJustificativa: (v: string) => void
  realizedAppsCount: number
  reactionsCount: number
  intervalDays: number
  patientStatus: 'active' | 'inactive'
  lgpdFormat: LgpdFileFormat
  setLgpdFormat: (f: LgpdFileFormat) => void
  lgpdDataItems: { label: string; count: number }[]
  onExportLgpd: () => void
}

export function ReportConfigPanel({
  reportMode,
  setReportMode,
  canLgpdPortability,
  fileFormat,
  setFileFormat,
  selectedSections,
  toggleSection,
  anonymized,
  setAnonymized,
  consentimento,
  setConsentimento,
  justificativa,
  setJustificativa,
  realizedAppsCount,
  reactionsCount,
  intervalDays,
  patientStatus,
  lgpdFormat,
  setLgpdFormat,
  lgpdDataItems,
  onExportLgpd,
}: ReportConfigPanelProps) {
  return (
    <div className="w-72 shrink-0 border-r border-(--border-custom) p-5 overflow-y-auto space-y-5">
      {canLgpdPortability && (
        <SegmentedControl
          value={reportMode}
          onChange={setReportMode}
          fullWidth
          options={[
            { value: 'clinico', label: 'Clínico' },
            { value: 'lgpd', label: 'Portabilidade' },
          ]}
          aria-label="Modo do relatório"
        />
      )}

      {reportMode === 'lgpd' ? (
        <>
          <div className="flex items-start gap-2 bg-brand/5 border border-brand/20 rounded-lg px-3 py-2.5">
            <Info size={14} className="text-brand shrink-0 mt-0.5" />
            <p className="text-[0.6rem] text-(--text) leading-relaxed">
              Exportação estruturada de todos os dados em atendimento ao <span className="font-bold">Art. 18, V da LGPD</span> (Direito à portabilidade).
            </p>
          </div>
          <div>
            <span className="text-xs font-semibold text-(--text-muted) mb-2 block">Formato</span>
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
            <span className="text-xs font-semibold text-(--text-muted) mb-2 block">Dados incluídos</span>
            <div className="space-y-1.5">
              {lgpdDataItems.map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-1.5 text-[0.6rem] text-(--text) bg-teal-50/50 border border-teal-100 rounded px-2 py-1">
                  <span className="flex items-center gap-1.5">
                    <CheckSquare size={10} className="text-brand shrink-0" />
                    {item.label}
                  </span>
                  <span className="text-(--text-muted) font-semibold">{item.count}</span>
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
              value={justificativa}
              onChange={(e) => setJustificativa(e.target.value)}
            />
          </div>
          <ConsentCheckbox
            checked={consentimento}
            onChange={() => setConsentimento(!consentimento)}
            title="Declaro ciência dos termos LGPD"
            description="Confirmo que há solicitação formal do titular."
          />
          <Button
            tone="brand"
            variant="solid"
            fullWidth
            leftIcon={<Download size={13} />}
            disabled={!consentimento || !justificativa.trim()}
            onClick={onExportLgpd}
          >
            Exportar {lgpdFormat.toUpperCase()}
          </Button>
        </>
      ) : (
        <>
          <div>
            <span className="text-xs font-semibold text-(--text-muted) mb-2 block">Formato</span>
            <div className="flex gap-2" role="radiogroup" aria-label="Formato do relatório">
              {REPORT_FORMATS.map((f) => {
                const Icon = f.icon
                const selected = fileFormat === f.id
                return (
                  <button
                    key={f.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setFileFormat(f.id)}
                    className={cn(
                      'flex-1 h-9 rounded-lg border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer',
                      selected ? 'border-brand bg-brand-50 text-brand-dark' : 'border-(--border-custom) text-(--text-muted) hover:border-brand/50',
                    )}
                  >
                    <Icon size={13} />
                    {f.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-(--text-muted) mb-2 block">Seções incluídas</span>
            <div className="space-y-1.5">
              {REPORT_SECTIONS.map((s) => {
                const selected = selectedSections.includes(s.id)
                return (
                  <button
                    key={s.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleSection(s.id)}
                    className={cn(
                      'flex w-full items-center gap-2.5 rounded-lg border p-2.5 text-left transition-all cursor-pointer',
                      selected ? 'border-brand bg-brand-50/50' : 'border-(--border-custom) hover:border-brand/50',
                    )}
                  >
                    <div className={cn('flex h-4 w-4 items-center justify-center rounded border transition-all shrink-0', selected ? 'bg-brand border-brand' : 'border-gray-300')}>
                      {selected && <Check size={10} className="text-white" />}
                    </div>
                    <span className="text-[0.7rem] font-medium text-(--text)">{s.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <div className="text-[0.6rem] font-bold text-(--text-muted) uppercase tracking-wider">Resumo</div>
            <div className="text-[0.65rem] text-(--text-muted) space-y-1">
              <Row label="Aplicações realizadas" value={String(realizedAppsCount)} />
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
            <span className="text-xs font-semibold text-(--text-muted) mb-2 block">Privacidade e LGPD</span>
            <div className="space-y-2">
              <ConsentCheckbox
                checked={anonymized}
                onChange={() => setAnonymized(!anonymized)}
                title="Anonimizar dados pessoais"
                description="Nome, CPF e telefone serão mascarados"
              />
              <ConsentCheckbox
                checked={consentimento}
                onChange={() => setConsentimento(!consentimento)}
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
              value={justificativa}
              onChange={(e) => setJustificativa(e.target.value)}
            />
          </div>

          {!consentimento && (
            <p className="text-[0.55rem] text-amber-600 text-center">Aceite a declaração LGPD para habilitar a exportação</p>
          )}
        </>
      )}
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
    <button
      type="button"
      aria-pressed={checked}
      onClick={onChange}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-lg border p-2.5 text-left transition-all cursor-pointer',
        checked ? 'border-brand bg-brand/5' : 'border-(--border-custom) hover:border-brand/40',
      )}
    >
      <div className={cn('flex h-4 w-4 items-center justify-center rounded border transition-all shrink-0 mt-px', checked ? 'bg-brand border-brand' : 'border-gray-300')}>
        {checked && <Check size={10} className="text-white" />}
      </div>
      <div>
        <span className="text-[0.7rem] font-medium text-(--text) block">{title}</span>
        <span className="text-[0.55rem] text-(--text-muted)">{description}</span>
      </div>
    </button>
  )
}
