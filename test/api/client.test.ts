import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  apiRequest,
  getCsrfToken,
  setCsrfToken,
  setUnauthenticatedHandler,
} from '@/shared/api/client'
import { ApiError, API_ERROR_CODES } from '@/shared/api/contracts/errors'

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('cliente HTTP', () => {
  beforeEach(() => {
    setCsrfToken(null)
    setUnauthenticatedHandler(null)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('envia o cookie de sessão e não acrescenta CSRF em leitura', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }))
    vi.stubGlobal('fetch', fetchMock)
    setCsrfToken('token-de-sessao')

    await apiRequest('/account/me')

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(init.credentials).toBe('include')
    expect((init.headers as Record<string, string>)['X-CSRF-Token']).toBeUndefined()
  })

  it('acrescenta o token CSRF em comandos', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }))
    vi.stubGlobal('fetch', fetchMock)
    setCsrfToken('token-de-sessao')

    await apiRequest('/auth/logout', { method: 'POST' })

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect((init.headers as Record<string, string>)['X-CSRF-Token']).toBe(
      'token-de-sessao',
    )
  })

  it('normaliza o envelope de erro preservando código e campos', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse(
          {
            statusCode: 400,
            code: 'VALIDATION_ERROR',
            message: 'Requisição inválida.',
            fieldErrors: { email: ['E-mail inválido'] },
            requestId: '01JABCDEF',
          },
          400,
        ),
      ),
    )

    const failure = await apiRequest('/auth/sessions', {
      method: 'POST',
      body: {},
    }).catch((error: unknown) => error)

    expect(failure).toBeInstanceOf(ApiError)
    const error = failure as ApiError
    expect(error.code).toBe('VALIDATION_ERROR')
    expect(error.fieldErrors?.email).toEqual(['E-mail inválido'])
    expect(error.requestId).toBe('01JABCDEF')
  })

  it('chama o tratamento único de 401 uma vez por falha de sessão', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse(
          { statusCode: 401, code: 'SESSION_EXPIRED', message: 'Sessão expirada.' },
          401,
        ),
      ),
    )

    const handler = vi.fn()
    setUnauthenticatedHandler(handler)

    await apiRequest('/account/me').catch(() => undefined)

    expect(handler).toHaveBeenCalledTimes(1)
    expect((handler.mock.calls[0][0] as ApiError).code).toBe('SESSION_EXPIRED')
  })

  it('classifica falha de rede como resultado indeterminado', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')))

    const failure = (await apiRequest('/doses/1/administer', {
      method: 'POST',
      body: {},
    }).catch((error: unknown) => error)) as ApiError

    expect(failure.code).toBe(API_ERROR_CODES.network)
    expect(failure.isIndeterminate).toBe(true)
  })

  it('propaga cancelamento sem transformar em erro de API', async () => {
    const abortError = new DOMException('aborted', 'AbortError')
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abortError))

    const failure = await apiRequest('/account/me').catch(
      (error: unknown) => error,
    )

    expect(failure).toBe(abortError)
  })

  it('trata 204 sem corpo', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(null, { status: 204 })),
    )
    setCsrfToken('token')

    await expect(
      apiRequest<void>('/auth/logout', { method: 'POST' }),
    ).resolves.toBeUndefined()
    expect(getCsrfToken()).toBe('token')
  })
})
