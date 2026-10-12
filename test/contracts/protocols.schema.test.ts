import { describe, expect, it } from 'vitest'
import { parseProtocolVersion } from '@/shared/api/contracts/protocols.schema'
import { expectContractViolation } from './contract-parsing'

function validVersion() {
  return {
    id: 'version-1',
    protocolId: 'protocol-1',
    number: 2,
    status: 'PUBLISHED',
    revision: 4,
    definition: {
      schemaVersion: 1,
      engineVersion: '1',
      route: 'SUBCUTANEOUS',
      volumeUnit: 'mL',
      concentrationUnit: 'DILUTION_DENOMINATOR',
      steps: [
        {
          id: 'step-1',
          label: '1:1000 0,1ml',
          concentration: '1000',
          volume: '0.1',
          intervalDays: 7,
          phase: 'BUILD_UP',
          nextStepId: null,
        },
      ],
    },
    createdAt: '2026-01-01T12:00:00.000Z',
    publishedAt: '2026-01-02T12:00:00.000Z',
  }
}

describe('parseProtocolVersion', () => {
  it('returns a valid payload unchanged', () => {
    const payload = validVersion()
    const snapshot = structuredClone(payload)
    const result = parseProtocolVersion(payload)
    expect(result).toBe(payload)
    expect(result).toEqual(snapshot)
  })

  it('accepts unknown additive fields and preserves them', () => {
    const payload = { ...validVersion(), reviewState: 'APPROVED' }
    const result = parseProtocolVersion(payload) as unknown as Record<
      string,
      unknown
    >
    expect(result.reviewState).toBe('APPROVED')
  })

  it('rejects a definition without steps', () => {
    const payload = validVersion()
    delete (payload.definition as Record<string, unknown>).steps
    expectContractViolation(() => parseProtocolVersion(payload))
  })

  it('rejects an unknown status', () => {
    const payload = validVersion()
    payload.status = 'ARCHIVED'
    expectContractViolation(() => parseProtocolVersion(payload))
  })

  it('rejects a wrongly typed revision', () => {
    const payload = validVersion()
    payload.revision = '4' as unknown as number
    expectContractViolation(() => parseProtocolVersion(payload))
  })

  it('rejects a step without id', () => {
    const payload = validVersion()
    payload.definition.steps = [{ label: 'x' }] as never
    expectContractViolation(() => parseProtocolVersion(payload))
  })
})
