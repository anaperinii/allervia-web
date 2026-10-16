import { createFileRoute } from '@tanstack/react-router'
import { ProtocolLabPage } from '@/features/protocols/protocol-lab-page'
import { RequireCapability } from '@/shared/auth/RequireCapability'

type SearchParams = {
  versionId: string
}

export const Route = createFileRoute('/protocol-lab')({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    versionId: typeof search.versionId === 'string' ? search.versionId : '',
  }),
  component: () => (
    <RequireCapability capability="view_protocols">
      <ProtocolLabPage />
    </RequireCapability>
  ),
})
