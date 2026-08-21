import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useHasPermission } from '@/shared/stores/useUserStore'
import { useDashboardAnalytics } from '@/features/dashboard/hooks/useDashboardAnalytics'
import { ExportConfigPanel, type ChartOption } from '@/features/dashboard/components/export/ConfigPanel'
import { ExportPreview } from '@/features/dashboard/components/export/preview'
import { ConfirmExportModal } from '@/features/dashboard/components/export/ConfirmExportModal'
import { CancelExportModal } from '@/features/dashboard/components/export/CancelExportModal'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'

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
  const [fileName, setFileName] = useState('relatorio-allervia')
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

  void fileName 

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden pt-0 pb-5">
      <div className="mb-6">
        <h1 className="text-3xl font-medium text-(--text)">Exportar Relatório</h1>
        <button
          type="button"
          onClick={() => setShowCancelModal(true)}
          className="mt-1.5 inline-flex items-center gap-1 text-sm font-medium text-(--text-muted) hover:text-(--text) transition-colors cursor-pointer"
        >
          <FontAwesomeIcon icon={faChevronLeft} style={{ fontSize: 15 }} />
          Painel de Métricas
        </button>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden gap-4">
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
