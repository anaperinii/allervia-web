import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { SettingsLayout } from '@/features/settings/components/SettingsLayout'
import { ProtocolEditor } from '@/features/protocols/protocol-editor'
import { DraftFlowPreview } from '@/features/protocols/components/lab/DraftFlowPreview'
import { EMPTY_DRAFT, validateDraft } from '@/features/protocols/protocol-draft'
import {
  createProtocol,
  createVersion,
  editVersion,
  listProtocols,
  readVersion,
} from '@/shared/api/protocols.api'
import type { ProtocolDefinitionDraft } from '@/shared/api/contracts/protocols'
import { PROTOCOL_ERROR_CODES } from '@/shared/api/contracts/protocols'
import { ApiError } from '@/shared/api/contracts/errors'
import { queryKeys } from '@/shared/api/query-keys'
import { useSession } from '@/shared/auth/useSession'
import { useHasPermission } from '@/shared/stores/useUserStore'
import { Button, FieldLabel, TextInput } from '@/shared/components'

export type ProtocolEditorMode = 'create' | 'new-version' | 'edit-draft'

interface ProtocolEditorPageProps {
  mode: ProtocolEditorMode
  protocolId?: string
  versionId?: string
}

interface EditorState {
  expectedRevision: number
  name: string
  draft: ProtocolDefinitionDraft
  serverDraft?: ProtocolDefinitionDraft
  serverRevision?: number
}

const STARTER_DRAFT: ProtocolDefinitionDraft = {
  ...EMPTY_DRAFT,
  steps: [
    {
      id: 'inicio',
      label: 'Início',
      phase: 'BUILD_UP',
      concentration: '1000',
      volume: '0.1',
      intervalDays: 7,
      nextStepId: null,
    },
  ],
}

function describe(error: unknown, fallback: string): string {
  if (!(error instanceof ApiError)) return fallback
  if (error.code === PROTOCOL_ERROR_CODES.invalidProtocol) {
    return 'O servidor recusou a definição: revise etapas e transições.'
  }
  return error.message
}

const TITLES: Record<ProtocolEditorMode, string> = {
  create: 'Novo protocolo',
  'new-version': 'Nova versão',
  'edit-draft': 'Editar rascunho',
}

export function ProtocolEditorPage({
  mode,
  protocolId,
  versionId,
}: ProtocolEditorPageProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { account } = useSession()
  const organizationId = account?.organization?.id ?? ''
  const canManage = useHasPermission('adjust_protocol')

  const protocolsQuery = useQuery({
    queryKey: queryKeys.protocols(organizationId),
    queryFn: ({ signal }) => listProtocols(signal),
    enabled: organizationId !== '' && mode !== 'create',
  })

  const versionQuery = useQuery({
    queryKey: queryKeys.protocolVersion(organizationId, versionId ?? ''),
    queryFn: ({ signal }) => readVersion(versionId!, signal),
    enabled:
      organizationId !== '' && mode === 'edit-draft' && Boolean(versionId),
  })

  const [editor, setEditor] = useState<EditorState | null>(
    mode === 'create'
      ? { expectedRevision: 0, name: '', draft: STARTER_DRAFT }
      : null,
  )
  const [conflict, setConflict] = useState(false)

  useEffect(() => {
    if (editor || mode === 'create') return
    if (mode === 'new-version') {
      const protocol = protocolsQuery.data?.find(
        (item) => item.id === protocolId,
      )
      if (!protocol) return
      const latest = protocol.versions[0]
      setEditor({
        expectedRevision: 0,
        name: protocol.name,
        draft: latest
          ? (JSON.parse(
              JSON.stringify({
                ...EMPTY_DRAFT,
                steps: latest.definition.steps,
              }),
            ) as ProtocolDefinitionDraft)
          : EMPTY_DRAFT,
      })
      return
    }
    const version = versionQuery.data
    if (!version) return
    const protocol = protocolsQuery.data?.find(
      (item) => item.id === version.protocolId,
    )
    setEditor({
      expectedRevision: version.revision,
      name: protocol?.name ?? '',
      draft: JSON.parse(
        JSON.stringify({ ...EMPTY_DRAFT, steps: version.definition.steps }),
      ) as ProtocolDefinitionDraft,
    })
  }, [editor, mode, protocolId, protocolsQuery.data, versionQuery.data])

  const leave = () => void navigate({ to: '/protocols' })

  const saveMutation = useMutation({
    mutationFn: async (state: EditorState) => {
      if (mode === 'create') {
        return createProtocol({ name: state.name.trim(), definition: state.draft })
      }
      if (mode === 'new-version') {
        return createVersion(protocolId!, state.draft)
      }
      return editVersion(versionId!, state.expectedRevision, state.draft)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.protocols(organizationId),
      })
      leave()
    },
    onError: async (error) => {
      if (
        error instanceof ApiError &&
        error.code === PROTOCOL_ERROR_CODES.staleRevision &&
        versionId
      ) {
        const fresh = await readVersion(versionId)
        setEditor((current) =>
          current
            ? {
                ...current,
                serverDraft: fresh.definition,
                serverRevision: fresh.revision,
              }
            : current,
        )
        setConflict(true)
        return
      }
    },
  })

  const loadFailure = protocolsQuery.error ?? versionQuery.error
  const missingTarget =
    (mode === 'new-version' &&
      protocolsQuery.isSuccess &&
      !protocolsQuery.data.some((item) => item.id === protocolId)) ||
    (mode === 'edit-draft' && !versionId)

  const draftProblems = editor ? validateDraft(editor.draft) : []
  const subtitle =
    mode === 'create' || !editor?.name
      ? TITLES[mode]
      : `${TITLES[mode]} — ${editor.name}`

  return (
    <SettingsLayout subtitle={subtitle}>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-4 xl:max-w-3xl">
        {!canManage && (
          <p className="rounded-lg border border-(--border-custom) bg-gray-50 px-3 py-2 text-[0.7rem] text-(--text-muted)">
            Você pode consultar esta definição, mas não pode salvá-la.
          </p>
        )}

        {(loadFailure || missingTarget) && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[0.7rem] text-red-700"
          >
            {missingTarget
              ? 'Protocolo não encontrado. Volte ao catálogo e tente novamente.'
              : describe(loadFailure, 'Não foi possível carregar o protocolo.')}
          </div>
        )}

        {!editor && !loadFailure && !missingTarget && (
          <p className="text-xs text-(--text-muted)">Carregando definição…</p>
        )}

        {editor && (
          <>
            {mode === 'create' && (
              <FieldLabel label="Nome do protocolo">
                <TextInput
                  value={editor.name}
                  onChange={(e) => setEditor({ ...editor, name: e.target.value })}
                  placeholder="Ex.: SCIT ácaros — padrão da clínica"
                  className="max-w-md"
                />
              </FieldLabel>
            )}

            {conflict && (
              <div
                role="alert"
                className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-[0.7rem] text-amber-800"
              >
                <p className="font-semibold">
                  Outra pessoa salvou este rascunho enquanto você editava.
                </p>
                <p className="mt-1">
                  Seu rascunho local foi preservado abaixo para comparação. A
                  versão do servidor agora tem{' '}
                  {editor.serverDraft?.steps.length ?? '?'} etapas (revisão{' '}
                  {editor.serverRevision}). Escolha como seguir:
                </p>
                <div className="mt-2 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditor({
                        ...editor,
                        draft: editor.serverDraft ?? editor.draft,
                        expectedRevision:
                          editor.serverRevision ?? editor.expectedRevision,
                        serverDraft: undefined,
                        serverRevision: undefined,
                      })
                      setConflict(false)
                    }}
                  >
                    Descartar o meu e usar o do servidor
                  </Button>
                  <Button
                    tone="brand"
                    variant="solid"
                    size="sm"
                    onClick={() => {
                      setEditor({
                        ...editor,
                        expectedRevision:
                          editor.serverRevision ?? editor.expectedRevision,
                        serverDraft: undefined,
                        serverRevision: undefined,
                      })
                      setConflict(false)
                    }}
                  >
                    Manter o meu e sobrescrever
                  </Button>
                </div>
              </div>
            )}

            <ProtocolEditor
              draft={editor.draft}
              readOnly={!canManage}
              onChange={(draft) => setEditor({ ...editor, draft })}
            />

            {draftProblems.length > 0 && (
              <ul className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[0.7rem] text-red-700 list-disc list-inside">
                {draftProblems.map((problem) => (
                  <li key={problem}>{problem}</li>
                ))}
              </ul>
            )}

            <div className="flex items-center justify-end gap-2 border-t border-(--border-custom) pt-4">
              <Button variant="outline" onClick={leave}>
                Cancelar
              </Button>
              <Button
                tone="brand"
                variant="solid"
                disabled={
                  !canManage ||
                  saveMutation.isPending ||
                  conflict ||
                  draftProblems.length > 0 ||
                  (mode === 'create' && editor.name.trim().length === 0)
                }
                onClick={() => saveMutation.mutate(editor)}
              >
                Salvar rascunho
              </Button>
            </div>
          </>
        )}
        </div>

        {editor && (
          <aside className="w-full xl:sticky xl:top-0 xl:w-[34rem] xl:shrink-0">
            <DraftFlowPreview steps={editor.draft.steps} perRow={3} />
          </aside>
        )}
      </div>
    </SettingsLayout>
  )
}
