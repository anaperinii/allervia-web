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
import { MigrationPage } from '@/features/protocols/migration-page'
import { withSession } from '../helpers/session'

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

const STEPS = [
  { id: 'low', label: 'Baixa', phase: 'BUILD_UP', concentration: '1000', volume: '0.1', intervalDays: 7, nextStepId: 'middle' },
  { id: 'middle', label: 'Média', phase: 'BUILD_UP', concentration: '1000', volume: '0.2', intervalDays: 7, nextStepId: 'high' },
  { id: 'high', label: 'Meta', phase: 'MAINTENANCE', concentration: '1000', volume: '0.4', intervalDays: 14, nextStepId: 'high' },
]

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
        definition: {
          schemaVersion: 1,
          engineVersion: '1',
          route: 'SUBCUTANEOUS',
          volumeUnit: 'mL',
          concentrationUnit: 'DILUTION_DENOMINATOR',
          steps: STEPS,
        },
        revision: 1,
        createdAt: '2026-09-01T12:00:00.000Z',
        publishedAt: '2026-09-02T12:00:00.000Z',
      },
    ],
  },
]

const INVENTORY = {
  report: [
    {
      therapyId: 'therapy-legacy',
      revision: 4,
      prescriptionId: null,
      patient: { id: 'patient-1', fullName: 'Paciente Legado', isActive: true },
      immunoType: 'Ácaros',
      extract: 'Der p 60%',
      status: 'IN_PROGRESS',
      administrationRoute: 'SUBCUTANEOUS',
      inductionStartDate: '2026-01-01T13:00:00.000Z',
      target: { concentration: '1000', volume: '0.4' },
      pendingDoses: [
        {
          id: 'dose-legacy',
          scheduledAt: '2026-10-01T13:00:00.000Z',
          concentration: '1000',
          volume: '0.2',
          intervalDays: 7,
        },
      ],
      pendingDoseIds: ['dose-legacy'],
      issues: ['PROTOCOL_NOT_BOUND'],
      decimals: [
        {
          doseId: 'dose-legacy',
          storedVolumeText: '0.2',
          decimalText: '0.2',
          exactCandidate: true,
          historicalRecordUnchanged: false,
        },
      ],
    },
    {
      therapyId: 'therapy-bound',
      revision: 2,
      prescriptionId: 'prescription-9',
      patient: { id: 'patient-2', fullName: 'Paciente Migrado', isActive: true },
      immunoType: 'Fungos',
      extract: 'Alt a 100%',
      status: 'IN_PROGRESS',
      administrationRoute: 'SUBCUTANEOUS',
      inductionStartDate: '2026-02-01T13:00:00.000Z',
      target: { concentration: '1000', volume: '0.4' },
      pendingDoses: [],
      pendingDoseIds: [],
      issues: [],
      decimals: [],
    },
  ],
  originDraft: {
    schemaVersion: 1,
    engineVersion: '1',
    route: 'SUBCUTANEOUS',
    volumeUnit: 'mL',
    concentrationUnit: 'DILUTION_DENOMINATOR',
    provenance: 'LEGACY_INVENTORY_NOT_CLINICALLY_APPROVED',
    requiresClinicalTransitionReview: true,
    steps: [],
  },
  dryRun: true,
}

function stubApi(bindResponses: ((init?: RequestInit) => Response)[] = []) {
  let bindCall = 0
  const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    const method = init?.method ?? 'GET'

    if (url.includes('/treatment-protocols/migration/inventory')) {
      return Promise.resolve(jsonResponse(INVENTORY))
    }
    if (url.includes('/treatment-protocols/migration/therapies/') && method === 'POST') {
      const responder = bindResponses[Math.min(bindCall, bindResponses.length - 1)]
      bindCall += 1
      if (responder) return Promise.resolve(responder(init))
      const body = JSON.parse((init?.body as string) ?? '{}')
      if (body.dryRun !== false) {
        return Promise.resolve(
          jsonResponse({
            dryRun: true,
            therapyId: 'therapy-legacy',
            doseId: 'dose-legacy',
            stepId: 'middle',
            historicalDosesUnchanged: true,
          }),
        )
      }
      return Promise.resolve(
        jsonResponse({ prescriptionId: 'prescription-new', alreadyBound: false }, 201),
      )
    }
    if (url.endsWith('/treatment-protocols')) {
      return Promise.resolve(jsonResponse(CATALOG))
    }
    return Promise.resolve(jsonResponse({}))
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

async function renderMigration() {
  const root = createRootRoute()
  const page = createRoute({
    getParentRoute: () => root,
    path: '/migration',
    component: MigrationPage,
  })
  const chart = createRoute({
    getParentRoute: () => root,
    path: '/patient/$patientId',
    validateSearch: (search: Record<string, unknown>) => ({
      therapy: typeof search.therapy === 'string' ? search.therapy : undefined,
    }),
    component: () => <h1>Prontuário</h1>,
  })
  const protocols = createRoute({
    getParentRoute: () => root,
    path: '/protocols',
    component: () => <h1>Catálogo</h1>,
  })
  const router = createRouter({
    routeTree: root.addChildren([page, chart, protocols]),
    history: createMemoryHistory({ initialEntries: ['/migration'] }),
  })
  await router.load()
  render(withSession(<RouterProvider router={router} />))
  return router
}

async function fillSelection(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await screen.findByRole('button', { name: /revisar e vincular/i }))
  const versionLabel = await screen.findByText(/versão publicada do protocolo/i, { selector: 'label' })
  await user.selectOptions(versionLabel.parentElement!.querySelector('select')!, 'version-1')
  await user.click(screen.getByRole('checkbox', { name: /baixa/i }))
  await user.click(screen.getByRole('checkbox', { name: /média/i }))
  await user.click(screen.getByRole('checkbox', { name: /meta/i }))
  const startLabel = screen.getByText(/etapa inicial/i, { selector: 'label' })
  await user.selectOptions(startLabel.parentElement!.querySelector('select')!, 'low')
  const targetLabel = screen.getByText(/etapa meta/i, { selector: 'label' })
  await user.selectOptions(targetLabel.parentElement!.querySelector('select')!, 'high')
}

describe('migração assistida', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('inventaria pendentes e migrados com incompatibilidades declaradas', async () => {
    stubApi()
    await renderMigration()

    expect(await screen.findByText('Paciente Legado')).toBeInTheDocument()
    expect(screen.getByText('Sem prescrição vinculada')).toBeInTheDocument()
    expect(screen.getByText('Paciente Migrado')).toBeInTheDocument()
    expect(screen.getByText('Migrado')).toBeInTheDocument()
    expect(screen.getByText(/bloqueados para novos comandos clínicos/i)).toBeInTheDocument()
  })

  it('vincula somente após ensaio bem-sucedido do mesmo corpo', async () => {
    const fetchMock = stubApi()
    const user = userEvent.setup()
    await renderMigration()
    await fillSelection(user)

    const bindButton = screen.getByRole('button', { name: /^vincular tratamento$/i })
    expect(bindButton).toBeDisabled()

    await user.click(screen.getByRole('button', { name: /ensaiar/i }))
    const rehearsal = await screen.findByText(/ensaio aprovado sem gravar nada/i)
    expect(rehearsal.closest('p')?.textContent).toContain('Média — 1:1.000 - 0,2ml')
    expect(bindButton).toBeEnabled()

    await user.click(bindButton)
    await waitFor(() => {
      const calls = fetchMock.mock.calls.filter(([url]) =>
        String(url).includes('/migration/therapies/therapy-legacy'),
      )
      expect(calls).toHaveLength(2)
      const rehearsal = JSON.parse((calls[0][1] as RequestInit).body as string)
      const commit = JSON.parse((calls[1][1] as RequestInit).body as string)
      expect(rehearsal.dryRun).not.toBe(false)
      expect(commit.dryRun).toBe(false)
      expect(commit.expectedRevision).toBe(4)
      expect(commit.prescription).toEqual(rehearsal.prescription)
      expect(commit.prescription.stepIds).toEqual(['low', 'middle', 'high'])
      expect(commit.prescription.targetStepId).toBe('high')
    })
  })

  it('valor sem correspondência explica a decisão clínica em vez de aproximar', async () => {
    stubApi([
      () =>
        jsonResponse(
          { statusCode: 400, code: 'VALUE_NOT_CONFIGURED', message: 'Bad Request Exception' },
          400,
        ),
    ])
    const user = userEvent.setup()
    await renderMigration()
    await fillSelection(user)

    await user.click(screen.getByRole('button', { name: /ensaiar/i }))
    expect(
      await screen.findByText(/não escolhemos o valor mais próximo/i),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^vincular tratamento$/i })).toBeDisabled()
  })
})
