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
import { NotificationsPage } from '@/features/notification/notifications-page'
import { notification, notificationPage } from '../fixtures/settings'
import { stubApi } from '../helpers/http'
import { withSession } from '../helpers/session'

const SERVER_NOTIFICATIONS = [
  notification({
    id: 'notification-1',
    kind: 'PHYSICIAN_REVIEW_REQUESTED',
    title: 'Avaliação médica solicitada',
    body: 'Paula Andrade: Eritema extenso; avaliar prescrição.',
    entityType: 'Immunotherapy',
    entityId: 'therapy-1',
    readAt: null,
    createdAt: '2026-09-21T18:00:00.000Z',
  }),
  notification({
    id: 'notification-2',
    kind: 'TREATMENT_SUSPENDED',
    title: 'Tratamento suspenso',
    body: 'Bruno Lima: reação tardia intensa.',
    entityType: 'Immunotherapy',
    entityId: 'therapy-2',
    readAt: '2026-09-21T19:00:00.000Z',
    createdAt: '2026-09-20T18:00:00.000Z',
  }),
]

function stubNotificationsApi() {
  return stubApi([
    {
      method: 'PATCH',
      path: '/notifications/notification-1/read',
      handler: notification({
        ...SERVER_NOTIFICATIONS[0],
        readAt: '2026-09-21T20:00:00.000Z',
      }),
    },
    { method: 'POST', path: '/notifications/read-all', handler: { marked: 1 } },
    {
      path: '/notifications',
      handler: notificationPage(SERVER_NOTIFICATIONS, { pageSize: 25 }),
    },
  ])
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
  it('lista as notificações do servidor com contagem de não lidas', async () => {
    stubNotificationsApi()
    await renderPage()

    expect(await screen.findByText('Avaliação médica solicitada')).toBeInTheDocument()
    expect(screen.getByText(/Paula Andrade: Eritema extenso/)).toBeInTheDocument()
    expect(screen.getByText('Tratamento suspenso')).toBeInTheDocument()
    expect(screen.getByText(/2 notificações · 1 não lidas/)).toBeInTheDocument()
  })

  it('marca todas como lidas pelo comando do servidor', async () => {
    const api = stubNotificationsApi()
    const user = userEvent.setup()
    await renderPage()

    await screen.findByText('Avaliação médica solicitada')
    await user.click(screen.getByRole('button', { name: /marcar todas como lidas/i }))

    await waitFor(() => {
      expect(api.requestsFor('POST', '/notifications/read-all')).toHaveLength(1)
    })
  })
})
