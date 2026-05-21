import { format } from 'date-fns'
import {
  ADJUSTMENT_TYPE_LABELS,
  INACTIVATION_CATEGORY_LABELS,
} from '@/features/patient/constants/clinical-labels'
import type { ReportData } from './types'
import { downloadFile } from './utils'

export function exportExcel(data: ReportData) {
  const { patient, realizedApps, sections } = data
  const rows: string[] = []
  rows.push(`<tr><th colspan="2" style="background:#18C1CB;color:#fff;padding:8px;font-size:14px;">Relatório Clínico — ${patient.name}</th></tr>`)
  rows.push(`<tr><td colspan="2" style="padding:6px;font-size:11px;color:#666;">Gerado em: ${data.generatedAt}${data.anonymized ? ' · Dados anonimizados' : ''}</td></tr>`)
  rows.push(`<tr><td colspan="2" style="height:10px;"></td></tr>`)

  const addSection = (title: string, pairs: [string, string][]) => {
    rows.push(`<tr><th colspan="2" style="background:#B6F2EC;padding:6px;text-align:left;font-size:12px;">${title}</th></tr>`)
    pairs.forEach(([k, v]) =>
      rows.push(`<tr><td style="padding:4px 8px;font-size:11px;color:#666;">${k}</td><td style="padding:4px 8px;font-size:11px;font-weight:bold;">${v}</td></tr>`),
    )
    rows.push(`<tr><td colspan="2" style="height:8px;"></td></tr>`)
  }

  if (sections.includes('personal')) {
    addSection('Dados Pessoais', [
      ['Nome', patient.name],
      ['CPF', patient.cpf],
      ['Data de Nascimento', patient.birthDate],
      ['Idade', `${patient.age} anos`],
      ['Telefone', patient.phone],
      ['Peso', patient.weight],
      ['Médico Responsável', patient.responsibleDoctor],
    ])
  }

  if (sections.includes('immunotherapy')) {
    addSection('Dados da Imunoterapia', [
      ['Tipo', patient.immunotherapyType],
      ['Via', patient.administrationRoute],
      ['Extrato', patient.extract],
      ['Início Indução', patient.inductionStart],
      ['Meta', patient.targetConcentrationVolume],
      ['Dose Atual', patient.currentDoseConcentration],
      ['Intervalo', `${patient.currentInterval} dias`],
    ])
  }

  if (sections.includes('applications')) {
    rows.push(`<tr><th colspan="2" style="background:#B6F2EC;padding:6px;text-align:left;font-size:12px;">Histórico de Aplicações (${realizedApps.length})</th></tr>`)
    const appRows = realizedApps
      .map((a) => `<tr><td style="padding:3px 8px;font-size:10px;">${a.date}</td><td style="padding:3px 8px;font-size:10px;">${a.dose}</td><td style="padding:3px 8px;font-size:10px;">${a.cycle.days}d</td><td style="padding:3px 8px;font-size:10px;">${a.sideEffect === 'yes' ? 'Sim' : 'Não'}</td></tr>`)
      .join('')
    rows.push(`<tr><td colspan="2" style="padding:0;"><table style="width:100%;border-collapse:collapse;"><tr><th style="padding:4px 8px;font-size:10px;background:#eee;">Data</th><th style="padding:4px 8px;font-size:10px;background:#eee;">Dose</th><th style="padding:4px 8px;font-size:10px;background:#eee;">Intervalo</th><th style="padding:4px 8px;font-size:10px;background:#eee;">Reação</th></tr>${appRows}</table></td></tr>`)
    rows.push(`<tr><td colspan="2" style="height:8px;"></td></tr>`)
  }

  if (sections.includes('adjustments') && patient.protocolAdjustments?.length) {
    rows.push(`<tr><th colspan="2" style="background:#B6F2EC;padding:6px;text-align:left;font-size:12px;">Ajustes de Protocolo (${patient.protocolAdjustments.length})</th></tr>`)
    patient.protocolAdjustments.forEach((adj) => {
      addSection(`${adj.date} — ${ADJUSTMENT_TYPE_LABELS[adj.type]}`, [
        ['Concentração', `${adj.previousConcentration} → ${adj.newConcentration}`],
        ['Intervalo', `${adj.previousInterval}d → ${adj.newInterval}d`],
        ['Justificativa', adj.justification],
        ['Responsável', adj.responsibleDoctor],
      ])
    })
  }

  if (sections.includes('inactivations') && patient.inactivations?.length) {
    rows.push(`<tr><th colspan="2" style="background:#B6F2EC;padding:6px;text-align:left;font-size:12px;">Histórico de Inativações (${patient.inactivations.length})</th></tr>`)
    patient.inactivations.forEach((inact) => {
      const pairs: [string, string][] = [
        ['Categoria', INACTIVATION_CATEGORY_LABELS[inact.category]],
        ['Motivo', inact.detail],
        ['Retorno previsto', inact.expectedReturnDate ?? '—'],
        ['Concentração na pausa', inact.snapshotConcentration],
        ['Intervalo na pausa', `${inact.snapshotInterval}d`],
        ['Responsável', inact.responsibleDoctor],
      ]
      if (inact.reactivatedAt) {
        pairs.push(['Reativação', inact.reactivatedAt])
        if (inact.reactivateConcentration) pairs.push(['Concentração retomada', inact.reactivateConcentration])
        if (inact.reactivateInterval != null) pairs.push(['Intervalo retomada', `${inact.reactivateInterval}d`])
        if (inact.reactivateJustification) pairs.push(['Justificativa', inact.reactivateJustification])
      }
      addSection(`${inact.startDate} — ${INACTIVATION_CATEGORY_LABELS[inact.category]}`, pairs)
    })
  }

  if (sections.includes('progress')) {
    addSection('Progressão do Protocolo', [
      ['Aplicações realizadas', String(realizedApps.length)],
      ['Concentração atual', patient.currentDoseConcentration.split(' - ')[0]],
      ['Intervalo', `${patient.currentInterval} dias`],
    ])
  }

  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8"/></head><body><table>${rows.join('')}</table></body></html>`
  const filename = `relatorio_${patient.name.replace(/\s+/g, '_').toLowerCase()}_${format(new Date(), 'yyyyMMdd_HHmm')}.xls`
  downloadFile(html, filename, 'application/vnd.ms-excel')
}
