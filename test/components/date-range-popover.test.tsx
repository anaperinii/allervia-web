import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { DateRange } from 'react-day-picker'
import { DateRangePopover } from '@/features/dashboard/components/showcase/DateRangePopover'

function Harness({ initialOpen = true }: { initialOpen?: boolean }) {
  const [range, setRange] = useState<DateRange | undefined>()
  const [open, setOpen] = useState(initialOpen)
  return (
    <div>
      <DateRangePopover
        open={open}
        range={range}
        onRangeChange={setRange}
        onClose={() => setOpen(false)}
      />
      <output data-testid="range">
        {range?.from ? range.from.toISOString() : 'none'}
      </output>
    </div>
  )
}

describe('DateRangePopover', () => {
  it('monta sem loop de atualização e seleciona um intervalo', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const user = userEvent.setup()
    render(<Harness />)

    expect(
      screen.getByRole('dialog', { name: 'Selecionar período' }),
    ).toBeInTheDocument()

    const dayButtons = screen
      .getAllByRole('button')
      .filter((button) => /^\d{1,2}$/.test(button.textContent ?? ''))
    await user.click(dayButtons[9])
    expect(screen.getByTestId('range')).not.toHaveTextContent('none')

    const updateDepthErrors = consoleError.mock.calls.filter((call) =>
      String(call[0]).includes('Maximum update depth'),
    )
    expect(updateDepthErrors).toEqual([])
    consoleError.mockRestore()
  })
})
