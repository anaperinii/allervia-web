import { jsPDF } from 'jspdf'
import { format } from 'date-fns'
import type {
  ComparisonEntry,
  CountEntry,
  PhaseDayEntry,
  StatusBucketEntry,
  VolumeConcentrationMatrix,
} from '@/features/dashboard/hooks/useDashboardAggregates'
import type { ClinicalMetrics } from '@/shared/api/contracts/clinical'

export type DashboardSectionId =
  | 'indicators'
  | 'comparison'
  | 'status'
  | 'phases'
  | 'concentrations'
  | 'types'
  | 'matrix'

export const DASHBOARD_SECTIONS: { id: DashboardSectionId; label: string }[] = [
  { id: 'indicators', label: 'Indicadores do período' },
  { id: 'comparison', label: 'Comparativo de aplicações' },
  { id: 'status', label: 'Status de imunoterapias' },
  { id: 'phases', label: 'Distribuição de fases' },
  { id: 'concentrations', label: 'Ciclos por concentração' },
  { id: 'types', label: 'Imunoterapias ativas por tipo' },
  { id: 'matrix', label: 'Volume × concentração' },
]

export const ALL_DASHBOARD_SECTIONS = DASHBOARD_SECTIONS.map((section) => section.id)

export interface DashboardReportData {
  generatedAt: string
  periodLabel: string
  /** Seções incluídas; ausente = todas. */
  sections?: DashboardSectionId[]
  metrics: ClinicalMetrics
  comparisonSeries: ComparisonEntry[]
  statusSeries: StatusBucketEntry[]
  phaseSeries: PhaseDayEntry[]
  concentrationData: CountEntry[]
  typeData: CountEntry[]
  volumeMatrix: VolumeConcentrationMatrix
}

const BRAND: [number, number, number] = [37, 126, 140]
const TEXT: [number, number, number] = [15, 32, 39]
const MUTED: [number, number, number] = [100, 116, 139]
const GRID: [number, number, number] = [226, 240, 239]
const SURFACE: [number, number, number] = [245, 250, 250]

const PHASE_COLORS = { buildUp: '#6E9A2B', maintenance: '#0C86C9' }
const STATUS_COLORS = { active: '#14B8A6', suspended: '#0891B2', completed: '#0F766E' }
const COMPARISON_COLORS = { current: '#257E8C', previous: '#9AB4B9' }
const SEQUENTIAL_RAMP = ['#CCE9E4', '#A6D9D1', '#74C3B9', '#4FA99E', '#37877D']

function hexToRgb(hex: string): [number, number, number] {
  const value = Number.parseInt(hex.slice(1), 16)
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255]
}

interface LineSeries {
  label: string
  color: string
  points: number[]
}

/** Monta o documento sem gravá-lo — usado pela pré-visualização e pelo download. */
export function buildDashboardReportPdf(data: DashboardReportData): jsPDF {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 15
  const contentW = pageW - margin * 2
  let y = margin

  const ensureSpace = (needed: number) => {
    if (y + needed > pageH - 22) {
      doc.addPage()
      y = margin
    }
  }

  const addSectionTitle = (title: string, caption?: string) => {
    ensureSpace(caption ? 16 : 12)
    doc.setFontSize(11)
    doc.setTextColor(...BRAND)
    doc.setFont('helvetica', 'bold')
    doc.text(title, margin, y)
    y += 2
    doc.setDrawColor(...GRID)
    doc.line(margin, y, pageW - margin, y)
    y += 4
    if (caption) {
      doc.setFontSize(7.5)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...MUTED)
      doc.text(caption, margin, y)
      y += 5
    }
  }

  const addEmptyState = (text: string) => {
    ensureSpace(8)
    doc.setFontSize(8.5)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(...MUTED)
    doc.text(text, margin, y)
    y += 8
  }

  const addLegend = (entries: { label: string; color: string }[]) => {
    ensureSpace(6)
    let x = margin
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...MUTED)
    entries.forEach((entry) => {
      doc.setFillColor(...hexToRgb(entry.color))
      doc.circle(x + 1.2, y - 1, 1.2, 'F')
      doc.text(entry.label, x + 3.5, y)
      x += 3.5 + doc.getTextWidth(entry.label) + 7
    })
    y += 5
  }

  /** Eixo Y com 4 divisões, séries como polilinhas, rótulos do eixo X decimados. */
  const drawLineChart = (series: LineSeries[], xLabels: string[], chartH: number) => {
    ensureSpace(chartH + 12)
    const axisW = 10
    const plotX = margin + axisW
    const plotW = contentW - axisW
    const plotY = y
    const plotH = chartH
    const maxValue = Math.max(1, ...series.flatMap((entry) => entry.points))

    doc.setFontSize(6.5)
    doc.setFont('helvetica', 'normal')
    for (let step = 0; step <= 4; step++) {
      const value = Math.round((maxValue * step) / 4)
      const lineY = plotY + plotH - (plotH * step) / 4
      doc.setDrawColor(...GRID)
      doc.line(plotX, lineY, plotX + plotW, lineY)
      doc.setTextColor(...MUTED)
      doc.text(String(value), plotX - 1.5, lineY + 1, { align: 'right' })
    }

    const pointCount = Math.max(xLabels.length, 2)
    const xAt = (index: number) => plotX + (plotW * index) / (pointCount - 1)
    const yAt = (value: number) => plotY + plotH - (plotH * value) / maxValue

    series.forEach((entry) => {
      doc.setDrawColor(...hexToRgb(entry.color))
      doc.setLineWidth(0.5)
      for (let i = 1; i < entry.points.length; i++) {
        doc.line(xAt(i - 1), yAt(entry.points[i - 1]), xAt(i), yAt(entry.points[i]))
      }
    })
    doc.setLineWidth(0.2)

    const labelEvery = Math.max(1, Math.ceil(xLabels.length / 10))
    doc.setTextColor(...MUTED)
    xLabels.forEach((label, index) => {
      if (index % labelEvery !== 0 && index !== xLabels.length - 1) return
      doc.text(label, xAt(index), plotY + plotH + 4, { align: 'center' })
    })
    y += plotH + 8
  }

  /** Barras verticais empilhadas (indução + manutenção) por dia. */
  const drawStackedBars = (series: PhaseDayEntry[], chartH: number) => {
    ensureSpace(chartH + 12)
    const axisW = 10
    const plotX = margin + axisW
    const plotW = contentW - axisW
    const plotY = y
    const plotH = chartH
    const maxValue = Math.max(1, ...series.map((entry) => entry.buildUp + entry.maintenance))

    doc.setFontSize(6.5)
    doc.setFont('helvetica', 'normal')
    for (let step = 0; step <= 4; step++) {
      const value = Math.round((maxValue * step) / 4)
      const lineY = plotY + plotH - (plotH * step) / 4
      doc.setDrawColor(...GRID)
      doc.line(plotX, lineY, plotX + plotW, lineY)
      doc.setTextColor(...MUTED)
      doc.text(String(value), plotX - 1.5, lineY + 1, { align: 'right' })
    }

    const slot = plotW / series.length
    const barW = Math.min(4, slot * 0.6)
    series.forEach((entry, index) => {
      const x = plotX + slot * index + (slot - barW) / 2
      const buildUpH = (plotH * entry.buildUp) / maxValue
      const maintenanceH = (plotH * entry.maintenance) / maxValue
      if (maintenanceH > 0) {
        doc.setFillColor(...hexToRgb(PHASE_COLORS.maintenance))
        doc.rect(x, plotY + plotH - maintenanceH, barW, maintenanceH, 'F')
      }
      if (buildUpH > 0) {
        doc.setFillColor(...hexToRgb(PHASE_COLORS.buildUp))
        doc.rect(x, plotY + plotH - maintenanceH - buildUpH, barW, buildUpH, 'F')
      }
    })

    const labelEvery = Math.max(1, Math.ceil(series.length / 10))
    doc.setTextColor(...MUTED)
    series.forEach((entry, index) => {
      if (index % labelEvery !== 0 && index !== series.length - 1) return
      doc.text(entry.label, plotX + slot * index + slot / 2, plotY + plotH + 4, { align: 'center' })
    })
    y += plotH + 8
  }

  /** Barras horizontais com rótulo e valor, iguais às do painel. */
  const drawHBarList = (entries: CountEntry[], unit: string) => {
    const max = Math.max(1, ...entries.map((entry) => entry.count))
    const labelW = 38
    const valueW = 30
    const barAreaW = contentW - labelW - valueW
    entries.forEach((entry) => {
      ensureSpace(7)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...TEXT)
      doc.text(entry.label, margin, y + 3)
      doc.setFillColor(...SURFACE)
      doc.roundedRect(margin + labelW, y, barAreaW, 4, 1, 1, 'F')
      const barW = Math.max(1.5, (barAreaW * entry.count) / max)
      doc.setFillColor(...BRAND)
      doc.roundedRect(margin + labelW, y, barW, 4, 1, 1, 'F')
      doc.setTextColor(...MUTED)
      doc.setFontSize(7.5)
      doc.text(
        `${entry.count} ${unit} (${entry.pct}%)`,
        margin + labelW + barAreaW + 2,
        y + 3,
      )
      y += 7
    })
    y += 3
  }

  /** Matriz volume × concentração com rampa sequencial (claro = menos, escuro = mais). */
  const drawHeatmap = (matrix: VolumeConcentrationMatrix) => {
    const labelW = 30
    const cellW = Math.min(22, (contentW - labelW) / Math.max(matrix.volumes.length, 1))
    const cellH = 9
    ensureSpace(cellH * (matrix.concentrations.length + 1) + 10)

    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...MUTED)
    matrix.volumes.forEach((volume, column) => {
      doc.text(volume, margin + labelW + cellW * column + cellW / 2, y + 3, { align: 'center' })
    })
    y += 6

    matrix.concentrations.forEach((concentration, row) => {
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...TEXT)
      doc.text(concentration, margin, y + cellH / 2 + 1)
      matrix.volumes.forEach((_, column) => {
        const count = matrix.counts[row][column]
        const x = margin + labelW + cellW * column
        if (count === 0) {
          doc.setFillColor(...SURFACE)
        } else {
          const rampIndex = Math.min(
            SEQUENTIAL_RAMP.length - 1,
            Math.floor((count / matrix.max) * SEQUENTIAL_RAMP.length),
          )
          doc.setFillColor(...hexToRgb(SEQUENTIAL_RAMP[rampIndex]))
        }
        doc.setDrawColor(255, 255, 255)
        doc.rect(x, y, cellW - 1, cellH - 1, 'FD')
        if (count > 0) {
          doc.setTextColor(...(count / matrix.max > 0.5 ? [255, 255, 255] : TEXT) as [number, number, number])
          doc.setFontSize(7)
          doc.text(String(count), x + (cellW - 1) / 2, y + cellH / 2 + 1, { align: 'center' })
        }
      })
      y += cellH
    })
    doc.setFontSize(7)
    doc.setTextColor(...MUTED)
    doc.text('Tom mais escuro = mais aplicações', margin, (y += 4))
    y += 6
  }

  // Cabeçalho
  doc.setFillColor(108, 158, 165)
  doc.rect(0, 0, pageW, 2, 'F')
  doc.setFontSize(16)
  doc.setTextColor(14, 153, 163)
  doc.setFont('helvetica', 'bold')
  doc.text('Relatório do Painel de Métricas', margin, (y += 6))
  doc.setFontSize(9)
  doc.setTextColor(...MUTED)
  doc.setFont('helvetica', 'normal')
  doc.text(`Período: ${data.periodLabel}`, margin, (y += 7))
  doc.text(`Gerado em ${data.generatedAt} · Allervia`, margin, (y += 5))
  doc.setDrawColor(...GRID)
  doc.line(margin, (y += 3), pageW - margin, y)
  y += 6

  const includes = (section: DashboardSectionId) =>
    (data.sections ?? ALL_DASHBOARD_SECTIONS).includes(section)

  // Indicadores
  if (includes('indicators')) {
    addSectionTitle('Indicadores do Período')
    const adherencePct =
      data.metrics.adherence.ratio !== null
        ? `${Math.round(data.metrics.adherence.ratio * 100)}%`
        : '—'
    const kpis: [string, string][] = [
      [String(data.metrics.therapies.inProgress), 'Tratamentos ativos'],
      [String(data.metrics.therapies.suspended), 'Suspensos'],
      [String(data.metrics.applications.total), 'Aplicações no período'],
      [String(data.metrics.therapies.buildUp), 'Em indução'],
      [String(data.metrics.therapies.maintenance), 'Em manutenção'],
      [adherencePct, 'Adesão no período'],
    ]
    const boxW = (contentW - 8) / 3
    const boxH = 16
    kpis.forEach(([value, label], index) => {
      const column = index % 3
      if (column === 0) ensureSpace(boxH + 4)
      const x = margin + column * (boxW + 4)
      doc.setFillColor(...SURFACE)
      doc.roundedRect(x, y, boxW, boxH, 2, 2, 'F')
      doc.setFontSize(13)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...BRAND)
      doc.text(value, x + boxW / 2, y + 8, { align: 'center' })
      doc.setFontSize(7.5)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...MUTED)
      doc.text(label, x + boxW / 2, y + 13, { align: 'center' })
      if (column === 2 || index === kpis.length - 1) y += boxH + 4
    })
    y += 3
  }

  // Comparativo de aplicações
  if (includes('comparison')) {
    addSectionTitle('Comparativo de Aplicações', 'Aplicações por dia vs período anterior')
    if (data.comparisonSeries.length === 0) {
      addEmptyState('Sem dados de comparação no período.')
    } else {
      addLegend([
        { label: 'Atual', color: COMPARISON_COLORS.current },
        { label: 'Anterior', color: COMPARISON_COLORS.previous },
      ])
      drawLineChart(
        [
          { label: 'Anterior', color: COMPARISON_COLORS.previous, points: data.comparisonSeries.map((entry) => entry.previous) },
          { label: 'Atual', color: COMPARISON_COLORS.current, points: data.comparisonSeries.map((entry) => entry.current) },
        ],
        data.comparisonSeries.map((entry) => entry.label),
        34,
      )
    }
  }

  // Status das imunoterapias
  if (includes('status')) {
    addSectionTitle(
      'Status de Imunoterapias',
      'Tratamentos por status ao fim de cada mês, reconstruídos do histórico',
    )
    if (data.statusSeries.length === 0) {
      addEmptyState('Sem tratamentos registrados.')
    } else {
      addLegend([
        { label: 'Ativas', color: STATUS_COLORS.active },
        { label: 'Suspensas', color: STATUS_COLORS.suspended },
        { label: 'Concluídas', color: STATUS_COLORS.completed },
      ])
      drawLineChart(
        [
          { label: 'Ativas', color: STATUS_COLORS.active, points: data.statusSeries.map((entry) => entry.active) },
          { label: 'Suspensas', color: STATUS_COLORS.suspended, points: data.statusSeries.map((entry) => entry.suspended) },
          { label: 'Concluídas', color: STATUS_COLORS.completed, points: data.statusSeries.map((entry) => entry.completed) },
        ],
        data.statusSeries.map((entry) => entry.label),
        34,
      )
    }
  }

  // Distribuição de fases
  if (includes('phases')) {
    addSectionTitle(
      'Distribuição de Fases',
      'Aplicações administradas por dia, empilhadas por fase do tratamento',
    )
    if (data.phaseSeries.every((entry) => entry.buildUp + entry.maintenance === 0)) {
      addEmptyState('Sem aplicações administradas no período.')
    } else {
      addLegend([
        { label: 'Indução', color: PHASE_COLORS.buildUp },
        { label: 'Manutenção', color: PHASE_COLORS.maintenance },
      ])
      drawStackedBars(data.phaseSeries, 34)
    }
  }

  // Concentrações
  if (includes('concentrations')) {
    addSectionTitle(
      'Ciclos de Tratamento por Concentração',
      'Aplicações administradas no período, por concentração',
    )
    if (data.concentrationData.length === 0) {
      addEmptyState('Sem aplicações administradas no período.')
    } else {
      drawHBarList(data.concentrationData, 'aplicações')
    }
  }

  // Tipos
  if (includes('types')) {
    addSectionTitle(
      'Imunoterapias Ativas por Tipo',
      'Tratamentos em andamento, por tipo de alérgeno',
    )
    if (data.typeData.length === 0) {
      addEmptyState('Sem tratamentos em andamento.')
    } else {
      drawHBarList(data.typeData, 'tratamentos')
    }
  }

  // Heatmap volume × concentração
  if (includes('matrix')) {
    addSectionTitle('Volume vs Concentração', 'Matriz de valores administrados no período')
    if (data.volumeMatrix.total === 0) {
      addEmptyState('Sem aplicações administradas no período.')
    } else {
      drawHeatmap(data.volumeMatrix)
    }
  }

  // Rodapé
  const totalPages = doc.getNumberOfPages()
  for (let page = 1; page <= totalPages; page++) {
    doc.setPage(page)
    doc.setDrawColor(...GRID)
    doc.line(margin, pageH - 18, pageW - margin, pageH - 18)
    doc.setFontSize(7)
    doc.setTextColor(150, 150, 150)
    doc.setFont('helvetica', 'normal')
    const lgpdText =
      'Documento protegido pela Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018). A reprodução, compartilhamento ou armazenamento não autorizado é proibido.'
    doc.text(doc.splitTextToSize(lgpdText, contentW), margin, pageH - 14)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(200, 200, 200)
    doc.text('CONFIDENCIAL', pageW / 2, pageH - 5, { align: 'center', charSpace: 2 })
    doc.setTextColor(...MUTED)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.text(`Página ${page} de ${totalPages}`, pageW - margin, pageH - 5, { align: 'right' })
  }

  return doc
}

export function exportDashboardReportPdf(data: DashboardReportData) {
  buildDashboardReportPdf(data).save(
    `relatorio_dashboard_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`,
  )
}
