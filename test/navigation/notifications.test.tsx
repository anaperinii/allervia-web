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
import { NotificationsPage } from '@/features/notification/notifications-page'
import { withSession } from '../helpers/session'

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

const SERVER_NOTIFICATIONS = [
  {
    id: 'notification-1',
    kind: 'PHYSICIAN_REVIEW_REQUESTED',
    title: 'Avaliação médica solicitada',
    body: 'Paula Andrade: Eritema extenso; avaliar prescrição.',
    entityType: 'Immunotherapy',
    entityId: 'therapy-1',
    readAt: null,
    createdAt: '2026-09-21T18:00:00.000Z',
  },
  {
    id: 'notification-2',
    kind: 'TREATMENT_SUSPENDED',
    title: 'Tratamento suspenso',
    body: 'Bruno Lima: reação tardia intensa.',
    entityType: 'Immunotherapy',
    entityId: 'therapy-2',
    readAt: '2026-09-21T19:00:00.000Z',
    createdAt: '2026-09-20T18:00:00.000Z',
  },
]

function stubApi() {
  const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    const method = init?.method ?? 'GET'
    if (url.includes('/notifications/notification-1/read') && method === 'PATCH') {
      return Promise.resolve(
        jsonResponse({ ...SERVER_NOTIFICATIONS[0], readAt: '2026-09-21T20:00:00.000Z' }),
      )
    }
    if (url.includes('/notifications/read-all') && method === 'POST') {
      return Promise.resolve(jsonResponse({ marked: 1 }))
    }
    if (url.includes('/notifications')) {
      return Promise.resolve(
        jsonResponse({
          items: SERVER_NOTIFICATIONS,
          page: 1,
          pageSize: 25,
          total: 2,
          unread: 1,
        }),
      )
    }
    return Promise.resolve(jsonResponse({}))
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

async function renderPage() {
  const root = createRootRoute()
  const page = createRoute({
    getParentRoute: () => root,
    path: '/notifications',
    component: NotificationsPage,
  })
  const router = createRouter({
    routeTree: root.addChildren([page]),
    history: createMemoryHistory({ initialEntries: ['/notifications'] }),
  })
  await router.load()
  render(withSession(<RouterProvider router={router} />))
}

describe('notificações internas persistidas', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('lista as notificações do servidor com contagem de não lidas', async () => {
    stubApi()
    await renderPage()

    expect(await screen.findByText('Avaliação médica solicitada')).toBeInTheDocument()
    expect(screen.getByText(/Paula Andrade: Eritema extenso/)).toBeInTheDocument()
    expect(screen.getByText('Tratamento suspenso')).toBeInTheDocument()
    expect(screen.getByText(/2 notificações · 1 não lidas/)).toBeInTheDocument()
  })

  it('marca todas como lidas pelo comando do servidor', async () => {
    const fetchMock = stubApi()
    const user = userEvent.setup()
    await renderPage()

    await screen.findByText('Avaliação médica solicitada')
    await user.click(screen.getByRole('button', { name: /marcar todas como lidas/i }))

    await waitFor(() => {
      const call = fetchMock.mock.calls.find(
        ([url, init]) =>
          String(url).includes('/notifications/read-all') &&
          (init as RequestInit | undefined)?.method === 'POST',
      )
      expect(call).toBeDefined()
    })
  })
})
