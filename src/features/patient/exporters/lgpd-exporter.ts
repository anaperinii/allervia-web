import { format } from 'date-fns'
import {
  ADJUSTMENT_TYPE_LABELS,
  INACTIVATION_CATEGORY_LABELS,
} from '@/features/patient/constants/clinical-labels'
import { derivePatientDates } from '@/features/patient/stores/usePatientStore'
import type { LgpdExportData, LgpdFileFormat } from './types'
import { downloadFile } from '@/shared/lib/file-download'
import { csvCell } from '@/shared/lib/csv'

function buildPayload(data: LgpdExportData) {
  const { patient, applications, accessLogs, exportedAt, justification, exportedBy } = data
  const { inductionStart, maintenanceStart } = derivePatientDates(applications, patient.id)
  return {
    exportedAt,
    exportedBy,
    justification,
    scope: { therapyId: data.therapyId ?? null, kind: 'SELECTED_THERAPY', completePatientRecord: false, historyLimit: 200, downloadAudited: false },
    patient: {
      id: patient.id,
      nome: patient.name,
      cpf: patient.cpf,
      dataNascimento: patient.birthDate,
      idade: patient.age,
      telefone: patient.phone,
      peso: patient.weight,
      medicoResponsavel: patient.responsibleDoctor,
      status: patient.status,
    },
    imunoterapia: {
      tipo: patient.immunotherapyType,
      viaAdministracao: patient.administrationRoute,
      extrato: patient.extract,
      inicioInducaoDerivadoDasDoses: inductionStart,
      inicioManutencaoDerivadoDasDoses: maintenanceStart,
      concentracaoVolumeMeta: patient.targetConcentrationVolume || null,
      concentracaoDoseAtuais: patient.currentDoseConcentration || null,
      intervaloAtual: patient.currentInterval > 0 ? patient.currentInterval : null,
      metaAtingida: null,
      dataProximaAplicacao: patient.nextApplicationDate,
    },
    ajustesProtocolo: (patient.protocolAdjustments ?? []).map((adj) => ({
      data: adj.date,
      tipo: ADJUSTMENT_TYPE_LABELS[adj.type],
      concentracaoAnterior: adj.previousConcentration,
      concentracaoNova: adj.newConcentration,
      intervaloAnterior: adj.previousInterval,
      intervaloNovo: adj.newInterval,
      justificativa: adj.justification,
      responsavel: adj.responsibleDoctor,
    })),
    inativacoes: (patient.inactivations ?? []).map((inact) => ({
      inicio: inact.startDate,
      categoria: INACTIVATION_CATEGORY_LABELS[inact.category],
      motivo: inact.detail,
      retornoPrevisto: inact.expectedReturnDate,
      concentracaoNaPausa: inact.snapshotConcentration,
      intervaloNaPausa: inact.snapshotInterval,
      responsavel: inact.responsibleDoctor,
      reativacao: inact.reactivatedAt ?? null,
      concentracaoRetomada: inact.reactivateConcentration ?? null,
      intervaloRetomada: inact.reactivateInterval ?? null,
      justificativaRetomada: inact.reactivateJustification ?? null,
      observacaoRetomada: inact.reactivateNote ?? null,
      reativadoPor: inact.reactivatedBy ?? null,
    })),
    doses: data.doses ?? [],
    aplicacoes: applications,
    historicoClinico: accessLogs,
  }
}

export function exportLgpd(data: LgpdExportData, fileFormat: LgpdFileFormat) {
  const payload = buildPayload(data)
  const filename = `allervia_tratamento_${data.patient.name.replace(/\s+/g, '_').toLowerCase()}_${format(new Date(), 'yyyyMMdd_HHmm')}.${fileFormat}`

  if (fileFormat === 'json') {
    downloadFile(JSON.stringify(payload, null, 2), filename, 'application/json')
    return
  }

  const lines: string[] = ['Categoria,Campo,Valor']
  const pushPair = (category: string, key: string, value: unknown) => {
    lines.push(`${csvCell(category)},${csvCell(key)},${csvCell(value)}`)
  }
  Object.entries(payload.scope).forEach(([k, v]) => pushPair('Escopo', k, v))
  Object.entries(payload.patient).forEach(([k, v]) => pushPair('Paciente', k, v))
  Object.entries(payload.imunoterapia).forEach(([k, v]) => pushPair('Imunoterapia', k, v))
  payload.ajustesProtocolo.forEach((adj, i) => Object.entries(adj).forEach(([k, v]) => pushPair(`Ajuste ${i + 1}`, k, v)))
  payload.inativacoes.forEach((inact, i) => Object.entries(inact).forEach(([k, v]) => pushPair(`Inativacao ${i + 1}`, k, v)))
  payload.doses.forEach((dose, i) => Object.entries(dose).forEach(([k, v]) => pushPair(`Dose ${i + 1}`, k, typeof v === 'object' ? JSON.stringify(v) : v)))
  payload.aplicacoes.forEach((a, i) =>
    Object.entries(a).forEach(([k, v]) => pushPair(`Aplicacao ${i + 1}`, k, typeof v === 'object' ? JSON.stringify(v) : v)),
  )
  payload.historicoClinico.forEach((l, i) => Object.entries(l).forEach(([k, v]) => pushPair(`Evento ${i + 1}`, k, typeof v === 'object' ? JSON.stringify(v) : v)))
  downloadFile('﻿' + lines.join('\n'), filename, 'text/csv;charset=utf-8')
}
