import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { GoogleCalendarRow } from '@/features/settings/components/GoogleCalendarRow'
import { withSession, buildAccountContext } from '../helpers/session'

afterEach(() => vi.unstubAllGlobals())

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

const CONNECTED = {
  connected: true,
  googleAccountEmail: 'dra.karina@gmail.com',
  status: 'ACTIVE',
  brokenReason: null,
  channelExpiresAt: '2026-10-08T12:00:00.000Z',
  lastIncrementalSyncAt: '2026-10-01T15:30:00.000Z',
  pendingJobs: 0,
  deadLetteredJobs: 0,
}

function stub(connection: unknown) {
  const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    const method = init?.method ?? 'GET'
    if (url.includes('/integrations/google-calendar/connect') && method === 'POST') {
      return Promise.resolve(
        jsonResponse({ authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth?x=1' }),
      )
    }
    if (url.includes('/integrations/google-calendar/connection') && method === 'DELETE') {
      return Promise.resolve(jsonResponse({ disconnected: true }))
    }
    if (url.includes('/integrations/google-calendar/connection')) {
      return Promise.resolve(jsonResponse(connection))
    }
    return Promise.resolve(jsonResponse({}))
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('conexão com o Google Agenda', () => {
  it('oferece conectar quando não há conexão e redireciona para o consentimento', async () => {
    const fetchMock = stub({ connected: false })
    const assign = vi.fn()
    vi.stubGlobal('location', { ...window.location, assign })
    const user = userEvent.setup()

    render(withSession(<GoogleCalendarRow />))

    const button = await screen.findByRole('button', { name: 'Conectar' })
    await user.click(button)

    await waitFor(() => {
      expect(assign).toHaveBeenCalledWith(
        'https://accounts.google.com/o/oauth2/v2/auth?x=1',
      )
    })
    const post = fetchMock.mock.calls.find(
      ([url, init]) =>
        String(url).endsWith('/integrations/google-calendar/connect') &&
        (init as RequestInit | undefined)?.method === 'POST',
    )
    expect(post).toBeDefined()
  })

  it('mostra a conta conectada e permite desconectar', async () => {
    const fetchMock = stub(CONNECTED)
    const user = userEvent.setup()

    render(withSession(<GoogleCalendarRow />))

    expect(await screen.findByText('Conectado')).toBeInTheDocument()
    expect(
      screen.getByText(/Conectado como dra\.karina@gmail\.com/),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Desconectar' }))

    await waitFor(() => {
      const del = fetchMock.mock.calls.find(
        ([url, init]) =>
          String(url).includes('/integrations/google-calendar/connection') &&
          (init as RequestInit | undefined)?.method === 'DELETE',
      )
      expect(del).toBeDefined()
      expect(String(del![0])).toContain('removeEvents=false')
    })
  })

  it('pede reconexão quando a conexão foi revogada no Google', async () => {
    stub({ ...CONNECTED, status: 'BROKEN', brokenReason: 'invalid_grant' })

    render(withSession(<GoogleCalendarRow />))

    expect(await screen.findByText('Reconexão necessária')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Reconectar' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/Conexão revogada no Google/)).toBeInTheDocument()
  })

  it('avisa sobre sincronizações em dead-letter', async () => {
    stub({ ...CONNECTED, deadLetteredJobs: 3 })

    render(withSession(<GoogleCalendarRow />))

    expect(
      await screen.findByText(/3 sincronização\(ões\) falharam/),
    ).toBeInTheDocument()
  })

  it('esconde a ação de quem não gerencia a própria conexão', async () => {
    const fetchMock = stub({ connected: false })
    const account = buildAccountContext()

    render(
      withSession(<GoogleCalendarRow />, {
        account: {
          ...account,
          capabilities: account.capabilities.filter(
            (capability) => !capability.startsWith('calendarConnections'),
          ),
        },
      }),
    )

    expect(await screen.findByText('Sem permissão')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Conectar' })).toBeNull()
    expect(
      fetchMock.mock.calls.some(([url]) =>
        String(url).includes('/integrations/google-calendar/connection'),
      ),
    ).toBe(false)
  })
})
