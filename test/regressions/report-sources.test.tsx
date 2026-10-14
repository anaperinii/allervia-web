import { patientRecord } from '../fixtures/patient-record'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryHistory, createRootRoute, createRoute, createRouter, RouterProvider } from '@tanstack/react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PatientReportPage } from '@/features/patient/patient-report-page'
import { PortabilityModal } from '@/features/patient/components/chart/PortabilityModal'
import { buildLegacyPatient } from '@/features/patient/adapters/clinical-presentation'
import { buildPatientReportPdf } from '@/features/patient/exporters'
import { administeredDose, doseDetail, patientDetail, therapySummary } from '../fixtures/clinical'
import { errorResponse, stubApi } from '../helpers/http'
import { withSession } from '../helpers/session'

vi.mock('@/features/patient/exporters', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/patient/exporters')>()
  return { ...actual, buildPatientReportPdf: vi.fn(() => ({ output: () => new Blob(['report']) })) }
})

async function renderReport() {
  const root = createRootRoute()
  const route = createRoute({ getParentRoute: () => root, path: '/patient-report', component: PatientReportPage,
    validateSearch: () => ({ patientId: 'patient-1', therapy: 'therapy-1' }) })
  const router = createRouter({ routeTree: root.addChildren([route]), history: createMemoryHistory({ initialEntries: ['/patient-report?patientId=patient-1&therapy=therapy-1'] }) })
  await router.load()
  render(withSession(<RouterProvider router={router} />))
}

describe('report source integrity', () => {
  beforeEach(() => {
    vi.stubGlobal('URL', class extends URL {
      static createObjectURL = vi.fn(() => 'blob:validated-report')
      static revokeObjectURL = vi.fn()
    })
  })
  afterEach(() => vi.unstubAllGlobals())

  it('blocks the individual report when its dose source fails', async () => {
    stubApi([
      { path: '/immunotherapies/record/patient-1', handler: patientRecord() },
      { path: '/patients/patient-1', handler: patientDetail({ therapies: [therapySummary()] }) },
      { path: '/immunotherapies/therapy-1/doses', handler: errorResponse(500, 'INTERNAL_ERROR') },
    ])
    await renderReport()
    expect(await screen.findByRole('alert')).toHaveTextContent('Relatório bloqueado')
    expect(screen.getByRole('button', { name: /exportar/i })).toBeDisabled()
    expect(buildPatientReportPdf).not.toHaveBeenCalled()
  })

  it('keeps the report unavailable when the required dose detail fails', async () => {
    stubApi([
      { path: '/immunotherapies/record/patient-1', handler: patientRecord() },
      { path: '/patients/patient-1', handler: patientDetail({ therapies: [therapySummary()] }) },
      { path: '/immunotherapies/therapy-1/doses', handler: [administeredDose({ id: 'dose-1' })] },
      { path: '/doses/dose-1', handler: errorResponse(500, 'INTERNAL_ERROR') },
    ])
    await renderReport()
    expect(await screen.findByRole('alert')).toHaveTextContent('Relatório bloqueado')
    expect(screen.getByRole('button', { name: /exportar/i })).toBeDisabled()
  })

  it('excludes a retraction and reads observed reactions in the preview data', async () => {
    stubApi([
      { path: '/immunotherapies/record/patient-1', handler: patientRecord() },
      { path: '/patients/patient-1', handler: patientDetail({ therapies: [therapySummary()] }) },
      { path: '/immunotherapies/therapy-1/doses', handler: [administeredDose({ id: 'dose-1' }), administeredDose({ id: 'retracted', status: 'ENTERED_IN_ERROR' })] },
      { path: '/doses/dose-1', handler: doseDetail() },
    ])
    await renderReport()
    await waitFor(() => expect(buildPatientReportPdf).toHaveBeenCalled())
    const data = vi.mocked(buildPatientReportPdf).mock.calls.at(-1)![0]
    expect(data.realizedApplications).toHaveLength(1)
    expect(data.reactionsCount).toBe(0)
    expect(data.patient.currentInterval).toBeGreaterThan(0)
  })

  it('blocks a treatment data package after a history failure even with consent', async () => {
    stubApi([
      { path: '/immunotherapies/therapy-1/doses', handler: [] },
      { path: '/immunotherapies/record/patient-1', handler: errorResponse(500, 'INTERNAL_ERROR') },
    ])
    const user = userEvent.setup()
    render(withSession(<PortabilityModal open patient={buildLegacyPatient(patientDetail(), therapySummary())} therapyId="therapy-1" onClose={() => {}} />))
    await user.type(screen.getByPlaceholderText('Ex: Solicitação formal do paciente'), 'Formal patient request')
    await user.click(screen.getByRole('button', { name: /declaro ciência/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Exportação bloqueada')
    expect(screen.getByRole('button', { name: 'Exportar JSON' })).toBeDisabled()
    expect(screen.queryByText(/ação será registrada/i)).not.toBeInTheDocument()
  })
})
