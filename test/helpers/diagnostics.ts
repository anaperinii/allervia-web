import { expect, vi } from 'vitest'











export type DiagnosticKind =
  | 'react-error'
  | 'window-error'
  | 'unhandled-rejection'

export interface Diagnostic {
  kind: DiagnosticKind
  message: string
  detail: string | null
}

const captured: Diagnostic[] = []
let expectedCount: number | null = null
let expectedMatcher: RegExp | null = null
let listeners: (() => void) | null = null

function describeError(value: unknown): { message: string; detail: string | null } {
  if (value instanceof Error) {
    return { message: value.message, detail: value.stack ?? null }
  }
  return { message: String(value), detail: null }
}

function record(kind: DiagnosticKind, value: unknown, extra?: string): void {
  const { message, detail } = describeError(value)
  captured.push({ kind, message, detail: extra ? `${extra}\n${detail ?? ''}`.trim() : detail })
}








export function expectRenderErrors(
  matcher: RegExp,
  options: { times?: number } = {},
): void {
  expectedMatcher = matcher
  expectedCount = options.times ?? null
}

export function capturedDiagnostics(): readonly Diagnostic[] {
  return captured
}

export function installDiagnostics(): void {
  listeners?.()
  captured.length = 0
  expectedCount = null
  expectedMatcher = null

  const onWindowError = (event: ErrorEvent) => {
    record('window-error', event.error ?? event.message)
  }
  const onRejection = (event: PromiseRejectionEvent) => {
    record('unhandled-rejection', event.reason)
  }
  window.addEventListener('error', onWindowError)
  window.addEventListener('unhandledrejection', onRejection)
  listeners = () => {
    window.removeEventListener('error', onWindowError)
    window.removeEventListener('unhandledrejection', onRejection)
  }




  vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
    const failure = args.find((argument) => argument instanceof Error)
    if (failure) {
      const stack = args.find(
        (argument) => typeof argument === 'string' && argument.includes('\n    at '),
      )
      record('react-error', failure, typeof stack === 'string' ? stack : undefined)
      return
    }
    const [first] = args
    if (typeof first === 'string' && /error boundary|uncaught error/i.test(first)) {
      record('react-error', first)
    }
  })
}





export function assertDiagnostics(): void {
  listeners?.()
  listeners = null
  const describeAll = () =>
    captured.map((item) => `${item.kind}: ${item.message}`).join('\n')
  const unexpected = captured.filter(
    (diagnostic) => !expectedMatcher || !expectedMatcher.test(diagnostic.message),
  )
  const declared = captured.length - unexpected.length
  const matcher = expectedMatcher
  const times = expectedCount

  try {
    expect(
      unexpected.map((item) => `${item.kind}: ${item.message}`),
      matcher
        ? `Erro de render não declarado (esperado apenas ${matcher}):\n${describeAll()}`
        : `Erro de render capturado sem declaração:\n${describeAll()}`,
    ).toEqual([])
    if (matcher) {
      expect(
        declared,
        `Nenhum erro correspondente a ${matcher} foi capturado; a expectativa do teste não se concretizou.`,
      ).toBeGreaterThan(0)
      if (times !== null) {
        expect(
          declared,
          `Erros correspondentes a ${matcher}: ${declared}, esperado ${times}.`,
        ).toBe(times)
      }
    }
  } finally {
    captured.length = 0
    expectedCount = null
    expectedMatcher = null
  }
}
