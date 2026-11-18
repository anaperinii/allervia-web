import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryHistory, createRootRoute, createRoute, createRouter, RouterProvider } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { HelpPage } from '@/features/settings/help-page'
import { ManageRolesModal } from '@/features/settings/components/ManageRolesModal'
import { TeamsPage } from '@/features/settings/teams-page'
import type { TeamMember, ProfessionalRoleGrant } from '@/shared/api/contracts/team'
import { queryKeys } from '@/shared/api/query-keys'
import { withSession, buildAccountContext } from '../helpers/session'
import { stubApi, errorResponse } from '../helpers/http'

async function renderPage(path: '/help' | '/teams', component: typeof HelpPage | typeof TeamsPage) {
  const root = createRootRoute()
  const page = createRoute({ getParentRoute: () => root, path, component })
  const router = createRouter({ routeTree: root.addChildren([page]), history: createMemoryHistory({ initialEntries: [path] }) })
  await router.load()
  render(withSession(<RouterProvider router={router} />, path === '/teams' ? { account: buildAccountContext({ roles: ['ADMINISTRATOR'], capabilities: ['professionals:manage', 'invites:manage', 'users:manage'] }) } : undefined))
}
const member: TeamMember = { professionalId: 'professional-2', userId: 'user-2', fullName: 'Synthetic Physician', email: 'test@example.com', phoneNumber: '11999999999', profession: 'PHYSICIAN', councilNumber: null, councilUf: null, roles: ['PHYSICIAN'], isActive: true, createdAt: '2026-01-01T00:00:00Z' }
const grant: ProfessionalRoleGrant = { id: 'grant-1', professionalId: 'professional-2', role: 'PHYSICIAN', grantedAt: '2026-01-01T00:00:00Z', grantedById: 'user-1', revokedAt: null, revokedById: null }

describe('FE-12 administrative outcomes', () => {
  it('distinguishes a failed support list from an empty list and preserves failed submissions', async () => {
    const requests = stubApi([
      { path: '/support-requests', handler: errorResponse(500, 'INTERNAL_ERROR') },
      { method: 'POST', path: '/support-requests', handler: errorResponse(500, 'INTERNAL_ERROR') },
    ])
    await renderPage('/help', HelpPage)
    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível carregar as solicitações')
    expect(screen.queryByText('Nenhuma solicitação registrada.')).not.toBeInTheDocument()
    const user = userEvent.setup()
    await user.type(screen.getByPlaceholderText('Ex: dúvida sobre a agenda'), 'Synthetic subject')
    await user.type(screen.getByPlaceholderText('Descreva a dúvida ou o problema'), 'Synthetic message')
    await user.click(screen.getByRole('button', { name: 'Enviar solicitação' }))
    await waitFor(() => expect(requests.requestsFor('POST', '/support-requests')).toHaveLength(1))
    expect(screen.getByPlaceholderText('Ex: dúvida sobre a agenda')).toHaveValue('Synthetic subject')
    expect(screen.getByPlaceholderText('Descreva a dúvida ou o problema')).toHaveValue('Synthetic message')
  })
  it('shows the real persisted support receipt and reloads the list', async () => {
    stubApi([
      { path: '/support-requests', handler: [] },
      { method: 'POST', path: '/support-requests', handler: { id: 'receipt-1', status: 'RECEIVED' } },
    ])
    await renderPage('/help', HelpPage)
    const user = userEvent.setup()
    await user.type(screen.getByPlaceholderText('Ex: dúvida sobre a agenda'), 'Synthetic subject')
    await user.type(screen.getByPlaceholderText('Descreva a dúvida ou o problema'), 'Synthetic message')
    await user.click(screen.getByRole('button', { name: 'Enviar solicitação' }))
    expect(await screen.findByRole('status')).toHaveTextContent('receipt-1')
    expect(screen.getByPlaceholderText('Ex: dúvida sobre a agenda')).toHaveValue('')
  })
  it('reports which role changes persisted before a failure and reloads grants', async () => {
    let granted = false
    const requests = stubApi([
      { path: '/roles/professional/professional-2', handler: () => new Response(JSON.stringify(granted ? [grant, { ...grant, id: 'grant-2', role: 'NURSE' }] : [grant]), { headers: { 'Content-Type': 'application/json' } }) },
      { method: 'POST', path: '/roles', handler: () => { granted = true; return new Response(JSON.stringify({ ...grant, id: 'grant-2', role: 'NURSE' }), { status: 201, headers: { 'Content-Type': 'application/json' } }) } },
      { method: 'DELETE', path: '/roles/grant-1', handler: errorResponse(409, 'LAST_ADMINISTRATOR') },
    ])
    function Host() {
      const client = useQueryClient()
      return <ManageRolesModal member={member} organizationId="organization-1" onClose={() => {}} onSaved={async () => { await client.invalidateQueries({ queryKey: ['team', 'organization-1'] }) }} />
    }
    render(withSession(<Host />))
    const user = userEvent.setup()
    await user.click(await screen.findByRole('switch', { name: 'Enfermeiro' }))
    await user.click(screen.getByRole('switch', { name: 'Médico' }))
    await user.click(screen.getByRole('button', { name: 'Salvar papéis' }))
    await waitFor(() => expect(screen.getAllByRole('alert').some(alert => alert.textContent?.includes('Concedido: Enfermeiro'))).toBe(true))
    expect(requests.requestsFor('GET', '/roles/professional/professional-2')).toHaveLength(2)
    expect(requests.requestsFor('POST', '/roles')).toHaveLength(1)
    expect(queryKeys.memberRoles('organization-1', 'professional-2')[0]).toBe('team')
  })
  it('does not claim delivery when the persisted invite reports SMTP failure', async () => {
    stubApi([
      { path: '/professionals', handler: { items: [member], total: 1, page: 1, pageSize: 10 } },
      { path: '/onboarding/invites/list', handler: { items: [], total: 0, page: 1, pageSize: 50 } },
      { path: '/professionals/email-change-requests', handler: { items: [], total: 0, page: 1, pageSize: 10 } },
      { method: 'POST', path: '/onboarding/invites', handler: { id: 'invite-1', emailDelivered: false } },
    ])
    await renderPage('/teams', TeamsPage)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Convidar membro' }))
    await user.type(screen.getByPlaceholderText('Nome completo'), 'Synthetic Physician')
    await user.type(screen.getByPlaceholderText('nome@clinica.com'), 'test@example.com')
    await user.click(screen.getByRole('button', { name: 'Enviar convite' }))
    expect(await screen.findByRole('status')).toHaveTextContent('envio do e-mail não confirmado')
  })
})
