import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { GoogleCalendarCallbackToast } from '@/features/settings/components/GoogleCalendarCallbackToast'
import { withSession } from '../helpers/session'

afterEach(() => {
  vi.unstubAllGlobals()
  window.history.replaceState(null, '', '/advanced-settings')
})

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('retorno do callback do Google Agenda', () => {
  it('mostra sucesso e limpa a URL quando status=connected', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(jsonResponse({ connected: false }))),
    )
    window.history.replaceState(null, '', '/advanced-settings?status=connected')

    render(withSession(<GoogleCalendarCallbackToast />))

    expect(
      await screen.findByText('Google Agenda conectado'),
    ).toBeInTheDocument()
    expect(window.location.search).toBe('')
  })

  it('mostra erro com mensagem específica do código', async () => {
    window.history.replaceState(
      null,
      '',
      '/advanced-settings?status=error&code=GOOGLE_OAUTH_SESSION_INVALID',
    )

    render(withSession(<GoogleCalendarCallbackToast />))

    expect(
      await screen.findByText('Falha ao conectar o Google Agenda'),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/sessão não corresponde à conta/i),
    ).toBeInTheDocument()
    expect(window.location.search).toBe('')
  })

  it('usa mensagem genérica para código desconhecido', async () => {
    window.history.replaceState(
      null,
      '',
      '/advanced-settings?status=error&code=ALGO_INESPERADO',
    )

    render(withSession(<GoogleCalendarCallbackToast />))

    expect(
      await screen.findByText('Falha ao conectar o Google Agenda'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Não foi possível concluir a conexão. Tente novamente.'),
    ).toBeInTheDocument()
  })

  it('não dispara toast sem parâmetros de retorno', () => {
    window.history.replaceState(null, '', '/advanced-settings')

    render(withSession(<GoogleCalendarCallbackToast />))

    expect(screen.queryByText('Google Agenda conectado')).toBeNull()
    expect(screen.queryByText('Falha ao conectar o Google Agenda')).toBeNull()
  })
})
