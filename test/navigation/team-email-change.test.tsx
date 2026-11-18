import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { afterEach, expect, it, vi } from 'vitest'
import { TeamsPage } from '@/features/settings/teams-page'
import { withSession, buildAccountContext } from '../helpers/session'
import { stubApi } from '../helpers/http'

async function renderTeams() {
  const root = createRootRoute()
  const teams = createRoute({ getParentRoute: () => root, path: '/teams', component: TeamsPage })
  const settings = createRoute({ getParentRoute: () => root, path: '/settings', component: () => <h1>Configurações</h1> })
  const router = createRouter({
    routeTree: root.addChildren([teams, settings]),
    history: createMemoryHistory({ initialEntries: ['/teams'] }),
  })
  await router.load()
  const ADMIN_ACCOUNT = buildAccountContext({
    roles: ['ADMINISTRATOR'],
    capabilities: ['professionals:read', 'professionals:manage', 'invites:manage', 'users:manage'],
  })
  render(withSession(<RouterProvider router={router} />, { account: ADMIN_ACCOUNT }))
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
  ],
  page: 1,
  pageSize: 10,
  total: 1,
}

const EMPTY_INVITES = { items: [], page: 1, pageSize: 50, total: 0 }

const PENDING_REQUEST = {
  id: 'ecr-1',
  professionalId: 'prof-1',
  professionalName: 'Dra. Karina Martins',
  currentEmail: 'karina@clinica.com.br',
  newEmail: 'karina.nova@clinica.com.br',
  status: 'PENDING',
  expiresAt: '2026-09-26T12:00:00.000Z',
  requestedAt: '2026-09-19T12:00:00.000Z',
}

afterEach(() => {
  vi.unstubAllGlobals()
})

it('admin dispara a troca de e-mail de um membro escolhendo o canal', async () => {
  const requests = stubApi([
    { path: '/professionals', handler: MEMBERS },
    { path: '/onboarding/invites/list', handler: EMPTY_INVITES },
    { path: '/professionals/email-change-requests', handler: { items: [], page: 1, pageSize: 10, total: 0 } },
    {
      method: 'POST',
      path: '/professionals/prof-1/email-change',
      handler: { ...PENDING_REQUEST, status: 'DISPATCHED' },
    },
  ])

  await renderTeams()
  const user = userEvent.setup()
  await screen.findByText('Dra. Karina Martins')

  await user.click(screen.getByRole('button', { name: /ações do membro/i }))
  await user.click(screen.getByRole('menuitem', { name: /alterar e-mail de acesso/i }))

  await screen.findByRole('heading', { name: 'Alterar e-mail de acesso' })
  await user.type(screen.getByPlaceholderText('novo@clinica.com'), 'karina.nova@clinica.com.br')
  await user.click(screen.getByRole('button', { name: 'Enviar confirmação' }))

  await waitFor(() => {
    const call = requests.requestsFor('POST', '/professionals/prof-1/email-change')[0]
    expect(call).toBeDefined()
    expect(call.body).toEqual({ newEmail: 'karina.nova@clinica.com.br', channel: 'email' })
  })
})

it('admin abre a fila de pedidos pendentes e aprova com WhatsApp', async () => {
  const requests = stubApi([
    { path: '/professionals', handler: MEMBERS },
    { path: '/onboarding/invites/list', handler: EMPTY_INVITES },
    { path: '/professionals/email-change-requests', handler: { items: [PENDING_REQUEST], page: 1, pageSize: 10, total: 1 } },
    {
      method: 'POST',
      path: '/professionals/email-change-requests/ecr-1/approve',
      handler: {
        ...PENDING_REQUEST,
        status: 'DISPATCHED',
        whatsappUrl: 'https://wa.me/5562999999999?text=confirme',
      },
    },
  ])

  await renderTeams()
  const user = userEvent.setup()
  await screen.findByText('Dra. Karina Martins')

  await user.click(screen.getByRole('tab', { name: /pedidos de e-mail/i }))
  await screen.findByText(/karina.nova@clinica.com.br/)

  await user.click(screen.getByRole('button', { name: 'Aprovar' }))
  await screen.findByRole('heading', { name: 'Aprovar troca de e-mail' })
  const approveDialog = screen.getByRole('dialog')
  await user.click(within(approveDialog).getByRole('tab', { name: 'WhatsApp' }))
  await user.click(within(approveDialog).getByRole('button', { name: 'Aprovar' }))

  await waitFor(() => {
    const call = requests.requestsFor('POST', '/professionals/email-change-requests/ecr-1/approve')[0]
    expect(call).toBeDefined()
    expect(call.body).toEqual({ channel: 'whatsapp' })
  })

  expect(await screen.findByRole('button', { name: /abrir whatsapp e enviar/i })).toBeInTheDocument()
})

it('admin recusa um pedido pendente sem corpo na requisição', async () => {
  const requests = stubApi([
    { path: '/professionals', handler: MEMBERS },
    { path: '/onboarding/invites/list', handler: EMPTY_INVITES },
    { path: '/professionals/email-change-requests', handler: { items: [PENDING_REQUEST], page: 1, pageSize: 10, total: 1 } },
    {
      method: 'POST',
      path: '/professionals/email-change-requests/ecr-1/reject',
      handler: { ...PENDING_REQUEST, status: 'REJECTED' },
    },
  ])

  await renderTeams()
  const user = userEvent.setup()
  await screen.findByText('Dra. Karina Martins')

  await user.click(screen.getByRole('tab', { name: /pedidos de e-mail/i }))
  await screen.findByText(/karina.nova@clinica.com.br/)
  await user.click(screen.getByRole('button', { name: 'Recusar' }))
  await screen.findByRole('heading', { name: 'Recusar troca de e-mail' })
  await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Recusar' }))

  await waitFor(() => {
    const call = requests.requestsFor('POST', '/professionals/email-change-requests/ecr-1/reject')[0]
    expect(call).toBeDefined()
    expect(call.body).toEqual({})
  })
})
