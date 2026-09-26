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
import { RegisterPage } from '@/features/auth/register-page'
import { LandingThemeProvider } from '@/features/landing-page/theme-context'
import { withSession } from '../helpers/session'

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

const INVITE_CONTEXT = {
  email: 'jaqueline@clinica.com.br',
  fullName: 'Jaqueline Oliveira',
  role: 'NURSE',
  organizationName: 'Clínica Integrada Princípios',
  expiresAt: '2026-09-26T12:00:00.000Z',
}

async function renderRegister(token?: string) {
  const root = createRootRoute()
  const register = createRoute({
    getParentRoute: () => root,
    path: '/register',
    component: () => <RegisterPage token={token} />,
  })
  const login = createRoute({
    getParentRoute: () => root,
    path: '/login',
    component: () => <h1>Entrar</h1>,
  })
  const router = createRouter({
    routeTree: root.addChildren([register, login]),
    history: createMemoryHistory({ initialEntries: ['/register'] }),
  })

  await router.load()
  render(
    withSession(
      <LandingThemeProvider>
        <RouterProvider router={router} />
      </LandingThemeProvider>,
      { status: 'anonymous', account: null, session: null },
    ),
  )
}

describe('cadastro por convite', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('exige o link do convite para abrir o formulário', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    await renderRegister()

    expect(
      screen.getByRole('heading', { name: /convite necessário/i }),
    ).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('mostra o contexto do convite e cadastra com os dados do servidor', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(INVITE_CONTEXT))
      .mockResolvedValueOnce(
        jsonResponse(
          { userId: 'user-9', professionalId: 'prof-9', email: INVITE_CONTEXT.email },
          201,
        ),
      )
    vi.stubGlobal('fetch', fetchMock)
    const user = userEvent.setup()

    await renderRegister('token-do-email')

    expect(
      await screen.findByRole('heading', { name: /é um prazer ter você aqui/i }),
    ).toBeInTheDocument()
    expect(screen.getByText('Clínica Integrada Princípios')).toBeInTheDocument()
    expect(screen.getByText('Enfermeiro')).toBeInTheDocument()

    const [contextUrl] = fetchMock.mock.calls[0] as [string]
    expect(contextUrl).toContain('/onboarding/invites/context/token-do-email')

    await user.click(screen.getByRole('button', { name: /completar meu cadastro/i }))

    await user.type(screen.getByPlaceholderText('Seu nome completo'), 'Jaqueline Oliveira')
    await user.type(screen.getByPlaceholderText('Mín. 8 caracteres'), 'Senha!Forte#2026')
    await user.type(screen.getByPlaceholderText('Repita a senha'), 'Senha!Forte#2026')
    await user.selectOptions(screen.getByRole('combobox'), 'NURSE')
    await user.type(screen.getByPlaceholderText('(00) 00000-0000'), '62994315582')
    await user.click(screen.getByRole('button', { name: /criar conta/i }))

    await waitFor(() => {
      const call = fetchMock.mock.calls.find(([url]) =>
        String(url).includes('/onboarding/registration/'),
      )
      expect(call).toBeDefined()
      expect(JSON.parse((call![1] as RequestInit).body as string)).toEqual({
        fullName: 'Jaqueline Oliveira',
        password: 'Senha!Forte#2026',
        profession: 'NURSE',
        phoneNumber: '62994315582',
      })
    })

    expect(
      await screen.findByRole('heading', { name: /conta ativada com sucesso/i }),
    ).toBeInTheDocument()
  })

  it('explica o motivo quando o convite não vale mais', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse(
          {
            statusCode: 409,
            code: 'USER_INVITE_EXPIRED',
            message: 'O convite expirou.',
          },
          409,
        ),
      ),
    )

    await renderRegister('token-expirado')

    expect(
      await screen.findByRole('heading', { name: /convite indisponível/i }),
    ).toBeInTheDocument()
    expect(screen.getByText('O convite expirou.')).toBeInTheDocument()
  })
})
