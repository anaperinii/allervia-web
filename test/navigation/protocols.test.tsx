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
import { ProtocolsPage } from '@/features/protocols/protocols-page'
import { validateDraft } from '@/features/protocols/protocol-draft'
import type { ProtocolDefinitionDraft } from '@/shared/api/contracts/protocols'
import { buildAccountContext, withSession } from '../helpers/session'

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

const DRAFT_DEFINITION = {
  schemaVersion: 1,
  engineVersion: '1',
  route: 'SUBCUTANEOUS',
  volumeUnit: 'mL',
  concentrationUnit: 'DILUTION_DENOMINATOR',
  steps: [
    {
      id: 'inicio',
      label: 'Início',
      phase: 'BUILD_UP',
      concentration: '1000',
      volume: '0.1',
      intervalDays: 7,
      nextStepId: null,
    },
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
        id: 'version-2',
        protocolId: 'protocol-1',
        number: 2,
        status: 'DRAFT',
        definition: DRAFT_DEFINITION,
        revision: 3,
        createdAt: '2026-09-10T12:00:00.000Z',
        publishedAt: null,
      },
      {
        id: 'version-1',
        protocolId: 'protocol-1',
        number: 1,
        status: 'PUBLISHED',
        definition: DRAFT_DEFINITION,
        revision: 1,
        createdAt: '2026-09-01T12:00:00.000Z',
        publishedAt: '2026-09-02T12:00:00.000Z',
      },
    ],
  },
]

const AUTOMATION = {
  enabled: true,
  timeZone: 'America/Sao_Paulo',
  defaults: [
    {
      organizationId: 'organization-1',
      route: 'SUBCUTANEOUS',
      versionId: 'version-1',
    },
  ],
}

function stubProtocolApi(options: { conflictOnEdit?: boolean } = {}) {
  const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    const method = init?.method ?? 'GET'

    if (url.endsWith('/treatment-protocols') && method === 'GET') {
      return Promise.resolve(jsonResponse(CATALOG))
    }
    if (url.includes('/treatment-protocols/automation') && method === 'GET') {
      return Promise.resolve(jsonResponse(AUTOMATION))
    }
    if (url.includes('/versions/version-2') && method === 'PATCH') {
      if (options.conflictOnEdit) {
        return Promise.resolve(
          jsonResponse(
            {
              statusCode: 409,
              code: 'STALE_PROTOCOL_REVISION',
              message: 'STALE_PROTOCOL_REVISION',
            },
            409,
          ),
        )
      }
      return Promise.resolve(jsonResponse(CATALOG[0].versions[0]))
    }
    if (url.includes('/versions/version-2') && method === 'GET') {
      return Promise.resolve(
        jsonResponse({ ...CATALOG[0].versions[0], revision: 4 }),
      )
    }
    if (url.includes('/publish') && method === 'POST') {
      return Promise.resolve(
        jsonResponse({ ...CATALOG[0].versions[0], status: 'PUBLISHED' }),
      )
    }
    return Promise.resolve(jsonResponse({}))
  })

  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

const PHYSICIAN = buildAccountContext()
const NURSE = buildAccountContext({
  roles: ['NURSE'],
  capabilities: ['protocols:read', 'immunotherapies:read', 'doses:read'],
})

async function renderProtocols(account = PHYSICIAN) {
  const root = createRootRoute()
  const protocols = createRoute({
    getParentRoute: () => root,
    path: '/protocols',
    component: ProtocolsPage,
  })
  const settings = createRoute({
    getParentRoute: () => root,
    path: '/settings',
    component: () => <h1>Configurações</h1>,
  })
  const router = createRouter({
    routeTree: root.addChildren([protocols, settings]),
    history: createMemoryHistory({ initialEntries: ['/protocols'] }),
  })

  await router.load()
  render(withSession(<RouterProvider router={router} />, { account }))
}

describe('catálogo de protocolos', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('mostra versões, situação e a padrão para novas prescrições', async () => {
    stubProtocolApi()
    await renderProtocols()

    expect(await screen.findByText('SCIT ácaros')).toBeInTheDocument()
    expect(screen.getByText('Rascunho')).toBeInTheDocument()
    expect(screen.getByText('Publicada')).toBeInTheDocument()
    expect(
      screen.getByText('Padrão para novas prescrições'),
    ).toBeInTheDocument()
  })

  it('enfermagem consulta sem ações de edição', async () => {
    stubProtocolApi()
    await renderProtocols(NURSE)

    expect(await screen.findByText('SCIT ácaros')).toBeInTheDocument()
    expect(screen.getByText(/capacidade clínica concedida a médicos/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /novo protocolo/i })).toBeNull()
    expect(screen.queryByRole('button', { name: /publicar/i })).toBeNull()
    expect(screen.queryByRole('button', { name: /editar rascunho/i })).toBeNull()
  })

  it('publica com confirmação explicando o efeito', async () => {
    const fetchMock = stubProtocolApi()
    const user = userEvent.setup()
    await renderProtocols()

    await screen.findByText('SCIT ácaros')
    await user.click(screen.getByRole('button', { name: 'Publicar' }))

    expect(
      await screen.findByText(/congela a definição/i),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Confirmar' }))

    await waitFor(() => {
      const publishCall = fetchMock.mock.calls.find(([url]) =>
        String(url).includes('/versions/version-2/publish'),
      )
      expect(publishCall).toBeDefined()
      expect(
        JSON.parse((publishCall![1] as RequestInit).body as string),
      ).toEqual({ expectedRevision: 3 })
    })
  })

  it('preserva o rascunho local no conflito de revisão', async () => {
    stubProtocolApi({ conflictOnEdit: true })
    const user = userEvent.setup()
    await renderProtocols()

    await screen.findByText('SCIT ácaros')
    await user.click(screen.getByRole('button', { name: /editar rascunho/i }))

    const labelInput = await screen.findByDisplayValue('Início')
    await user.clear(labelInput)
    await user.type(labelInput, 'Início editado')

    await user.click(screen.getByRole('button', { name: /salvar rascunho/i }))

    // Conflito: aviso aparece, rascunho local intacto, salvar bloqueado até decidir.
    expect(
      await screen.findByText(/outra pessoa salvou este rascunho/i),
    ).toBeInTheDocument()
    expect(screen.getByDisplayValue('Início editado')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /salvar rascunho/i })).toBeDisabled()

    // Decidir manter o local reassume a revisão nova e libera o salvar.
    await user.click(
      screen.getByRole('button', { name: /manter o meu e sobrescrever/i }),
    )
    expect(screen.getByRole('button', { name: /salvar rascunho/i })).toBeEnabled()
    expect(screen.getByDisplayValue('Início editado')).toBeInTheDocument()
  })
})

describe('validação local do rascunho', () => {
  const base = DRAFT_DEFINITION as ProtocolDefinitionDraft

  it('aceita a definição do fixture', () => {
    expect(validateDraft(base)).toEqual([])
  })

  it('aponta ids repetidos, valores inválidos e sucessor inexistente', () => {
    const broken: ProtocolDefinitionDraft = {
      ...base,
      steps: [
        { ...base.steps[0], id: 'a', volume: '0,1' },
        { ...base.steps[0], id: 'a', concentration: 'x', nextStepId: 'zzz' },
      ],
    }

    const problems = validateDraft(broken)
    expect(problems.some((p) => p.includes('repetido'))).toBe(true)
    expect(problems.some((p) => p.includes('volume'))).toBe(true)
    expect(problems.some((p) => p.includes('concentração'))).toBe(true)
    expect(problems.some((p) => p.includes('não existe'))).toBe(true)
  })
})
