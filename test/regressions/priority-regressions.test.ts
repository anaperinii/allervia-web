import { describe, expect, it } from 'vitest'
import { collectPages } from '@/shared/api/pagination'
import { RegistrationIntent } from '@/shared/api/registration-intent'
import { buildClinicalSummary } from '@/features/patient/adapters/clinical-summary'
import { administeredDose, doseDetail, doseRecord } from '../fixtures/clinical'

describe('bounded pagination', () => {
  it('collects the 101st record without losing the total', async () => {
    const pages: number[] = []
    const result = await collectPages(async (page) => {
      pages.push(page)
      return { total: 101, items: Array.from({ length: page === 1 ? 100 : 1 }, (_, n) => ({ id: String((page - 1) * 100 + n) })) }
    }, { maxPages: 5 })
    expect(pages).toEqual([1, 2])
    expect(result).toMatchObject({ total: 101, complete: true, truncated: false })
    expect(result.items.at(-1)?.id).toBe('100')
  })
  it('reports a declared ceiling instead of claiming completeness', async () => {
    const result = await collectPages(async (page) => ({ total: 600, items: [{ id: String(page) }] }), { maxPages: 2 })
    expect(result).toMatchObject({ total: 600, complete: false, truncated: true })
  })
  it('rejects repeated pages', async () => {
    await expect(collectPages(async () => ({ total: 2, items: [{ id: 'same' }] }), { maxPages: 5 })).rejects.toThrow('Repeated')
  })
  it('rejects an empty page before the declared end', async () => {
    await expect(collectPages(async () => ({ total: 1, items: [] }), { maxPages: 5 })).rejects.toThrow('no progress')
  })
  it('rejects a changing total', async () => {
    await expect(collectPages(async (page) => ({ total: page + 1, items: [{ id: String(page) }] }), { maxPages: 5 })).rejects.toThrow('changed')
  })
  it('stops on cancellation before accepting a response', async () => {
    const controller = new AbortController()
    await expect(collectPages(async () => {
      controller.abort()
      return { total: 1, items: [{ id: 'cancelled' }] }
    }, { maxPages: 5, signal: controller.signal })).rejects.toMatchObject({ name: 'AbortError' })
  })
  it('uses user identity for professional directory rows', async () => {
    const result = await collectPages(async () => ({ total: 1, items: [{ userId: 'user-101' }] }), { maxPages: 5, getId: (row) => row.userId })
    expect(result.items[0].userId).toBe('user-101')
  })
})

describe('registration intent', () => {
  it('reuses its receipt key after an indeterminate result', () => {
    const intent = new RegistrationIntent()
    const key = intent.prepare({ patientId: 'patient-1', extract: 'A' })
    intent.failed(false)
    expect(intent.prepare({ patientId: 'patient-1', extract: 'A' })).toBe(key)
  })
  it('blocks a changed command while the previous result is unknown', () => {
    const intent = new RegistrationIntent()
    intent.prepare({ extract: 'A' })
    intent.failed(false)
    expect(() => intent.prepare({ extract: 'B' })).toThrow('resultado desconhecido')
  })
  it('creates a new key for a changed command after definite rejection', () => {
    const intent = new RegistrationIntent()
    const key = intent.prepare({ extract: 'A' })
    intent.failed(true)
    expect(intent.prepare({ extract: 'B' })).not.toBe(key)
  })
})

describe('clinical summary provenance', () => {
  it('does not count retracted doses or derive reactions from a conduct', () => {
    const summary = buildClinicalSummary([
      administeredDose({ id: 'valid', immediateConduct: 'MAINTAIN' }),
      administeredDose({ id: 'retracted', status: 'ENTERED_IN_ERROR' }),
      doseRecord({ id: 'pending' }),
    ], null)
    expect(summary.administered.map((dose) => dose.id)).toEqual(['valid'])
    expect(summary.reactionsCount).toBeNull()
    expect(summary.targetPresentation).toBeNull()
  })
  it('preserves unavailable interval instead of manufacturing zero', () => {
    expect(buildClinicalSummary([], null).intervalDays).toBeNull()
  })
  it('uses the explicit prescription target instead of the final allowed option', () => {
    const detail = doseDetail()
    const target = detail.allowedValues[0]
    detail.immunotherapy.currentPrescription = {
      id: 'prescription-1', immunotherapyId: 'therapy-1', organizationId: 'organization-1',
      createdAt: '2026-01-01T00:00:00Z', createdById: 'user-1', revision: 1, revisionReason: null,
      versionId: 'version-1', version: { id: 'version-1', number: 1, status: 'PUBLISHED', definition: {}, createdAt: '2026-01-01T00:00:00Z', createdById: 'user-1', engineVersion: '1', organizationId: 'organization-1', protocolId: 'protocol-1', publishedAt: '2026-01-01T00:00:00Z', publishedById: 'user-1', revision: 1, schemaVersion: 1 },
      resolved: { protocolId: 'protocol-1', protocolVersionId: 'version-1', route: 'SUBCUTANEOUS', startingStepId: target.id, stepIds: [target.id], targetStepId: target.id, timeZone: 'America/Sao_Paulo' },
    }
    expect(buildClinicalSummary([], detail).targetPresentation).toContain(target.volume.replace('.', ','))
  })
})
