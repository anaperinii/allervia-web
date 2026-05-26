import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { IconButton } from '@/shared/components'
import { useHasPermission } from '@/shared/identity/user-store'
import { useDashboardAnalytics } from '@/features/dashboard/hooks/use-dashboard-analytics'
import { ExportConfigPanel, type ChartOption } from '@/features/dashboard/components/export/config-panel'
import { ExportPreview } from '@/features/dashboard/components/export/preview'
import { ConfirmExportModal } from '@/features/dashboard/components/export/confirm-export-modal'
import { CancelExportModal } from '@/features/dashboard/components/export/cancel-export-modal'

const CHART_OPTIONS: readonly ChartOption[] = [
  { id: 'concentration', label: 'Ciclos de Tratamento por Concentração' },
  { id: 'phases', label: 'Distribuição de Fases' },
  { id: 'status', label: 'Status de Imunoterapias' },
  { id: 'types', label: 'Imunoterapias Ativas por Tipo' },
  { id: 'volume', label: 'Volume vs Concentração' },
]

export function ExportReportPage() {
  const navigate = useNavigate()
  const canViewDashboard = useHasPermission('view_dashboard')
  useEffect(() => {
    if (!canViewDashboard) navigate({ to: '/immunotherapies' })
  }, [canViewDashboard, navigate])

  const [modality, setModality] = useState<'sub' | 'sbl'>('sub')
  const [fileName, setFileName] = useState('relatorio-imunecare')
  const [format, setFormat] = useState('pdf')
  const [interval, setInterval] = useState<string>('Este Mês')
  const [monthFilter, setMonthFilter] = useState('all')
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString())
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedCharts, setSelectedCharts] = useState<string[]>(['concentration', 'phases', 'status'])
  const [anonymize, setAnonymize] = useState(false)
  const [consent, setConsent] = useState(false)
  const [justification, setJustification] = useState('')
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)

  const analytics = useDashboardAnalytics({
    modality: modality === 'sub' ? 'subcutaneous' : 'sublingual',
  })

  const toggleChart = (id: string) => {
    setSelectedCharts((prev) => (prev.includes(id) ? prev.filter((chartId) => chartId !== id) : [...prev, id]))
  }

  void fileName // TODO: pass through to actual file generator once wired

  return (
    <div className="flex flex-1 flex-col bg-gray-50/80 min-h-0 overflow-hidden">
      <div className="flex flex-1 min-h-0 flex-col rounded-xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden m-4">
        <div className="border-b border-(--border-custom) px-5 py-4 flex items-center gap-3">
          <IconButton aria-label="Voltar" variant="danger" onClick={() => setShowCancelModal(true)}>
            <ArrowLeft size={18} />
          </IconButton>
          <h1 className="text-2xl font-bold text-(--text)">Exportar Relatório</h1>
        </div>

        <div className="flex flex-1 min-h-0 overflow-hidden">
          <ExportConfigPanel
            modality={modality}
            onModalityChange={setModality}
            fileName={fileName}
            onFileNameChange={setFileName}
            format={format}
            onFormatChange={setFormat}
            interval={interval}
            onIntervalChange={setInterval}
            monthFilter={monthFilter}
            onMonthFilterChange={setMonthFilter}
            yearFilter={yearFilter}
            onYearFilterChange={setYearFilter}
            startDate={startDate}
            onStartDateChange={setStartDate}
            endDate={endDate}
            onEndDateChange={setEndDate}
            chartOptions={CHART_OPTIONS}
            selectedCharts={selectedCharts}
            onToggleChart={toggleChart}
            anonymize={anonymize}
            onAnonymizeChange={setAnonymize}
            consent={consent}
            onConsentChange={setConsent}
            justification={justification}
            onJustificationChange={setJustification}
            onExport={() => setShowExportModal(true)}
          />

          <ExportPreview
            modality={modality}
            interval={interval}
            monthFilter={monthFilter}
            yearFilter={yearFilter}
            startDate={startDate}
            endDate={endDate}
            anonymize={anonymize}
            selectedCharts={selectedCharts}
            chartOptions={CHART_OPTIONS}
            analytics={analytics}
          />
        </div>
      </div>

      <ConfirmExportModal
        open={showExportModal}
        format={format}
        anonymize={anonymize}
        justification={justification}
        onClose={() => setShowExportModal(false)}
        onConfirm={() => {
          setShowExportModal(false)
          navigate({ to: '/dashboard' })
        }}
      />

      <CancelExportModal
        open={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirmCancel={() => navigate({ to: '/dashboard' })}
      />
    </div>
  )
}
