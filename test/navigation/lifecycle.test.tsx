import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  SuspendTherapyModal,
} from '@/features/patient/components/chart/TherapyLifecycleModals'
import { RevisePrescriptionModal } from '@/features/patient/components/chart/RevisePrescriptionModal'
import { PatientCompletionPage } from '@/features/patient/patient-completion-page'
import { withSession } from '../helpers/session'

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

const THERAPY = {
  id: 'therapy-1',
  immunoType: 'Ácaros',
  administrationRoute: 'SUBCUTANEOUS',
  extract: 'Der p 60%',
  status: 'IN_PROGRESS',
  revision: 3,
  inductionStartDate: '2026-01-01T11:00:00.000Z',
  maintenanceStartDate: '2026-06-01T11:00:00.000Z',
  patient: { id: 'patient-1', fullName: 'Paula Andrade', isActive: true },
  responsiblePhysician: { id: 'professional-1', fullName: 'Dra. Karina Martins' },
  prescription: { versionId: 'version-1', revision: 1 },
  nextDose: { id: 'dose-9', scheduledAt: '2026-10-01T11:00:00.000Z', status: 'SCHEDULED' },
  createdAt: '2026-01-01T11:00:00.000Z',
  isArchived: false,
  doseCount: 12,
  updatedAt: '2026-09-01T11:00:00.000Z',
}

function stubApi(extra?: (url: string, init?: RequestInit) => Response | null) {
  const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    const handled = extra?.(url, init)
    if (handled) return Promise.resolve(handled)
    if (url.includes('/lifecycle') && init?.method === 'POST') {
      return Promise.resolve(
        jsonResponse(
          {
            event: { id: 'event-1', type: 'SUSPENSION' },
            status: 'SUSPENDED',
            revision: 4,
            archivedDoseIds: [],
          },
          201,
        ),
      )
    }
    if (url.includes('/immunotherapies/therapy-1/doses')) {
      return Promise.resolve(jsonResponse([]))
    }
    if (url.includes('/immunotherapies/therapy-1')) {
      return Promise.resolve(jsonResponse(THERAPY))
    }
    return Promise.resolve(jsonResponse({}))
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('ciclo de vida clínico no web', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('suspende com categoria, motivo e previsão de retorno persistidos', async () => {
    const fetchMock = stubApi()
    const user = userEvent.setup()
    render(
      withSession(
        <SuspendTherapyModal
          open
          therapyId="therapy-1"
          therapyRevision={3}
          organizationId="organization-1"
          onClose={() => {}}
          onDone={() => {}}
        />,
      ),
    )

    const submit = screen.getByRole('button', { name: /suspender tratamento/i })
    expect(submit).toBeDisabled()

    const categoryLabel = screen.getByText(/categoria do motivo/i, { selector: 'label' })
    await user.selectOptions(
      categoryLabel.parentElement!.querySelector('select')!,
      'severe_adverse_reaction',
    )
    const reasonLabel = screen.getByText(/detalhamento clínico/i, { selector: 'label' })
    await user.type(
      reasonLabel.parentElement!.querySelector('textarea')!,
      'Reação adversa extensa na última aplicação.',
    )
    const returnLabel = screen.getByText(/previsão de retorno/i, { selector: 'label' })
    await user.type(returnLabel.parentElement!.querySelector('input')!, '2026-11-01')

    expect(submit).toBeEnabled()
    await user.click(submit)

    await waitFor(() => {
      const call = fetchMock.mock.calls.find(
        ([url, init]) =>
          String(url).includes('/immunotherapies/therapy-1/lifecycle') &&
          (init as RequestInit | undefined)?.method === 'POST',
      )
      expect(call).toBeDefined()
      const body = JSON.parse((call![1] as RequestInit).body as string)
      expect(body.action).toBe('SUSPEND')
      expect(body.expectedRevision).toBe(3)
      expect(body.category).toBe('severe_adverse_reaction')
      expect(body.reason).toContain('Reação adversa extensa')
      expect(body.expectedReturnAt).toMatch(/^2026-11-01T08:00:00[+-]\d{2}:\d{2}$/)
    })
  })

  it('encerra com recomendações estruturadas, nunca só o status', async () => {
    const fetchMock = stubApi()
    const user = userEvent.setup()

    const root = createRootRoute()
    const completion = createRoute({
      getParentRoute: () => root,
      path: '/patient-completion',
      validateSearch: (search: Record<string, unknown>) => ({
        patientId: typeof search.patientId === 'string' ? search.patientId : undefined,
        therapy: typeof search.therapy === 'string' ? search.therapy : undefined,
      }),
      component: PatientCompletionPage,
    })
    const chart = createRoute({
      getParentRoute: () => root,
      path: '/patient/$patientId',
      validateSearch: (search: Record<string, unknown>) => ({
        therapy: typeof search.therapy === 'string' ? search.therapy : undefined,
      }),
      component: () => <h1>Prontuário</h1>,
    })
    const router = createRouter({
      routeTree: root.addChildren([completion, chart]),
      history: createMemoryHistory({
        initialEntries: ['/patient-completion?patientId=patient-1&therapy=therapy-1'],
      }),
    })
    await router.load()
    render(withSession(<RouterProvider router={router} />))

    expect(await screen.findByText('Paula Andrade')).toBeInTheDocument()
    expect(
      screen.getByText(/a previsão pendente será arquivada/i),
    ).toBeInTheDocument()

    const reasonLabel = screen.getByText(/motivo do encerramento/i, { selector: 'label' })
    await user.type(
      reasonLabel.parentElement!.querySelector('textarea')!,
      'Meta terapêutica atingida e sustentada.',
    )
    const monitoringLabel = screen.getByText(/plano de retornos/i, { selector: 'label' })
    await user.type(
      monitoringLabel.parentElement!.querySelector('textarea')!,
      'Semestral no primeiro ano.',
    )
    await user.click(screen.getByRole('checkbox', { name: /confirmo o encerramento/i }))
    await user.click(screen.getByRole('button', { name: /encerrar tratamento/i }))

    await waitFor(() => {
      const call = fetchMock.mock.calls.find(
        ([url, init]) =>
          String(url).includes('/immunotherapies/therapy-1/lifecycle') &&
          (init as RequestInit | undefined)?.method === 'POST',
      )
      expect(call).toBeDefined()
      const body = JSON.parse((call![1] as RequestInit).body as string)
      expect(body.action).toBe('COMPLETE')
      expect(body.expectedRevision).toBe(3)
      expect(body.recommendations.retesting).toBe(true)
      expect(body.recommendations.monitoringSchedule).toBe('Semestral no primeiro ano.')
      expect(body.reason).toContain('Meta terapêutica')
    })
  })

  it('revisão de prescrição só confirma após ensaio do mesmo corpo', async () => {
    stubApi((url, init) => {
      if (url.includes('/prescription/revision') && init?.method === 'POST') {
        return jsonResponse({
          dryRun: true,
          therapyId: 'therapy-1',
          pendingDoseId: 'dose-9',
          previousVersionId: 'version-1',
          targetVersionId: 'version-2',
          pendingStep: {
            id: 'middle',
            label: 'Média',
            concentration: '1000',
            volume: '0.2',
            intervalDays: 7,
          },
          scheduledAtUnchanged: '2026-10-01T11:00:00.000Z',
          historicalDosesUnchanged: true,
        })
      }
      if (url.endsWith('/treatment-protocols')) {
        return jsonResponse([
          {
            id: 'protocol-1',
            name: 'SCIT ácaros',
            route: 'SUBCUTANEOUS',
            available: true,
            createdAt: '2026-01-01T11:00:00.000Z',
            versions: [
              {
                id: 'version-2',
                protocolId: 'protocol-1',
                number: 2,
                status: 'PUBLISHED',
                definition: {
                  schemaVersion: 1,
                  engineVersion: '1',
                  route: 'SUBCUTANEOUS',
                  volumeUnit: 'mL',
                  concentrationUnit: 'DILUTION_DENOMINATOR',
                  steps: [
                    { id: 'low', label: 'Baixa', phase: 'BUILD_UP', concentration: '1000', volume: '0.1', intervalDays: 7, nextStepId: 'middle' },
                    { id: 'middle', label: 'Média', phase: 'BUILD_UP', concentration: '1000', volume: '0.2', intervalDays: 7, nextStepId: 'high' },
                    { id: 'high', label: 'Meta', phase: 'MAINTENANCE', concentration: '1000', volume: '0.4', intervalDays: 14, nextStepId: 'high' },
                  ],
                },
                revision: 1,
                createdAt: '2026-01-01T11:00:00.000Z',
                publishedAt: '2026-01-02T11:00:00.000Z',
              },
            ],
          },
        ])
      }
      return null
    })
    const user = userEvent.setup()
    render(
      withSession(
        <RevisePrescriptionModal
          open
          therapyId="therapy-1"
          therapyRevision={3}
          currentVersionId="version-1"
          organizationId="organization-1"
          onClose={() => {}}
        />,
      ),
    )

    const confirm = screen.getByRole('button', { name: /confirmar revisão/i })
    expect(confirm).toBeDisabled()

    const versionLabel = await screen.findByText(/nova versão publicada/i, { selector: 'label' })
    await screen.findByRole('option', { name: /SCIT ácaros — v2/ })
    await user.selectOptions(versionLabel.parentElement!.querySelector('select')!, 'version-2')
    await user.click(screen.getByRole('checkbox', { name: /baixa/i }))
    await user.click(screen.getByRole('checkbox', { name: /média/i }))
    await user.click(screen.getByRole('checkbox', { name: /meta/i }))
    const start = screen.getByText(/etapa inicial/i, { selector: 'label' })
    await user.selectOptions(start.parentElement!.querySelector('select')!, 'low')
    const target = screen.getByText(/etapa meta/i, { selector: 'label' })
    await user.selectOptions(target.parentElement!.querySelector('select')!, 'high')
    const pending = screen.getByText(/previsão pendente vira/i, { selector: 'label' })
    await user.selectOptions(pending.parentElement!.querySelector('select')!, 'middle')
    const reason = screen.getByText(/motivo clínico da revisão/i, { selector: 'label' })
    await user.type(reason.parentElement!.querySelector('textarea')!, 'Atualização da conduta clínica.')

    expect(confirm).toBeDisabled()
    await user.click(screen.getByRole('button', { name: /ensaiar/i }))
    expect(await screen.findByText(/ensaio aprovado sem gravar nada/i)).toBeInTheDocument()
    expect(confirm).toBeEnabled()

    // Mudança após o ensaio invalida a confirmação.
    await user.type(reason.parentElement!.querySelector('textarea')!, ' Ajuste.')
    expect(confirm).toBeDisabled()
  })
})
