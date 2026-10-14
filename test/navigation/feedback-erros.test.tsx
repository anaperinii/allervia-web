import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router'
import { describe, expect, it } from 'vitest'
import { ProtocolsPage } from '@/features/protocols/protocols-page'
import { ToastViewport } from '@/shared/components/toasts/ToastViewport'
import { showApiErrorToast } from '@/shared/components/toasts/apiErrorToast'
import { toast, useToastStore } from '@/shared/components/toasts/useToastStore'
import { ApiError } from '@/shared/api/contracts/errors'
import { automationSettings } from '../fixtures/settings'
import { treatmentProtocol } from '../fixtures/protocols'
import {
  errorResponse,
  type HandlerContext,
  jsonResponse,
  stubApi,
  type RouteDefinition,
} from '../helpers/http'
import { withSession } from '../helpers/session'

const CATALOG = [treatmentProtocol()]

async function renderProtocols(extraRoutes: RouteDefinition[] = []) {
  const api = stubApi([
    ...extraRoutes,
    { path: '/treatment-protocols', handler: CATALOG },
    { path: '/treatment-protocols/automation', handler: automationSettings() },
  ])

  const root = createRootRoute({ component: Outlet })
  const protocols = createRoute({
    getParentRoute: () => root,
    path: '/protocols',
    component: ProtocolsPage,
  })
  const editor = createRoute({
    getParentRoute: () => root,
    path: '/protocol-editor',
    validateSearch: () => ({ mode: 'create' as const }),
    component: () => <h1>Editor</h1>,
  })
  const settings = createRoute({
    getParentRoute: () => root,
    path: '/settings',
    component: () => <h1>Configurações</h1>,
  })
  const router = createRouter({
    routeTree: root.addChildren([protocols, editor, settings]),
    history: createMemoryHistory({ initialEntries: ['/protocols'] }),
  })
  await router.load()
  render(withSession(<RouterProvider router={router} />))
  return api
}

describe('decisão por código de erro', () => {
  it('conflito de revisão com mensagem humanizada entra no ramo correto', async () => {

    const api = await renderProtocols([
      {
        method: 'PATCH',
        path: '/treatment-protocols/automation',
        handler: errorResponse(
          409,
          'STALE_ORGANIZATION_REVISION',
          'Esta configuração foi alterada por outra pessoa. Recarregue e tente de novo.',
        ),
      },
    ])
    const user = userEvent.setup()

    const toggle = await screen.findByRole('switch', {
      name: /recomendação automática/i,
    })
    await user.click(toggle)


    expect(
      await screen.findByRole('button', { name: /revisei os valores atuais/i }),
    ).toBeInTheDocument()
    await waitFor(() => {
      expect(
        api.requestsFor('GET', '/treatment-protocols/automation').length,
      ).toBeGreaterThanOrEqual(2)
    })
    expect(
      screen.getByRole('switch', { name: /recomendação automática/i }),
    ).toBeDisabled()


    expect(useToastStore.getState().toasts).toHaveLength(1)
    expect(useToastStore.getState().toasts[0].title).toBe(
      'Configuração desatualizada',
    )



    await user.click(screen.getByRole('button', { name: /revisei os valores atuais/i }))
    expect(
      screen.getByRole('switch', { name: /recomendação automática/i }),
    ).toBeEnabled()
  })

  it('falha inesperada da automação não fica silenciosa', async () => {
    await renderProtocols([
      {
        method: 'PATCH',
        path: '/treatment-protocols/automation',
        handler: errorResponse(500, 'UNEXPECTED_ERROR', 'Falha no servidor.'),
      },
    ])
    const user = userEvent.setup()

    await user.click(
      await screen.findByRole('switch', { name: /recomendação automática/i }),
    )

    expect(await screen.findByText('Falha no servidor')).toBeInTheDocument()
    expect(useToastStore.getState().toasts).toHaveLength(1)
  })

  it.each([
    ['403', errorResponse(403, 'FORBIDDEN', 'Sem permissão para publicar.')],
    [
      '409 com regra de negócio',
      errorResponse(
        409,
        'PUBLISHED_DEFAULT_REQUIRED',
        'PUBLISHED_DEFAULT_REQUIRED',
      ),
    ],
    [
      '429',
      errorResponse(429, 'RATE_LIMITED', 'Muitas tentativas.', {}),
    ],
    ['500', errorResponse(500, 'UNEXPECTED_ERROR', 'Falha interna.')],
  ])('recusa de publicação (%s) exibe feedback e preserva a intenção', async (_label, response) => {
    await renderProtocols([
      {
        method: 'POST',
        path: '/treatment-protocols/versions/version-2/publish',
        handler: response,
      },
    ])
    const user = userEvent.setup()

    await screen.findByText('SCIT ácaros')
    await user.click(screen.getByRole('button', { name: 'Publicar' }))
    await user.click(await screen.findByRole('button', { name: 'Confirmar' }))


    const dialog = await screen.findByRole('dialog')
    expect(await within(dialog).findByRole('alert')).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: 'Confirmar' })).toBeInTheDocument()
  })

  it('rede indisponível na publicação mantém a confirmação aberta', async () => {
    await renderProtocols([
      {
        method: 'POST',
        path: '/treatment-protocols/versions/version-2/publish',
        handler: () => {
          throw new TypeError('Failed to fetch')
        },
      },
    ])
    const user = userEvent.setup()

    await screen.findByText('SCIT ácaros')
    await user.click(screen.getByRole('button', { name: 'Publicar' }))
    await user.click(await screen.findByRole('button', { name: 'Confirmar' }))

    const dialog = await screen.findByRole('dialog')
    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      /servidor|conexão|tente novamente/i,
    )
  })

  it('erro de leitura da automação não vira "carregando" permanente', async () => {
    await renderProtocols([
      {
        path: '/treatment-protocols/automation',
        handler: ({ call }: HandlerContext) =>
          call === 1
            ? errorResponse(500, 'UNEXPECTED_ERROR', 'Falha ao ler automação.')
            : jsonResponse(automationSettings()),
      },
    ])

    expect(await screen.findByText('Falha ao ler automação.')).toBeInTheDocument()
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: /tentar novamente/i }))
    expect(
      await screen.findByRole('switch', { name: /recomendação automática/i }),
    ).toBeInTheDocument()
  })
})

describe('apresentação dos avisos', () => {
  it('mensagem em formato de código recebe texto amigável e referência secundária', () => {
    showApiErrorToast(
      new ApiError({
        statusCode: 409,
        code: 'STALE_ORGANIZATION_REVISION',
        message: 'STALE_ORGANIZATION_REVISION',
        requestId: 'req-9',
      }),
    )
    render(<ToastViewport />)

    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent(
      'O registro mudou enquanto você trabalhava. Recarregue e confirme de novo.',
    )
    expect(alert).toHaveTextContent('Referência: STALE_ORGANIZATION_REVISION · req-9')
  })

  it('dois erros distintos e um sucesso convivem; fechar um não fecha os demais', async () => {
    showApiErrorToast(
      new ApiError({ statusCode: 403, code: 'FORBIDDEN', message: 'Sem permissão.' }),
    )
    showApiErrorToast(
      new ApiError({ statusCode: 500, code: 'UNEXPECTED_ERROR', message: 'Falha interna.' }),
    )
    toast.success({ icon: null, title: 'Protocolo publicado' })
    render(<ToastViewport />)

    expect(screen.getByText('Sem permissão.')).toBeInTheDocument()
    expect(screen.getByText('Falha interna.')).toBeInTheDocument()
    expect(screen.getByText('Protocolo publicado')).toBeInTheDocument()

    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: /fechar aviso: sem permissão/i }))

    expect(screen.queryByText('Sem permissão.')).not.toBeInTheDocument()
    expect(screen.getByText('Falha interna.')).toBeInTheDocument()
    expect(screen.getByText('Protocolo publicado')).toBeInTheDocument()
  })

  it('repetir a mesma falha agrupa com contador em vez de empilhar', () => {
    const error = new ApiError({
      statusCode: 429,
      code: 'RATE_LIMITED',
      message: 'Muitas tentativas.',
    })
    showApiErrorToast(error)
    showApiErrorToast(error)
    showApiErrorToast(error)
    render(<ToastViewport />)

    expect(useToastStore.getState().toasts).toHaveLength(1)
    expect(screen.getByText('3×')).toBeInTheDocument()
  })

  it('acima de três avisos a pilha informa quantos ficaram para trás', () => {
    for (const index of [1, 2, 3, 4, 5]) {
      toast.info({ icon: null, title: `Aviso ${index}` })
    }
    render(<ToastViewport />)

    expect(screen.queryByText('Aviso 1')).not.toBeInTheDocument()
    expect(screen.getByText('Aviso 5')).toBeInTheDocument()
    expect(screen.getByText('+2 avisos anteriores')).toBeInTheDocument()
  })
})
