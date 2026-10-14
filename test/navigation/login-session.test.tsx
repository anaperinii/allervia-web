import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LoginPage } from '@/features/auth/login-page'
import { setCsrfToken } from '@/shared/api/client'
import {
  accountContext,
  mfaChallenge,
  mfaEnrollmentChallenge,
  sessionEnvelope,
} from '../fixtures/account'
import {
  errorResponse,
  jsonResponse,
  type HandlerContext,
  type RouteDefinition,
  stubApi,
} from '../helpers/http'
import { withSession } from '../helpers/session'


async function renderLogin(adopt = vi.fn().mockResolvedValue(accountContext())) {
  const root = createRootRoute()
  const login = createRoute({
    getParentRoute: () => root,
    path: '/login',
    component: LoginPage,
  })
  const destination = createRoute({
    getParentRoute: () => root,
    path: '/immunotherapies',
    component: () => <h1>Prontuários</h1>,
  })
  const forgot = createRoute({
    getParentRoute: () => root,
    path: '/forgot-password',
    component: () => <h1>Recuperação</h1>,
  })
  const trial = createRoute({
    getParentRoute: () => root,
    path: '/trial',
    component: () => <h1>Demonstração</h1>,
  })
  const router = createRouter({
    routeTree: root.addChildren([login, destination, forgot, trial]),
    history: createMemoryHistory({ initialEntries: ['/login'] }),
  })

  await router.load()

  render(
    withSession(
      <RouterProvider router={router} />,
      { status: 'anonymous', account: null, session: null, adopt },
    ),
  )

  return { router, adopt }
}

async function fillCredentials() {
  const user = userEvent.setup()
  await user.type(
    screen.getByPlaceholderText('seu@email.com.br'),
    'profissional@clinica.com.br',
  )
  await user.type(
    screen.getByPlaceholderText('Insira aqui'),
    'Senha!Forte#2026',
  )
  await user.click(screen.getByRole('button', { name: 'Entrar' }))
  return user
}


function csrfRoute(tokens: string[]): RouteDefinition {
  return {
    method: 'GET',
    path: '/auth/csrf',
    handler: ({ call }: HandlerContext) =>
      jsonResponse({ csrfToken: tokens[call - 1] ?? tokens.at(-1) }),
  }
}

describe('entrada com sessão real', () => {
  beforeEach(() => {
    setCsrfToken(null)
  })

  it('pede o desafio anti-CSRF antes de enviar as credenciais', async () => {
    const api = stubApi([
      csrfRoute(['csrf-de-pre-sessao']),
      { method: 'POST', path: '/auth/sessions', handler: sessionEnvelope() },
    ])

    const { adopt, router } = await renderLogin()
    await fillCredentials()

    await waitFor(() => expect(adopt).toHaveBeenCalledTimes(1))


    expect(api.requestsFor('GET', '/auth/csrf')).toHaveLength(1)
    const [login] = api.requestsFor('POST', '/auth/sessions')
    expect(login.headers['X-CSRF-Token']).toBe('csrf-de-pre-sessao')
    expect(api.requests.indexOf(login)).toBeGreaterThan(0)
    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/immunotherapies'),
    )
  })

  it('exige o segundo fator antes de criar a sessão clínica', async () => {
    const api = stubApi([
      csrfRoute(['csrf-1', 'csrf-2']),
      { method: 'POST', path: '/auth/sessions', handler: mfaChallenge() },
      { method: 'POST', path: '/auth/mfa/verify', handler: sessionEnvelope() },
    ])

    const { adopt } = await renderLogin()
    const user = await fillCredentials()

    expect(
      await screen.findByRole('heading', {
        name: /verificação em duas etapas/i,
      }),
    ).toBeInTheDocument()
    expect(adopt).not.toHaveBeenCalled()

    await user.type(screen.getByPlaceholderText('000000'), '123456')
    await user.click(screen.getByRole('button', { name: 'Verificar' }))

    await waitFor(() => expect(adopt).toHaveBeenCalledTimes(1))
    const [verify] = api.requestsFor('POST', '/auth/mfa/verify')
    expect(verify.body).toEqual({
      challengeToken: 'desafio-1',
      code: '123456',
    })
  })

  it('mostra os códigos de recuperação uma única vez após o cadastro do fator', async () => {
    stubApi([
      csrfRoute(['csrf-1', 'csrf-2']),
      { method: 'POST', path: '/auth/sessions', handler: mfaEnrollmentChallenge() },
      {
        method: 'POST',
        path: '/auth/mfa/verify',
        handler: sessionEnvelope({
          recoveryCodes: ['ABCDE-12345', 'FGHIJ-67890'],
        }),
      },
    ])

    const { adopt } = await renderLogin()
    const user = await fillCredentials()

    expect(
      await screen.findByRole('heading', {
        name: /configure seu segundo fator/i,
      }),
    ).toBeInTheDocument()
    expect(screen.getByText('JBSWY3DPEHPK3PXP')).toBeInTheDocument()

    await user.type(screen.getByPlaceholderText('000000'), '654321')
    await user.click(
      screen.getByRole('button', { name: /confirmar cadastro/i }),
    )

    expect(
      await screen.findByRole('heading', { name: /guarde seus códigos/i }),
    ).toBeInTheDocument()
    expect(screen.getByText('ABCDE-12345')).toBeInTheDocument()
    expect(adopt).not.toHaveBeenCalled()

    await user.click(
      screen.getByRole('button', { name: /salvei meus códigos/i }),
    )
    await waitFor(() => expect(adopt).toHaveBeenCalledTimes(1))
  })

  it('mostra a mensagem do servidor quando as credenciais são recusadas', async () => {
    stubApi([
      csrfRoute(['csrf-1']),
      {
        method: 'POST',
        path: '/auth/sessions',
        handler: errorResponse(401, 'INVALID_CREDENTIALS', 'Credenciais inválidas.'),
      },
    ])

    const { adopt } = await renderLogin()
    await fillCredentials()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Credenciais inválidas.',
    )
    expect(adopt).not.toHaveBeenCalled()
  })
})
