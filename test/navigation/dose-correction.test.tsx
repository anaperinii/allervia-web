import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { RetractDoseModal } from '@/features/patient/components/chart/DoseCorrectionModals'
import { withSession } from '../helpers/session'

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

const DOSE = {
  id: 'dose-1',
  revision: 2,
  therapyRevision: 5,
}

function stubApi(failFirstRetract: boolean) {
  let retractAttempts = 0
  const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    if (url.includes('/doses/dose-1/retract') && init?.method === 'POST') {
      retractAttempts += 1
      if (failFirstRetract && retractAttempts === 1) {
        return Promise.resolve(
          jsonResponse(
            { statusCode: 500, code: 'INTERNAL_ERROR', message: 'Erro interno.' },
            500,
          ),
        )
      }
      return Promise.resolve(
        jsonResponse(
          {
            dose: { id: 'dose-1' },
            reissuedDose: { id: 'dose-2' },
            archivedSuccessorId: null,
            therapyRevision: 6,
          },
          201,
        ),
      )
    }
    if (url.includes('/doses/dose-1')) {
      return Promise.resolve(jsonResponse(DOSE))
    }
    return Promise.resolve(jsonResponse({}))
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

function retractBodies(fetchMock: ReturnType<typeof stubApi>) {
  return fetchMock.mock.calls
    .filter(
      ([url, init]) =>
        String(url).includes('/doses/dose-1/retract') &&
        (init as RequestInit | undefined)?.method === 'POST',
    )
    .map(([, init]) => JSON.parse((init as RequestInit).body as string))
}

describe('retração de dose com comando idempotente', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('reenvia a mesma chave após falha e troca de chave quando o conteúdo muda', async () => {
    const fetchMock = stubApi(true)
    const user = userEvent.setup()
    render(
      withSession(
        <RetractDoseModal
          doseId="dose-1"
          organizationId="organization-1"
          onClose={() => {}}
        />,
      ),
    )

    const submit = screen.getByRole('button', { name: /registrar em erro/i })
    await waitFor(() => expect(submit).toBeDisabled())

    const reasonLabel = screen.getByText(/motivo clínico da retratação/i, { selector: 'label' })
    const reasonField = reasonLabel.parentElement!.querySelector('textarea')!
    await user.type(reasonField, 'Registro lançado no paciente errado.')
    await waitFor(() => expect(submit).toBeEnabled())

    await user.click(submit)
    await waitFor(() => expect(retractBodies(fetchMock)).toHaveLength(1))
    await waitFor(() => expect(submit).toBeEnabled())

    await user.click(submit)
    await waitFor(() => expect(retractBodies(fetchMock)).toHaveLength(2))

    const [first, second] = retractBodies(fetchMock)
    expect(first.idempotencyKey).toEqual(expect.any(String))
    expect(first.reason).toBe('Registro lançado no paciente errado.')
    expect(first.expectedRevision).toBe(2)
    expect(first.expectedTherapyRevision).toBe(5)
    expect(second.idempotencyKey).toBe(first.idempotencyKey)

    await waitFor(() => expect(submit).toBeEnabled())
    await user.type(reasonField, ' Corrigido o prontuário.')
    await user.click(submit)
    await waitFor(() => expect(retractBodies(fetchMock)).toHaveLength(3))

    const third = retractBodies(fetchMock)[2]
    expect(third.idempotencyKey).toEqual(expect.any(String))
    expect(third.idempotencyKey).not.toBe(first.idempotencyKey)
  })
})
