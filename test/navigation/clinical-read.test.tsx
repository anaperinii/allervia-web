import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ImmunotherapiesPage } from '@/features/immunotherapy/immunotherapies-page'
import { PatientChartPage } from '@/features/patient/patient-chart-page'
import { usePatientStore } from '@/features/patient/stores/usePatientStore'
import { withSession } from '../helpers/session'

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

const LIST_PAGE = {
  items: [
    {
      id: 'therapy-1',
      immunoType: 'SCIT',
      administrationRoute: 'SUBCUTANEOUS',
      extract: 'Der p 100%',
      status: 'IN_PROGRESS',
      revision: 0,
      inductionStartDate: '2026-01-01T13:00:00.000Z',
      maintenanceStartDate: null,
      patient: { id: 'patient-1', fullName: 'Carla Mendes', isActive: true },
      responsiblePhysician: { id: 'prof-1', fullName: 'Dra. Karina Martins' },
      prescription: { versionId: 'version-1', revision: 1 },
      nextDose: {
        id: 'dose-1',
        scheduledAt: '2026-01-08T13:00:00.000Z',
        status: 'SCHEDULED',
      },
      createdAt: '2026-01-01T13:00:00.000Z',
    },
  ],
  page: 1,
  pageSize: 10,
  total: 1,
}

const PATIENT_DETAIL = {
  id: 'patient-1',
  fullName: 'Carla Mendes',
  cpfMasked: '***.***.*47-25',
  cpf: '52998224725',
  birthDate: '1990-06-15T00:00:00.000Z',
  phoneNumber: '62999999999',
  weightInKg: 70.5,
  isActive: true,
  responsiblePhysician: {
    id: 'prof-1',
    fullName: 'Dra. Karina Martins',
    councilNumber: '24815',
    councilUf: 'GO',
  },
  therapyCount: 2,
  therapyStatuses: ['IN_PROGRESS', 'SUSPENDED'],
  therapies: [
    {
      id: 'therapy-1',
      immunoType: 'SCIT',
      administrationRoute: 'SUBCUTANEOUS',
      extract: 'Der p 100%',
      status: 'IN_PROGRESS',
      revision: 0,
      inductionStartDate: '2026-01-01T13:00:00.000Z',
      maintenanceStartDate: null,
      prescription: { versionId: 'version-1', revision: 1 },
      nextDose: {
        id: 'dose-1',
        scheduledAt: '2026-01-08T13:00:00.000Z',
        status: 'SCHEDULED',
      },
      createdAt: '2026-01-01T13:00:00.000Z',
    },
    {
      id: 'therapy-2',
      immunoType: 'SCIT',
      administrationRoute: 'SUBLINGUAL',
      extract: 'Der f 100%',
      status: 'SUSPENDED',
      revision: 1,
      inductionStartDate: '2025-06-01T13:00:00.000Z',
      maintenanceStartDate: null,
      prescription: { versionId: 'version-0', revision: 1 },
      nextDose: null,
      createdAt: '2025-06-01T13:00:00.000Z',
    },
  ],
  createdAt: '2026-01-01T13:00:00.000Z',
  updatedAt: '2026-01-01T13:00:00.000Z',
}

function stubClinicalApi() {
  const fetchMock = vi.fn((input: RequestInfo | URL) => {
    const url = String(input)
    if (url.includes('/immunotherapies/list')) {
      return Promise.resolve(jsonResponse(LIST_PAGE))
    }
    if (url.includes('/patients/patient-1')) {
      return Promise.resolve(jsonResponse(PATIENT_DETAIL))
    }
    if (url.includes('/patients/desconhecido')) {
      return Promise.resolve(
        jsonResponse(
          {
            statusCode: 404,
            code: 'NOT_FOUND',
            message: 'Paciente com ID "desconhecido" não encontrado.',
          },
          404,
        ),
      )
    }
    if (url.includes('/professionals')) {
      return Promise.resolve(
        jsonResponse({ items: [], page: 1, pageSize: 100, total: 0 }),
      )
    }
    return Promise.resolve(jsonResponse({}))
  })

  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

async function renderAt(initialEntry: string) {
  const root = createRootRoute()
  const list = createRoute({
    getParentRoute: () => root,
    path: '/immunotherapies',
    component: ImmunotherapiesPage,
  })
  const chart = createRoute({
    getParentRoute: () => root,
    path: '/patient/$patientId',
    validateSearch: (search: Record<string, unknown>) => ({
      therapy: typeof search.therapy === 'string' ? search.therapy : undefined,
    }),
    component: PatientChartPage,
  })
  const addTherapy = createRoute({
    getParentRoute: () => root,
    path: '/add-immunotherapy',
    component: () => <h1>Nova imunoterapia</h1>,
  })
  const evolution = createRoute({
    getParentRoute: () => root,
    path: '/patient-evolution',
    component: () => <h1>Evolução</h1>,
  })
  const completion = createRoute({
    getParentRoute: () => root,
    path: '/patient-completion',
    validateSearch: (search: Record<string, unknown>) => ({
      patientId:
        typeof search.patientId === 'string' ? search.patientId : undefined,
    }),
    component: () => <h1>Conclusão</h1>,
  })
  const router = createRouter({
    routeTree: root.addChildren([list, chart, addTherapy, evolution, completion]),
    history: createMemoryHistory({ initialEntries: [initialEntry] }),
  })

  await router.load()
  render(withSession(<RouterProvider router={router} />))
  return router
}

describe('prontuário de leitura', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    usePatientStore.setState({ selectedPatient: null, applications: [] })
  })

  it('lista tratamentos do servidor e navega com paciente e tratamento na URL', async () => {
    const fetchMock = stubClinicalApi()
    const router = await renderAt('/immunotherapies')

    expect(await screen.findByText('Carla Mendes')).toBeInTheDocument()
    // O rótulo também existe na opção do filtro; a célula da tabela basta.
    expect(screen.getAllByText('Em andamento').length).toBeGreaterThan(0)
    expect(screen.getByText('Dra. Karina Martins')).toBeInTheDocument()

    const [listUrl] = fetchMock.mock.calls[0] as [string]
    expect(listUrl).toContain('/immunotherapies/list')
    expect(listUrl).toContain('status=IN_PROGRESS')

    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: /abrir prontuário de carla/i }))

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/patient/patient-1')
    })
    expect(router.state.location.search).toEqual({ therapy: 'therapy-1' })
  })

  it('abre o prontuário por URL direta com o tratamento selecionado', async () => {
    stubClinicalApi()
    await renderAt('/patient/patient-1?therapy=therapy-2')

    expect(await screen.findByText('Carla Mendes')).toBeInTheDocument()

    // O seletor mostra os dois tratamentos; o da URL está ativo.
    const selected = screen
      .getAllByRole('button', { pressed: true })
      .find((button) => button.textContent?.includes('SCIT'))
    expect(selected).toHaveTextContent('Der f 100%')

    // Dois tratamentos não se misturam: o estado publicado é o do selecionado.
    expect(usePatientStore.getState().selectedPatient?.extract).toBe(
      'Der f 100%',
    )
    expect(usePatientStore.getState().selectedPatient?.administrationRoute).toBe(
      'Sublingual',
    )
  })

  it('sem parâmetro de tratamento, seleciona o mais recente', async () => {
    stubClinicalApi()
    await renderAt('/patient/patient-1')

    expect(await screen.findByText('Carla Mendes')).toBeInTheDocument()
    const selected = screen
      .getAllByRole('button', { pressed: true })
      .find((button) => button.textContent?.includes('SCIT'))
    expect(selected).toHaveTextContent('Der p 100%')
  })

  it('mostra erro do servidor sem recuperar dados simulados', async () => {
    stubClinicalApi()
    await renderAt('/patient/desconhecido')

    expect(
      await screen.findByText(/não encontrado/i),
    ).toBeInTheDocument()
    expect(usePatientStore.getState().selectedPatient).toBeNull()
  })
})
