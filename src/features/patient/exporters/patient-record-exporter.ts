import type { PatientClinicalRecord } from '@/shared/api/contracts/patient-record.schema'
import { csvCell } from '@/shared/lib/csv'
import { downloadFile } from '@/shared/lib/file-download'
export function exportPatientRecord(record: PatientClinicalRecord, format: 'json' | 'csv', justification: string, therapyId: string | null = null) {
  const therapies = therapyId ? record.therapies.filter(therapy => therapy.id === therapyId) : record.therapies
  const doseIds = new Set(therapies.flatMap(therapy => therapy.doses.map(dose => dose.id)))
  const appointments = therapyId ? record.appointments.filter(appointment => appointment.doseId && doseIds.has(appointment.doseId)) : record.appointments
  const entities = new Set([record.patient.id, ...appointments.map(appointment => appointment.id), ...therapies.flatMap(therapy => [therapy.id, ...therapy.doses.map(dose => dose.id)])])
  const payload = { scope: { kind: therapyId ? 'SELECTED_THERAPY' : 'PATIENT_CLINICAL_RECORD', completeAuthorizedScope: true, includesAllPatientData: false, downloadAudited: false }, asOf: record.asOf, redactedFields: record.redactedFields, justification, patient: record.patient, therapies, appointments, history: record.history.filter(entry => entities.has(String(entry.entityId))) }
  const filename = `allervia_prontuario_${record.patient.id}_${record.asOf.replace(/[:.]/g, '-')}.${format}`
  if (format === 'json') { downloadFile(JSON.stringify(payload, null, 2), filename, 'application/json'); return }
  const rows = ['Categoria,Campo,Valor']
  const visit = (value: unknown, path: string) => {
    if (value !== null && typeof value === 'object') {
      const entries = Object.entries(value)
      if (!entries.length) rows.push([path, 'valor', JSON.stringify(value)].map(csvCell).join(','))
      else for (const [key, nested] of entries) visit(nested, path ? `${path}.${key}` : key)
    } else rows.push([path, 'valor', value ?? ''].map(csvCell).join(','))
  }
  visit(payload, '')
  downloadFile('\uFEFF' + rows.join('\n'), filename, 'text/csv;charset=utf-8')
}
