import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { describe, expect, it } from 'vitest'
import { ImmunotherapiesPage } from '@/features/immunotherapy/immunotherapies-page'
import { PatientChartPage } from '@/features/patient/patient-chart-page'
import { usePatientStore } from '@/features/patient/stores/usePatientStore'
import {
  administeredDose,
  doseDetail,
  doseRecord,
  doseValues,
  immunotherapyListItem,
  immunotherapyPage,
  patientDetail,
  professionalPage,
  protocolStep,
  therapySummary,
} from '../fixtures/clinical'
import { capturedDiagnostics } from '../helpers/diagnostics'
import { errorResponse, jsonResponse, stubApi, type RouteDefinition } from '../helpers/http'
import { withSession } from '../helpers/session'

const PATIENT = patientDetail({
  therapies: [
    therapySummary(),
    therapySummary({
      id: 'therapy-2',
      administrationRoute: 'SUBLINGUAL',
      extract: 'Der f 100%',
      status: 'SUSPENDED',
      revision: 1,
      inductionStartDate: '2025-06-01T13:00:00.000Z',
      prescription: { versionId: 'version-0', revision: 1 },
      nextDose: null,
      createdAt: '2025-06-01T13:00:00.000Z',
    }),
  ],
  therapyCount: 2,
  therapyStatuses: ['IN_PROGRESS', 'SUSPENDED'],
})


const THERAPY_DOSES = [
  administeredDose({
    id: 'dose-administered-1',
    administeredAt: '2026-01-01T13:00:00.000Z',
    administeredValues: doseValues({ concentration: '10000', volume: '0.1' }),
    concentration: 10000,
    volume: '0.1',
    scheduledAt: '2026-01-01T13:00:00.000Z',
  }),
  administeredDose({
    id: 'dose-administered-2',
    administeredAt: '2026-01-08T13:00:00.000Z',
    administeredValues: doseValues({ concentration: '1000', volume: '0.2' }),
    concentration: 1000,
    volume: '0.2',
    scheduledAt: '2026-01-08T13:00:00.000Z',
  }),
  doseRecord({
    id: 'dose-scheduled',
    status: 'SCHEDULED',
    scheduledAt: '2026-01-15T13:00:00.000Z',
    plannedValues: doseValues({ concentration: '100', volume: '0.3' }),
    concentration: 100,
    volume: '0.3',
  }),
]

const PENDING_DETAIL = doseDetail({
  id: 'dose-scheduled',
  status: 'SCHEDULED',
  scheduledAt: '2026-01-15T13:00:00.000Z',
  plannedValues: doseValues({ concentration: '100', volume: '0.3' }),
  concentration: 100,
  volume: '0.3',
  allowedValues: [
    protocolStep({ id: 'low', concentration: '10000', volume: '0.1' }),
    protocolStep({ id: 'middle', concentration: '1000', volume: '0.2', nextStepId: 'high' }),
    protocolStep({
      id: 'high',
      label: 'Etapa alvo',
      concentration: '10',
      volume: '0.5',
      nextStepId: null,
      phase: 'MAINTENANCE',
    }),
  ],
})

function clinicalRoutes(overrides: RouteDefinition[] = []): RouteDefinition[] {
  return [
    ...overrides,
    { path: '/immunotherapies/list', handler: immunotherapyPage([immunotherapyListItem()]) },
    { path: '/immunotherapies/types', handler: ['Ácaros'] },
    { path: '/immunotherapies/therapy-1/doses', handler: THERAPY_DOSES },
    { path: '/doses/dose-scheduled', handler: PENDING_DETAIL },
    { path: '/patients/patient-1', handler: PATIENT },
    {
      path: '/patients/desconhecido',
      handler: errorResponse(
        404,
        'NOT_FOUND',
        'Paciente com ID "desconhecido" não encontrado.',
      ),
    },
    {
      path: '/treatment-protocols/automation',
      handler: {
        enabled: true,
        timeZone: 'America/Sao_Paulo',
        revision: 3,
        defaults: [
          {
            organizationId: 'organization-1',
            route: 'SUBCUTANEOUS',
            versionId: 'version-1',
          },
        ],
      },
    },
    { path: '/professionals', handler: professionalPage() },
  ]
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
  it('lista tratamentos do servidor e navega com paciente e tratamento na URL', async () => {
    const api = stubApi(clinicalRoutes())
    const router = await renderAt('/immunotherapies')

    expect(await screen.findByText('Carla Mendes')).toBeInTheDocument()
    expect(screen.getAllByText('Em andamento').length).toBeGreaterThan(0)
    expect(screen.getByText('Dra. Karina Martins')).toBeInTheDocument()

    const [listRequest] = api.requestsFor('GET', '/immunotherapies/list')
    expect(listRequest.search).toContain('status=IN_PROGRESS')

    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: /abrir prontuário de carla/i }))

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/patient/patient-1')
    })
    expect(router.state.location.search).toEqual({ therapy: 'therapy-1' })
  })

  it('renderiza o histórico completo de doses, a dose vigente, a anterior e a meta', async () => {
    const api = stubApi(clinicalRoutes())
    await renderAt('/patient/patient-1?therapy=therapy-1')

    expect(await screen.findByText('Carla Mendes')).toBeInTheDocument()




    await waitFor(() => {
      expect(
        screen.getByText('Concentração e Volume Vigentes').parentElement,
      ).toHaveTextContent('1:100 - 0,3ml')
    })
    expect(screen.getByTitle(/dose administrada anterior/i)).toHaveTextContent(
      '1:1.000 - 0,2ml',
    )



    await waitFor(() => {
      expect(
        screen.getByText(/^Meta Concentração e Volume:$/).parentElement,
      ).toHaveTextContent('1:10 - 0,5ml')
    })
    expect(api.requestsFor('GET', '/doses/dose-scheduled')).toHaveLength(1)





    for (const dose of ['1:10.000 - 0,1ml', '1:1.000 - 0,2ml', '1:100 - 0,3ml']) {
      expect(document.body).toHaveTextContent(dose)
    }
    expect(screen.getByText(/próxima agendada/i)).toBeInTheDocument()
  })

  it('abre o prontuário por URL direta com o tratamento selecionado', async () => {
    stubApi(
      clinicalRoutes([{ path: '/immunotherapies/therapy-2/doses', handler: [] }]),
    )
    await renderAt('/patient/patient-1?therapy=therapy-2')

    expect(await screen.findByText('Carla Mendes')).toBeInTheDocument()

    const selected = screen
      .getAllByRole('button', { pressed: true })
      .find((button) => button.textContent?.includes('SCIT'))
    expect(selected).toHaveTextContent('Der f 100%')

    expect(usePatientStore.getState().selectedPatient?.extract).toBe('Der f 100%')
    expect(usePatientStore.getState().selectedPatient?.administrationRoute).toBe(
      'Sublingual',
    )
  })

  it('sem parâmetro de tratamento, seleciona o mais recente', async () => {
    stubApi(clinicalRoutes())
    await renderAt('/patient/patient-1')

    expect(await screen.findByText('Carla Mendes')).toBeInTheDocument()
    const selected = screen
      .getAllByRole('button', { pressed: true })
      .find((button) => button.textContent?.includes('SCIT'))
    expect(selected).toHaveTextContent('Der p 100%')
  })

  it('mostra erro do servidor sem recuperar dados simulados', async () => {
    stubApi(clinicalRoutes())
    await renderAt('/patient/desconhecido')

    expect(await screen.findByText(/não encontrado/i)).toBeInTheDocument()
    expect(usePatientStore.getState().selectedPatient).toBeNull()
  })

  it('payload de doses fora do contrato vira erro tipado, não sucesso aparente', async () => {



    stubApi(
      clinicalRoutes([
        { path: '/immunotherapies/therapy-1/doses', handler: jsonResponse({}) },
      ]),
    )
    await renderAt('/patient/patient-1?therapy=therapy-1')

    expect(await screen.findByText('Carla Mendes')).toBeInTheDocument()
    await waitFor(() => {
      expect(
        screen.queryByText('Concentração e Volume Vigentes')?.parentElement,
      ).toHaveTextContent('-')
    })
    expect(capturedDiagnostics()).toHaveLength(0)
  })
})
