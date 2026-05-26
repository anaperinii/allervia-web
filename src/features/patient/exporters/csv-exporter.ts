import { format } from 'date-fns'
import {
  ADJUSTMENT_TYPE_LABELS,
  INACTIVATION_CATEGORY_LABELS,
} from '@/features/patient/constants/clinical-labels'
import { derivePatientDates } from '@/features/patient/lib/patient-dates'
import type { ReportData } from './types'
import { downloadFile } from '@/shared/lib/file-download'

function escapeCsv(value: unknown): string {
  return `"${String(value ?? '').replace(/"/g, '""')}"`
}

export function exportCsv(data: ReportData) {
  const { patient, realizedApplications, sections } = data
  const { inductionStart } = derivePatientDates(realizedApplications, patient.id)
  const lines: string[] = []
  lines.push(escapeCsv(`Relatório Clínico — ${patient.name}`))
  lines.push(escapeCsv(`Gerado em: ${data.generatedAt}`))
  lines.push('')

  if (sections.includes('personal')) {
    lines.push(escapeCsv('=== DADOS PESSOAIS ==='))
    lines.push('Campo,Valor')
    const rows: [string, string][] = [
      ['Nome', patient.name],
      ['CPF', patient.cpf],
      ['Data de Nascimento', patient.birthDate],
      ['Idade', `${patient.age} anos`],
      ['Telefone', patient.phone],
      ['Peso', patient.weight],
      ['Médico Responsável', patient.responsibleDoctor],
    ]
    rows.forEach(([label, value]) => lines.push(`${escapeCsv(label)},${escapeCsv(value)}`))
    lines.push('')
  }

  if (sections.includes('immunotherapy')) {
    lines.push(escapeCsv('=== DADOS DA IMUNOTERAPIA ==='))
    lines.push('Campo,Valor')
    const rows: [string, string][] = [
      ['Tipo', patient.immunotherapyType],
      ['Via', patient.administrationRoute],
      ['Extrato', patient.extract],
      ['Início Indução', inductionStart ?? '-'],
      ['Meta', patient.targetConcentrationVolume],
      ['Dose Atual', patient.currentDoseConcentration],
      ['Intervalo', `${patient.currentInterval} dias`],
    ]
    rows.forEach(([label, value]) => lines.push(`${escapeCsv(label)},${escapeCsv(value)}`))
    lines.push('')
  }

  if (sections.includes('applications')) {
    lines.push(escapeCsv('=== HISTÓRICO DE APLICAÇÕES ==='))
    lines.push('Data,Dose,Intervalo,Reação,Responsável')
    realizedApplications.forEach((application) => {
      lines.push([
        application.date,
        application.dose,
        `${application.cycle.days}d`,
        application.sideEffect === 'yes' ? 'Sim' : 'Não',
        application.administrator || '-',
      ].map(escapeCsv).join(','))
    })
    lines.push('')
  }

  if (sections.includes('reactions')) {
    lines.push(escapeCsv('=== REAÇÕES ADVERSAS ==='))
    lines.push('Data,Dose,Medicação,Observação')
    realizedApplications
      .filter((application) => application.sideEffect === 'yes')
      .forEach((application) => {
        const medicationLabel =
          application.medicationNeeded === 'yes' ? 'Sim'
          : application.medicationNeeded === 'no' ? 'Não'
          : '-'
        lines.push([
          application.date,
          application.dose,
          medicationLabel,
          application.administratorNote || '',
        ].map(escapeCsv).join(','))
      })
    lines.push('')
  }

  if (sections.includes('adjustments') && patient.protocolAdjustments?.length) {
    lines.push(escapeCsv('=== AJUSTES DE PROTOCOLO ==='))
    lines.push('Data,Tipo,Concentração Anterior,Concentração Nova,Intervalo Anterior,Intervalo Novo,Justificativa,Responsável')
    patient.protocolAdjustments.forEach((adj) => {
      lines.push([
        adj.date,
        ADJUSTMENT_TYPE_LABELS[adj.type],
        adj.previousConcentration,
        adj.newConcentration,
        `${adj.previousInterval}d`,
        `${adj.newInterval}d`,
        adj.justification,
        adj.responsibleDoctor,
      ].map(escapeCsv).join(','))
    })
    lines.push('')
  }

  if (sections.includes('inactivations') && patient.inactivations?.length) {
    lines.push(escapeCsv('=== HISTÓRICO DE INATIVAÇÕES ==='))
    lines.push('Início,Categoria,Motivo,Retorno Previsto,Concentração na Pausa,Intervalo na Pausa,Responsável,Reativação,Concentração Retomada,Intervalo Retomada,Justificativa Retomada')
    patient.inactivations.forEach((inact) => {
      lines.push([
        inact.startDate,
        INACTIVATION_CATEGORY_LABELS[inact.category],
        inact.detail,
        inact.expectedReturnDate ?? '',
        inact.snapshotConcentration,
        `${inact.snapshotInterval}d`,
        inact.responsibleDoctor,
        inact.reactivatedAt ?? '',
        inact.reactivateConcentration ?? '',
        inact.reactivateInterval != null ? `${inact.reactivateInterval}d` : '',
        inact.reactivateJustification ?? '',
      ].map(escapeCsv).join(','))
    })
    lines.push('')
  }

  if (sections.includes('progress')) {
    lines.push(escapeCsv('=== PROGRESSÃO DO PROTOCOLO ==='))
    lines.push('Métrica,Valor')
    lines.push(`${escapeCsv('Aplicações realizadas')},${escapeCsv(realizedApplications.length)}`)
    lines.push(`${escapeCsv('Concentração atual')},${escapeCsv(patient.currentDoseConcentration.split(' - ')[0])}`)
    lines.push(`${escapeCsv('Intervalo')},${escapeCsv(`${patient.currentInterval} dias`)}`)
  }

  const filename = `relatorio_${patient.name.replace(/\s+/g, '_').toLowerCase()}_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`
  downloadFile('﻿' + lines.join('\n'), filename, 'text/csv;charset=utf-8')
}
