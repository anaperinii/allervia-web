import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LoginPage } from '@/features/auth/login-page'
import { LandingThemeProvider } from '@/features/landing-page/theme-context'
import { setCsrfToken } from '@/shared/api/client'
import { withSession } from '../helpers/session'

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

async function renderLogin(adopt = vi.fn().mockResolvedValue(undefined)) {
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
      <LandingThemeProvider>
        <RouterProvider router={router} />
      </LandingThemeProvider>,
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
  await user.type(screen.getByPlaceholderText('Insira aqui'), 'Senha!Forte#2026')
  await user.click(screen.getByRole('button', { name: 'Entrar' }))
  return user
}

const SESSION_BODY = {
  authenticated: true,
  csrfToken: 'csrf-da-sessao',
  session: {
    id: 'session-1',
    createdAt: '2026-09-19T12:00:00.000Z',
    expiresAt: '2026-09-19T20:00:00.000Z',
    lastInteractiveAt: '2026-09-19T12:00:00.000Z',
    mfaVerified: true,
    reauthenticatedAt: null,
  },
}

describe('entrada com sessão real', () => {
  beforeEach(() => {
    setCsrfToken(null)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('pede o desafio anti-CSRF antes de enviar as credenciais', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ csrfToken: 'csrf-de-pre-sessao' }))
      .mockResolvedValueOnce(jsonResponse(SESSION_BODY))
    vi.stubGlobal('fetch', fetchMock)

    const { adopt, router } = await renderLogin()
    await fillCredentials()

    await waitFor(() => expect(adopt).toHaveBeenCalledTimes(1))

    const [csrfUrl] = fetchMock.mock.calls[0] as [string]
    const [loginUrl, loginInit] = fetchMock.mock.calls[1] as [string, RequestInit]
    expect(csrfUrl).toContain('/auth/csrf')
    expect(loginUrl).toContain('/auth/sessions')
    expect((loginInit.headers as Record<string, string>)['X-CSRF-Token']).toBe(
      'csrf-de-pre-sessao',
    )
    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/immunotherapies'),
    )
  })

  it('exige o segundo fator antes de criar a sessão clínica', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ csrfToken: 'csrf-1' }))
      .mockResolvedValueOnce(
        jsonResponse({
          status: 'MFA_REQUIRED',
          challengeToken: 'desafio-1',
          expiresAt: '2026-09-19T12:05:00.000Z',
        }),
      )
      .mockResolvedValueOnce(jsonResponse({ csrfToken: 'csrf-2' }))
      .mockResolvedValueOnce(jsonResponse(SESSION_BODY))
    vi.stubGlobal('fetch', fetchMock)

    const { adopt } = await renderLogin()
    const user = await fillCredentials()

    expect(
      await screen.findByRole('heading', { name: /verificação em duas etapas/i }),
    ).toBeInTheDocument()
    expect(adopt).not.toHaveBeenCalled()

    await user.type(screen.getByPlaceholderText('000000'), '123456')
    await user.click(screen.getByRole('button', { name: 'Verificar' }))

    await waitFor(() => expect(adopt).toHaveBeenCalledTimes(1))
    const [verifyUrl, verifyInit] = fetchMock.mock.calls[3] as [string, RequestInit]
    expect(verifyUrl).toContain('/auth/mfa/verify')
    expect(JSON.parse(verifyInit.body as string)).toEqual({
      challengeToken: 'desafio-1',
      code: '123456',
    })
  })

  it('mostra os códigos de recuperação uma única vez após o cadastro do fator', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ csrfToken: 'csrf-1' }))
      .mockResolvedValueOnce(
        jsonResponse({
          status: 'MFA_ENROLLMENT_REQUIRED',
          challengeToken: 'desafio-2',
          expiresAt: '2026-09-19T12:05:00.000Z',
          enrollment: {
            credentialId: 'credencial-1',
            secret: 'JBSWY3DPEHPK3PXP',
            keyUri: 'otpauth://totp/Allervia:profissional',
          },
        }),
      )
      .mockResolvedValueOnce(jsonResponse({ csrfToken: 'csrf-2' }))
      .mockResolvedValueOnce(
        jsonResponse({ ...SESSION_BODY, recoveryCodes: ['ABCDE-12345', 'FGHIJ-67890'] }),
      )
    vi.stubGlobal('fetch', fetchMock)

    const { adopt } = await renderLogin()
    const user = await fillCredentials()

    expect(
      await screen.findByRole('heading', { name: /configure seu segundo fator/i }),
    ).toBeInTheDocument()
    expect(screen.getByText('JBSWY3DPEHPK3PXP')).toBeInTheDocument()

    await user.type(screen.getByPlaceholderText('000000'), '654321')
    await user.click(screen.getByRole('button', { name: /confirmar cadastro/i }))

    expect(
      await screen.findByRole('heading', { name: /guarde seus códigos/i }),
    ).toBeInTheDocument()
    expect(screen.getByText('ABCDE-12345')).toBeInTheDocument()
    expect(adopt).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: /salvei meus códigos/i }))
    await waitFor(() => expect(adopt).toHaveBeenCalledTimes(1))
  })

  it('mostra a mensagem do servidor quando as credenciais são recusadas', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ csrfToken: 'csrf-1' }))
      .mockResolvedValueOnce(
        jsonResponse(
          {
            statusCode: 401,
            code: 'INVALID_CREDENTIALS',
            message: 'Credenciais inválidas.',
          },
          401,
        ),
      )
    vi.stubGlobal('fetch', fetchMock)

    const { adopt } = await renderLogin()
    await fillCredentials()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Credenciais inválidas.',
    )
    expect(adopt).not.toHaveBeenCalled()
  })
})
