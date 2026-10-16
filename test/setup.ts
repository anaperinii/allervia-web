import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import { clearSession, setUnauthenticatedHandler } from '@/shared/api/client'
import { useImmunotherapiesStore } from '@/features/immunotherapy/stores/useImmunotherapiesStore'
import { useCompletionDraftsStore } from '@/features/patient/stores/useCompletionDraftsStore'
import { usePatientStore } from '@/features/patient/stores/usePatientStore'
import { useSettingsStore } from '@/features/settings/stores/useSettingsStore'
import { useToastStore } from '@/shared/components/toasts/useToastStore'
import { useSidebarStore } from '@/shared/layout/useSidebarStore'
import { useAuditStore } from '@/shared/stores/useAuditStore'
import { useUserStore } from '@/shared/stores/useUserStore'
import { assertDiagnostics, installDiagnostics } from './helpers/diagnostics'
import { assertNoUnexpectedRequests } from './helpers/http'

Object.defineProperty(window, 'scrollTo', { value: vi.fn(), writable: true })

Object.defineProperty(Element.prototype, 'scrollIntoView', {
  value: vi.fn(),
  writable: true,
})

Object.defineProperty(Element.prototype, 'scrollTo', {
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






interface ResettableStore {
  getState: () => unknown
  setState: (state: never, replace: true) => void
}

const stores = (
  [
    useImmunotherapiesStore,
    useCompletionDraftsStore,
    usePatientStore,
    useSettingsStore,
    useToastStore,
    useSidebarStore,
    useAuditStore,
    useUserStore,
  ] as unknown as ResettableStore[]
).map((store) => ({ store, initial: store.getState() as never }))

beforeEach(() => {
  installDiagnostics()
})

afterEach(() => {


  cleanup()
  try {
    assertDiagnostics()
    assertNoUnexpectedRequests()
  } finally {
    for (const { store, initial } of stores) {
      store.setState(initial, true)
    }
    clearSession()
    setUnauthenticatedHandler(null)
    authLockQueue = Promise.resolve()
    vi.unstubAllGlobals()
    vi.useRealTimers()
  }
})
