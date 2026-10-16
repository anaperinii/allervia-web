import { createFileRoute } from '@tanstack/react-router'
import { ProtocolsPage } from '@/features/protocols/protocols-page'
import { RequireCapability } from '@/shared/auth/RequireCapability'

export const Route = createFileRoute('/protocols')({
  component: () => (
    <RequireCapability capability="view_protocols">
      <ProtocolsPage />
    </RequireCapability>
  ),
})
