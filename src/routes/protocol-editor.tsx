import { createFileRoute } from '@tanstack/react-router'
import {
  ProtocolEditorPage,
  type ProtocolEditorMode,
} from '@/features/protocols/protocol-editor-page'

type SearchParams = {
  mode: ProtocolEditorMode
  protocolId?: string
  versionId?: string
}

const MODES: ProtocolEditorMode[] = ['create', 'new-version', 'edit-draft']

export const Route = createFileRoute('/protocol-editor')({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    mode: MODES.includes(search.mode as ProtocolEditorMode)
      ? (search.mode as ProtocolEditorMode)
      : 'create',
    protocolId:
      typeof search.protocolId === 'string' ? search.protocolId : undefined,
    versionId:
      typeof search.versionId === 'string' ? search.versionId : undefined,
  }),
  component: ProtocolEditorRoute,
})

function ProtocolEditorRoute() {
  const { mode, protocolId, versionId } = Route.useSearch()
  return (
    <ProtocolEditorPage
      mode={mode}
      protocolId={protocolId}
      versionId={versionId}
    />
  )
}
