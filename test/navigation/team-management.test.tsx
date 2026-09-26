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
import { TeamsPage } from '@/features/settings/teams-page'
import { withSession, buildAccountContext, type SessionOverrides } from '../helpers/session'

async function renderTeams(session?: SessionOverrides) {
  const root = createRootRoute()
  const teams = createRoute({
    getParentRoute: () => root,
    path: '/teams',
    component: TeamsPage,
  })
  const settings = createRoute({
    getParentRoute: () => root,
    path: '/settings',
    component: () => <h1>Configurações</h1>,
  })
  const router = createRouter({
    routeTree: root.addChildren([teams, settings]),
    history: createMemoryHistory({ initialEntries: ['/teams'] }),
  })

  await router.load()
  render(withSession(<RouterProvider router={router} />, session))
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

const MEMBERS = {
  items: [
    {
      professionalId: 'prof-1',
      userId: 'user-1',
      fullName: 'Dra. Karina Martins',
      email: 'karina@clinica.com.br',
      phoneNumber: '62995571423',
      profession: 'PHYSICIAN',
      councilNumber: '24815',
      councilUf: 'GO',
      roles: ['PHYSICIAN'],
      isActive: true,
      createdAt: '2026-01-10T12:00:00.000Z',
    },
    {
      professionalId: 'prof-2',
      userId: 'user-2',
      fullName: 'Rafael Mendes',
      email: 'rafael@clinica.com.br',
      phoneNumber: '62981123309',
      profession: 'NURSING_TECHNICIAN',
      councilNumber: null,
      councilUf: null,
      roles: [],
      isActive: false,
      createdAt: '2026-02-01T12:00:00.000Z',
    },
  ],
  page: 1,
  pageSize: 5,
  total: 2,
}

const INVITES = {
  items: [
    {
      id: 'invite-1',
      email: 'novo@clinica.com.br',
      fullName: 'Novo Profissional',
      role: 'NURSE',
      status: 'ACTIVE',
      expiresAt: '2026-09-26T12:00:00.000Z',
      usedAt: null,
      createdAt: '2026-09-19T12:00:00.000Z',
      createdBy: { id: 'user-1', email: 'karina@clinica.com.br' },
    },
  ],
  page: 1,
  pageSize: 50,
  total: 1,
}

function stubTeamApi(overrides: Record<string, unknown> = {}) {
  const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    const method = init?.method ?? 'GET'

    if (url.includes('/professionals')) return Promise.resolve(jsonResponse(MEMBERS))
    if (url.includes('/onboarding/invites/list')) {
      return Promise.resolve(jsonResponse(INVITES))
    }
    if (url.includes('/onboarding/invites') && method === 'POST') {
      return Promise.resolve(jsonResponse(INVITES.items[0], 201))
    }
    if (url.includes('/onboarding/invites/') && method === 'DELETE') {
      return Promise.resolve(new Response(null, { status: 204 }))
    }
    if (url.includes('/access') && method === 'PATCH') {
      return Promise.resolve(
        jsonResponse({ professionalId: 'prof-1', userId: 'user-1', isActive: false }),
      )
    }

    return Promise.resolve(jsonResponse({}))
  })

  Object.assign(fetchMock, overrides)
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

const ADMIN_ACCOUNT = buildAccountContext({
  roles: ['ADMINISTRATOR'],
  capabilities: [
    'professionals:read',
    'professionals:manage',
    'invites:manage',
    'users:manage',
  ],
})

describe('gestão de equipe', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('bloqueia quem não tem a capacidade de gerenciar equipe', async () => {
    stubTeamApi()
    await renderTeams()

    expect(screen.getByRole('heading', { name: /acesso restrito/i })).toBeInTheDocument()
  })

  it('lista membros e convites vindos do servidor', async () => {
    const fetchMock = stubTeamApi()
    await renderTeams({ account: ADMIN_ACCOUNT })

    expect(await screen.findByText('Dra. Karina Martins')).toBeInTheDocument()
    expect(screen.getByText('Rafael Mendes')).toBeInTheDocument()
    expect(screen.getByText('Sem papel')).toBeInTheDocument()
    expect(screen.getByText('Técnico(a) em Enfermagem')).toBeInTheDocument()

    const [listUrl] = fetchMock.mock.calls[0] as [string]
    expect(listUrl).toContain('/professionals?')
    expect(listUrl).toContain('page=1')
    expect(listUrl).toContain('isActive=true')

    await userEvent.setup().click(screen.getByRole('tab', { name: /convites/i }))
    expect(await screen.findByText('novo@clinica.com.br')).toBeInTheDocument()
    expect(screen.getByText('Aguardando')).toBeInTheDocument()
  })

  it('encerra o acesso de um membro pelo contrato de acesso', async () => {
    const fetchMock = stubTeamApi()
    const user = userEvent.setup()
    await renderTeams({ account: ADMIN_ACCOUNT })

    await screen.findByText('Dra. Karina Martins')
    const [menu] = screen.getAllByRole('button', { name: /ações do membro/i })
    await user.click(menu)
    await user.click(screen.getByRole('menuitem', { name: /encerrar acesso/i }))

    expect(
      await screen.findByRole('heading', { name: /encerrar acesso/i }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Encerrar acesso' }))

    await waitFor(() => {
      const accessCall = fetchMock.mock.calls.find(([url, init]) =>
        String(url).includes('/access') && (init as RequestInit)?.method === 'PATCH',
      )
      expect(accessCall).toBeDefined()
      expect(JSON.parse((accessCall![1] as RequestInit).body as string)).toEqual({
        isActive: false,
      })
    })
  })

  it('envia convite com nome, e-mail e papel do servidor', async () => {
    const fetchMock = stubTeamApi()
    const user = userEvent.setup()
    await renderTeams({ account: ADMIN_ACCOUNT })

    await screen.findByText('Dra. Karina Martins')
    await user.click(screen.getByRole('button', { name: /convidar membro/i }))

    await user.type(screen.getByPlaceholderText('Nome completo'), 'Ana Souza')
    await user.type(screen.getByPlaceholderText('nome@clinica.com'), 'ana@clinica.com.br')
    await user.click(screen.getByRole('radio', { name: 'Enfermeiro' }))
    await user.click(screen.getByRole('button', { name: /enviar convite/i }))

    await waitFor(() => {
      const inviteCall = fetchMock.mock.calls.find(
        ([url, init]) =>
          String(url).endsWith('/onboarding/invites') &&
          (init as RequestInit)?.method === 'POST',
      )
      expect(inviteCall).toBeDefined()
      expect(JSON.parse((inviteCall![1] as RequestInit).body as string)).toEqual({
        email: 'ana@clinica.com.br',
        fullName: 'Ana Souza',
        userRole: 'NURSE',
      })
    })
  })
})
