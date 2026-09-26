import {
  ApiError,
  API_ERROR_CODES,
  type ApiErrorEnvelope,
} from '@/shared/api/contracts/errors'

const API_BASE_URL = (
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '/backend'
).replace(/\/+$/, '')

const CSRF_HEADER = 'X-CSRF-Token'

let csrfToken: string | null = null

export function setCsrfToken(token: string | null): void {
  csrfToken = token
}

export function getCsrfToken(): string | null {
  return csrfToken
}

type UnauthenticatedHandler = (error: ApiError) => void

let onUnauthenticated: UnauthenticatedHandler | null = null

export function setUnauthenticatedHandler(
  handler: UnauthenticatedHandler | null,
): void {
  onUnauthenticated = handler
}

export interface RequestOptions {
  anonymous?: boolean
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  body?: unknown
  signal?: AbortSignal
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

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const method = options.method ?? 'GET'
  const headers: Record<string, string> = { ...options.headers }

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  if (!options.anonymous && !SAFE_METHODS.has(method) && csrfToken) {
    headers[CSRF_HEADER] = csrfToken
  }

  let response: Response
  try {
    response = await fetch(buildUrl(path), {
      method,
      headers,
      credentials: options.anonymous ? 'omit' : 'include',
      signal: options.signal,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    })
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === 'AbortError') {
      throw cause
    }

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
    if (error.isUnauthenticated && !options.anonymous) onUnauthenticated?.(error)
    throw error
  }

  const text = await response.text()
  return (text ? JSON.parse(text) : undefined) as T
}
