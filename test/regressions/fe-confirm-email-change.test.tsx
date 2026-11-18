import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryHistory, createRootRoute, createRoute, createRouter, RouterProvider } from '@tanstack/react-router'
import { expect, it } from 'vitest'
import { ConfirmEmailChangePage } from '@/features/auth/confirm-email-change-page'
import { stubApi, errorResponse } from '../helpers/http'
import { withSession } from '../helpers/session'

type SearchParams = { token?: string }

function buildRouter(initialEntry: string) {
  const root = createRootRoute()
  const route = createRoute({
    getParentRoute: () => root,
    path: '/confirm-email-change',
    validateSearch: (search: Record<string, unknown>): SearchParams => ({
      token: typeof search.token === 'string' ? search.token : undefined,
    }),
    component: () => {
      const { token } = route.useSearch()
      return <ConfirmEmailChangePage initialToken={token} />
    },
  })
  const login = createRoute({ getParentRoute: () => root, path: '/login', component: () => <p>Login</p> })
  return createRouter({
    routeTree: root.addChildren([route, login]),
    history: createMemoryHistory({ initialEntries: [initialEntry] }),
  })
}

it('verifies the magic link and confirms the e-mail change', async () => {
  const requests = stubApi([
    { path: '/auth/csrf', handler: { csrfToken: 'preauth' } },
    { method: 'POST', path: '/auth/email-change/verify', handler: { valid: true, newEmail: 'novo@clinica.com.br' } },
    {
      method: 'POST',
      path: '/auth/email-change/confirm',
      handler: { message: 'E-mail de acesso alterado para novo@clinica.com.br. Entre novamente com o novo endereço.' },
    },
  ])
  const router = buildRouter('/confirm-email-change?token=synthetic-token')
  await router.load()
  render(withSession(<RouterProvider router={router} />, { status: 'anonymous', account: null, session: null }))

  expect(await screen.findByText(/novo@clinica.com.br/)).toBeInTheDocument()
  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name: 'Confirmar troca' }))

  expect(await screen.findByText('E-mail alterado')).toBeInTheDocument()
  expect(screen.getByText(/Entre novamente com o novo endereço/)).toBeInTheDocument()
  await waitFor(() => expect(requests.requestsFor('POST', '/auth/email-change/confirm')).toHaveLength(1))
})

it('shows a generic invalid-link state for an expired or consumed token, without leaking the reason', async () => {
  const requests = stubApi([
    { path: '/auth/csrf', handler: { csrfToken: 'preauth' } },
    {
      method: 'POST',
      path: '/auth/email-change/verify',
      handler: errorResponse(404, 'NOT_FOUND', 'Link de confirmação inválido ou expirado.'),
    },
  ])
  const router = buildRouter('/confirm-email-change?token=stale-token')
  await router.load()
  render(withSession(<RouterProvider router={router} />, { status: 'anonymous', account: null, session: null }))

  expect(await screen.findByText('Link inválido')).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Confirmar troca' })).not.toBeInTheDocument()
  await waitFor(() => expect(requests.requestsFor('POST', '/auth/email-change/verify')).toHaveLength(1))
})

it('shows the invalid-link state immediately when the page is opened without a token', async () => {
  const router = buildRouter('/confirm-email-change')
  await router.load()
  render(withSession(<RouterProvider router={router} />, { status: 'anonymous', account: null, session: null }))

  expect(await screen.findByText('Link inválido')).toBeInTheDocument()
})
