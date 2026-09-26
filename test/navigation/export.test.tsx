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
import { ExportReportPage } from '@/features/dashboard/export-report-page'
import { withSession } from '../helpers/session'

const downloadFileMock = vi.fn()
vi.mock('@/shared/lib/file-download', () => ({
  downloadFile: (...args: unknown[]) => downloadFileMock(...args),
  safeFilename: (name: string) => name,
}))

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function exportRow(id: string, patientName: string) {
  return {
    doseId: id,
    status: 'ADMINISTERED_ON_SCHEDULE',
    scheduledAt: '2026-01-01T13:00:00.000Z',
    administeredAt: '2026-01-01T13:00:00.000Z',
    administrationEndedAt: null,
    planned: {
      concentration: '1000', volume: '0.1', intervalDays: 7,
      phase: 'BUILD_UP', route: 'SUBCUTANEOUS', volumeUnit: 'mL', concentrationUnit: 'DILUTION_DENOMINATOR',
    },
    administered: {
      concentration: '1000', volume: '0.1', intervalDays: 7,
      phase: 'BUILD_UP', route: 'SUBCUTANEOUS', volumeUnit: 'mL', concentrationUnit: 'DILUTION_DENOMINATOR',
    },
    immediateConduct: null,
    administeredBy: { id: 'professional-1', fullName: 'Dra. Karina Martins' },
    prescription: {
      versionId: 'version-1',
      protocolName: 'SCIT ácaros',
      versionNumber: 1,
      timeZone: 'America/Sao_Paulo',
    },
    therapy: {
      id: 'therapy-1',
      immunoType: 'Ácaros',
      extract: 'Der p 60%',
      status: 'IN_PROGRESS',
      administrationRoute: 'SUBCUTANEOUS',
      inductionStartDate: '2026-01-01T13:00:00.000Z',
    },
    patient: {
      id: 'patient-1',
      fullName: patientName,
      isActive: true,
      responsiblePhysician: { id: 'professional-1', fullName: 'Dra. Karina Martins' },
    },
  }
}

function stubApi() {
  const fetchMock = vi.fn((input: RequestInfo | URL) => {
    const url = String(input)
    if (url.includes('/immunotherapies/export')) {
      const parsed = new URL(url, 'http://localhost')
      const page = Number(parsed.searchParams.get('page') ?? '1')
      const asOf = parsed.searchParams.get('asOf')!
      const items =
        page === 1
          ? [exportRow('dose-1', 'Paula Andrade'), exportRow('dose-2', '=HACK(A1)')]
          : []
      return Promise.resolve(
        jsonResponse({ items, page, pageSize: 100, total: 2, asOf }),
      )
    }
    return Promise.resolve(jsonResponse({}))
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

async function renderPage() {
  const root = createRootRoute()
  const page = createRoute({
    getParentRoute: () => root,
    path: '/export-report',
    component: ExportReportPage,
  })
  const list = createRoute({
    getParentRoute: () => root,
    path: '/immunotherapies',
    component: () => <h1>Lista</h1>,
  })
  const router = createRouter({
    routeTree: root.addChildren([page, list]),
    history: createMemoryHistory({ initialEntries: ['/export-report'] }),
  })
  await router.load()
  render(withSession(<RouterProvider router={router} />))
}

describe('exportação do conjunto clínico', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    downloadFileMock.mockClear()
  })

  it('gera CSV do servidor com corte temporal e fórmulas neutralizadas', async () => {
    const fetchMock = stubApi()
    const user = userEvent.setup()
    await renderPage()

    const justLabel = screen.getByText(/justificativa/i, { selector: 'label' })
    await user.type(justLabel.parentElement!.querySelector('textarea')!, 'Auditoria interna trimestral.')
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: /exportar csv/i }))
    await user.click(await screen.findByRole('button', { name: /confirmar e exportar/i }))

    await waitFor(() => expect(downloadFileMock).toHaveBeenCalledTimes(1))

    const call = fetchMock.mock.calls.find(([url]) =>
      String(url).includes('/immunotherapies/export'),
    )!
    const parsed = new URL(String(call[0]), 'http://localhost')
    expect(parsed.searchParams.get('asOf')).toMatch(/Z$/)
    expect(parsed.searchParams.get('pageSize')).toBe('100')

    const [content, filename, mime] = downloadFileMock.mock.calls[0] as [string, string, string]
    expect(filename).toMatch(/^allervia_export_.*\.csv$/)
    expect(mime).toContain('text/csv')
    expect(content).toContain('corte temporal')
    expect(content).toContain('"Paula Andrade"')
    // Valor iniciado por "=" degradado a texto: sem injeção de fórmula.
    expect(content).toContain('"\'=HACK(A1)"')
    // Decimais exatos preservados como texto.
    expect(content).toContain('"0.1"')
    expect(content).toContain('America/Sao_Paulo')
  })

  it('não exporta sem justificativa e consentimento', async () => {
    stubApi()
    await renderPage()
    const button = screen.getByRole('button', { name: /exportar csv/i })
    expect(button).toBeDisabled()
    expect(downloadFileMock).not.toHaveBeenCalled()
  })
})
