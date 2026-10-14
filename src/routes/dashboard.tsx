import { createFileRoute } from '@tanstack/react-router'
import { DashboardPage } from '@/features/dashboard/dashboard-page'
import { RequireCapability } from '@/shared/auth/RequireCapability'

export const Route = createFileRoute('/dashboard')({
  component: () => (
    <RequireCapability capability="view_dashboard">
      <DashboardPage />
    </RequireCapability>
  ),
})
