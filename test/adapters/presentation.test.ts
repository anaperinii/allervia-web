import { describe, expect, it } from 'vitest'
import { isoToPtDate } from '@/shared/lib/dates'
import { formatCPF, formatWeight } from '@/shared/lib/formatters'
import { loginSchema } from '@/features/auth/schemas/login'

describe('existing presentation boundary', () => {
  it('preserves a civil date without timezone conversion', () => {
    expect(isoToPtDate('2000-02-29')).toBe('29/02/2000')
  })
  it('formats identifiers without numerical conversion', () => {
    expect(formatCPF('01234567890')).toBe('012.345.678-90')
  })
  it('normalizes a localized weight for the form', () => {
    expect(formatWeight('70,5')).toBe('70.5')
  })
  it('rejects an invalid login before any request', () => {
    expect(loginSchema.safeParse({ email: 'invalid', password: '' }).success).toBe(false)
    expect(loginSchema.safeParse({ email: 'synthetic@example.test', password: 'example' }).success).toBe(true)
  })
})
