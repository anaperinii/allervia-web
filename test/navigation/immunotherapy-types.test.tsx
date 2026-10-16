import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ImmunotherapyDataStep } from '@/features/immunotherapy/components/add-steps/ImmunotherapyDataStep'
import type { AddImmunotherapyForm } from '@/features/immunotherapy/schemas/add-immunotherapy'
import { AdvancedSettingsPage } from '@/features/settings/advanced-settings-page'
import { withSession } from '../helpers/session'

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

const SERVER_TYPES = ['Ácaros', 'Gramíneas', 'Fungos']

function stubApi(typesBody: unknown = SERVER_TYPES) {
  const fetchMock = vi.fn((input: RequestInfo | URL) => {
    const url = String(input)
    if (url.includes('/immunotherapies/types')) {
      return Promise.resolve(jsonResponse(typesBody))
    }
    if (url.includes('/treatment-protocols/automation')) {
      return Promise.resolve(
        jsonResponse({ enabled: true, timeZone: 'America/Sao_Paulo', defaults: [] }),
      )
    }
    if (url.endsWith('/treatment-protocols')) {
      return Promise.resolve(jsonResponse([]))
    }
    if (url.includes('/organization/me')) {
      return Promise.resolve(
        jsonResponse({
          id: 'organization-1',
          name: 'Clínica Integrada Princípios',
          timeZone: 'America/Sao_Paulo',
        }),
      )
    }
    if (url.includes('/notifications/preferences')) {
      return Promise.resolve(jsonResponse([]))
    }
    return Promise.resolve(jsonResponse({}))
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

function StepHarness() {
  const form = useForm<AddImmunotherapyForm>({
    defaultValues: {
      name: '', cpf: '', phone: '', birthDate: '', weight: '', patientId: '',
      guardianName: '', guardianCpf: '', guardianPhone: '',
      type: '', startDate: '', extract: '',
      protocolVersionId: '', stepIds: [], startingStepId: '', targetStepId: '',
    },
  })
  return <ImmunotherapyDataStep form={form} />
}

function typeControl(): HTMLInputElement {
  return screen.getByPlaceholderText('Ex: Ácaros, Gramíneas…') as HTMLInputElement
}

async function renderAdvancedSettings() {
  const root = createRootRoute()
  const page = createRoute({
    getParentRoute: () => root,
    path: '/advanced-settings',
    component: AdvancedSettingsPage,
  })
  const settings = createRoute({
    getParentRoute: () => root,
    path: '/settings',
    component: () => <h1>Configurações</h1>,
  })
  const router = createRouter({
    routeTree: root.addChildren([page, settings]),
    history: createMemoryHistory({ initialEntries: ['/advanced-settings'] }),
  })
  await router.load()
  render(withSession(<RouterProvider router={router} />))
}

describe('tipos de imunoterapia pela fonte do servidor', () => {
  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('wizard: lista os tipos do servidor e aceita seleção', async () => {
    const fetchMock = stubApi()
    const user = userEvent.setup()
    render(withSession(<StepHarness />))

    await user.click(typeControl())
    expect(await screen.findByRole('option', { name: 'Ácaros' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Gramíneas' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Fungos' })).toBeInTheDocument()

    await user.click(screen.getByRole('option', { name: 'Gramíneas' }))
    expect(typeControl()).toHaveValue('Gramíneas')

    expect(
      fetchMock.mock.calls.some(([url]) =>
        String(url).includes('/immunotherapies/types'),
      ),
    ).toBe(true)
  })

  it('wizard: filtra as sugestões e aceita um tipo novo digitado', async () => {
    stubApi()
    const user = userEvent.setup()
    render(withSession(<StepHarness />))

    await user.click(typeControl())
    await screen.findByRole('option', { name: 'Ácaros' })

    await user.type(typeControl(), 'Gram')
    expect(await screen.findByRole('option', { name: 'Gramíneas' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Ácaros' })).toBeNull()

    await user.clear(typeControl())
    await user.type(typeControl(), 'Pólen')
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).toBeNull()
    })
    expect(typeControl()).toHaveValue('Pólen')
  })

  it('wizard: erro de contrato vira estado de erro, não lista vazia', async () => {
    stubApi({ items: ['Ácaros'] })
    const user = userEvent.setup()
    render(withSession(<StepHarness />))

    expect(
      await screen.findByText(/não foi possível carregar os tipos/i),
    ).toBeInTheDocument()
    expect(screen.queryByText(/nenhum tipo cadastrado/i)).toBeNull()

    await user.type(typeControl(), 'Insetos')
    expect(typeControl()).toHaveValue('Insetos')
  })

  it('wizard: lista vazia do servidor é estado vazio, não erro', async () => {
    stubApi([])
    render(withSession(<StepHarness />))

    expect(
      await screen.findByText(/nenhum tipo cadastrado ainda/i),
    ).toBeInTheDocument()
    expect(screen.queryByText(/não foi possível carregar os tipos/i)).toBeNull()
  })

  it('configurações avançadas: exibe os tipos do servidor somente leitura', async () => {
    stubApi()
    await renderAdvancedSettings()

    expect(
      await screen.findByText('Tipos de Imunoterapia'),
    ).toBeInTheDocument()
    expect(await screen.findByText('Ácaros')).toBeInTheDocument()
    expect(screen.getByText('Gramíneas')).toBeInTheDocument()

    expect(screen.queryByText(/refletem em toda a clínica/i)).toBeNull()
    expect(screen.queryByRole('button', { name: 'Adicionar' })).toBeNull()
    expect(screen.queryByRole('button', { name: /^Editar /i })).toBeNull()
    expect(screen.queryByRole('button', { name: /^Remover Ácaros/i })).toBeNull()
  })

  it('configurações avançadas: erro de contrato não vira "nenhum tipo"', async () => {
    stubApi('tipos')
    await renderAdvancedSettings()

    expect(
      await screen.findByText(/não foi possível carregar os tipos de imunoterapia/i),
    ).toBeInTheDocument()
    expect(screen.queryByText(/nenhum tipo cadastrado/i)).toBeNull()
  })
})
