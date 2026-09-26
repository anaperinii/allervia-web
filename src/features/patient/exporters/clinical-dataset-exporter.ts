import { format } from 'date-fns'
import type { ClinicalExportRow } from '@/shared/api/contracts/clinical'
import { csvLine } from '@/shared/lib/csv'
import { downloadFile } from '@/shared/lib/file-download'

const HEADER = [
  'paciente',
  'pacienteId',
  'medicoResponsavel',
  'tratamentoId',
  'tipo',
  'extrato',
  'statusTratamento',
  'via',
  'inicioInducao',
  'protocolo',
  'versao',
  'fusoDaPrescricao',
  'doseId',
  'statusDose',
  'previstoConcentracao',
  'previstoVolume',
  'previstoIntervaloDias',
  'previstoPara',
  'realizadoConcentracao',
  'realizadoVolume',
  'realizadoIntervaloDias',
  'realizadoEm',
  'fimDaAplicacao',
  'condutaImediata',
  'executor',
]

export function exportClinicalDatasetCsv(
  rows: ClinicalExportRow[],
  asOf: string,
): void {
  const lines: string[] = []
  lines.push(csvLine([`Exportação clínica — corte temporal: ${asOf}`]))
  lines.push(HEADER.join(','))
  for (const row of rows) {
    lines.push(
      csvLine([
        row.patient.fullName,
        row.patient.id,
        row.patient.responsiblePhysician.fullName,
        row.therapy.id,
        row.therapy.immunoType,
        row.therapy.extract,
        row.therapy.status,
        row.therapy.administrationRoute,
        row.therapy.inductionStartDate,
        row.prescription?.protocolName ?? '',
        row.prescription ? `v${row.prescription.versionNumber}` : '',
        row.prescription?.timeZone ?? '',
        row.doseId,
        row.status,
        row.planned?.concentration ?? '',
        row.planned?.volume ?? '',
        row.planned?.intervalDays ?? '',
        row.scheduledAt,
        row.administered?.concentration ?? '',
        row.administered?.volume ?? '',
        row.administered?.intervalDays ?? '',
        row.administeredAt ?? '',
        row.administrationEndedAt ?? '',
        row.immediateConduct ?? '',
        row.administeredBy?.fullName ?? '',
      ]),
    )
  }
  const filename = `allervia_export_${format(new Date(asOf), 'yyyyMMdd_HHmm')}.csv`
  downloadFile('﻿' + lines.join('\n'), filename, 'text/csv;charset=utf-8')
}
