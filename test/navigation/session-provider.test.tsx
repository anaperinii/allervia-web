import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SessionProvider } from '@/shared/auth/SessionProvider'
import { useSession } from '@/shared/auth/useSession'
import {
  acceptSession,
  clearSession,
  setUnauthenticatedHandler,
} from '@/shared/api/client'

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status })
const envelope = {
  authenticated: true,
  csrfToken: 'csrf',
  session: { id: 'family', mfaVerified: true },
}

function Probe() {
  const { status, account, signOut } = useSession()
  return (
    <>
      <p data-testid="status">{status}</p>
      <p>{account?.user.email}</p>
      <button onClick={() => void signOut().catch(() => undefined)}>
        Sair
      </button>
    </>
  )
}

describe('Opaque session provider', () => {
  beforeEach(() => acceptSession('', ''))
  afterEach(() => {
    clearSession()
    setUnauthenticatedHandler(null)
    vi.unstubAllGlobals()
  })

  function setup(offlineLogout = false) {
    const fetchMock = vi.fn(async (url: string) => {
      if (url.includes('/auth/csrf')) return json({ csrfToken: 'csrf' })
      if (url.endsWith('/auth/session')) return json(envelope)
      if (url.endsWith('/account/me'))
        return json({ user: { email: 'professional@example.test' } })
      if (url.endsWith('/auth/logout')) {
        if (offlineLogout) throw new TypeError('offline')
        return new Response(null, { status: 204 })
      }
      throw new Error('Unexpected request')
    })
    vi.stubGlobal('fetch', fetchMock)
    const client = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    render(
      <QueryClientProvider client={client}>
        <SessionProvider>
          <Probe />
        </SessionProvider>
      </QueryClientProvider>,
    )
    return { fetchMock, client }
  }

  it('restores identity on reload through cookie and loads the account', async () => {
    const { fetchMock } = setup()
    await waitFor(() =>
      expect(screen.getByTestId('status')).toHaveTextContent('authenticated'),
    )
    expect(screen.getByText('professional@example.test')).toBeInTheDocument()
    expect(
      fetchMock.mock.calls.filter(([url]) => url.endsWith('/auth/refresh')),
    ).toHaveLength(0)
    expect(
      fetchMock.mock.calls.filter(([url]) => url.endsWith('/auth/session')),
    ).toHaveLength(1)
  })

  it('clears identity and cached clinical data even when remote logout fails', async () => {
    const { client } = setup(true)
    await waitFor(() =>
      expect(screen.getByTestId('status')).toHaveTextContent('authenticated'),
    )
    client.setQueryData(['clinical-data'], { private: true })
    await userEvent.click(screen.getByRole('button', { name: 'Sair' }))
    await waitFor(() =>
      expect(screen.getByTestId('status')).toHaveTextContent('anonymous'),
    )
    expect(client.getQueryData(['clinical-data'])).toBeUndefined()
    expect(
      screen.queryByText('professional@example.test'),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('não foi confirmada')
  })
})
