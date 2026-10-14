import { expect, vi } from 'vitest'











export interface RecordedRequest {
  method: string
  pathname: string
  search: string
  url: string
  body: unknown
  headers: Record<string, string>
}

export interface HandlerContext extends RecordedRequest {
  call: number
}

export type Handler = (context: HandlerContext) => Response | Promise<Response>

export interface RouteDefinition {
  method?: string

  path: string | RegExp
  handler: Handler | Response | unknown

  times?: number
}

const unexpected: string[] = []

export function recordUnexpectedRequest(description: string): void {
  unexpected.push(description)
}

export function assertNoUnexpectedRequests(): void {
  try {
    expect(
      unexpected,
      `Request sem stub declarado:\n${unexpected.join('\n')}`,
    ).toEqual([])
  } finally {
    unexpected.length = 0
  }
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export function errorResponse(
  status: number,
  code: string,
  message = 'Falha simulada.',
  extra: Record<string, unknown> = {},
): Response {
  return jsonResponse({ statusCode: status, code, message, ...extra }, status)
}

export function emptyResponse(status = 204): Response {
  return new Response(null, { status })
}

function toPathname(input: RequestInfo | URL): { pathname: string; search: string; url: string } {
  const raw = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
  const url = new URL(raw, 'http://localhost')
  const pathname = url.pathname.replace(/^\/backend/, '')
  return { pathname, search: url.search, url: raw }
}

function parseBody(init: RequestInit | undefined): unknown {
  if (!init || typeof init.body !== 'string') return undefined
  try {
    return JSON.parse(init.body)
  } catch {
    return init.body
  }
}

function matches(route: RouteDefinition, method: string, pathname: string): boolean {
  if ((route.method ?? 'GET').toUpperCase() !== method) return false
  return typeof route.path === 'string'
    ? route.path === pathname
    : route.path.test(pathname)
}

export interface ApiStub {
  fetchMock: ReturnType<typeof vi.fn>

  requests: RecordedRequest[]

  requestsFor(method: string, path: string | RegExp): RecordedRequest[]

  override(route: RouteDefinition): void
}





export function stubApi(routes: RouteDefinition[]): ApiStub {
  const definitions = [...routes]
  const counters = new Map<RouteDefinition, number>()
  const requests: RecordedRequest[] = []

  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const method = (init?.method ?? 'GET').toUpperCase()
    const { pathname, search, url } = toPathname(input)
    const headers = Object.fromEntries(
      Object.entries((init?.headers as Record<string, string>) ?? {}),
    )
    const request: RecordedRequest = {
      method,
      pathname,
      search,
      url,
      body: parseBody(init),
      headers,
    }
    requests.push(request)

    const route = definitions.find((candidate) => {
      if (!matches(candidate, method, pathname)) return false
      if (candidate.times === undefined) return true
      return (counters.get(candidate) ?? 0) < candidate.times
    })

    if (!route) {
      const description = `${method} ${pathname}${search}`
      recordUnexpectedRequest(description)
      throw new Error(`Request sem stub declarado: ${description}`)
    }

    counters.set(route, (counters.get(route) ?? 0) + 1)
    const context: HandlerContext = { ...request, call: counters.get(route) ?? 1 }
    const { handler } = route
    if (typeof handler === 'function') {
      return (handler as Handler)(context)
    }
    if (handler instanceof Response) return handler.clone()
    return jsonResponse(handler)
  })

  vi.stubGlobal('fetch', fetchMock)

  return {
    fetchMock,
    requests,
    requestsFor: (method, path) =>
      requests.filter((request) =>
        matches({ method, path, handler: null }, request.method, request.pathname),
      ),
    override: (route) => {
      definitions.unshift(route)
    },
  }
}
