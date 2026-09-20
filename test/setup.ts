import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(cleanup)
// jsdom does not implement scrolling; routing still uses real memory history.
Object.defineProperty(window, 'scrollTo', { value: vi.fn(), writable: true })

// jsdom lacks ResizeObserver, used by layout-aware chart components.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
Object.defineProperty(globalThis, 'ResizeObserver', {
  value: ResizeObserverStub,
  writable: true,
})
