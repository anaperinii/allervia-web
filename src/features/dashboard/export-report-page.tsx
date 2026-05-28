import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

import { IconButton } from '@/shared/components'
import { useHasPermission } from '@/shared/stores/useUserStore'

import { useDashboardAnalytics } from '@/features/dashboard/hooks/useDashboardAnalytics'
import { useDashboardStore } from '@/features/dashboard/stores/dashboard-store'

import {
  ExportConfigPanel,
  type ChartOption,
} from '@/features/dashboard/components/export/ConfigPanel'

import { ExportPreview } from '@/features/dashboard/components/export/preview'

import { ConfirmExportModal } from '@/features/dashboard/components/export/ConfirmExportModal'
import { CancelExportModal } from '@/features/dashboard/components/export/CancelExportModal'

const CHART_OPTIONS: readonly ChartOption[] = [
  {
    id: 'concentration',
    label: 'Ciclos de Tratamento por Concentração',
  },
  {
    id: 'phases',
    label: 'Distribuição de Fases',
  },
  {
    id: 'status',
    label: 'Status de Imunoterapias',
  },
  {
    id: 'types',
    label: 'Imunoterapias Ativas por Tipo',
  },
  {
    id: 'volume',
    label: 'Volume vs Concentração',
  },
]

export function ExportReportPage() {
  const navigate = useNavigate()

  const canViewDashboard =
    useHasPermission('view_dashboard')

  useEffect(() => {
    if (!canViewDashboard) {
      navigate({ to: '/immunotherapies' })
    }
  }, [canViewDashboard, navigate])

  const dashboardModality =
    useDashboardStore((s) => s.modality)

  const dashboardArchivedCharts =
    useDashboardStore((s) => s.archivedCharts)

  const [modality, setModality] =
    useState(dashboardModality)

  const [fileName, setFileName] = useState(
    'relatorio-imunecare',
  )

  const [format, setFormat] = useState('pdf')

  const [interval, setInterval] =
    useState<string>('Este Mês')

  const [monthFilter, setMonthFilter] =
    useState('all')

  const [yearFilter, setYearFilter] = useState(
    new Date().getFullYear().toString(),
  )

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const [selectedCharts, setSelectedCharts] =
    useState<string[]>(() => {
      const visibleCharts = CHART_OPTIONS
        .map((c) => c.id)
        .filter(
          (id) =>
            !dashboardArchivedCharts.includes(id),
        )

      return visibleCharts.length > 0
        ? visibleCharts
        : ['concentration', 'phases', 'status']
    })

  const [anonymize, setAnonymize] =
    useState(false)

  const [consent, setConsent] = useState(false)

  const [justification, setJustification] =
    useState('')

  const [showCancelModal, setShowCancelModal] =
    useState(false)

  const [showExportModal, setShowExportModal] =
    useState(false)

  const analytics = useDashboardAnalytics({
    modality,
  })

  const toggleChart = (id: string) => {
    setSelectedCharts((prev) =>
      prev.includes(id)
        ? prev.filter(
            (chartId) => chartId !== id,
          )
        : [...prev, id],
    )
  }

  void fileName

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-gray-50/80">
      <div className="m-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-3 border-b border-(--border-custom) px-5 py-4">
          <IconButton
            aria-label="Voltar"
            variant="danger"
            onClick={() =>
              setShowCancelModal(true)
            }
          >
            <ArrowLeft size={18} />
          </IconButton>

          <h1 className="text-2xl font-bold text-(--text)">
            Exportar Relatório
          </h1>
        </div>

        <div className="flex min-h-0 flex-1 overflow-hidden">
          <ExportConfigPanel
            modality={
              modality === 'subcutaneous'
                ? 'sub'
                : 'sbl'
            }
            onModalityChange={(val) =>
              setModality(
                val === 'sub'
                  ? 'subcutaneous'
                  : 'sublingual',
              )
            }
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
            onJustificationChange={
              setJustification
            }
            onExport={() =>
              setShowExportModal(true)
            }
          />

          <ExportPreview
            modality={
              modality === 'subcutaneous'
                ? 'sub'
                : 'sbl'
            }
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
        onClose={() =>
          setShowExportModal(false)
        }
        onConfirm={() => {
          setShowExportModal(false)

          navigate({
            to: '/dashboard',
          })
        }}
      />

      <CancelExportModal
        open={showCancelModal}
        onClose={() =>
          setShowCancelModal(false)
        }
        onConfirmCancel={() =>
          navigate({
            to: '/dashboard',
          })
        }
      />
    </div>
  )
}