import { createFileRoute } from '@tanstack/react-router'
import { MigrationPage } from '@/features/protocols/migration-page'
import { RequireCapability } from '@/shared/auth/RequireCapability'

export const Route = createFileRoute('/migration')({
  component: () => (
    <RequireCapability capability="adjust_protocol">
      <MigrationPage />
    </RequireCapability>
  ),
})
