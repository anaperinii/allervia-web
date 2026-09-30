import { createFileRoute } from '@tanstack/react-router'
import { ProtocolLabPage } from '@/features/protocols/protocol-lab-page'

type SearchParams = {
  versionId: string
}

export const Route = createFileRoute('/protocol-lab')({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    versionId: typeof search.versionId === 'string' ? search.versionId : '',
  }),
  component: ProtocolLabPage,
})
