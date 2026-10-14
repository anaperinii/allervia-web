import { render, screen, waitFor } from '@testing-library/react'
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router'
import { describe, expect, it } from 'vitest'
import { PatientChartPage } from '@/features/patient/patient-chart-page'
import { PatientCompletionPage } from '@/features/patient/patient-completion-page'
import { RequireCapability } from '@/shared/auth/RequireCapability'
import {
  canAccess,
  defaultDestination,
  destinationAfterLogin,
  safeReturnTo,
} from '@/shared/auth/navigation-policy'
import { PERMISSION_CAPABILITIES } from '@/shared/stores/useUserStore'
import { accountContext } from '../fixtures/account'
import { patientDetail, therapySummary } from '../fixtures/clinical'
import { stubApi } from '../helpers/http'
import { withSession } from '../helpers/session'

const PHYSICIAN = accountContext().capabilities
const RECEPTION = ['appointments:read', 'appointments:manage', 'patients:read']
const NURSE = [
  'immunotherapies:read',
  'doses:read',
  'doses:create',
  'patients:read',
  'appointments:read',
  'protocols:read',
]

describe('política de destinos e capacidades', () => {
  it('recepção não tem acesso a leitura clínica e entra pela agenda', () => {
    expect(canAccess(RECEPTION, '/immunotherapies')).toBe(false)
    expect(canAccess(RECEPTION, '/patient/patient-1')).toBe(false)
    expect(canAccess(RECEPTION, '/appointments')).toBe(true)
    expect(defaultDestination(RECEPTION)).toBe('/appointments')
  })

  it('médico entra pela lista clínica e enfermagem mantém leitura clínica', () => {
    expect(defaultDestination(PHYSICIAN)).toBe('/immunotherapies')
    expect(defaultDestination(NURSE)).toBe('/immunotherapies')
  })

  it('enfermagem acessa preferências próprias sem permissão de organização', () => {
    expect(canAccess(NURSE, '/profile')).toBe(true)
    expect(canAccess(NURSE, '/security')).toBe(true)
    expect(canAccess(NURSE, '/notifications')).toBe(true)

    expect(canAccess(NURSE, '/protocols')).toBe(true)
    expect(canAccess(NURSE, '/protocol-editor')).toBe(false)
    expect(canAccess(NURSE, '/advanced-settings')).toBe(false)
    expect(canAccess(NURSE, '/teams')).toBe(false)
  })

  it('auditoria continua restrita à capacidade própria', () => {
    expect(PERMISSION_CAPABILITIES.view_audit).toBe('auditLogs:read')
    expect(NURSE).not.toContain('auditLogs:read')
    expect(RECEPTION).not.toContain('auditLogs:read')
  })

  it.each([
    ['https://exemplo.invalido/roubo', 'URL externa'],
    ['//exemplo.invalido/roubo', 'protocolo relativo'],
    ['/rota-inexistente', 'rota desconhecida'],
    ['/teams', 'rota vedada ao papel'],
    ['/login', 'rota pública'],
    ['/immunotherapies ', 'espaço em branco'],
  ])('returnTo %s é descartado (%s)', (candidate) => {
    expect(safeReturnTo(candidate, NURSE)).toBeNull()
  })

  it('returnTo relativo, conhecido e autorizado é preservado', () => {
    expect(safeReturnTo('/patient/patient-1?therapy=therapy-1', NURSE)).toBe(
      '/patient/patient-1?therapy=therapy-1',
    )
    expect(destinationAfterLogin('/appointments', RECEPTION)).toBe('/appointments')
    expect(destinationAfterLogin('/immunotherapies', RECEPTION)).toBe('/appointments')
    expect(destinationAfterLogin(null, PHYSICIAN)).toBe('/immunotherapies')
  })
})

async function renderGuarded(session: Parameters<typeof withSession>[1]) {
  const api = stubApi([
    { path: '/immunotherapies/patients/patient-1', handler: [] },
    { path: '/patients/patient-1', handler: patientDetail() },
  ])
  const root = createRootRoute({ component: Outlet })
  const completion = createRoute({
    getParentRoute: () => root,
    path: '/patient-completion',
    validateSearch: (search: Record<string, unknown>) => ({
      patientId:
        typeof search.patientId === 'string' ? search.patientId : undefined,
      therapy: typeof search.therapy === 'string' ? search.therapy : undefined,
    }),
    component: () => (
      <RequireCapability capability="inactivate_immunotherapy">
        <PatientCompletionPage />
      </RequireCapability>
    ),
  })
  const list = createRoute({
    getParentRoute: () => root,
    path: '/immunotherapies',
    component: () => <h1>Lista clínica</h1>,
  })
  const appointments = createRoute({
    getParentRoute: () => root,
    path: '/appointments',
    component: () => <h1>Agenda</h1>,
  })
  const router = createRouter({
    routeTree: root.addChildren([completion, list, appointments]),
    history: createMemoryHistory({ initialEntries: ['/patient-completion'] }),
  })
  await router.load()
  render(withSession(<RouterProvider router={router} />, session))
  return { router, api }
}

describe('guarda de rota espera a sessão', () => {
  it('entrada direta com sessão lenta não nega acesso por capabilities vazias', async () => {


    const { router } = await renderGuarded({
      status: 'loading',
      account: null,
      session: null,
    })

    expect(await screen.findByText(/verificando seu acesso/i)).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/patient-completion')
    expect(screen.queryByText('Lista clínica')).not.toBeInTheDocument()
  })

  it('sem a capacidade, a recusa é explícita e nenhuma query clínica é disparada', async () => {
    const { api } = await renderGuarded({
      account: accountContext({
        roles: ['RECEPTIONIST'],
        capabilities: RECEPTION,
      }),
    })

    expect(await screen.findByRole('alert')).toHaveTextContent('Acesso restrito')
    expect(
      screen.getByRole('link', { name: /voltar para uma área disponível/i }),
    ).toHaveAttribute('href', '/appointments')

    expect(api.requests).toHaveLength(0)
  })

  it('com a capacidade, a tela carrega normalmente', async () => {
    await renderGuarded({
      account: accountContext({ capabilities: PHYSICIAN }),
    })

    await waitFor(() => {
      expect(screen.queryByText('Acesso restrito')).not.toBeInTheDocument()
    })
  })
})

describe('vínculo paciente e tratamento na URL', () => {
  async function renderChart(initialEntry: string) {
    const api = stubApi([
      {
        path: '/patients/patient-1',
        handler: patientDetail({ therapies: [therapySummary()] }),
      },
      { path: '/immunotherapies/therapy-1/doses', handler: [] },
      { path: '/professionals', handler: { items: [], page: 1, pageSize: 100, total: 0 } },
    ])
    const root = createRootRoute({ component: Outlet })
    const chart = createRoute({
      getParentRoute: () => root,
      path: '/patient/$patientId',
      validateSearch: (search: Record<string, unknown>) => ({
        therapy: typeof search.therapy === 'string' ? search.therapy : undefined,
      }),
      component: PatientChartPage,
    })
    const router = createRouter({
      routeTree: root.addChildren([chart]),
      history: createMemoryHistory({ initialEntries: [initialEntry] }),
    })
    await router.load()
    render(withSession(<RouterProvider router={router} />))
    return { router, api }
  }

  it('tratamento de outro paciente não cai na seleção anterior', async () => {
    const { api } = await renderChart('/patient/patient-1?therapy=therapy-de-outro')

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /tratamento não encontrado para carla mendes/i,
    )

    expect(api.requestsFor('GET', /\/doses$/)).toHaveLength(0)
  })

  it('sem parâmetro, a seleção padrão continua válida', async () => {
    await renderChart('/patient/patient-1')

    expect(await screen.findByText('Carla Mendes')).toBeInTheDocument()
    expect(screen.queryByText(/tratamento não encontrado/i)).not.toBeInTheDocument()
  })
})
