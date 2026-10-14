import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryHistory, createRootRoute, createRoute, createRouter, RouterProvider } from '@tanstack/react-router'
import { expect, it } from 'vitest'
import { SecurityPage } from '@/features/settings/security-page'
import { stubApi, errorResponse } from '../helpers/http'
import { withSession } from '../helpers/session'

it('does not present failed factor and device reads as zero and reloads the confirmed counts explicitly', async () => {
  const requests = stubApi([
    { path: '/auth/mfa/factors', handler: errorResponse(500, 'INTERNAL_ERROR') },
    { path: '/auth/sessions', handler: errorResponse(500, 'INTERNAL_ERROR') },
  ])
  const root = createRootRoute()
  const route = createRoute({ getParentRoute: () => root, path: '/security', component: SecurityPage })
  const router = createRouter({ routeTree: root.addChildren([route]), history: createMemoryHistory({ initialEntries: ['/security'] }) })
  await router.load()
  render(withSession(<RouterProvider router={router} />))
  expect(await screen.findByRole('button', { name: 'Recarregar fatores' })).toBeInTheDocument()
  expect(await screen.findByRole('button', { name: 'Recarregar sessões' })).toBeInTheDocument()
  expect(screen.queryByText('0 dispositivos')).not.toBeInTheDocument()
  const user = userEvent.setup()
  requests.override({ path: '/auth/mfa/factors', handler: { factors: [], recoveryCodesRemaining: 4 } })
  requests.override({ path: '/auth/sessions', handler: [] })
  await user.click(screen.getByRole('button', { name: 'Recarregar fatores' }))
  await user.click(screen.getByRole('button', { name: 'Recarregar sessões' }))
  expect(await screen.findByText('0 dispositivos')).toBeInTheDocument()
  expect(requests.requestsFor('GET', '/auth/mfa/factors')).toHaveLength(2)
  expect(requests.requestsFor('GET', '/auth/sessions')).toHaveLength(2)
})
