import { describe, expect, it, vi } from 'vitest'
import { buildPatientReportPdf } from '@/features/patient/exporters/pdf-exporter'
import { exportCsv } from '@/features/patient/exporters/csv-exporter'
import { buildLegacyPatient, doseToLegacyApplication } from '@/features/patient/adapters/clinical-presentation'
import { downloadFile } from '@/shared/lib/file-download'
import { administeredDose, patientDetail, therapySummary } from '../fixtures/clinical'
import type { ReportData } from '@/features/patient/exporters/types'

vi.mock('@/shared/lib/file-download', () => ({ downloadFile: vi.fn() }))

function report(): ReportData {
  return {
    patient: { ...buildLegacyPatient(patientDetail(), therapySummary()), currentInterval: 7 },
    sections: ['applications', 'reactions'],
    realizedApplications: [doseToLegacyApplication(administeredDose(), 'patient-1')],
    reactionsCount: null,
    generatedAt: '13/10/2026 às 09:00',
    anonymized: false,
  }
}

describe('exported clinical information', () => {
  it('marks unknown reaction information in the CSV file instead of reporting no reaction', () => {
    exportCsv(report())
    const text = vi.mocked(downloadFile).mock.calls[0][0]
    expect(text).toContain('Indisponível')
    expect(text).toContain('Observações de reações indisponíveis')
    expect(text).not.toContain(',Não,')
  })
  it('marks unknown reaction information in the PDF file', () => {
    const pdf = buildPatientReportPdf(report()).output()
    expect(pdf).toContain('Indisponível')
    expect(pdf).not.toContain('(Não)')
  })
})
