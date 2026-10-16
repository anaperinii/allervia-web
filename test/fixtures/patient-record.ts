import type { PatientClinicalRecord } from '@/shared/api/contracts/patient-record.schema'
export function patientRecord(): PatientClinicalRecord {
  return { asOf: '2026-01-01T13:00:00.000Z', complete: true, redactedFields: [], patient: { id: 'patient-1' }, therapies: [{ id: 'therapy-1', prescriptions: [], lifecycleEvents: [], doses: [{ id: 'dose-1', status: 'ADMINISTERED_ON_SCHEDULE', administeredAt: '2026-01-01T13:00:00Z', observations: [{ id: 'observation-1', reportedSideEffects: [], administeredMedications: [], notes: null }], observationAddenda: [] }] }], appointments: [], history: [] }
}
