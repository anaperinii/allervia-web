import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TimeSelect } from '@/shared/components/forms/TimeSelect'

function ControlledHarness({
  initial = '',
  onSubmit,
}: {
  initial?: string
  onSubmit?: (value: string) => void
}) {
  const [value, setValue] = useState(initial)
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit?.(value)
      }}
    >
      <TimeSelect value={value} onChange={setValue} aria-label="Horário" />
      <output data-testid="parent-value">{value}</output>
      <button type="submit">Salvar</button>
    </form>
  )
}

function getInput() {
  return screen.getByRole('textbox', { name: 'Horário' })
}

describe('TimeSelect (controlado pelo pai)', () => {
  it('digitar 10:00 mantém 10:00 e não vira 01:00', async () => {
    const user = userEvent.setup()
    render(<ControlledHarness />)
    const input = getInput()
    await user.type(input, '10:00')
    expect(input).toHaveValue('10:00')
    expect(screen.getByTestId('parent-value')).toHaveTextContent('10:00')
  })

  it('digitar 930 e sair do campo exibe 09:30 e envia 09:30 ao pai', async () => {
    const user = userEvent.setup()
    const submitted = vi.fn()
    render(<ControlledHarness onSubmit={submitted} />)
    const input = getInput()
    await user.type(input, '930')
    expect(screen.getByTestId('parent-value')).toHaveTextContent('')
    await user.tab()
    expect(input).toHaveValue('09:30')
    expect(screen.getByTestId('parent-value')).toHaveTextContent('09:30')
    await user.click(screen.getByRole('button', { name: 'Salvar' }))
    expect(submitted).toHaveBeenCalledWith('09:30')
  })

  it('digitar 09:30 completo confirma durante a digitação', async () => {
    const user = userEvent.setup()
    render(<ControlledHarness />)
    await user.type(getInput(), '09:30')
    expect(screen.getByTestId('parent-value')).toHaveTextContent('09:30')
  })

  it('colar 0930 confirma o horário normalizado', async () => {
    const user = userEvent.setup()
    render(<ControlledHarness />)
    const input = getInput()
    await user.click(input)
    await user.paste('0930')
    expect(screen.getByTestId('parent-value')).toHaveTextContent('09:30')
    await user.tab()
    expect(input).toHaveValue('09:30')
  })

  it('entrada inválida no blur conserva o valor confirmado anterior', async () => {
    const user = userEvent.setup()
    render(<ControlledHarness initial="08:00" />)
    const input = getInput()
    await user.clear(input)
    await user.type(input, '99')
    await user.tab()
    expect(input).toHaveValue('08:00')
    expect(screen.getByTestId('parent-value')).toHaveTextContent('08:00')
  })

  it('minutos inválidos (1090) não confirmam e revertem no blur', async () => {
    const user = userEvent.setup()
    render(<ControlledHarness initial="08:00" />)
    const input = getInput()
    await user.clear(input)
    await user.type(input, '1090')
    expect(screen.getByTestId('parent-value')).toHaveTextContent('08:00')
    await user.tab()
    expect(input).toHaveValue('08:00')
  })

  it('limpar o campo e sair conserva o valor anterior sem inventar horário', async () => {
    const user = userEvent.setup()
    render(<ControlledHarness initial="14:15" />)
    const input = getInput()
    await user.clear(input)
    await user.tab()
    expect(input).toHaveValue('14:15')
    expect(screen.getByTestId('parent-value')).toHaveTextContent('14:15')
  })

  it('seleção pela roda atualiza valor do pai e texto do campo', async () => {
    const user = userEvent.setup()
    render(<ControlledHarness initial="08:00" />)
    await user.click(
      screen.getByRole('button', { name: 'Abrir seletor de horário' }),
    )
    const dialog = within(screen.getByRole('dialog', { name: 'Horário' }))
    const hourTen = dialog.getAllByRole('button', { name: '10' })[0]
    await user.click(hourTen)
    await user.click(dialog.getByRole('button', { name: '45' }))
    expect(screen.getByTestId('parent-value')).toHaveTextContent('10:45')
    expect(getInput()).toHaveValue('10:45')
  })

  it('atualização externa do value sincroniza o texto exibido', () => {
    const onChange = vi.fn()
    const { rerender } = render(
      <TimeSelect value="08:00" onChange={onChange} aria-label="Horário" />,
    )
    expect(getInput()).toHaveValue('08:00')
    rerender(
      <TimeSelect value="16:20" onChange={onChange} aria-label="Horário" />,
    )
    expect(getInput()).toHaveValue('16:20')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('Escape fecha o seletor aberto', async () => {
    const user = userEvent.setup()
    render(<ControlledHarness initial="08:00" />)
    await user.click(
      screen.getByRole('button', { name: 'Abrir seletor de horário' }),
    )
    expect(screen.getByRole('dialog', { name: 'Horário' })).toBeInTheDocument()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(
      screen.queryByRole('dialog', { name: 'Horário' }),
    ).not.toBeInTheDocument()
  })
})
