import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createMemoryHistory, createRootRoute, createRoute, createRouter, RouterProvider } from '@tanstack/react-router'
import { afterEach, expect, it, vi } from 'vitest'
import { TrialPage } from '@/features/auth/trial-page'
import { LandingThemeProvider } from '@/features/landing-page/theme-context'
import { trialSchema } from '@/features/auth/schemas/trial'

vi.mock('@/shared/components/Aurora', () => ({ Aurora: () => null }))
afterEach(() => vi.unstubAllGlobals())

async function page() {
  const root = createRootRoute()
  const trial = createRoute({ getParentRoute: () => root, path: '/trial', component: TrialPage })
  const router = createRouter({ routeTree: root.addChildren([trial]), history: createMemoryHistory({ initialEntries: ['/trial'] }) })
  await router.load()
  render(<LandingThemeProvider><RouterProvider router={router} /></LandingThemeProvider>)
  await screen.findByRole('button', { name: 'Solicitar demonstração' })
}

function fill() {
  for (const [label, value] of Object.entries({
    Nome: 'Maria', Sobrenome: 'Teste', 'E-mail profissional': 'maria@example.com',
    Telefone: '11999999999', Atuação: 'doctor', 'Uso pretendido': 'single_clinic',
    Especialidade: 'Alergologia', 'Número de profissionais': '3',
  })) fireEvent.change(screen.getByLabelText(label), { target: { value } })
}

it('waits for the real HTTP receipt before showing success and sends all fields without cookies', async () => {
  let resolve!: (response: Response) => void
  const fetchMock = vi.fn().mockReturnValue(new Promise<Response>(done => { resolve = done }))
  vi.stubGlobal('fetch', fetchMock)
  await page()
  fill()
  fireEvent.click(screen.getByRole('button', { name: 'Solicitar demonstração' }))
  await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce())
  expect(screen.queryByRole('heading', { name: 'Solicitação recebida!' })).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Enviando solicitação…' })).toBeDisabled()
  const [url, options] = fetchMock.mock.calls[0]
  expect(url).toBe('/backend/demo-requests')
  expect(options.credentials).toBe('omit')
  expect(JSON.parse(options.body)).toEqual({
    requestId: expect.any(String), name: 'Maria', lastName: 'Teste', email: 'maria@example.com',
    phone: '11999999999', role: 'doctor', solution: 'single_clinic', specialty: 'Alergologia', professionals: 3,
  })
  await act(async () => resolve(new Response(JSON.stringify({ received: true, id: 'DEMO-123', createdAt: '2026-09-23T12:00:00Z' }), { status: 202 })))
  expect(await screen.findByRole('heading', { name: 'Solicitação recebida!' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Solicitação recebida' })).toBeDisabled()
})

it('preserves values and the idempotency key after a network failure', async () => {
  const fetchMock = vi.fn().mockRejectedValueOnce(new TypeError('network')).mockResolvedValueOnce(
    new Response(JSON.stringify({ received: true, id: 'DEMO-RETRY', createdAt: '2026-09-23T12:00:00Z' }), { status: 202 }),
  )
  vi.stubGlobal('fetch', fetchMock)
  await page()
  fill()
  fireEvent.click(screen.getByRole('button', { name: 'Solicitar demonstração' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('Tente novamente')
  expect(screen.getByLabelText('Nome')).toHaveValue('Maria')
  expect(screen.queryByRole('heading', { name: 'Solicitação recebida!' })).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Solicitar demonstração' }))
  await screen.findByRole('heading', { name: 'Solicitação recebida!' })
  expect(fetchMock.mock.calls[0][1].body).toBe(fetchMock.mock.calls[1][1].body)
})

it('shows server rejection instead of a success modal', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
    statusCode: 429, code: 'DEMO_REQUEST_LIMIT', message: 'Aguarde antes de tentar novamente.',
  }), { status: 429 })))
  await page()
  fill()
  fireEvent.click(screen.getByRole('button', { name: 'Solicitar demonstração' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('Aguarde antes')
  expect(screen.queryByRole('heading', { name: 'Solicitação recebida!' })).not.toBeInTheDocument()
})

it('rejects partial numbers and unknown select values', () => {
  const input = { name: 'Maria', lastName: 'Teste', email: 'maria@example.com', phone: '11999999999',
    role: 'doctor', solution: 'single_clinic', specialty: 'Alergologia', professionals: '3' }
  expect(trialSchema.safeParse(input).success).toBe(true)
  expect(trialSchema.safeParse({ ...input, professionals: '3abc' }).success).toBe(false)
  expect(trialSchema.safeParse({ ...input, role: 'unknown' }).success).toBe(false)
})
