import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ProtocolEditor } from '@/features/protocols/protocol-editor'
import { validateDraft } from '@/features/protocols/protocol-draft'
import {
  deriveStepIntervalTolerance,
  toleranceProblems,
} from '@/shared/lib/dose-interval'
import type { ProtocolDefinitionDraft } from '@/shared/api/contracts/protocols'

function draft(
  steps: ProtocolDefinitionDraft['steps'],
): ProtocolDefinitionDraft {
  return {
    schemaVersion: 1,
    engineVersion: '1',
    route: 'SUBCUTANEOUS',
    volumeUnit: 'mL',
    concentrationUnit: 'DILUTION_DENOMINATOR',
    steps,
  }
}

const BUILD_UP = {
  id: 'low',
  label: 'Baixa',
  phase: 'BUILD_UP' as const,
  concentration: '1000',
  volume: '0.1',
  intervalDays: 7,
  nextStepId: 'high',
}

const MAINTENANCE = {
  id: 'high',
  label: 'Meta',
  phase: 'MAINTENANCE' as const,
  concentration: '1000',
  volume: '0.4',
  intervalDays: 14,
  nextStepId: 'high',
}

describe('tolerância de intervalo no editor de protocolo', () => {
  afterEach(cleanup)

  it('deriva os limites do passo e do seguinte, como o servidor', () => {
    expect(deriveStepIntervalTolerance(7, 7)).toEqual({
      shortBelowDays: 4,
      longFromDays: 10,
      stepReviewAboveDays: 14,
    })
    expect(deriveStepIntervalTolerance(7, 14)).toEqual({
      shortBelowDays: 4,
      longFromDays: 14,
      stepReviewAboveDays: 21,
    })
    expect(deriveStepIntervalTolerance(28, 28)).toEqual({
      shortBelowDays: 14,
      longFromDays: 42,
      stepReviewAboveDays: 56,
    })
    expect(deriveStepIntervalTolerance(14, null)).toEqual({
      shortBelowDays: 7,
      longFromDays: 21,
      stepReviewAboveDays: 28,
    })
  })

  it('recusa limites fora de ordem', () => {
    expect(
      toleranceProblems(
        { shortBelowDays: 9, longFromDays: 10, stepReviewAboveDays: 14 },
        7,
      ),
    ).toContain('o limite curto não pode passar do intervalo da etapa')
    expect(
      toleranceProblems(
        { shortBelowDays: 5, longFromDays: 7, stepReviewAboveDays: 14 },
        7,
      ),
    ).toContain('o limite longo precisa ser maior que o intervalo da etapa')
    expect(
      toleranceProblems(
        { shortBelowDays: 5, longFromDays: 10, stepReviewAboveDays: 9 },
        7,
      ),
    ).toContain('o limite de revisão não pode vir antes do limite longo')
    expect(
      toleranceProblems(
        { shortBelowDays: 5, longFromDays: 10, stepReviewAboveDays: 14 },
        7,
      ),
    ).toEqual([])
  })

  it('bloqueia o rascunho com tolerância inválida', () => {
    const invalid = draft([
      {
        ...BUILD_UP,
        intervalTolerance: {
          shortBelowDays: 5,
          longFromDays: 6,
          stepReviewAboveDays: 14,
        },
      },
      MAINTENANCE,
    ])
    expect(validateDraft(invalid).join(' ')).toContain(
      'o limite longo precisa ser maior que o intervalo da etapa',
    )
    expect(validateDraft(draft([BUILD_UP, MAINTENANCE]))).toEqual([])
  })

  it('mostra o derivado e deixa definir os limites do passo', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(
      <ProtocolEditor
        draft={draft([BUILD_UP, MAINTENANCE])}
        readOnly={false}
        onChange={onChange}
      />,
    )

    expect(
      screen.getAllByText(/derivado desta etapa e da seguinte/i).length,
    ).toBeGreaterThan(0)
    expect(screen.queryByText('Curto abaixo de')).toBeNull()

    await user.click(screen.getAllByRole('button', { name: 'Definir limites' })[0])

    expect(onChange).toHaveBeenCalledTimes(1)
    const next = onChange.mock.calls[0][0] as ProtocolDefinitionDraft
    expect(next.steps[0].intervalTolerance).toEqual({
      shortBelowDays: 4,
      longFromDays: 14,
      stepReviewAboveDays: 21,
    })
  })

  it('edita e remove os limites já definidos', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(
      <ProtocolEditor
        draft={draft([
          {
            ...BUILD_UP,
            intervalTolerance: {
              shortBelowDays: 5,
              longFromDays: 10,
              stepReviewAboveDays: 14,
            },
          },
          MAINTENANCE,
        ])}
        readOnly={false}
        onChange={onChange}
      />,
    )

    expect(screen.getByDisplayValue('5')).toBeInTheDocument()
    expect(screen.getByText('Limites definidos neste protocolo.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Voltar ao derivado' }))
    const next = onChange.mock.calls[0][0] as ProtocolDefinitionDraft
    expect(next.steps[0].intervalTolerance).toBeUndefined()
  })

  it('não oferece edição em versão somente leitura', () => {
    render(
      <ProtocolEditor
        draft={draft([BUILD_UP, MAINTENANCE])}
        readOnly
        onChange={vi.fn()}
      />,
    )
    expect(screen.queryByRole('button', { name: 'Definir limites' })).toBeNull()
  })
})
