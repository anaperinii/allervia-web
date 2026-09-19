import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(cleanup)
// jsdom does not implement scrolling; routing still uses real memory history.
Object.defineProperty(window, 'scrollTo', { value: vi.fn(), writable: true })
