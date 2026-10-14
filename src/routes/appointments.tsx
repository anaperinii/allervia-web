import { createFileRoute } from '@tanstack/react-router'
import { AppointmentsPage } from '@/features/scheduling/appointments-page'
import { RequireCapability } from '@/shared/auth/RequireCapability'

export const Route = createFileRoute('/appointments')({
  component: () => (
    <RequireCapability capability="view_appointments">
      <AppointmentsPage />
    </RequireCapability>
  ),
})
