import { FieldLabel, SegmentedControl, TextInput, Select, ToggleCard } from '@/shared/components'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileArrowDown, faFileExcel, faFileLines } from '@fortawesome/free-solid-svg-icons'

const FORMAT_OPTIONS = [
  { value: 'pdf', label: 'PDF', icon: <FontAwesomeIcon icon={faFileLines} style={{ fontSize: 13 }} /> },
  { value: 'excel', label: 'Excel', icon: <FontAwesomeIcon icon={faFileExcel} style={{ fontSize: 13 }} /> },
  { value: 'csv', label: 'CSV', icon: <FontAwesomeIcon icon={faFileArrowDown} style={{ fontSize: 13 }} /> },
]

const INTERVALS = ['Este Mês', 'Este Trimestre', 'Este Semestre', 'Este Ano', 'Personalizado'] as const

const MONTH_OPTIONS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
const YEAR_OPTIONS = ['2024', '2025', '2026']

export interface ChartOption {
  id: string
  label: string
}

interface ExportConfigPanelProps {
  modality: 'sub' | 'sbl'
  onModalityChange: (modality: 'sub' | 'sbl') => void
  fileName: string
  onFileNameChange: (value: string) => void
  format: string
  onFormatChange: (value: string) => void
  interval: string
  onIntervalChange: (value: string) => void
  monthFilter: string
  onMonthFilterChange: (value: string) => void
  yearFilter: string
  onYearFilterChange: (value: string) => void
  startDate: string
  onStartDateChange: (value: string) => void
  endDate: string
  onEndDateChange: (value: string) => void
  chartOptions: readonly ChartOption[]
  selectedCharts: string[]
  onToggleChart: (id: string) => void
  anonymize: boolean
  onAnonymizeChange: (value: boolean) => void
  consent: boolean
  onConsentChange: (value: boolean) => void
  justification: string
  onJustificationChange: (value: string) => void
  onExport: () => void
}

export function ExportConfigPanel(props: ExportConfigPanelProps) {

  return (
    <div className="w-88 shrink-0 border-r border-(--border-custom) overflow-y-auto">
      <div className="flex items-center justify-between px-5 pt-5 pb-3 gap-2">
        <SegmentedControl
          value={props.modality}
          onChange={props.onModalityChange}
          options={[
            { value: 'sub', label: 'Subcutânea' },
            { value: 'sbl', label: 'Sublingual' },
          ]}
          fullWidth
          aria-label="Modalidade"        />
      </div>

      <div className="px-5 pb-5 space-y-5">
        <FieldLabel label="Nome do arquivo">
          <TextInput value={props.fileName} onChange={(e) => props.onFileNameChange(e.target.value)} />
        </FieldLabel>

        <FieldLabel label="Formato">
          <SegmentedControl
            value={props.format}
            onChange={props.onFormatChange}
            options={FORMAT_OPTIONS}
            fullWidth
            aria-label="Formato do arquivo"
            className="bg-white"
          />
        </FieldLabel>

        <FieldLabel label="Período">
          <div className="mb-2">
            <Select value={props.interval} onChange={(e) => props.onIntervalChange(e.target.value)}>
              {INTERVALS.map((interval) => (
                <option key={interval}>{interval}</option>
              ))}
            </Select>
          </div>
          {props.interval === 'Personalizado' ? (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[0.6rem] text-(--text-muted) mb-1 block">Data início</label>
                <TextInput type="date" value={props.startDate} onChange={(e) => props.onStartDateChange(e.target.value)} />
              </div>
              <div>
                <label className="text-[0.6rem] text-(--text-muted) mb-1 block">Data fim</label>
                <TextInput type="date" value={props.endDate} onChange={(e) => props.onEndDateChange(e.target.value)} />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Select value={props.monthFilter} onChange={(e) => props.onMonthFilterChange(e.target.value)}>
                <option value="all">Mês</option>
                {MONTH_OPTIONS.map((month) => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </Select>
              <Select value={props.yearFilter} onChange={(e) => props.onYearFilterChange(e.target.value)}>
                {YEAR_OPTIONS.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </Select>
            </div>
          )}
        </FieldLabel>

        <div>
          <label className="text-xs font-semibold text-(--text-muted) mb-2 block">Gráficos incluídos</label>
          <div className="space-y-1.5">
            {props.chartOptions.map((option) => (
              <ToggleCard
                key={option.id}
                label={option.label}
                selected={props.selectedCharts.includes(option.id)}
                onToggle={() => props.onToggleChart(option.id)}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-(--text-muted) mb-2 block">Privacidade e LGPD</label>
          <div className="space-y-2">
            <ToggleCard
              label="Anonimizar dados pessoais"
              description="Nomes, CPFs e telefones serão mascarados"
              selected={props.anonymize}
              onToggle={() => props.onAnonymizeChange(!props.anonymize)}
            />
            <ToggleCard
              label="Declaro ciência da LGPD"
              description="Responsabilizo-me pelo uso dos dados exportados"
              selected={props.consent}
              onToggle={() => props.onConsentChange(!props.consent)}
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">
            Justificativa da exportação <span className="text-red-400">*</span>
          </label>
          <textarea
            rows={2}
            placeholder="Ex: Relatório para acompanhamento clínico do paciente"
            value={props.justification}
            onChange={(e) => props.onJustificationChange(e.target.value)}
            className="w-full rounded-2xl border border-[#DDE6E6] bg-white px-4 py-2.5 text-xs placeholder:text-(--text-muted)/60 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#257E8C]/35 focus:border-[#257E8C] transition-all resize-none"
          />
        </div>

      </div>
    </div>
  )
}
