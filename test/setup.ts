import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(cleanup)
Object.defineProperty(window, 'scrollTo', { value: vi.fn(), writable: true })
// jsdom não implementa scrollIntoView; listas com navegação por teclado o chamam.
Object.defineProperty(Element.prototype, 'scrollIntoView', {
  value: vi.fn(),
  writable: true,
})

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
Object.defineProperty(globalThis, 'ResizeObserver', {
  value: ResizeObserverStub,
  writable: true,
})

// Model the browser lock queue for authentication concurrency tests.
let authLockQueue: Promise<unknown> = Promise.resolve()
Object.defineProperty(navigator, 'locks', {
  configurable: true,
  value: {
    request: (_name: string, action: () => Promise<unknown>) => {
      const next = authLockQueue.then(action, action)
      authLockQueue = next.catch(() => undefined)
      return next
    },
  },
})
