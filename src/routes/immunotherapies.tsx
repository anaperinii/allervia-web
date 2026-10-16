import { createFileRoute } from '@tanstack/react-router'
import { ImmunotherapiesPage } from '@/features/immunotherapy/immunotherapies-page'
import { RequireCapability } from '@/shared/auth/RequireCapability'

export const Route = createFileRoute('/immunotherapies')({
  component: () => (
    <RequireCapability capability="view_clinical">
      <ImmunotherapiesPage />
    </RequireCapability>
  ),
})
