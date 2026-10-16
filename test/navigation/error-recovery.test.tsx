import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { describe, expect, it, vi } from 'vitest'
import { apiRequest } from '@/shared/api/client'
import { clearChunkReloadGuard } from '@/shared/components/errors/chunk-reload'
import { NotFoundFallback } from '@/shared/components/errors/NotFoundFallback'
import { RouteErrorFallback } from '@/shared/components/errors/RouteErrorFallback'
import { classifyError, technicalReference } from '@/shared/components/errors/error-kind'
import { expectRenderErrors } from '../helpers/diagnostics'
import {
  errorResponse,
  type HandlerContext,
  jsonResponse,
  stubApi,
} from '../helpers/http'
import { withSession } from '../helpers/session'


const LEAKY_MESSAGE =
  'falha ao montar: paciente Carla Mendes CPF 529.982.247-25 token=abc123'

function Exploding(): never {
  throw new Error(LEAKY_MESSAGE)
}

function ChunkFailure(): never {
  throw new Error('Failed to fetch dynamically imported module: /assets/page-abc.js')
}

interface RouteSpec {
  path: string
  component: () => ReactNode
}

function buildRouter(routes: RouteSpec[], initialEntry: string) {

  const root = createRootRoute({
    component: Outlet,
    errorComponent: RouteErrorFallback,
    notFoundComponent: NotFoundFallback,
  })
  const children = routes.map((route) =>
    createRoute({
      getParentRoute: () => root,
      path: route.path,
      component: route.component,
    }),
  )
  return createRouter({
    routeTree: root.addChildren(children),
    history: createMemoryHistory({ initialEntries: [initialEntry] }),
  })
}

const CLINICAL_LIST: RouteSpec = {
  path: '/immunotherapies',
  component: () => <h1>Lista clínica</h1>,
}

describe('recuperação de erro de rota', () => {
  it('erro de render mostra fallback recuperável e nenhum dado bruto', async () => {
    expectRenderErrors(/falha ao montar/)
    const router = buildRouter(
      [{ path: '/quebrada', component: Exploding }, CLINICAL_LIST],
      '/quebrada',
    )
    await router.load()
    render(withSession(<RouterProvider router={router} />))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Algo quebrou ao montar esta tela',
    )
    expect(document.body).not.toHaveTextContent('529.982.247-25')
    expect(document.body).not.toHaveTextContent('token=abc123')
    expect(document.body).not.toHaveTextContent('at Exploding')


    await userEvent.setup().click(screen.getByRole('link', { name: /lista clínica/i }))
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/immunotherapies')
    })
  })

  it('URL inexistente apresenta 404 própria com destino permitido', async () => {
    const router = buildRouter([CLINICAL_LIST], '/rota-que-nao-existe')
    await router.load()
    render(withSession(<RouterProvider router={router} />))

    expect(await screen.findByRole('alert')).toHaveTextContent('Endereço não encontrado')
    expect(screen.getByRole('link', { name: /lista clínica/i })).toBeInTheDocument()
  })

  it('anônimo em URL inexistente recebe destino público', async () => {
    const router = buildRouter(
      [{ path: '/', component: () => <h1>Início</h1> }],
      '/rota-que-nao-existe',
    )
    await router.load()
    render(
      withSession(<RouterProvider router={router} />, {
        status: 'anonymous',
        account: null,
        session: null,
      }),
    )

    expect(await screen.findByRole('alert')).toHaveTextContent('Endereço não encontrado')
    expect(
      screen.getByRole('link', { name: /página inicial/i }),
    ).toBeInTheDocument()
  })

  it('retry de erro de leitura não repete comando clínico', async () => {
    const api = stubApi([
      { method: 'POST', path: '/doses/dose-1/administer', handler: jsonResponse({ ok: true }) },
      {
        method: 'GET',
        path: '/immunotherapies/therapy-1/history',
        handler: ({ call }: HandlerContext) =>
          call === 1
            ? errorResponse(500, 'UNEXPECTED_ERROR', 'Falha temporária.')
            : jsonResponse({ entries: [] }),
      },
    ])


    await apiRequest('/doses/dose-1/administer', { method: 'POST', body: { ok: true } })

    function Screen() {
      const history = useQuery({
        queryKey: ['historico'],
        queryFn: () => apiRequest('/immunotherapies/therapy-1/history'),
        retry: false,
        throwOnError: true,
      })
      return <p>{history.isSuccess ? 'Histórico carregado' : 'Carregando'}</p>
    }

    const router = buildRouter(
      [{ path: '/prontuario', component: Screen }, CLINICAL_LIST],
      '/prontuario',
    )
    await router.load()
    expectRenderErrors(/Falha temporária/)
    render(withSession(<RouterProvider router={router} />))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'O servidor recusou esta leitura',
    )
    await waitFor(() => {
      expect(api.requestsFor('POST', '/doses/dose-1/administer')).toHaveLength(1)
    })

    await userEvent.setup().click(screen.getByRole('button', { name: /tentar novamente/i }))

    expect(await screen.findByText('Histórico carregado')).toBeInTheDocument()

    expect(api.requestsFor('GET', '/immunotherapies/therapy-1/history')).toHaveLength(2)
    expect(api.requestsFor('POST', '/doses/dose-1/administer')).toHaveLength(1)
  })

  it('falha de chunk orienta a recarga explícita e não entra em laço', async () => {
    clearChunkReloadGuard()
    const reload = vi.fn()
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...window.location, reload },
    })

    expectRenderErrors(/dynamically imported module/)
    const router = buildRouter(
      [{ path: '/lenta', component: ChunkFailure }, CLINICAL_LIST],
      '/lenta',
    )
    await router.load()
    render(withSession(<RouterProvider router={router} />))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Esta página mudou desde que você abriu',
    )
    const button = screen.getByRole('button', { name: /recarregar o aplicativo/i })
    const user = userEvent.setup()
    await user.click(button)
    expect(reload).toHaveBeenCalledTimes(1)


    await user.click(button)
    expect(reload).toHaveBeenCalledTimes(1)
    clearChunkReloadGuard()
  })
})

describe('classificação e referência técnica', () => {
  it('separa falha de chunk, rede, API e render', () => {
    expect(
      classifyError(new Error('Failed to fetch dynamically imported module: /a.js')),
    ).toBe('chunk')
    expect(classifyError(new Error('ChunkLoadError: Loading chunk 3 failed'))).toBe('chunk')
    expect(classifyError(new TypeError('x is not a function'))).toBe('render')
  })

  it('a referência técnica não contém mensagem nem conteúdo do erro', () => {
    const reference = technicalReference(new Error(LEAKY_MESSAGE))
    expect(reference).not.toContain('529.982.247-25')
    expect(reference).not.toContain('Carla Mendes')
    expect(reference).toMatch(/^Error · [0-9A-Z]{1,6}$/)

    expect(technicalReference(new Error(LEAKY_MESSAGE))).toBe(reference)
  })
})
