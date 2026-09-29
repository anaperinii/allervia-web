import {
  ApiError,
  API_ERROR_CODES,
  type ApiErrorEnvelope,
} from '@/shared/api/contracts/errors'

const API_BASE_URL = (
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '/backend'
).replace(/\/+$/, '')
let csrfToken: string | null = null
let sessionContext: string | null = null
let generation = 0
let channel: BroadcastChannel | null = null
type UnauthenticatedHandler = (error: ApiError) => void
let onUnauthenticated: UnauthenticatedHandler | null = null

export function setCsrfToken(token: string | null): void {
  csrfToken = token
}
export function getCsrfToken(): string | null {
  return csrfToken
}
export function acceptSession(id: string, csrf: string): void {
  sessionContext = id
  csrfToken = csrf
}
export function getSessionContext(): string | null { return sessionContext }
export function clearSession(broadcast = false): void {
  generation++
  sessionContext = null
  csrfToken = null
  if (broadcast) channel?.postMessage({ type: 'logout' })
}
export function setUnauthenticatedHandler(
  handler: UnauthenticatedHandler | null,
): void {
  onUnauthenticated = handler
  channel?.close()
  channel = null
  if (handler && typeof BroadcastChannel !== 'undefined') {
    channel = new BroadcastChannel('allervia-auth-events')
    channel.onmessage = (event: MessageEvent<unknown>) => {
      if (
        typeof event.data === 'object' &&
        event.data !== null &&
        'type' in event.data &&
        event.data.type === 'logout'
      ) {
        clearSession()
        handler(
          new ApiError({
            statusCode: 401,
            code: 'SESSION_REVOKED',
            message: 'Acesso encerrado em outra aba.',
          }),
        )
      }
    }
  }
}

export interface RequestOptions {
  anonymous?: boolean
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  body?: unknown
  signal?: AbortSignal
  headers?: Record<string, string>
}

function buildUrl(path: string): string {
  if (!path.startsWith('/') || path.startsWith('//'))
    throw new Error('API paths must be relative to the configured backend')
  const base = new URL(API_BASE_URL + '/', window.location.origin)
  const target = new URL(API_BASE_URL + path, window.location.origin)
  if (
    target.origin !== base.origin ||
    !target.pathname.startsWith(base.pathname)
  )
    throw new Error('Untrusted API destination')
  return API_BASE_URL + path
}

async function parseEnvelope(response: Response): Promise<ApiErrorEnvelope> {
  try {
    const body = (await response.json()) as Partial<ApiErrorEnvelope>
    return {
      statusCode: response.status,
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

async function send(path: string, options: RequestOptions): Promise<Response> {
  const headers = { ...options.headers }
  const mutating = options.method && options.method !== 'GET'
  if (options.body !== undefined || mutating) headers['Content-Type'] = 'application/json'
  if (!options.anonymous) {
    if (sessionContext) headers['X-Session-Context'] = sessionContext
    if (csrfToken && options.method && options.method !== 'GET')
      headers['X-CSRF-Token'] = csrfToken
  }
  try {
    return await fetch(buildUrl(path), {
      method: options.method ?? 'GET',
      headers,
      credentials: options.anonymous ? 'omit' : 'include',
      signal: options.signal,
      body:
        options.body === undefined ? (mutating ? '{}' : undefined) : JSON.stringify(options.body),
    })
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === 'AbortError')
      throw cause
    throw new ApiError({
      statusCode: 0,
      code: API_ERROR_CODES.network,
      message: 'Não foi possível falar com o servidor.',
    })
  }
}

/** Only identity-changing operations need coordination; reads never wait for renewal. */
let identityOperation: Promise<unknown> = Promise.resolve()
export function withAuthLock<T>(action: () => Promise<T>): Promise<T> {
  if (navigator.locks) return navigator.locks.request('allervia-auth-identity', action)
  const next = identityOperation.then(action, action)
  identityOperation = next.catch(() => undefined)
  return next
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const started = generation
  const response = await send(path, options)
  if (started !== generation)
    throw new DOMException('Authentication changed', 'AbortError')
  if (!response.ok) {
    const error = new ApiError(await parseEnvelope(response))
    if (error.isUnauthenticated && !options.anonymous) {
      clearSession()
      onUnauthenticated?.(error)
    }
    throw error
  }
  if (response.status === 204) return undefined as T
  const text = await response.text()
  return (text ? JSON.parse(text) : undefined) as T
}
