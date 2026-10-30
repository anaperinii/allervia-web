import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { afterEach, expect, it, vi } from 'vitest'
import { ProfilePage } from '@/features/settings/profile-page'
import { withSession, buildAccountContext } from '../helpers/session'
import { stubApi, errorResponse, type HandlerContext } from '../helpers/http'

async function renderProfile() {
  const root = createRootRoute()
  const profile = createRoute({ getParentRoute: () => root, path: '/profile', component: ProfilePage })
  const router = createRouter({
    routeTree: root.addChildren([profile]),
    history: createMemoryHistory({ initialEntries: ['/profile'] }),
  })
  await router.load()
  render(withSession(<RouterProvider router={router} />, { account: buildAccountContext({ security: { mfaEnabled: false, mfaRequired: false, sessionBased: true } }) }))
}

const PROFILE = {
  id: 'prof-1',
  fullName: 'Dra. Karina Martins',
  phoneNumber: '62995571423',
  profession: 'PHYSICIAN',
  councilNumber: '24815',
  councilUf: 'GO',
}

afterEach(() => {
  vi.unstubAllGlobals()
})

it('exige reautenticação antes de enviar o pedido de troca de e-mail do próprio profissional', async () => {
  const requests = stubApi([
    { path: '/professionals/me', handler: PROFILE },
    {
      method: 'POST',
      path: '/account/me/email-change',
      handler: ({ call }: HandlerContext) =>
        call === 1
          ? errorResponse(403, 'REAUTHENTICATION_REQUIRED', 'Confirme sua identidade novamente.')
          : new Response(
              JSON.stringify({
                id: 'ecr-1',
                professionalId: 'prof-1',
                professionalName: 'Dra. Karina Martins',
                currentEmail: 'profissional@clinica.com.br',
                newEmail: 'karina.nova@clinica.com.br',
                status: 'PENDING',
                expiresAt: '2026-09-26T12:00:00.000Z',
                requestedAt: '2026-09-19T12:00:00.000Z',
              }),
              { status: 202, headers: { 'Content-Type': 'application/json' } },
            ),
    },
    { method: 'POST', path: '/auth/reauthenticate', handler: { reauthenticatedAt: '2026-09-19T12:00:00.000Z', maxAgeSeconds: 300 } },
  ])

  await renderProfile()
  const user = userEvent.setup()
  await screen.findAllByText('Dra. Karina Martins')

  await user.click(screen.getByRole('button', { name: 'Alterar' }))
  await screen.findByRole('heading', { name: 'Alterar e-mail de acesso' })
  await user.type(screen.getByPlaceholderText('novo@clinica.com'), 'karina.nova@clinica.com.br')
  await user.click(screen.getByRole('button', { name: 'Enviar pedido' }))

  await screen.findByRole('heading', { name: 'Confirme sua identidade' })
  await user.type(screen.getByPlaceholderText('Insira aqui'), 'senha-correta')
  await user.click(screen.getByRole('button', { name: 'Confirmar' }))

  await waitFor(() => {
    expect(requests.requestsFor('POST', '/account/me/email-change')).toHaveLength(2)
  })
  await waitFor(() => {
    expect(screen.getByText(/pedido enviado para aprovação/i)).toBeInTheDocument()
  })
})
