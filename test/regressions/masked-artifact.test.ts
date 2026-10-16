import { it, expect, vi } from 'vitest'
import { mkdirSync, writeFileSync } from 'node:fs'
import { buildPatientReportPdf } from '@/features/patient/exporters/pdf-exporter'
import { exportCsv } from '@/features/patient/exporters/csv-exporter'
import { buildLegacyPatient, doseToLegacyApplication } from '@/features/patient/adapters/clinical-presentation'
import { maskCpf, maskName, maskPhone } from '@/shared/lib/mask'
import { downloadFile } from '@/shared/lib/file-download'
import { patientDetail, therapySummary, administeredDose } from '../fixtures/clinical'
import type { ReportData } from '@/features/patient/exporters/types'
vi.mock('@/shared/lib/file-download', () => ({ downloadFile: vi.fn() }))
it('generates masked PDF and CSV samples without the original direct identifiers or free observation text', () => {
  const original = buildLegacyPatient(patientDetail({ fullName: 'Synthetic Confidential Patient', cpf: '12345678909', phoneNumber: '11912345678' }), therapySummary())
  const patient = { ...original, name: maskName(original.name, true), cpf: maskCpf(original.cpf, true), phone: maskPhone(original.phone, true) }
  const data: ReportData = { patient, generatedAt: '01/01/2026', anonymized: true, reactionsCount: 1, sections: ['personal', 'applications', 'reactions'], realizedApplications: [{ ...doseToLegacyApplication(administeredDose(), original.id, { hasReaction: true }), administratorNote: '[Texto livre ocultado]', medicationNeeded: 'no' }] }
  const doc = buildPatientReportPdf(data)
  const directory = 'artifacts/frontend-stabilization/fe06-13-samples'
  mkdirSync(directory, { recursive: true })
  writeFileSync(directory + '/masked-report.pdf', new Uint8Array(doc.output('arraybuffer')))
  exportCsv(data)
  const text = String(vi.mocked(downloadFile).mock.calls[0][0])
  writeFileSync(directory + '/masked-report.csv', text)
  for (const raw of [original.name, original.cpf, original.phone]) {
    expect(text).not.toContain(raw)
    expect(String(vi.mocked(downloadFile).mock.calls[0][1])).not.toContain(raw)
  }
  expect(text).toContain('[Texto livre ocultado]')
})
