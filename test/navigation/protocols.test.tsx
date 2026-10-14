import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { describe, expect, it } from 'vitest'
import { ProtocolsPage } from '@/features/protocols/protocols-page'
import {
  ProtocolEditorPage,
  type ProtocolEditorMode,
} from '@/features/protocols/protocol-editor-page'
import { validateDraft } from '@/features/protocols/protocol-draft'
import type { ProtocolDefinitionDraft } from '@/shared/api/contracts/protocols'
import { automationSettings } from '../fixtures/settings'
import {
  protocolDefinition,
  protocolVersion,
  treatmentProtocol,
} from '../fixtures/protocols'
import { errorResponse, stubApi, type RouteDefinition } from '../helpers/http'
import { buildAccountContext, withSession } from '../helpers/session'

const DRAFT_DEFINITION = protocolDefinition()
const CATALOG = [treatmentProtocol()]
const DRAFT_VERSION = CATALOG[0].versions[0]

function stubProtocolApi(options: { conflictOnEdit?: boolean } = {}) {
  const editRoute: RouteDefinition = options.conflictOnEdit
    ? {
        method: 'PATCH',
        path: '/treatment-protocols/versions/version-2',
        handler: errorResponse(
          409,
          'STALE_PROTOCOL_REVISION',
          'STALE_PROTOCOL_REVISION',
        ),
      }
    : {
        method: 'PATCH',
        path: '/treatment-protocols/versions/version-2',
        handler: DRAFT_VERSION,
      }

  return stubApi([
    editRoute,
    { path: '/treatment-protocols', handler: CATALOG },
    { path: '/treatment-protocols/automation', handler: automationSettings() },
    {
      path: '/treatment-protocols/versions/version-2',
      handler: protocolVersion({ revision: 4 }),
    },
    {
      method: 'POST',
      path: '/treatment-protocols/versions/version-2/publish',
      handler: protocolVersion({ status: 'PUBLISHED' }),
    },
  ])
}

const PHYSICIAN = buildAccountContext()
const NURSE = buildAccountContext({
  roles: ['NURSE'],
  capabilities: ['protocols:read', 'immunotherapies:read', 'doses:read'],
})

async function renderProtocols(account = PHYSICIAN) {
  const root = createRootRoute()
  const protocols = createRoute({
    getParentRoute: () => root,
    path: '/protocols',
    component: ProtocolsPage,
  })
  const settings = createRoute({
    getParentRoute: () => root,
    path: '/settings',
    component: () => <h1>Configurações</h1>,
  })
  type EditorSearch = {
    mode: ProtocolEditorMode
    protocolId?: string
    versionId?: string
  }
  const editor = createRoute({
    getParentRoute: () => root,
    path: '/protocol-editor',
    validateSearch: (search: Record<string, unknown>): EditorSearch => ({
      mode: (search.mode as ProtocolEditorMode) ?? 'create',
      protocolId:
        typeof search.protocolId === 'string' ? search.protocolId : undefined,
      versionId:
        typeof search.versionId === 'string' ? search.versionId : undefined,
    }),
    component: function EditorRoute() {
      const search = editor.useSearch()
      return (
        <ProtocolEditorPage
          mode={search.mode}
          protocolId={search.protocolId}
          versionId={search.versionId}
        />
      )
    },
  })
  const router = createRouter({
    routeTree: root.addChildren([protocols, settings, editor]),
    history: createMemoryHistory({ initialEntries: ['/protocols'] }),
  })

  await router.load()
  render(withSession(<RouterProvider router={router} />, { account }))
}

describe('catálogo de protocolos', () => {
  it('mostra versões, situação e a padrão para novas prescrições', async () => {
    stubProtocolApi()
    await renderProtocols()

    expect(await screen.findByText('SCIT ácaros')).toBeInTheDocument()
    expect(screen.getByText('Rascunho')).toBeInTheDocument()
    expect(screen.getByText('Publicada')).toBeInTheDocument()
    expect(
      screen.getByText('Padrão para novas prescrições'),
    ).toBeInTheDocument()
  })

  it('enfermagem consulta sem ações de edição', async () => {
    stubProtocolApi()
    await renderProtocols(NURSE)

    expect(await screen.findByText('SCIT ácaros')).toBeInTheDocument()
    expect(screen.getByText(/capacidade clínica concedida a médicos/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /novo protocolo/i })).toBeNull()
    expect(screen.queryByRole('button', { name: /publicar/i })).toBeNull()
    expect(screen.queryByRole('button', { name: /editar rascunho/i })).toBeNull()
  })

  it('publica com confirmação explicando o efeito', async () => {
    const api = stubProtocolApi()
    const user = userEvent.setup()
    await renderProtocols()

    await screen.findByText('SCIT ácaros')
    await user.click(screen.getByRole('button', { name: 'Publicar' }))

    expect(
      await screen.findByText(/congela a definição/i),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Confirmar' }))

    await waitFor(() => {
      const [publish] = api.requestsFor(
        'POST',
        '/treatment-protocols/versions/version-2/publish',
      )
      expect(publish?.body).toEqual({ expectedRevision: 3 })
    })
  })

  it('preserva o rascunho local no conflito de revisão', async () => {
    stubProtocolApi({ conflictOnEdit: true })
    const user = userEvent.setup()
    await renderProtocols()

    await screen.findByText('SCIT ácaros')
    await user.click(screen.getByRole('button', { name: /editar rascunho/i }))

    const labelInput = await screen.findByDisplayValue('Início')
    await user.clear(labelInput)
    await user.type(labelInput, 'Início editado')

    await user.click(screen.getByRole('button', { name: /salvar rascunho/i }))

    expect(
      await screen.findByText(/outra pessoa salvou este rascunho/i),
    ).toBeInTheDocument()
    expect(screen.getByDisplayValue('Início editado')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /salvar rascunho/i })).toBeDisabled()

    await user.click(
      screen.getByRole('button', { name: /manter o meu e sobrescrever/i }),
    )
    expect(screen.getByRole('button', { name: /salvar rascunho/i })).toBeEnabled()
    expect(screen.getByDisplayValue('Início editado')).toBeInTheDocument()
  })
})

describe('validação local do rascunho', () => {
  const base = DRAFT_DEFINITION as ProtocolDefinitionDraft

  it('aceita a definição do fixture', () => {
    expect(validateDraft(base)).toEqual([])
  })

  it('aponta ids repetidos, valores inválidos e sucessor inexistente', () => {
    const broken: ProtocolDefinitionDraft = {
      ...base,
      steps: [
        { ...base.steps[0], id: 'a', volume: '0,1' },
        { ...base.steps[0], id: 'a', concentration: 'x', nextStepId: 'zzz' },
      ],
    }

    const problems = validateDraft(broken)
    expect(problems.some((p) => p.includes('repetido'))).toBe(true)
    expect(problems.some((p) => p.includes('volume'))).toBe(true)
    expect(problems.some((p) => p.includes('concentração'))).toBe(true)
    expect(problems.some((p) => p.includes('não existe'))).toBe(true)
  })
})
