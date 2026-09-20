import {
  ApiError,
  API_ERROR_CODES,
  type ApiErrorEnvelope,
} from '@/shared/api/contracts/errors'

/**
 * Caminho público da API. Em desenvolvimento o Vite encaminha `/backend` ao
 * NestJS; em produção UI e API ficam na mesma origem pelo gateway. Nunca
 * contém segredo.
 */
const API_BASE_URL = (
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '/backend'
).replace(/\/+$/, '')

const CSRF_HEADER = 'X-CSRF-Token'

/**
 * Token sincronizador da sessão. Fica apenas em memória: gravá-lo em
 * `localStorage` o exporia a qualquer script da origem e não traria benefício,
 * já que a credencial de sessão viaja no cookie `HttpOnly`.
 */
let csrfToken: string | null = null

export function setCsrfToken(token: string | null): void {
  csrfToken = token
}

export function getCsrfToken(): string | null {
  return csrfToken
}

type UnauthenticatedHandler = (error: ApiError) => void

let onUnauthenticated: UnauthenticatedHandler | null = null

/**
 * Tratamento único de 401. A aplicação registra uma vez o que fazer quando a
 * sessão cai — limpar cache e voltar para o login — em vez de espalhar essa
 * decisão por cada chamada.
 */
export function setUnauthenticatedHandler(
  handler: UnauthenticatedHandler | null,
): void {
  onUnauthenticated = handler
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  body?: unknown
  signal?: AbortSignal
  /** Cabeçalhos extras; nunca usar para credencial. */
  headers?: Record<string, string>
}

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

function buildUrl(path: string): string {
  return path.startsWith('http') ? path : `${API_BASE_URL}${path}`
}

async function parseEnvelope(response: Response): Promise<ApiErrorEnvelope> {
  try {
    const body = (await response.json()) as Partial<ApiErrorEnvelope>
    return {
      statusCode: body.statusCode ?? response.status,
      code: body.code ?? 'UNEXPECTED_ERROR',
      message: body.message ?? 'Não foi possível concluir a operação.',
      fieldErrors: body.fieldErrors,
      requestId: body.requestId,
    }
  } catch {
    return {
      statusCode: response.status,
      code: 'UNEXPECTED_ERROR',
      message: 'Resposta inesperada do servidor.',
    }
  }
}

/**
 * Chamada autenticada por cookie de sessão. O corpo é sempre JSON, o token CSRF
 * acompanha todo comando e a resposta de erro chega normalizada como `ApiError`.
 */
export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const method = options.method ?? 'GET'
  const headers: Record<string, string> = { ...options.headers }

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  if (!SAFE_METHODS.has(method) && csrfToken) {
    headers[CSRF_HEADER] = csrfToken
  }

  let response: Response
  try {
    response = await fetch(buildUrl(path), {
      method,
      headers,
      // O cookie de sessão só acompanha a requisição com `include`.
      credentials: 'include',
      signal: options.signal,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    })
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === 'AbortError') {
      throw cause
    }

    // Falha de rede não prova que o servidor deixou de gravar: quem chama
    // decide entre reconsultar o estado e repetir o mesmo comando.
    throw new ApiError({
      statusCode: 0,
      code: API_ERROR_CODES.network,
      message: 'Não foi possível falar com o servidor.',
    })
  }

  if (response.status === 204) {
    return undefined as T
  }

  if (!response.ok) {
    const error = new ApiError(await parseEnvelope(response))
    if (error.isUnauthenticated) onUnauthenticated?.(error)
    throw error
  }

  const text = await response.text()
  return (text ? JSON.parse(text) : undefined) as T
}
