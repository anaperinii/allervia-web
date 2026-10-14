import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor, renderHook } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { collectPages } from '@/shared/api/pagination'
import { queryKeys } from '@/shared/api/query-keys'
import { appointmentWindow, toZonedOffsetIso, dayInZone, calculateAge, toDateInputValue } from '@/shared/lib/dates'
import { parsePatientRecord } from '@/shared/api/contracts/patient-record.schema'
import { exportPatientRecord } from '@/features/patient/exporters/patient-record-exporter'
import { Modal } from '@/shared/components/modals/Modal'
import { InviteMemberModal } from '@/features/settings/components/InviteMemberModal'
import { NotificationPreferencesPanel } from '@/features/settings/components/NotificationPreferencesPanel'
import { useStatusHistory } from '@/features/dashboard/hooks/useDashboardAggregates'
import { addImmunotherapySchema } from '@/features/immunotherapy/schemas/add-immunotherapy'
import { withSession } from '../helpers/session'
import { stubApi, errorResponse } from '../helpers/http'
import { patientRecord } from '../fixtures/patient-record'
import { notificationPreferences } from '../fixtures/settings'

const download = vi.fn()
vi.mock('@/shared/lib/file-download', () => ({ downloadFile: (...args: unknown[]) => download(...args) }))

describe('FE-06 through FE-13 completion', () => {
  it.each([0, 1, 100, 101, 500])('collects %i records without losing a later page', async total => {
    const result = await collectPages(async page => ({ total, items: Array.from({ length: Math.min(100, Math.max(0, total - (page - 1) * 100)) }, (_, index) => ({ id: String((page - 1) * 100 + index) })) }), { maxPages: 5 })
    expect(result.items).toHaveLength(total)
    expect(result.complete).toBe(true)
  })
  it('reports the ceiling and rejects repeated, empty and changing pages', async () => {
    const result = await collectPages(async page => ({ total: 600, items: Array.from({ length: 100 }, (_, index) => ({ id: String(page * 100 + index) })) }), { maxPages: 5 })
    expect(result).toMatchObject({ complete: false, truncated: true, total: 600 })
    await expect(collectPages(async () => ({ total: 2, items: [{ id: 'same' }] }), { maxPages: 3 })).rejects.toThrow('Repeated')
    await expect(collectPages(async () => ({ total: 1, items: [] }), { maxPages: 3 })).rejects.toThrow('progress')
    await expect(collectPages(async page => ({ total: page + 2, items: [{ id: String(page) }] }), { maxPages: 3 })).rejects.toThrow('changed')
  })
  it('stops page collection on abort', async () => {
    const controller = new AbortController()
    const load = vi.fn(async () => { controller.abort(); return { total: 2, items: [{ id: '1' }] } })
    await expect(collectPages(load, { signal: controller.signal, maxPages: 2 })).rejects.toThrow()
    expect(load).toHaveBeenCalledTimes(1)
  })
  it('rejects ambiguous and nonexistent clinical instants', () => {
    expect(() => toZonedOffsetIso('2026-03-08', '02:30', 'America/New_York')).toThrow('inexistente')
    expect(() => toZonedOffsetIso('2026-11-01', '01:30', 'America/New_York')).toThrow('ambíguo')
    expect(() => toZonedOffsetIso('2026-02-30', '09:00', 'UTC')).toThrow()
    expect(() => toZonedOffsetIso('2026-02-28', '25:00', 'UTC')).toThrow()
  })
  it('constructs the same clinical time independently of the operator timezone and crosses midnight', () => {
    expect(toZonedOffsetIso('2026-01-31', '23:59', 'America/Sao_Paulo')).toBe('2026-01-31T23:59:00-03:00')
    const bounds = appointmentWindow('2026-01-31', '23:59', '00:29', 'America/Sao_Paulo')
    expect(bounds.endsAt).toBe('2026-02-01T00:29:00-03:00')
    expect(Date.parse(bounds.endsAt) - Date.parse(bounds.startsAt)).toBe(1800000)
    expect(dayInZone(new Date('2026-02-01T01:00:00Z'), 'America/Sao_Paulo')).toBe('2026-01-31')
  })
  it('keeps civil birth dates and handles the eighteenth birthday boundary', () => {
    expect(toDateInputValue('2008-02-29')).toBe('2008-02-29')
    expect(calculateAge('2008-02-29', '2026-02-28')).toBe(17)
    expect(calculateAge('2008-02-29', '2026-03-01')).toBe(18)
  })
  it('accepts missing CPF and requires the minor guardian', () => {
    const form = { name: 'Synthetic Patient', cpf: '', phone: '11999999999', birthDate: '1990-01-01', weight: '70', guardianName: '', guardianCpf: '', guardianPhone: '', patientId: '', type: 'Synthetic', startDate: '2099-01-01', extract: 'Der p 100%', protocolVersionId: 'version-1', stepIds: ['low'], startingStepId: 'low', targetStepId: 'low' }
    expect(addImmunotherapySchema.safeParse(form).success).toBe(true)
    const minor = { ...form, birthDate: '2020-01-01' }
    expect(addImmunotherapySchema.safeParse(minor).success).toBe(false)
    expect(addImmunotherapySchema.safeParse({ ...minor, guardianName: 'Synthetic Guardian', guardianPhone: '11999999999' }).success).toBe(true)
  })
  it('separates notification, preference and support caches by both organization and user', () => {
    for (const factory of [queryKeys.notifications, queryKeys.notificationPreferences, queryKeys.supportRequests]) {
      expect(factory('org-1', 'user-1')).not.toEqual(factory('org-1', 'user-2'))
      expect(factory('org-1', 'user-1')).not.toEqual(factory('org-2', 'user-1'))
    }
    expect(queryKeys.notificationPreferences('org-1', 'user-1')).not.toEqual(queryKeys.notificationScope('org-1', 'user-1'))
  })
  it('rejects incomplete clinical records instead of exporting a partial success', () => {
    expect(() => parsePatientRecord({ ...patientRecord(), complete: false })).toThrow('inválida')
    expect(() => parsePatientRecord({ ...patientRecord(), therapies: [{}] })).toThrow('inválida')
  })
  it('exports more than 200 events, multiple therapies and forensic retractions with truthful scope', () => {
    const record = patientRecord()
    record.history = Array.from({ length: 201 }, (_, index) => ({ id: String(index), entityId: 'therapy-1' }))
    record.therapies.push({ ...record.therapies[0], id: 'therapy-2' })
    record.therapies[0].doses[0].status = 'ENTERED_IN_ERROR'
    exportPatientRecord(record, 'json', 'Formal request')
    const payload = JSON.parse(download.mock.calls.at(-1)![0])
    expect(payload.therapies).toHaveLength(2)
    expect(payload.history).toHaveLength(201)
    expect(payload.scope).toMatchObject({ completeAuthorizedScope: true, includesAllPatientData: false, downloadAudited: false })
    expect(payload.therapies[0].doses[0].status).toBe('ENTERED_IN_ERROR')
    record.patient.fullName = '=HACK(A1)'
    exportPatientRecord(record, 'csv', '@malicious')
    expect(download.mock.calls.at(-1)![0]).toContain("'=HACK(A1)")
  })
  it('blocks invalid invitations and normalizes a valid email', async () => {
    const submit = vi.fn(); const user = userEvent.setup()
    render(<InviteMemberModal open submitting={false} onClose={() => {}} onSubmit={submit} />)
    await user.type(screen.getByPlaceholderText('Nome completo'), 'Synthetic Physician')
    await user.type(screen.getByPlaceholderText('nome@clinica.com'), 'invalid')
    expect(screen.getByRole('button', { name: 'Enviar convite' })).toBeDisabled()
    await user.clear(screen.getByPlaceholderText('nome@clinica.com'))
    await user.type(screen.getByPlaceholderText('nome@clinica.com'), 'TEST@EXAMPLE.COM')
    await user.click(screen.getByRole('button', { name: 'Enviar convite' }))
    expect(submit).toHaveBeenCalledWith(expect.objectContaining({ email: 'test@example.com' }))
  })
  it('makes failed preference reads explicit and can recover without guessing defaults', async () => {
    stubApi([{ path: '/notifications/preferences', handler: ({ call }: { call: number }) => call === 1 ? errorResponse(500, 'INTERNAL_ERROR') : new Response(JSON.stringify(notificationPreferences()), { headers: { 'Content-Type': 'application/json' } }) }])
    const user = userEvent.setup()
    render(withSession(<NotificationPreferencesPanel />))
    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível carregar')
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }))
    expect(await screen.findByRole('switch', { name: 'Avaliação médica solicitada' })).toBeInTheDocument()
  })
  it('confirms discard for Escape and refuses to close while a clinical command is pending', async () => {
    const close = vi.fn(); const user = userEvent.setup()
    const view = render(<Modal open dirty onClose={close} title="Clinical draft"><input aria-label="Reason" /></Modal>)
    await user.keyboard('{Escape}')
    expect(close).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent('Descartar')
    await user.click(screen.getByRole('button', { name: 'Continuar editando' }))
    view.rerender(<Modal open dirty pending onClose={close} title="Clinical draft"><input aria-label="Reason" /></Modal>)
    await user.keyboard('{Escape}')
    expect(close).not.toHaveBeenCalled()
    expect(screen.getByRole('status')).toHaveTextContent('Operação em andamento')
  })
  it('reads 350 therapy histories in one HTTP operation without per-therapy lifecycle requests', async () => {
    const requests = stubApi([{ path: '/immunotherapies/status-history', handler: { asOf: '2026-01-01T00:00:00Z', complete: true, totalTherapies: 350, timeZone: 'America/Sao_Paulo', buckets: [{ date: '2026-01-31', label: 'jan./26', active: 350, suspended: 0, completed: 0, unknown: 0 }] } }])
    const { result } = renderHook(() => useStatusHistory('organization-1'), { wrapper: ({ children }) => withSession(children) })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(requests.requests).toHaveLength(1)
    expect(result.current.data?.totalTherapies).toBe(350)
  })
})
