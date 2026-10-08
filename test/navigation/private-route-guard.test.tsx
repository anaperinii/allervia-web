import { render, screen } from '@testing-library/react'
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { expect, it, describe } from 'vitest'
import { RequireSession } from '@/shared/auth/RequireSession'
import { ApiError } from '@/shared/api/contracts/errors'
import { useUserStore } from '@/shared/stores/useUserStore'
import { buildAccountContext, withSession } from '../helpers/session'

async function renderGuardedRoute(session: Parameters<typeof withSession>[1]) {
  const root = createRootRoute()
  const privateRoute = createRoute({
    getParentRoute: () => root,
    path: '/immunotherapies',
    component: () => (
      <RequireSession>
        <h1>Prontuários</h1>
      </RequireSession>
    ),
  })
  const login = createRoute({
    getParentRoute: () => root,
    path: '/login',
    component: () => <h1>Entrar</h1>,
  })
  const router = createRouter({
    routeTree: root.addChildren([privateRoute, login]),
    history: createMemoryHistory({ initialEntries: ['/immunotherapies'] }),
  })

  await router.load()
  render(withSession(<RouterProvider router={router} />, session))
  return router
}

describe('guarda de rotas privadas', () => {
  it('não monta a área privada enquanto a sessão carrega', async () => {
    await renderGuardedRoute({ status: 'loading', account: null, session: null })

    expect(screen.queryByRole('heading', { name: 'Prontuários' })).toBeNull()
    expect(screen.getByText(/carregando sua sessão/i)).toBeInTheDocument()
  })

  it('manda o acesso anônimo para o login', async () => {
    const router = await renderGuardedRoute({
      status: 'anonymous',
      account: null,
      session: null,
    })

    expect(await screen.findByRole('heading', { name: 'Entrar' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/login')
  })

  it('mostra erro recuperável quando o servidor não responde', async () => {
    await renderGuardedRoute({
      status: 'error',
      account: null,
      session: null,
      error: new ApiError({
        statusCode: 0,
        code: 'NETWORK_UNAVAILABLE',
        message: 'Não foi possível falar com o servidor.',
      }),
    })

    expect(screen.getByText(/não foi possível falar com o servidor/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /tentar novamente/i })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Prontuários' })).toBeNull()
  })

  it('libera a área privada e publica identidade e capacidades reais', async () => {
    await renderGuardedRoute({ status: 'authenticated' })

    expect(
      await screen.findByRole('heading', { name: 'Prontuários' }),
    ).toBeInTheDocument()

    const state = useUserStore.getState()
    expect(state.current?.name).toBe('Dra. Karina Martins')
    expect(state.current?.role).toBe('doctor')
    expect(state.capabilities).toEqual(buildAccountContext().capabilities)
  })
})
