import { volumeSchema } from '@/shared/lib/field-schemas'
import { act, renderHook } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { useCountdown } from '@/shared/hooks/useCountdown'
import { useUnsavedChangesGuard } from '@/shared/hooks/useUnsavedChangesGuard'
import { parseIsoDate } from '@/shared/lib/dates'
import { formatVolume } from '@/shared/lib/formatters'

afterEach(() => vi.useRealTimers())

it('preserves exact decimal input and leaves malformed values for validation', () => {
  expect(formatVolume('0,0000001234567890123456789')).toBe('0.0000001234567890123456789')
  expect(formatVolume('1.2.3')).toBe('1.2.3')
  expect(formatVolume('-0.5')).toBe('-0.5')
  expect(volumeSchema.safeParse(formatVolume('0,0000001234567890123456789')).success).toBe(true)
  expect(volumeSchema.safeParse('1.2.3').success).toBe(false)
  expect(volumeSchema.safeParse('10.000000000000000000001').success).toBe(false)
  expect(volumeSchema.safeParse('0.0000').success).toBe(false)
})

it('rejects calendar rollover and accepts leap days', () => {
  expect(parseIsoDate('2026-02-30')).toBeNull()
  expect(parseIsoDate('2026-13-01')).toBeNull()
  expect(parseIsoDate('2026-01-01-extra')).toBeNull()
  expect(parseIsoDate('2024-02-29')?.getDate()).toBe(29)
})

it('resets the countdown and cleans up its timer', () => {
  vi.useFakeTimers()
  const { result, rerender, unmount } = renderHook(
    ({ resetKey }) => useCountdown(2, resetKey), { initialProps: { resetKey: 0 } },
  )
  act(() => vi.advanceTimersByTime(2000))
  expect(result.current.isExpired).toBe(true)
  rerender({ resetKey: 1 })
  expect(result.current.seconds).toBe(2)
  act(() => vi.advanceTimersByTime(1000))
  expect(result.current.seconds).toBe(1)
  unmount()
  expect(vi.getTimerCount()).toBe(0)
})

it('does not reopen a stale discard prompt when the form opens again', () => {
  const onClose = vi.fn()
  const { result, rerender } = renderHook(
    ({ open }) => useUnsavedChangesGuard({ open, isDirty: true, onClose }),
    { initialProps: { open: true } },
  )
  act(() => result.current.requestClose())
  expect(result.current.guardOpen).toBe(true)
  expect(onClose).not.toHaveBeenCalled()
  rerender({ open: false })
  rerender({ open: true })
  expect(result.current.guardOpen).toBe(false)
  act(() => result.current.requestClose())
  act(() => result.current.confirmDiscard())
  expect(onClose).toHaveBeenCalledOnce()
})
