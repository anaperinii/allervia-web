import { createFileRoute } from '@tanstack/react-router'
import { TeamsPage } from '@/features/settings/teams-page'
import { RequireCapability } from '@/shared/auth/RequireCapability'

export const Route = createFileRoute('/teams')({
  component: () => (
    <RequireCapability capability="manage_team">
      <TeamsPage />
    </RequireCapability>
  ),
})
