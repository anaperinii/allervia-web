import { createFileRoute } from '@tanstack/react-router'
import { ProtocolsPage } from '@/features/protocols/protocols-page'

export const Route = createFileRoute('/protocols')({
  component: ProtocolsPage,
})
