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
import { AddImmunotherapyPage } from '@/features/immunotherapy/add-immunotherapy-page'
import { withSession } from '../helpers/session'

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

const DEFINITION = {
  schemaVersion: 1,
  engineVersion: '1',
  route: 'SUBCUTANEOUS',
  volumeUnit: 'mL',
  concentrationUnit: 'DILUTION_DENOMINATOR',
  steps: [
    { id: 'low', label: 'Baixa', phase: 'BUILD_UP', concentration: '1000', volume: '0.1', intervalDays: 7, nextStepId: 'high' },
    { id: 'high', label: 'Meta', phase: 'MAINTENANCE', concentration: '1000', volume: '0.4', intervalDays: 14, nextStepId: 'high' },
  ],
}

const CATALOG = [
  {
    id: 'protocol-1',
    name: 'SCIT ácaros',
    route: 'SUBCUTANEOUS',
    available: true,
    createdAt: '2026-09-01T12:00:00.000Z',
    versions: [
      {
        id: 'version-1',
        protocolId: 'protocol-1',
        number: 1,
        status: 'PUBLISHED',
        definition: DEFINITION,
        revision: 1,
        createdAt: '2026-09-01T12:00:00.000Z',
        publishedAt: '2026-09-02T12:00:00.000Z',
      },
    ],
  },
]

const PATIENTS_PAGE = {
  items: [
    {
      id: 'patient-7',
      fullName: 'Paula Andrade',
      cpfMasked: null,
      birthDate: '1988-02-10',
      weightInKg: '61.0',
      phoneNumber: '62911112222',
      isActive: true,
      responsiblePhysician: { id: 'professional-1', fullName: 'Dra. Karina Martins' },
    },
  ],
  page: 1,
  pageSize: 50,
  total: 1,
}

function stubApi() {
  const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    const method = init?.method ?? 'GET'

    if (url.includes('/treatment-protocols/automation')) {
      return Promise.resolve(
        jsonResponse({
          enabled: true,
          timeZone: 'America/Sao_Paulo',
          defaults: [
            { organizationId: 'organization-1', route: 'SUBCUTANEOUS', versionId: 'version-1' },
          ],
        }),
      )
    }
    if (url.endsWith('/treatment-protocols')) {
      return Promise.resolve(jsonResponse(CATALOG))
    }
    if (url.includes('/immunotherapies/register') && method === 'POST') {
      return Promise.resolve(
        jsonResponse(
          {
            patient: { id: 'patient-9', fullName: 'Paciente Novo' },
            immunotherapy: {
              id: 'therapy-9',
              patientId: 'patient-9',
              prescription: { id: 'prescription-9', versionId: 'version-1' },
            },
            firstDose: { id: 'dose-9' },
          },
          201,
        ),
      )
    }
    if (url.includes('/patients')) {
      return Promise.resolve(jsonResponse(PATIENTS_PAGE))
    }
    return Promise.resolve(jsonResponse({}))
  })

  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

async function renderWizard() {
  const root = createRootRoute()
  const add = createRoute({
    getParentRoute: () => root,
    path: '/add-immunotherapy',
    component: AddImmunotherapyPage,
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
    routeTree: root.addChildren([add, list, chart]),
    history: createMemoryHistory({ initialEntries: ['/add-immunotherapy'] }),
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

async function fillPatientStep(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByPlaceholderText('Nome completo'), 'Paciente Novo')
  await user.type(screen.getByPlaceholderText('(00) 00000-0000'), '62999998888')
  await user.type(controlByLabel(/data de nascimento/i), '1990-06-15')
  await user.type(screen.getByPlaceholderText('Ex: 70.5'), '70.5')
  await user.click(screen.getByRole('button', { name: 'Continuar' }))
}

async function fillPrescriptionStep(user: ReturnType<typeof userEvent.setup>) {
  await user.selectOptions(controlByLabel(/^tipo$/i), 'Ácaros')
  await user.type(
    screen.getByPlaceholderText(/Der p 60%/),
    'Der p 60% + Der f 40%',
  )
  await user.selectOptions(controlByLabel(/versão do protocolo/i), 'version-1')
  await user.click(screen.getByRole('checkbox', { name: /baixa/i }))
  await user.click(screen.getByRole('checkbox', { name: /meta/i }))
  await user.selectOptions(controlByLabel(/etapa inicial/i), 'low')
  await user.selectOptions(controlByLabel(/etapa meta/i), 'high')
  await user.click(screen.getByRole('button', { name: 'Continuar' }))
}

function registerBody(fetchMock: ReturnType<typeof vi.fn>) {
  const call = fetchMock.mock.calls.find(([url]) =>
    String(url).includes('/immunotherapies/register'),
  )
  if (!call) return null
  return JSON.parse((call[1] as RequestInit).body as string)
}

describe('wizard de prescrição', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('prescreve paciente novo com versão explícita, etapas e idempotência', async () => {
    const fetchMock = stubApi()
    const user = userEvent.setup()
    await renderWizard()

    expect(screen.getByDisplayValue(/Dra\. Karina Martins · 24815\/GO/)).toBeInTheDocument()
    await fillPatientStep(user)

    expect(await screen.findByDisplayValue('Subcutânea (SCIT)')).toBeInTheDocument()
    expect(screen.queryByText(/meta de concentração/i)).toBeNull()
    expect(screen.queryByText(/meta de volume/i)).toBeNull()

    expect(
      await screen.findByRole('option', { name: 'SCIT ácaros — v1 (padrão)' }),
    ).toBeInTheDocument()
    await fillPrescriptionStep(user)

    expect(await screen.findByText('SCIT ácaros — v1')).toBeInTheDocument()
    expect(screen.getByText('America/Sao_Paulo')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /salvar prescrição/i }))

    await waitFor(() => {
      const body = registerBody(fetchMock)
      expect(body).not.toBeNull()
      expect(body.protocolVersionId).toBe('version-1')
      expect(body.stepIds).toEqual(['low', 'high'])
      expect(body.startingStepId).toBe('low')
      expect(body.targetStepId).toBe('high')
      expect(body.idempotencyKey).toEqual(expect.any(String))
      expect(body.administrationRoute).toBe('SUBCUTANEOUS')
      expect(body.patientId).toBeUndefined()
      expect(body.patient.fullName).toBe('Paciente Novo')
      expect(body.patient.phoneNumber).toBe('62999998888')
      expect(body.patient.cpf).toBeUndefined()
      expect(body.patient.responsiblePhysicianId).toBe('professional-1')
      expect(body.targetConcentration).toBeUndefined()
      expect(body.targetVolume).toBeUndefined()
    })
  })

  it('prescreve para paciente existente enviando patientId sem dados de cadastro', async () => {
    const fetchMock = stubApi()
    const user = userEvent.setup()
    await renderWizard()

    await user.click(screen.getByRole('tab', { name: 'Paciente existente' }))
    const patientOption = await screen.findByRole('option', { name: /paula andrade/i })
    await user.selectOptions(patientOption.closest('select')!, 'patient-7')
    await user.click(screen.getByRole('button', { name: 'Continuar' }))

    await fillPrescriptionStep(user)
    await user.click(await screen.findByRole('button', { name: /salvar prescrição/i }))

    await waitFor(() => {
      const body = registerBody(fetchMock)
      expect(body).not.toBeNull()
      expect(body.patientId).toBe('patient-7')
      expect(body.patient).toBeUndefined()
      expect(body.idempotencyKey).toEqual(expect.any(String))
    })
  })

  it('falha do servidor não gera sucesso local e preserva o formulário', async () => {
    const fetchMock = stubApi()
    fetchMock.mockImplementation((input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('/immunotherapies/register')) {
        return Promise.resolve(
          jsonResponse(
            { statusCode: 409, code: 'AUTOMATION_DISABLED', message: 'AUTOMATION_DISABLED' },
            409,
          ),
        )
      }
      if (url.includes('/treatment-protocols/automation')) {
        return Promise.resolve(
          jsonResponse({ enabled: true, timeZone: 'America/Sao_Paulo', defaults: [] }),
        )
      }
      if (url.endsWith('/treatment-protocols')) return Promise.resolve(jsonResponse(CATALOG))
      if (url.includes('/patients')) return Promise.resolve(jsonResponse(PATIENTS_PAGE))
      return Promise.resolve(jsonResponse({}))
    })

    const user = userEvent.setup()
    const router = await renderWizard()

    await fillPatientStep(user)
    await screen.findByDisplayValue('Subcutânea (SCIT)')
    await fillPrescriptionStep(user)
    await user.click(await screen.findByRole('button', { name: /salvar prescrição/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent('AUTOMATION_DISABLED')
    expect(router.state.location.pathname).toBe('/add-immunotherapy')
    expect(screen.getByText('SCIT ácaros — v1')).toBeInTheDocument()
  })
})
