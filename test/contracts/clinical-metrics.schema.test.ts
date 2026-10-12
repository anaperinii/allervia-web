import { describe, expect, it } from 'vitest'
import { parseClinicalMetrics } from '@/shared/api/contracts/clinical-metrics.schema'
import { expectContractViolation } from './contract-parsing'

function validMetrics() {
  return {
    from: '2026-10-01T00:00:00.000-03:00',
    to: '2026-10-10T23:59:59.999-03:00',
    timeZone: 'America/Sao_Paulo',
    applications: {
      total: 4,
      onSchedule: 3,
      offSchedule: 1,
      byDay: [{ day: '2026-10-02', count: 4 }],
    },
    scheduled: { pending: 2, overdue: 1 },
    adherence: { numerator: 3, denominator: 4, ratio: 0.75 as number | null },
    therapies: {
      inProgress: 5,
      suspended: 1,
      completed: 2,
      buildUp: 3,
      maintenance: 2,
    },
  }
}

describe('parseClinicalMetrics', () => {
  it('returns a valid payload unchanged', () => {
    const payload = validMetrics()
    const snapshot = structuredClone(payload)
    const result = parseClinicalMetrics(payload)
    expect(result).toBe(payload)
    expect(result).toEqual(snapshot)
  })

  it('keeps legitimate zeros as zeros', () => {
    const payload = {
      ...validMetrics(),
      applications: { total: 0, onSchedule: 0, offSchedule: 0, byDay: [] },
      scheduled: { pending: 0, overdue: 0 },
      adherence: { numerator: 0, denominator: 0, ratio: null },
      therapies: {
        inProgress: 0,
        suspended: 0,
        completed: 0,
        buildUp: 0,
        maintenance: 0,
      },
    }
    const result = parseClinicalMetrics(payload)
    expect(result.applications.total).toBe(0)
    expect(result.scheduled.pending).toBe(0)
    expect(result.adherence.ratio).toBeNull()
  })

  it('accepts unknown additive fields and preserves them', () => {
    const payload = { ...validMetrics(), futureSection: { anything: true } }
    const result = parseClinicalMetrics(payload) as Record<string, unknown>
    expect(result).toBe(payload)
    expect(result.futureSection).toEqual({ anything: true })
  })

  it('rejects applications whose total differs from onSchedule + offSchedule', () => {
    const payload = validMetrics()
    payload.applications = {
      total: 5,
      onSchedule: 3,
      offSchedule: 1,
      byDay: [{ day: '2026-10-02', count: 5 }],
    }
    expectContractViolation(() => parseClinicalMetrics(payload))
  })

  it('rejects a byDay sum that differs from applications.total', () => {
    const payload = validMetrics()
    payload.applications.byDay = [
      { day: '2026-10-02', count: 2 },
      { day: '2026-10-03', count: 3 },
    ]
    expectContractViolation(() => parseClinicalMetrics(payload))
  })

  it('accepts a byDay split across days that sums to the total', () => {
    const payload = validMetrics()
    payload.applications.byDay = [
      { day: '2026-10-02', count: 1 },
      { day: '2026-10-03', count: 3 },
    ]
    expect(parseClinicalMetrics(payload).applications.total).toBe(4)
  })

  it('rejects a numeric ratio when the denominator is zero', () => {
    const payload = validMetrics()
    payload.adherence = { numerator: 0, denominator: 0, ratio: 0 }
    expectContractViolation(() => parseClinicalMetrics(payload))
  })

  it('accepts a null ratio alongside a positive denominator window edge', () => {
    const payload = validMetrics()
    payload.adherence = { numerator: 0, denominator: 0, ratio: null }
    expect(parseClinicalMetrics(payload).adherence.ratio).toBeNull()
  })

  it('rejects a missing payload', () => {
    expectContractViolation(() => parseClinicalMetrics(undefined))
    expectContractViolation(() => parseClinicalMetrics(null))
  })

  it('rejects a missing required section', () => {
    const payload: Record<string, unknown> = { ...validMetrics() }
    delete payload.therapies
    expectContractViolation(() => parseClinicalMetrics(payload))
  })

  it('rejects a wrongly typed count', () => {
    const payload = validMetrics()
    payload.applications.total = '4' as unknown as number
    expectContractViolation(() => parseClinicalMetrics(payload))
  })

  it('rejects negative and non-finite counts', () => {
    const negative = validMetrics()
    negative.scheduled.overdue = -1
    expectContractViolation(() => parseClinicalMetrics(negative))
    const infinite = validMetrics()
    infinite.applications.total = Number.POSITIVE_INFINITY
    expectContractViolation(() => parseClinicalMetrics(infinite))
  })

  it('never leaks the clinical body in the violation message', () => {
    const payload = validMetrics()
    payload.adherence = { numerator: 7, denominator: 0, ratio: 0.99 }
    const violation = expectContractViolation(() => parseClinicalMetrics(payload))
    expect(violation.message).not.toContain('0.99')
    expect(violation.message).not.toContain('adherence')
    expect(violation.message).not.toContain('America/Sao_Paulo')
  })
})
