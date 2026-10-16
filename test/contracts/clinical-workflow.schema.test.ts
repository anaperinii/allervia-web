import { describe, expect, it } from 'vitest'
import {
  parseAdministerDoseResult,
  parseClinicalExportPage,
  parseImmunotherapyDetail,
  parsePreviewDoseResult,
} from '@/shared/api/contracts/clinical-workflow.schema'
import { expectContractViolation } from './contract-parsing'

function validPreview() {
  return {
    recommendation: { kind: 'RECOMMENDED', fromStepId: 'step-1', label: '1:1000 0,1ml' },
    allowedValues: [
      { id: 'step-1', concentration: '1000', volume: '0.1', intervalDays: 7 },
    ],
    expectedRevision: 0,
    expectedTherapyRevision: 0,
    nextScheduledAt: '2026-10-17T13:00:00.000Z',
    prescriptionRevision: 1,
    protocolVersionId: 'version-1',
  }
}

function doseRecord(id: string) {
  return {
    id,
    status: 'SCHEDULED',
    scheduledAt: '2026-10-17T13:00:00.000Z',
    revision: 0,
  }
}

function validAdminister() {
  return {
    dose: { ...doseRecord('dose-1'), status: 'ADMINISTERED_ON_SCHEDULE' },
    successor: doseRecord('dose-2'),
    therapyRevision: 1,
    recommendation: { kind: 'RECOMMENDED', fromStepId: 'step-1' },
  }
}

function validDetail() {
  return {
    id: 'therapy-1',
    status: 'IN_PROGRESS',
    revision: 3,
    patient: { id: 'patient-1', fullName: 'Paciente Exemplo', isActive: true },
    prescription: { versionId: 'version-1', revision: 2 },
    nextDose: { id: 'dose-2', scheduledAt: '2026-10-17T13:00:00.000Z' },
    immunoType: 'Ácaros',
    extract: 'Extrato A',
  }
}

function validExport() {
  return {
    items: [{ doseId: 'dose-1', status: 'SCHEDULED' }],
    page: 1,
    pageSize: 50,
    total: 1,
    asOf: '2026-10-10T12:00:00.000Z',
  }
}

describe('parsePreviewDoseResult', () => {
  it('returns a valid payload unchanged', () => {
    const payload = validPreview()
    const snapshot = structuredClone(payload)
    const result = parsePreviewDoseResult(payload)
    expect(result).toBe(payload)
    expect(result).toEqual(snapshot)
  })

  it('accepts an end-of-sequence recommendation', () => {
    const payload = validPreview()
    payload.recommendation = { kind: 'END_OF_SEQUENCE', fromStepId: 'step-9' } as never
    expect(parsePreviewDoseResult(payload)).toBe(payload)
  })

  it('accepts unknown additive fields and preserves them', () => {
    const payload = { ...validPreview(), hints: ['future'] }
    const result = parsePreviewDoseResult(payload) as Record<string, unknown>
    expect(result.hints).toEqual(['future'])
  })

  it('rejects an unknown recommendation kind', () => {
    const payload = validPreview()
    payload.recommendation.kind = 'GUESSED'
    expectContractViolation(() => parsePreviewDoseResult(payload))
  })

  it('rejects a missing expectedRevision', () => {
    const payload: Record<string, unknown> = { ...validPreview() }
    delete payload.expectedRevision
    expectContractViolation(() => parsePreviewDoseResult(payload))
  })

  it('rejects an allowed value without id', () => {
    const payload = validPreview()
    payload.allowedValues = [{ concentration: '1000' }] as never
    expectContractViolation(() => parsePreviewDoseResult(payload))
  })
})

describe('parseAdministerDoseResult', () => {
  it('returns a valid payload unchanged', () => {
    const payload = validAdminister()
    const snapshot = structuredClone(payload)
    const result = parseAdministerDoseResult(payload)
    expect(result).toBe(payload)
    expect(result).toEqual(snapshot)
  })

  it('accepts a null successor at end of sequence', () => {
    const payload = { ...validAdminister(), successor: null }
    expect(parseAdministerDoseResult(payload)).toBe(payload)
  })

  it('accepts unknown additive fields and preserves them', () => {
    const payload = { ...validAdminister(), auditRef: 'audit-1' }
    const result = parseAdministerDoseResult(payload) as Record<string, unknown>
    expect(result.auditRef).toBe('audit-1')
  })

  it('rejects a missing therapyRevision', () => {
    const payload: Record<string, unknown> = { ...validAdminister() }
    delete payload.therapyRevision
    expectContractViolation(() => parseAdministerDoseResult(payload))
  })

  it('rejects a wrongly typed dose id', () => {
    const payload = validAdminister()
    payload.dose.id = 10 as unknown as string
    expectContractViolation(() => parseAdministerDoseResult(payload))
  })
})

describe('parseImmunotherapyDetail', () => {
  it('returns a valid payload unchanged', () => {
    const payload = validDetail()
    const snapshot = structuredClone(payload)
    const result = parseImmunotherapyDetail(payload)
    expect(result).toBe(payload)
    expect(result).toEqual(snapshot)
  })

  it('accepts a null nextDose', () => {
    const payload = { ...validDetail(), nextDose: null }
    expect(parseImmunotherapyDetail(payload)).toBe(payload)
  })

  it('accepts unknown additive fields and preserves them', () => {
    const payload = { ...validDetail(), labels: ['priority'] }
    const result = parseImmunotherapyDetail(payload) as Record<string, unknown>
    expect(result.labels).toEqual(['priority'])
  })

  it('rejects a missing patient block', () => {
    const payload: Record<string, unknown> = { ...validDetail() }
    delete payload.patient
    expectContractViolation(() => parseImmunotherapyDetail(payload))
  })

  it('rejects an unknown status', () => {
    const payload = validDetail()
    payload.status = 'ARCHIVED'
    expectContractViolation(() => parseImmunotherapyDetail(payload))
  })

  it('rejects a wrongly typed revision', () => {
    const payload = validDetail()
    payload.revision = '3' as unknown as number
    expectContractViolation(() => parseImmunotherapyDetail(payload))
  })
})

describe('parseClinicalExportPage', () => {
  it('returns a valid payload unchanged', () => {
    const payload = validExport()
    const snapshot = structuredClone(payload)
    const result = parseClinicalExportPage(payload)
    expect(result).toBe(payload)
    expect(result).toEqual(snapshot)
  })

  it('accepts unknown additive fields on page and rows', () => {
    const payload = {
      ...validExport(),
      items: [{ doseId: 'dose-1', futureColumn: 'x' }],
      cursor: 'next',
    }
    const result = parseClinicalExportPage(payload) as unknown as Record<
      string,
      unknown
    >
    expect(result.cursor).toBe('next')
    expect(result.items).toEqual([{ doseId: 'dose-1', futureColumn: 'x' }])
  })

  it('rejects a missing asOf', () => {
    const payload: Record<string, unknown> = { ...validExport() }
    delete payload.asOf
    expectContractViolation(() => parseClinicalExportPage(payload))
  })

  it('rejects a wrongly typed total', () => {
    const payload = validExport()
    payload.total = '1' as unknown as number
    expectContractViolation(() => parseClinicalExportPage(payload))
  })

  it('rejects a row without doseId', () => {
    const payload = validExport()
    payload.items = [{ status: 'SCHEDULED' }] as never
    expectContractViolation(() => parseClinicalExportPage(payload))
  })
})
