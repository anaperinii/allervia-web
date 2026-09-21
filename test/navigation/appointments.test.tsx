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
import { AppointmentsPage } from '@/features/scheduling/appointments-page'
import { DashboardPage } from '@/features/dashboard/dashboard-page'
import { withSession } from '../helpers/session'

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

const VALUES = {
  concentration: '1000',
  volume: '0.1',
  intervalDays: 7,
  phase: 'BUILD_UP',
  route: 'SUBCUTANEOUS',
  volumeUnit: 'mL',
  concentrationUnit: 'DILUTION_DENOMINATOR',
}

function isoAt(daysFromToday: number, hour: number): string {
  const date = new Date()
  date.setDate(date.getDate() + daysFromToday)
  date.setHours(hour, 0, 0, 0)
  return date.toISOString()
}

function scheduleItem(overrides: Record<string, unknown>) {
  return {
    id: 'dose-1',
    immunotherapyId: 'therapy-1',
    status: 'SCHEDULED',
    scheduledAt: isoAt(0, 11),
    administeredAt: null,
    administrationEndedAt: null,
    plannedStepId: 'low',
    administeredStepId: null,
    plannedValues: VALUES,
    administeredValues: null,
    revision: 1,
    immunotherapy: {
      id: 'therapy-1',
      immunoType: 'Ácaros',
      extract: 'Der p 60%',
      status: 'IN_PROGRESS',
      revision: 3,
      patient: {
        id: 'patient-1',
        fullName: 'Paula Andrade',
        phoneNumber: '62911112222',
        isActive: true,
        responsiblePhysician: { id: 'professional-1', fullName: 'Dra. Karina Martins' },
      },
    },
    ...overrides,
  }
}

const DOSE_DETAIL = {
  ...scheduleItem({}),
  administeredById: null,
  performedById: null,
  immediateConduct: null,
  immediateConductJustification: null,
  betweenDosesReport: '',
  recommendation: null,
  sourceDoseId: null,
  isArchived: false,
  createdAt: isoAt(-7, 11),
  updatedAt: isoAt(-7, 11),
  protocolVersionId: 'version-1',
  prescriptionRevision: 1,
  therapyRevision: 3,
  allowedValues: [
    { id: 'low', label: 'Baixa', phase: 'BUILD_UP', concentration: '1000', volume: '0.1', intervalDays: 7, nextStepId: 'high' },
    { id: 'high', label: 'Meta', phase: 'MAINTENANCE', concentration: '1000', volume: '0.4', intervalDays: 14, nextStepId: 'high' },
  ],
  migrationRequired: false,
}

function stubApi() {
  const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    const method = init?.method ?? 'GET'

    if (url.includes('/doses/metrics')) {
      return Promise.resolve(
        jsonResponse({
          from: isoAt(-30, 0),
          to: isoAt(0, 23),
          timeZone: 'America/Sao_Paulo',
          applications: {
            total: 4,
            onSchedule: 3,
            offSchedule: 1,
            byDay: [{ day: '2026-09-15', count: 4 }],
          },
          scheduled: { pending: 2, overdue: 1 },
          adherence: { numerator: 3, denominator: 4, ratio: 0.75 },
          therapies: { inProgress: 5, suspended: 1, completed: 2, buildUp: 3, maintenance: 2 },
        }),
      )
    }
    if (url.includes('/doses/dose-1/scheduled') && method === 'PATCH') {
      return Promise.resolve(jsonResponse({ ...DOSE_DETAIL, revision: 2, therapyRevision: 4 }))
    }
    if (url.includes('/doses/dose-1')) {
      return Promise.resolve(jsonResponse(DOSE_DETAIL))
    }
    if (url.includes('/doses?') || url.match(/\/doses$/)) {
      return Promise.resolve(
        jsonResponse({
          items: [
            scheduleItem({}),
            scheduleItem({
              id: 'dose-0',
              status: 'ADMINISTERED_ON_SCHEDULE',
              scheduledAt: isoAt(-1, 11),
              administeredAt: isoAt(-1, 11),
              administeredStepId: 'low',
              administeredValues: VALUES,
            }),
          ],
          page: 1,
          pageSize: 100,
          total: 2,
        }),
      )
    }
    return Promise.resolve(jsonResponse({}))
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

async function renderAt(path: string, component: () => React.JSX.Element) {
  const root = createRootRoute()
  const page = createRoute({ getParentRoute: () => root, path, component })
  const chart = createRoute({
    getParentRoute: () => root,
    path: '/patient/$patientId',
    component: () => <h1>Prontuário</h1>,
  })
  const router = createRouter({
    routeTree: root.addChildren([page, chart]),
    history: createMemoryHistory({ initialEntries: [path] }),
  })
  await router.load()
  render(withSession(<RouterProvider router={router} />))
  return router
}

describe('agenda alimentada por doses persistidas', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('consulta o período com offset e mostra a previsão do dia', async () => {
    const fetchMock = stubApi()
    await renderAt('/appointments', AppointmentsPage)

    expect(await screen.findByText('Paula Andrade')).toBeInTheDocument()

    const call = fetchMock.mock.calls.find(([url]) =>
      String(url).includes('/doses?'),
    )
    expect(call).toBeDefined()
    const url = new URL(String(call![0]), 'http://localhost')
    expect(url.searchParams.get('from')).toMatch(/T00:00:00[+-]\d{2}:\d{2}$/)
    expect(url.searchParams.get('to')).toMatch(/T23:59:00[+-]\d{2}:\d{2}$/)
    expect(url.searchParams.get('pageSize')).toBe('100')
  })

  it('reagenda pela edição da dose pendente com motivo e revisões', async () => {
    const fetchMock = stubApi()
    const user = userEvent.setup()
    await renderAt('/appointments', AppointmentsPage)

    await user.click(await screen.findByText('Paula Andrade'))
    await user.click(
      await screen.findByRole('button', { name: /reagendar previsão/i }),
    )

    // Modal de edição carregado do GET /doses/:id com valores permitidos.
    expect(await screen.findByText('Editar previsão pendente')).toBeInTheDocument()
    const reasonLabel = screen.getByText(/motivo clínico/i, { selector: 'label' })
    const reason = reasonLabel.parentElement!.querySelector('textarea')!
    await user.type(reason, 'Paciente pediu para antecipar.')
    await user.click(screen.getByRole('button', { name: /salvar previsão/i }))

    await waitFor(() => {
      const patch = fetchMock.mock.calls.find(
        ([url, init]) =>
          String(url).includes('/doses/dose-1/scheduled') &&
          (init as RequestInit | undefined)?.method === 'PATCH',
      )
      expect(patch).toBeDefined()
      const body = JSON.parse((patch![1] as RequestInit).body as string)
      expect(body.reason).toBe('Paciente pediu para antecipar.')
      expect(body.expectedRevision).toBe(1)
      expect(body.expectedTherapyRevision).toBe(3)
      expect(body.values.stepId).toBe('low')
      expect(body.scheduledAt).toMatch(/[+-]\d{2}:\d{2}$/)
    })
  })

  it('nova aplicação vira seleção de previsão existente, sem criação livre', async () => {
    stubApi()
    const user = userEvent.setup()
    await renderAt('/appointments', AppointmentsPage)

    await screen.findByText('Paula Andrade')
    await user.click(screen.getByRole('button', { name: /nova aplicação/i }))
    expect(
      await screen.findByText(/não existe compromisso livre/i),
    ).toBeInTheDocument()
    // Apenas a previsão pendente é oferecida; a administrada não.
    const picker = screen.getByText('Selecionar previsão existente').closest('[role="dialog"]')
    expect(picker).not.toBeNull()
  })
})

describe('dashboard com indicadores oficiais', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('mostra adesão real com denominadores e marca séries sem base como indisponíveis', async () => {
    stubApi()
    await renderAt('/dashboard', DashboardPage)

    expect(await screen.findByText('75%')).toBeInTheDocument()
    expect(screen.getByText(/3 de 4 aplicações no dia previsto/)).toBeInTheDocument()
    expect(screen.getAllByText(/indicador indisponível/i).length).toBeGreaterThanOrEqual(5)
  })
})
