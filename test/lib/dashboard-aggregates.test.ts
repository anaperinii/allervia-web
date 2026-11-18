import { describe, expect, it } from 'vitest'
import {
  activeByTypeFromMetrics,
  concentrationFromMetrics,
  volumeMatrixFromMetrics,
} from '@/features/dashboard/hooks/useDashboardAggregates'
import type { ClinicalMetrics } from '@/shared/api/contracts/clinical'

function metrics(overrides: Partial<ClinicalMetrics> = {}): ClinicalMetrics {
  return {
    from: '2026-10-09T00:00:00.000Z',
    to: '2026-10-11T23:59:00.000Z',
    timeZone: 'America/Sao_Paulo',
    applications: { total: 0, onSchedule: 0, offSchedule: 0, byDay: [] },
    scheduled: { pending: 0, overdue: 0 },
    adherence: { numerator: 0, denominator: 0, ratio: null },
    therapies: { inProgress: 0, suspended: 0, completed: 0, buildUp: 0, maintenance: 0 },
    concentration: [],
    volumeMatrix: [],
    phases: { buildUp: 0, maintenance: 0 },
    typesActive: [],
    ...overrides,
  }
}

describe('concentrationFromMetrics', () => {
  it('converts backend groupBy rows into labeled, percent-weighted entries, highest concentration first', () => {
    const entries = concentrationFromMetrics(
      metrics({
        concentration: [
          { concentration: 1000, count: 1, totalVolume: 0.1 },
          { concentration: 100, count: 3, totalVolume: 0.3 },
        ],
      }),
    )
    expect(entries).toEqual([
      { label: '1:1.000', count: 1, pct: 25 },
      { label: '1:100', count: 3, pct: 75 },
    ])
  })

  it('returns an empty list when the period has no administered doses', () => {
    expect(concentrationFromMetrics(metrics())).toEqual([])
  })
})

describe('volumeMatrixFromMetrics', () => {
  it('builds a concentration x volume matrix from the backend pairs', () => {
    const matrix = volumeMatrixFromMetrics(
      metrics({
        volumeMatrix: [
          { concentration: 1000, volume: 0.1, count: 2 },
          { concentration: 100, volume: 0.2, count: 1 },
        ],
      }),
    )
    expect(matrix.concentrations).toEqual(['1:1.000', '1:100'])
    expect(matrix.volumes).toEqual(['0,1ml', '0,2ml'])
    expect(matrix.counts).toEqual([
      [2, 0],
      [0, 1],
    ])
    expect(matrix.total).toBe(3)
    expect(matrix.max).toBe(2)
  })
})

describe('activeByTypeFromMetrics', () => {
  it('zero-fills known types absent from the backend aggregate', () => {
    const entries = activeByTypeFromMetrics(
      metrics({ typesActive: [{ immunoType: 'Ácaros', count: 2 }] }),
      ['Ácaros', 'Gramíneas'],
    )
    expect(entries).toEqual([
      { label: 'Ácaros', count: 2, pct: 100 },
      { label: 'Gramíneas', count: 0, pct: 0 },
    ])
  })
})
