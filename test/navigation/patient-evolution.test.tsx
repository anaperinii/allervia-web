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
import { PatientEvolutionPage } from '@/features/patient/patient-evolution-page'
import { withSession } from '../helpers/session'

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

const ALLOWED_VALUES = [
  { id: 'low', label: 'Baixa', phase: 'BUILD_UP', concentration: '1000', volume: '0.1', intervalDays: 7, nextStepId: 'high' },
  { id: 'high', label: 'Meta', phase: 'MAINTENANCE', concentration: '1000', volume: '0.4', intervalDays: 14, nextStepId: 'high' },
]

const THERAPY = {
  id: 'therapy-1',
  immunoType: 'Ácaros',
  administrationRoute: 'SUBCUTANEOUS',
  extract: 'Der p 60%',
  status: 'IN_PROGRESS',
  revision: 3,
  inductionStartDate: '2026-08-01T11:00:00.000Z',
  maintenanceStartDate: null,
  patient: { id: 'patient-1', fullName: 'Paula Andrade', isActive: true },
  responsiblePhysician: { id: 'professional-1', fullName: 'Dra. Karina Martins' },
  prescription: { versionId: 'version-1', revision: 1 },
  nextDose: { id: 'dose-2', scheduledAt: '2026-09-22T11:00:00.000Z', status: 'SCHEDULED' },
  createdAt: '2026-08-01T11:00:00.000Z',
  isArchived: false,
  doseCount: 2,
  updatedAt: '2026-09-15T11:00:00.000Z',
}

const DOSE_DETAIL = {
  id: 'dose-2',
  immunotherapyId: 'therapy-1',
  status: 'SCHEDULED',
  scheduledAt: '2026-09-22T11:00:00.000Z',
  administeredAt: null,
  administrationEndedAt: null,
  administeredById: null,
  performedById: null,
  immediateConduct: null,
  immediateConductJustification: null,
  betweenDosesReport: '',
  plannedStepId: 'low',
  administeredStepId: null,
  plannedValues: {
    concentration: '1000', volume: '0.1', intervalDays: 7,
    phase: 'BUILD_UP', route: 'SUBCUTANEOUS', volumeUnit: 'mL', concentrationUnit: 'DILUTION_DENOMINATOR',
  },
  administeredValues: null,
  recommendation: null,
  sourceDoseId: 'dose-1',
  revision: 1,
  isArchived: false,
  createdAt: '2026-09-15T11:00:00.000Z',
  updatedAt: '2026-09-15T11:00:00.000Z',
  protocolVersionId: 'version-1',
  prescriptionRevision: 1,
  therapyRevision: 3,
  allowedValues: ALLOWED_VALUES,
  migrationRequired: false,
}

const DOSE_HISTORY = [
  {
    ...DOSE_DETAIL,
    id: 'dose-1',
    status: 'ADMINISTERED_ON_SCHEDULE',
    administeredAt: '2026-09-15T11:00:00.000Z',
    administeredStepId: 'low',
    administeredValues: DOSE_DETAIL.plannedValues,
    sourceDoseId: null,
  },
  { ...DOSE_DETAIL },
]

const TEAM_PAGE = {
  items: [
    {
      professionalId: 'professional-1', userId: 'user-1', fullName: 'Dra. Karina Martins',
      email: 'k@x.com', phoneNumber: '62999990000', profession: 'PHYSICIAN',
      councilNumber: '24815', councilUf: 'GO', roles: ['PHYSICIAN'], isActive: true,
      createdAt: '2026-01-01T12:00:00.000Z',
    },
    {
      professionalId: 'professional-2', userId: 'user-2', fullName: 'Enf. Bruno Sales',
      email: 'b@x.com', phoneNumber: '62999991111', profession: 'NURSE',
      councilNumber: '1010', councilUf: 'GO', roles: ['NURSE'], isActive: true,
      createdAt: '2026-01-01T12:00:00.000Z',
    },
  ],
  page: 1,
  pageSize: 100,
  total: 2,
}

const PREVIEW_RESULT = {
  recommendation: {
    kind: 'RECOMMENDED',
    protocolVersionId: 'version-1',
    fromStepId: 'low',
    stepId: 'high',
    label: 'Meta',
    phase: 'MAINTENANCE',
    values: { concentration: '1000', volume: '0.4', intervalDays: 14 },
  },
  allowedValues: ALLOWED_VALUES,
  nextScheduledAt: '2026-10-04T11:00:00.000Z',
  expectedRevision: 1,
  expectedTherapyRevision: 3,
  prescriptionRevision: 1,
  protocolVersionId: 'version-1',
}

function stubApi(overrides: {
  administer?: (init?: RequestInit) => Response
} = {}) {
  const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    const method = init?.method ?? 'GET'

    if (url.includes('/immunotherapies/therapy-1/doses')) {
      return Promise.resolve(jsonResponse(DOSE_HISTORY))
    }
    if (url.includes('/immunotherapies/therapy-1')) {
      return Promise.resolve(jsonResponse(THERAPY))
    }
    if (url.includes('/doses/dose-2/preview') && method === 'POST') {
      return Promise.resolve(jsonResponse(PREVIEW_RESULT))
    }
    if (url.includes('/doses/dose-2/administer') && method === 'POST') {
      if (overrides.administer) return Promise.resolve(overrides.administer(init))
      return Promise.resolve(
        jsonResponse(
          {
            dose: { ...DOSE_HISTORY[0], id: 'dose-2' },
            successor: { ...DOSE_DETAIL, id: 'dose-3' },
            recommendation: PREVIEW_RESULT.recommendation,
            therapyRevision: 4,
          },
          201,
        ),
      )
    }
    if (url.includes('/doses/dose-2')) {
      return Promise.resolve(jsonResponse(DOSE_DETAIL))
    }
    if (url.includes('/professionals')) {
      return Promise.resolve(jsonResponse(TEAM_PAGE))
    }
    return Promise.resolve(jsonResponse({}))
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

async function renderWizard() {
  const root = createRootRoute()
  const evolution = createRoute({
    getParentRoute: () => root,
    path: '/patient-evolution',
    validateSearch: (search: Record<string, unknown>) => ({
      therapy: typeof search.therapy === 'string' ? search.therapy : undefined,
    }),
    component: PatientEvolutionPage,
  })
  const list = createRoute({
    getParentRoute: () => root,
    path: '/immunotherapies',
    component: () => <h1>Lista</h1>,
  })
  const chart = createRoute({
    getParentRoute: () => root,
    path: '/patient/$patientId',
    validateSearch: (search: Record<string, unknown>) => ({
      therapy: typeof search.therapy === 'string' ? search.therapy : undefined,
    }),
    component: () => <h1>Prontuário</h1>,
  })
  const router = createRouter({
    routeTree: root.addChildren([evolution, list, chart]),
    history: createMemoryHistory({
      initialEntries: ['/patient-evolution?therapy=therapy-1'],
    }),
  })
  await router.load()
  render(withSession(<RouterProvider router={router} />))
  return router
}

function controlByLabel(labelText: RegExp): HTMLElement {
  const label = screen.getByText(labelText, { selector: 'label' })
  const control = label.parentElement?.querySelector('select, input, textarea')
  if (!control) throw new Error(`Controle não encontrado para ${labelText}`)
  return control as HTMLElement
}

async function fillToReview(user: ReturnType<typeof userEvent.setup>) {
  // Passo 0: previsão pendente persistida visível.
  expect(await screen.findByText('Previsão pendente')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Continuar' }))

  // Passo 1: pré-aplicação.
  await user.type(
    await screen.findByPlaceholderText('Descreva aqui'),
    'Sem intercorrências no intervalo.',
  )
  await user.click(screen.getByRole('button', { name: 'Continuar' }))

  // Passo 2: valor previsto já selecionado; executor da equipe real.
  const stepSelect = (await screen.findByText(/valor administrado/i, { selector: 'label' }))
    .parentElement!.querySelector('select') as HTMLSelectElement
  expect(stepSelect.value).toBe('low')
  await user.type(controlByLabel(/hora início/i), '10:00')
  await user.selectOptions(controlByLabel(/executor da aplicação/i), 'professional-2')
  await user.click(screen.getByRole('button', { name: 'Continuar' }))
}

describe('wizard de evolução sobre o contrato de doses', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('administra o valor previsto com prévia do servidor e comando idempotente', async () => {
    const fetchMock = stubApi()
    const user = userEvent.setup()
    await renderWizard()

    await fillToReview(user)

    // Revisão: recomendação vem do servidor, não de cálculo local.
    expect(await screen.findByText(/o servidor recomenda como próxima dose/i)).toBeInTheDocument()
    expect(screen.getByText(/Meta — 1:1\.000 - 0,4ml/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /salvar evolução/i }))

    await waitFor(() => {
      const call = fetchMock.mock.calls.find(
        ([url, init]) =>
          String(url).includes('/doses/dose-2/administer') &&
          (init as RequestInit | undefined)?.method === 'POST',
      )
      expect(call).toBeDefined()
      const body = JSON.parse((call![1] as RequestInit).body as string)
      expect(body.idempotencyKey).toEqual(expect.any(String))
      expect(body.values.stepId).toBe('low')
      expect(body.values.concentration).toBe('1000')
      expect(body.expectedRevision).toBe(1)
      expect(body.expectedTherapyRevision).toBe(3)
      expect(body.administeredAt).toMatch(/T10:00:00[+-]\d{2}:\d{2}$/)
      expect(body.administrationEndedAt).toMatch(/T10:30:00[+-]\d{2}:\d{2}$/)
      expect(body.performedById).toBe('professional-2')
      expect(body.betweenDosesReport).toBe('Sem intercorrências no intervalo.')
      expect(body.observations).toHaveLength(2)
      expect(body.observations[0].phase).toBe('PRE_ADMINISTRATION')
      expect(body.observations[1].phase).toBe('POST_ADMINISTRATION')
      expect(body.immediateConduct).toBeUndefined()
      expect(body.reason).toBeUndefined()
      // Nenhum campo de intervalo livre viaja no comando.
      expect(body.nextInterval).toBeUndefined()
    })
  })

  it('revisão desatualizada recarrega a dose e mantém o formulário, sem sucesso local', async () => {
    stubApi({
      administer: () =>
        jsonResponse(
          {
            statusCode: 409,
            code: 'STALE_CLINICAL_REVISION',
            message: 'STALE_CLINICAL_REVISION',
          },
          409,
        ),
    })
    const user = userEvent.setup()
    const router = await renderWizard()

    await fillToReview(user)
    await screen.findByText(/o servidor recomenda como próxima dose/i)
    await user.click(screen.getByRole('button', { name: /salvar evolução/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/mudou desde que você abriu/i)
    expect(router.state.location.pathname).toBe('/patient-evolution')
  })
})
