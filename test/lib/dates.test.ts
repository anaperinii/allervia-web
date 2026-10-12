import { describe, expect, it } from 'vitest'
import { addDaysToDay, dayInZone, toZonedOffsetIso } from '@/shared/lib/dates'

describe('toZonedOffsetIso', () => {
  it('serializes a wall time with the offset of the organization zone, not the browser zone', () => {
    expect(toZonedOffsetIso('2026-10-10', '23:30', 'America/Sao_Paulo')).toBe(
      '2026-10-10T23:30:00-03:00',
    )
    expect(toZonedOffsetIso('2026-10-10', '23:30', 'UTC')).toBe(
      '2026-10-10T23:30:00+00:00',
    )
  })

  it('maps 23:30 in the organization zone to the correct absolute instant', () => {
    const instant = new Date(toZonedOffsetIso('2026-10-10', '23:30', 'America/Sao_Paulo'))
    expect(instant.toISOString()).toBe('2026-10-11T02:30:00.000Z')
  })

  it('follows daylight saving transitions of the zone', () => {
    expect(toZonedOffsetIso('2026-01-15', '12:00', 'Europe/Berlin')).toBe(
      '2026-01-15T12:00:00+01:00',
    )
    expect(toZonedOffsetIso('2026-07-15', '12:00', 'Europe/Berlin')).toBe(
      '2026-07-15T12:00:00+02:00',
    )
  })

  it('supports zones with non-hour offsets', () => {
    expect(toZonedOffsetIso('2026-10-10', '08:00', 'Asia/Kolkata')).toBe(
      '2026-10-10T08:00:00+05:30',
    )
  })
})

describe('dayInZone', () => {
  it('resolves the civil day in the organization zone even when UTC already rolled over', () => {
    const instant = new Date('2026-10-11T02:30:00.000Z')
    expect(dayInZone(instant, 'America/Sao_Paulo')).toBe('2026-10-10')
    expect(dayInZone(instant, 'UTC')).toBe('2026-10-11')
  })
})

describe('addDaysToDay', () => {
  it('walks civil days across month and year boundaries', () => {
    expect(addDaysToDay('2026-10-10', -29)).toBe('2026-09-11')
    expect(addDaysToDay('2026-03-01', -1)).toBe('2026-02-28')
    expect(addDaysToDay('2026-01-01', -1)).toBe('2025-12-31')
    expect(addDaysToDay('2026-12-31', 1)).toBe('2027-01-01')
  })
})
