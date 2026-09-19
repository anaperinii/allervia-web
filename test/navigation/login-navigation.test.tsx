import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryHistory, createRootRoute, createRoute, createRouter, RouterProvider } from '@tanstack/react-router'
import { expect, it } from 'vitest'
import { LoginPage } from '@/features/auth/login-page'
import { LandingThemeProvider } from '@/features/landing-page/theme-context'

it('uses a real memory router for the password recovery link', async () => {
  const root = createRootRoute()
  const login = createRoute({ getParentRoute: () => root, path: '/login', component: LoginPage })
  const recovery = createRoute({ getParentRoute: () => root, path: '/forgot-password', component: () => <h1>Recovery destination</h1> })
  const router = createRouter({ routeTree: root.addChildren([login, recovery]), history: createMemoryHistory({ initialEntries: ['/login'] }) })
  await router.load()
  render(<LandingThemeProvider><RouterProvider router={router} /></LandingThemeProvider>)
  const link = await screen.findByRole('link', { name: /esqueceu/i })
  await userEvent.setup().click(link)
  expect(await screen.findByRole('heading', { name: 'Recovery destination' })).toBeInTheDocument()
  expect(router.state.location.pathname).toBe('/forgot-password')
})
