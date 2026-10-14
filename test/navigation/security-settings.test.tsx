import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SecurityPage } from '@/features/settings/security-page'
import { withSession } from '../helpers/session'

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

const DEVICES = [
  {
    id: 'session-1',
    current: true,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0) Chrome/130.0',
    createdAt: '2026-09-19T12:00:00.000Z',
    lastInteractiveAt: '2026-09-19T12:00:00.000Z',
    expiresAt: '2026-09-19T20:00:00.000Z',
  },
]

interface StubOptions {
  passwordResponse?: Response
}

function stubApi(options: StubOptions = {}) {
  const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    const method = init?.method ?? 'GET'
    if (url.includes('/account/me/password') && method === 'POST') {
      return Promise.resolve(
        options.passwordResponse ??
          jsonResponse({ message: 'Senha alterada com sucesso.' }),
      )
    }
    if (url.includes('/auth/logout-all') && method === 'POST') {
      return Promise.resolve(new Response(null, { status: 204 }))
    }
    if (url.includes('/auth/mfa/factors')) {
      return Promise.resolve(
        jsonResponse({ factors: [], recoveryCodesRemaining: 0 }),
      )
    }
    if (url.includes('/auth/sessions')) {
      return Promise.resolve(jsonResponse(DEVICES))
    }
    return Promise.resolve(jsonResponse({}))
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

async function renderPage(refresh = vi.fn(async () => {})) {
  const root = createRootRoute()
  const page = createRoute({
    getParentRoute: () => root,
    path: '/settings/security',
    component: SecurityPage,
  })
  const router = createRouter({
    routeTree: root.addChildren([page]),
    history: createMemoryHistory({ initialEntries: ['/settings/security'] }),
  })
  await router.load()
  render(withSession(<RouterProvider router={router} />, { refresh }))
  return refresh
}

async function openPasswordModal(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await screen.findByRole('button', { name: 'Alterar' }))
  const [current, newPassword, confirm] =
    await screen.findAllByPlaceholderText('Insira aqui')
  return { current, newPassword, confirm }
}

describe('segurança: alterar senha', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('envia a troca ao servidor e mostra sucesso somente após 2xx', async () => {
    const fetchMock = stubApi()
    const user = userEvent.setup()
    const refresh = await renderPage()

    const fields = await openPasswordModal(user)
    await user.type(fields.current, 'SenhaAtual#1')
    await user.type(fields.newPassword, 'NovaSenha#123')
    await user.type(fields.confirm, 'NovaSenha#123')
    await user.click(screen.getByRole('button', { name: 'Alterar senha' }))

    expect(
      await screen.findByText('Senha alterada com sucesso'),
    ).toBeInTheDocument()

    const call = fetchMock.mock.calls.find(
      ([url, init]) =>
        String(url).includes('/account/me/password') &&
        (init as RequestInit | undefined)?.method === 'POST',
    )
    expect(call).toBeDefined()
    expect(JSON.parse(String((call![1] as RequestInit).body))).toEqual({
      currentPassword: 'SenhaAtual#1',
      newPassword: 'NovaSenha#123',
    })
    await waitFor(() => expect(refresh).toHaveBeenCalled())
  })

  it('mantém o formulário e exibe o erro quando a senha atual é recusada', async () => {
    stubApi({
      passwordResponse: jsonResponse(
        { code: 'INVALID_CREDENTIALS', message: 'Senha atual incorreta.' },
        401,
      ),
    })
    const user = userEvent.setup()
    const refresh = await renderPage()

    const fields = await openPasswordModal(user)
    await user.type(fields.current, 'SenhaErrada#1')
    await user.type(fields.newPassword, 'NovaSenha#123')
    await user.type(fields.confirm, 'NovaSenha#123')
    await user.click(screen.getByRole('button', { name: 'Alterar senha' }))

    expect(
      await screen.findByText('Senha atual incorreta.'),
    ).toBeInTheDocument()
    expect(fields.current).toHaveValue('SenhaErrada#1')
    expect(fields.newPassword).toHaveValue('NovaSenha#123')
    expect(fields.confirm).toHaveValue('NovaSenha#123')
    expect(
      screen.queryByText('Senha alterada com sucesso'),
    ).not.toBeInTheDocument()
    expect(refresh).not.toHaveBeenCalled()
  })

  it('valida localmente sem chamar o servidor', async () => {
    const fetchMock = stubApi()
    const user = userEvent.setup()
    await renderPage()

    const fields = await openPasswordModal(user)
    await user.type(fields.current, 'SenhaAtual#1')
    await user.type(fields.newPassword, 'NovaSenha#123')
    await user.type(fields.confirm, 'Diferente#123')
    await user.click(screen.getByRole('button', { name: 'Alterar senha' }))

    expect(
      await screen.findByText('As senhas não coincidem.'),
    ).toBeInTheDocument()
    expect(
      fetchMock.mock.calls.some(([url]) =>
        String(url).includes('/account/me/password'),
      ),
    ).toBe(false)
  })
})

describe('segurança: encerrar todas as sessões', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('chama logout-all e trata o sucesso como saída', async () => {
    const fetchMock = stubApi()
    const user = userEvent.setup()
    const refresh = await renderPage()

    await user.click(
      await screen.findByRole('button', { name: 'Encerrar todas' }),
    )
    const dialog = await screen.findByRole('dialog')
    await user.click(
      within(dialog).getByRole('button', { name: 'Encerrar todas' }),
    )

    expect(
      await screen.findByText('Todas as sessões foram encerradas'),
    ).toBeInTheDocument()
    const call = fetchMock.mock.calls.find(
      ([url, init]) =>
        String(url).includes('/auth/logout-all') &&
        (init as RequestInit | undefined)?.method === 'POST',
    )
    expect(call).toBeDefined()
    await waitFor(() => expect(refresh).toHaveBeenCalled())
  })
})

describe('segurança: LGPD sem operação no servidor', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('exibe exportação e anonimização como indisponíveis, sem controles', async () => {
    stubApi()
    await renderPage()

    expect(await screen.findByText('Exportar meus dados')).toBeInTheDocument()
    expect(screen.getAllByText('Indisponível')).toHaveLength(2)
    expect(
      screen.queryByRole('button', { name: 'Solicitar' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Gerenciar' }),
    ).not.toBeInTheDocument()
    expect(screen.queryByText('Visibilidade do perfil')).not.toBeInTheDocument()
  })
})
