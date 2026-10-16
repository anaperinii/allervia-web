import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryHistory, createRootRoute, createRoute, createRouter, RouterProvider } from '@tanstack/react-router'
import { expect, it } from 'vitest'
import { ForgotPasswordPage } from '@/features/auth/forgot-password-page'
import { stubApi, errorResponse } from '../helpers/http'
import { withSession } from '../helpers/session'

type SearchParams = { token?: string }

function buildRouter(initialEntry: string) {
  const root = createRootRoute()
  const route = createRoute({
    getParentRoute: () => root,
    path: '/forgot-password',
    validateSearch: (search: Record<string, unknown>): SearchParams => ({
      token: typeof search.token === 'string' ? search.token : undefined,
    }),
    component: () => {
      const { token } = route.useSearch()
      return <ForgotPasswordPage initialToken={token} />
    },
  })
  const login = createRoute({ getParentRoute: () => root, path: '/login', component: () => <p>Login</p> })
  return createRouter({
    routeTree: root.addChildren([route, login]),
    history: createMemoryHistory({ initialEntries: [initialEntry] }),
  })
}

it('prevents a native reload when requesting the reset link by e-mail', async () => {
  const requests = stubApi([
    { path: '/auth/csrf', handler: { csrfToken: 'preauth' } },
    { method: 'POST', path: '/auth/password-reset/request', handler: { message: 'Accepted' } },
  ])
  const router = buildRouter('/forgot-password')
  await router.load()
  render(withSession(<RouterProvider router={router} />, { status: 'anonymous', account: null, session: null }))
  const user = userEvent.setup()
  await user.type(await screen.findByPlaceholderText('seu@email.com.br'), 'reader@example.test')
  const emailSubmit = new Event('submit', { bubbles: true, cancelable: true })
  await act(async () => { screen.getByPlaceholderText('seu@email.com.br').closest('form')!.dispatchEvent(emailSubmit) })
  expect(emailSubmit.defaultPrevented).toBe(true)
  expect(await screen.findByText(/enviamos um link de redefinição/i)).toBeInTheDocument()
  expect(screen.queryByPlaceholderText(/código/i)).not.toBeInTheDocument()
  await waitFor(() => expect(requests.requestsFor('POST', '/auth/password-reset/request')).toHaveLength(1))
})

it('opens straight into the reset step from the magic link and drops an invalidated token without retaining the new password', async () => {
  const requests = stubApi([
    { path: '/auth/csrf', handler: { csrfToken: 'preauth' } },
    { method: 'POST', path: '/auth/password-reset/verify', handler: { valid: true } },
    { method: 'POST', path: '/auth/password-reset/confirm', handler: errorResponse(404, 'NOT_FOUND', 'Token de redefinição inválido ou expirado.') },
  ])
  const router = buildRouter('/forgot-password?token=synthetic-token')
  await router.load()
  render(withSession(<RouterProvider router={router} />, { status: 'anonymous', account: null, session: null }))
  const user = userEvent.setup()
  await user.type(await screen.findByPlaceholderText('8 a 20 caracteres'), 'Abcdefg1!')
  await user.type(screen.getByPlaceholderText('Repita a nova senha'), 'Abcdefg1!')
  const passwordSubmit = new Event('submit', { bubbles: true, cancelable: true })
  await act(async () => { screen.getByPlaceholderText('8 a 20 caracteres').closest('form')!.dispatchEvent(passwordSubmit) })
  expect(passwordSubmit.defaultPrevented).toBe(true)
  expect(await screen.findByText('Link inválido')).toBeInTheDocument()
  expect(screen.queryByPlaceholderText('8 a 20 caracteres')).not.toBeInTheDocument()
  await waitFor(() => expect(requests.requestsFor('POST', '/auth/password-reset/confirm')).toHaveLength(1))
})
