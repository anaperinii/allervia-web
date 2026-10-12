import { describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'
import { useState } from 'react'
import type { DateRange } from 'react-day-picker'
import { DateRangePopover } from '@/features/dashboard/components/showcase/DateRangePopover'

function Harness({ open }: { open: boolean }) {
  const [range, setRange] = useState<DateRange | undefined>()
  const [calendarOpen, setCalendarOpen] = useState(open)
  return (
    <DateRangePopover
      open={calendarOpen}
      range={range}
      onRangeChange={setRange}
      onClose={() => setCalendarOpen(false)}
    />
  )
}

describe('repro', () => {
  it('mount closed', () => {
    const errorSpy = vi.spyOn(console, 'error')
    render(<Harness open={false} />)
    expect(errorSpy.mock.calls.flat().join('\n')).not.toMatch(/Maximum update depth/)
  })
  it('mount open', () => {
    const errorSpy = vi.spyOn(console, 'error')
    render(<Harness open />)
    expect(errorSpy.mock.calls.flat().join('\n')).not.toMatch(/Maximum update depth/)
  })
})
