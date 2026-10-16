import { createFileRoute } from '@tanstack/react-router'
import { AddImmunotherapyPage } from '@/features/immunotherapy/add-immunotherapy-page'
import { RequireCapability } from '@/shared/auth/RequireCapability'

export const Route = createFileRoute('/add-immunotherapy')({
  component: () => (
    <RequireCapability capability="add_immunotherapy">
      <AddImmunotherapyPage />
    </RequireCapability>
  ),
})
