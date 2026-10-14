import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryHistory, createRootRoute, createRoute, createRouter, RouterProvider } from '@tanstack/react-router'
import { expect, it } from 'vitest'
import { ForgotPasswordPage } from '@/features/auth/forgot-password-page'
import { stubApi, errorResponse } from '../helpers/http'
import { withSession } from '../helpers/session'

it('prevents native submit reloads and returns an invalidated reset token to the token step without retaining the new password', async () => {
  const requests = stubApi([
    { path: '/auth/csrf', handler: { csrfToken: 'preauth' } },
    { method: 'POST', path: '/auth/password-reset/request', handler: { message: 'Accepted' } },
    { method: 'POST', path: '/auth/password-reset/verify', handler: { valid: true } },
    { method: 'POST', path: '/auth/password-reset/confirm', handler: errorResponse(404, 'NOT_FOUND', 'Código inválido ou expirado.') },
  ])
  const root = createRootRoute()
  const route = createRoute({ getParentRoute: () => root, path: '/forgot-password', component: ForgotPasswordPage })
  const login = createRoute({ getParentRoute: () => root, path: '/login', component: () => <p>Login</p> })
  const home = createRoute({ getParentRoute: () => root, path: '/', component: () => <p>Home</p> })
  const router = createRouter({ routeTree: root.addChildren([route, login, home]), history: createMemoryHistory({ initialEntries: ['/forgot-password'] }) })
  await router.load()
  render(withSession(<RouterProvider router={router} />, { status: 'anonymous', account: null, session: null }))
  const user = userEvent.setup()
  await user.type(await screen.findByPlaceholderText('seu@email.com.br'), 'reader@example.test')
  const emailSubmit = new Event('submit', { bubbles: true, cancelable: true })
  await act(async () => { screen.getByPlaceholderText('seu@email.com.br').closest('form')!.dispatchEvent(emailSubmit) })
  expect(emailSubmit.defaultPrevented).toBe(true)
  await user.type(await screen.findByPlaceholderText('Cole aqui o código recebido por e-mail'), 'synthetic-token')
  await user.click(screen.getByRole('button', { name: 'Verificar código' }))
  await user.type(await screen.findByPlaceholderText('Mínimo 8 caracteres'), 'abcdefgh')
  await user.type(screen.getByPlaceholderText('Repita a nova senha'), 'abcdefgh')
  const passwordSubmit = new Event('submit', { bubbles: true, cancelable: true })
  await act(async () => { screen.getByPlaceholderText('Mínimo 8 caracteres').closest('form')!.dispatchEvent(passwordSubmit) })
  expect(passwordSubmit.defaultPrevented).toBe(true)
  expect(await screen.findByPlaceholderText('Cole aqui o código recebido por e-mail')).toHaveValue('')
  expect(screen.queryByPlaceholderText('Mínimo 8 caracteres')).not.toBeInTheDocument()
  await waitFor(() => expect(requests.requestsFor('POST', '/auth/password-reset/confirm')).toHaveLength(1))
})
