import { useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { VerificationCodeInput } from '@/shared/components/forms/VerificationCodeInput'

function CodeForm() {
  const [value, setValue] = useState('')
  return <><VerificationCodeInput value={value} onChange={setValue} /><output aria-label="Entered code">{value}</output></>
}

describe('verification input interaction', () => {
  it('accepts numeric typing and moves keyboard focus', async () => {
    const user = userEvent.setup()
    render(<CodeForm />)
    await user.type(screen.getByLabelText('Dígito 1 de 6'), 'a1')
    expect(screen.getByLabelText('Entered code')).toHaveTextContent('1')
    expect(screen.getByLabelText('Dígito 2 de 6')).toHaveFocus()
  })
  it('accepts a pasted code without separators', () => {
    render(<CodeForm />)
    fireEvent.paste(screen.getByRole('group'), { clipboardData: { getData: () => '123 456' } })
    expect(screen.getByLabelText('Entered code')).toHaveTextContent('123456')
    expect(screen.getByLabelText('Dígito 6 de 6')).toHaveFocus()
  })
})
