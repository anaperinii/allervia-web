import { it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppointmentActionModal } from '@/features/scheduling/components/AppointmentModals'
import type { Appointment } from '@/shared/api/contracts/clinical'
import { withSession } from '../helpers/session'
import { stubApi, errorResponse } from '../helpers/http'

it('reloads the current appointment after 409 and requires explicit review before saving the preserved draft', async () => {
  const appointment: Appointment = { id: 'appointment-1', organizationId: 'organization-1', patientId: 'patient-1', doseId: null, professionalId: null, professional: null, dose: null, patient: { id: 'patient-1', fullName: 'Synthetic Patient', phoneNumber: '11999999999' }, revision: 0, startsAt: '2026-01-01T13:00:00Z', endsAt: '2026-01-01T13:30:00Z', status: 'SCHEDULED', statusReason: null, notes: null, title: 'Original', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' }
  const requests = stubApi([
    { method: 'PATCH', path: '/appointments/appointment-1', handler: errorResponse(409, 'STALE_APPOINTMENT_REVISION') },
    { path: '/appointments/appointment-1', handler: errorResponse(500, 'INTERNAL_ERROR') },
  ])
  const user = userEvent.setup()
  render(withSession(<AppointmentActionModal appointment={appointment} organizationId="organization-1" onClose={() => {}} />))
  await user.click(screen.getByRole('button', { name: 'Editar' }))
  await user.type(screen.getByPlaceholderText('Ex: Aplicação SCIT / Avaliação'), ' kept draft')
  await user.click(screen.getByRole('button', { name: 'Confirmar' }))
  expect(await screen.findByText(/Não foi possível carregar o registro atual/)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Confirmar' })).toBeDisabled()
  requests.override({ path: '/appointments/appointment-1', handler: { ...appointment, revision: 4, title: 'Other operator' } })
  await user.click(screen.getByRole('button', { name: 'Recarregar registro atual' }))
  expect(await screen.findByText(/Registro atual: revisão 4/)).toBeInTheDocument()
  expect(screen.getByPlaceholderText('Ex: Aplicação SCIT / Avaliação')).toHaveValue('Original kept draft')
  expect(screen.getByRole('button', { name: 'Confirmar' })).toBeDisabled()
  await user.click(screen.getByRole('button', { name: 'Revisei os dados atuais' }))
  requests.override({ method: 'PATCH', path: '/appointments/appointment-1', handler: { ...appointment, revision: 5 } })
  await user.click(screen.getByRole('button', { name: 'Confirmar' }))
  await waitFor(() => expect(requests.requestsFor('PATCH', '/appointments/appointment-1')).toHaveLength(2))
  expect(requests.requestsFor('PATCH', '/appointments/appointment-1')[1].body).toMatchObject({ expectedRevision: 4, title: 'Original kept draft' })
})
