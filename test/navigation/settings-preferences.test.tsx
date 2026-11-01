import { render, screen } from '@testing-library/react'
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { beforeEach, describe, expect, it } from 'vitest'
import { AdvancedSettingsPage } from '@/features/settings/advanced-settings-page'
import { WeekView } from '@/features/scheduling/components/WeekView'
import { useSettingsStore } from '@/features/settings/stores/useSettingsStore'
import type { Application } from '@/features/patient/stores/usePatientStore'
import {
  automationSettings,
  notificationPreferences,
  organization,
} from '../fixtures/settings'
import { stubApi } from '../helpers/http'
import { withSession } from '../helpers/session'

function stubSettingsApi() {
  return stubApi([
    { path: '/organization/me', handler: organization() },
    { path: '/immunotherapies/types', handler: ['Ácaros'] },
    { path: '/notifications/preferences', handler: notificationPreferences() },
    { path: '/treatment-protocols/automation', handler: automationSettings() },
    { path: '/audit-logs', handler: [] },
  ])
}

async function renderAdvancedSettings() {
  const root = createRootRoute()
  const page = createRoute({
    getParentRoute: () => root,
    path: '/settings/advanced',
    component: AdvancedSettingsPage,
  })
  const router = createRouter({
    routeTree: root.addChildren([page]),
    history: createMemoryHistory({ initialEntries: ['/settings/advanced'] }),
  })
  await router.load()
  render(withSession(<RouterProvider router={router} />))
}

function buildApplication(overrides: Partial<Application> = {}): Application {
  return {
    id: 'application-1',
    patientId: 'patient-1',
    date: '2026-10-09',
    startTime: '09:00',
    endTime: '09:30',
    status: 'scheduled',
    dose: '0.3 ml',
    cycle: { number: 1, days: 7 },
    month: 'Outubro',
    year: 2026,
    modality: 'subcutaneous',
    patientName: 'Paula Andrade',
    ...overrides,
  }
}

describe('configurações avançadas: política de sessão e idioma', () => {
  it('exibe o tempo de sessão como política somente leitura do servidor', async () => {
    stubSettingsApi()
    await renderAdvancedSettings()

    expect(await screen.findByText('Tempo de sessão')).toBeInTheDocument()
    expect(
      screen.getByText('15 min de inatividade · 8 h de duração máxima'),
    ).toBeInTheDocument()
    expect(screen.getByText(/Sua sessão atual expira em/)).toBeInTheDocument()
    expect(
      screen.queryByText('Tempo de sessão (minutos)'),
    ).not.toBeInTheDocument()
  })

  it('não oferece seletor de idioma', async () => {
    stubSettingsApi()
    await renderAdvancedSettings()

    await screen.findByText('Tempo de sessão')
    expect(screen.queryByText('Idioma')).not.toBeInTheDocument()
  })
})

describe('cores dos eventos: preferência visual consumida pela agenda', () => {
  beforeEach(() => {
    window.localStorage.clear()
    useSettingsStore.setState({
      eventColors: [
        { id: 'subcutaneous', label: 'Subcutânea', color: '#14B8A6' },
        { id: 'sublingual', label: 'Sublingual', color: '#8B5CF6' },
        { id: 'missed', label: 'Ausente', color: '#EF4444' },
      ],
    })
  })

  it('a agenda pinta o evento com a cor escolhida no editor', () => {
    useSettingsStore.getState().setEventColor('subcutaneous', '#123456')

    const day = new Date('2026-10-09T12:00:00')
    const key = '09/10/2026'
    render(
      withSession(
        <WeekView
          weekDays={[day]}
          selectedDate={day}
          onSelectDate={() => {}}
          applicationsByDate={new Map([[key, [buildApplication()]]])}
          onSelectApplication={() => {}}
        />,
      ),
    )

    const event = screen.getByText('Paula Andrade').closest('[style]')
    expect(event).toHaveStyle({ background: '#12345633' })
  })

  it('eventos ausentes usam a cor configurada para "Ausente"', () => {
    useSettingsStore.getState().setEventColor('missed', '#654321')

    const day = new Date('2026-10-09T12:00:00')
    const key = '09/10/2026'
    render(
      withSession(
        <WeekView
          weekDays={[day]}
          selectedDate={day}
          onSelectDate={() => {}}
          applicationsByDate={
            new Map([[key, [buildApplication({ status: 'missed' })]]])
          }
          onSelectApplication={() => {}}
        />,
      ),
    )

    const event = screen.getByText('Paula Andrade').closest('[style]')
    expect(event).toHaveStyle({ background: '#65432133' })
  })
})
