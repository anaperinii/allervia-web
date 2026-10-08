import { format } from 'date-fns'
import { csvLine } from '@/shared/lib/csv'
import { downloadFile } from '@/shared/lib/file-download'
import {
  ALL_DASHBOARD_SECTIONS,
  type DashboardReportData,
  type DashboardSectionId,
} from './pdf-report-exporter'

function adherenceValue(data: DashboardReportData): string {
  return data.metrics.adherence.ratio !== null
    ? `${Math.round(data.metrics.adherence.ratio * 100)}%`
    : ''
}

function includesSection(data: DashboardReportData, section: DashboardSectionId): boolean {
  return (data.sections ?? ALL_DASHBOARD_SECTIONS).includes(section)
}

/** CSV com os valores do painel (sem gráficos), em seções nomeadas. */
export function exportDashboardReportCsv(data: DashboardReportData): void {
  const lines: string[] = []
  lines.push(csvLine([`Relatório do Painel de Métricas — período: ${data.periodLabel}`]))
  lines.push(csvLine([`Gerado em ${data.generatedAt}`]))
  lines.push('')

  if (includesSection(data, 'indicators')) {
    lines.push(csvLine(['Indicadores do período']))
    lines.push(csvLine(['indicador', 'valor']))
    lines.push(csvLine(['Tratamentos ativos', data.metrics.therapies.inProgress]))
    lines.push(csvLine(['Tratamentos suspensos', data.metrics.therapies.suspended]))
    lines.push(csvLine(['Aplicações no período', data.metrics.applications.total]))
    lines.push(csvLine(['Em indução', data.metrics.therapies.buildUp]))
    lines.push(csvLine(['Em manutenção', data.metrics.therapies.maintenance]))
    lines.push(csvLine(['Adesão no período', adherenceValue(data)]))
    lines.push(csvLine(['Previstas pendentes', data.metrics.scheduled.pending]))
    lines.push(csvLine(['Vencidas', data.metrics.scheduled.overdue]))
    lines.push('')
  }

  if (includesSection(data, 'comparison')) {
    lines.push(csvLine(['Comparativo de aplicações por dia (vs período anterior)']))
    lines.push(csvLine(['data', 'aplicacoesAtual', 'aplicacoesPeriodoAnterior']))
    for (const entry of data.comparisonSeries) {
      lines.push(csvLine([entry.date, entry.current, entry.previous]))
    }
    lines.push('')
  }

  if (includesSection(data, 'status')) {
    lines.push(csvLine(['Status de imunoterapias ao fim de cada mês']))
    lines.push(csvLine(['mes', 'ativas', 'suspensas', 'concluidas']))
    for (const entry of data.statusSeries) {
      lines.push(csvLine([entry.label, entry.active, entry.suspended, entry.completed]))
    }
    lines.push('')
  }

  if (includesSection(data, 'phases')) {
    lines.push(csvLine(['Aplicações administradas por dia, por fase']))
    lines.push(csvLine(['data', 'inducao', 'manutencao']))
    for (const entry of data.phaseSeries) {
      lines.push(csvLine([entry.date, entry.buildUp, entry.maintenance]))
    }
    lines.push('')
  }

  if (includesSection(data, 'concentrations')) {
    lines.push(csvLine(['Aplicações administradas por concentração']))
    lines.push(csvLine(['concentracao', 'aplicacoes', 'percentual']))
    for (const entry of data.concentrationData) {
      lines.push(csvLine([entry.label, entry.count, `${entry.pct}%`]))
    }
    lines.push('')
  }

  if (includesSection(data, 'types')) {
    lines.push(csvLine(['Imunoterapias ativas por tipo']))
    lines.push(csvLine(['tipo', 'tratamentos', 'percentual']))
    for (const entry of data.typeData) {
      lines.push(csvLine([entry.label, entry.count, `${entry.pct}%`]))
    }
    lines.push('')
  }

  if (includesSection(data, 'matrix')) {
    lines.push(csvLine(['Matriz volume × concentração (aplicações administradas)']))
    lines.push(csvLine(['concentracao', ...data.volumeMatrix.volumes]))
    data.volumeMatrix.concentrations.forEach((concentration, row) => {
      lines.push(csvLine([concentration, ...data.volumeMatrix.counts[row]]))
    })
  }

  const filename = `relatorio_dashboard_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`
  downloadFile('﻿' + lines.join('\n'), filename, 'text/csv;charset=utf-8')
}

/** JSON estruturado com os valores do painel (sem gráficos). */
export function exportDashboardReportJson(data: DashboardReportData): void {
  const payload = {
    generatedAt: data.generatedAt,
    period: data.periodLabel,
    sections: data.sections ?? ALL_DASHBOARD_SECTIONS,
    ...(includesSection(data, 'indicators') && {
      indicators: {
        activeTherapies: data.metrics.therapies.inProgress,
        suspendedTherapies: data.metrics.therapies.suspended,
        applicationsInPeriod: data.metrics.applications.total,
        buildUp: data.metrics.therapies.buildUp,
        maintenance: data.metrics.therapies.maintenance,
        adherence: data.metrics.adherence,
        scheduled: data.metrics.scheduled,
      },
    }),
    ...(includesSection(data, 'comparison') && {
      applicationsByDayComparison: data.comparisonSeries.map((entry) => ({
        date: entry.date,
        current: entry.current,
        previous: entry.previous,
      })),
    }),
    ...(includesSection(data, 'status') && {
      therapyStatusByMonth: data.statusSeries.map((entry) => ({
        month: entry.label,
        active: entry.active,
        suspended: entry.suspended,
        completed: entry.completed,
      })),
    }),
    ...(includesSection(data, 'phases') && {
      applicationsByDayAndPhase: data.phaseSeries.map((entry) => ({
        date: entry.date,
        buildUp: entry.buildUp,
        maintenance: entry.maintenance,
      })),
    }),
    ...(includesSection(data, 'concentrations') && {
      applicationsByConcentration: data.concentrationData,
    }),
    ...(includesSection(data, 'types') && { activeTherapiesByType: data.typeData }),
    ...(includesSection(data, 'matrix') && {
      volumeConcentrationMatrix: {
        volumes: data.volumeMatrix.volumes,
        concentrations: data.volumeMatrix.concentrations,
        counts: data.volumeMatrix.counts,
        total: data.volumeMatrix.total,
      },
    }),
  }
  const filename = `relatorio_dashboard_${format(new Date(), 'yyyyMMdd_HHmm')}.json`
  downloadFile(JSON.stringify(payload, null, 2), filename, 'application/json')
}
