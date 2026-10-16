import { createFileRoute } from '@tanstack/react-router'
import { ExportReportPage } from '@/features/dashboard/export-report-page'
import { RequireCapability } from '@/shared/auth/RequireCapability'

export const Route = createFileRoute('/export-report')({
  component: () => (
    <RequireCapability capability="view_dashboard">
      <ExportReportPage />
    </RequireCapability>
  ),
})
