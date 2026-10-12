import { describe, expect, it } from 'vitest'
import {
  aggregateByConcentration,
  aggregatePhasesByDay,
  aggregateVolumeMatrix,
} from '@/features/dashboard/hooks/useDashboardAggregates'
import type { DoseValues, ScheduleDoseItem } from '@/shared/api/contracts/clinical'

function doseValues(overrides: Partial<DoseValues> = {}): DoseValues {
  return {
    concentration: '1000',
    concentrationUnit: 'DILUTION_DENOMINATOR',
    intervalDays: 7,
    phase: 'BUILD_UP',
    route: 'SUBCUTANEOUS',
    volume: '0.1',
    volumeUnit: 'mL',
    ...overrides,
  }
}

function dose(overrides: Partial<ScheduleDoseItem> = {}): ScheduleDoseItem {
  return {
    id: 'dose-1',
    immunotherapyId: 'therapy-1',
    revision: 1,
    scheduledAt: '2026-10-11T02:30:00.000Z',
    administeredAt: '2026-10-11T02:30:00.000Z',
    administrationEndedAt: null,
    administeredStepId: null,
    plannedStepId: null,
    plannedValues: doseValues(),
    administeredValues: doseValues(),
    status: 'ADMINISTERED_ON_SCHEDULE',
    immunotherapy: {
      id: 'therapy-1',
      extract: 'Der p 60%',
      immunoType: 'Ácaros',
      revision: 1,
      status: 'IN_PROGRESS',
      patient: {
        id: 'patient-1',
        fullName: 'Paula Andrade',
        isActive: true,
        phoneNumber: '+5511999999999',
        responsiblePhysician: { id: 'professional-1', fullName: 'Dra. Karina Martins' },
      },
    },
    ...overrides,
  }
}

describe('aggregatePhasesByDay', () => {
  it('buckets a 23:30 local application on the organization civil day, not the UTC day', () => {
    const series = aggregatePhasesByDay(
      [dose()],
      '2026-10-09',
      '2026-10-11',
      'America/Sao_Paulo',
    )
    expect(series.find((entry) => entry.date === '2026-10-10')).toMatchObject({
      buildUp: 1,
      maintenance: 0,
    })
    expect(series.find((entry) => entry.date === '2026-10-11')).toMatchObject({
      buildUp: 0,
      maintenance: 0,
    })
  })

  it('buckets the same instant on the UTC day when the organization zone is UTC', () => {
    const series = aggregatePhasesByDay([dose()], '2026-10-09', '2026-10-11', 'UTC')
    expect(series.find((entry) => entry.date === '2026-10-11')).toMatchObject({
      buildUp: 1,
    })
    expect(series.find((entry) => entry.date === '2026-10-10')).toMatchObject({
      buildUp: 0,
    })
  })

  it('ignores retracted doses even when administeredAt is preserved', () => {
    const series = aggregatePhasesByDay(
      [dose({ status: 'ENTERED_IN_ERROR' })],
      '2026-10-09',
      '2026-10-11',
      'America/Sao_Paulo',
    )
    expect(series.every((entry) => entry.buildUp + entry.maintenance === 0)).toBe(true)
  })
})

describe('exclusão de doses retraídas nos agregados locais', () => {
  const doses = [
    dose(),
    dose({ id: 'dose-2', status: 'ENTERED_IN_ERROR' }),
    dose({ id: 'dose-3', status: 'SCHEDULED', administeredAt: null, administeredValues: null }),
  ]

  it('aggregateByConcentration counts only administered doses', () => {
    const entries = aggregateByConcentration(doses)
    expect(entries).toEqual([{ label: '1:1.000', count: 1, pct: 100 }])
  })

  it('aggregateVolumeMatrix counts only administered doses', () => {
    const matrix = aggregateVolumeMatrix(doses)
    expect(matrix.total).toBe(1)
    expect(matrix.counts).toEqual([[1]])
  })
})
