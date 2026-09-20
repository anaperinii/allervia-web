import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { SettingsLayout } from '@/features/settings/components/SettingsLayout'
import { ProtocolEditor } from '@/features/protocols/protocol-editor'
import { EMPTY_DRAFT, validateDraft } from '@/features/protocols/protocol-draft'
import {
  createProtocol,
  createVersion,
  editVersion,
  listProtocols,
  publishVersion,
  readAutomation,
  readVersion,
  retireVersion,
  setDefaultVersion,
  simulateVersion,
  updateAutomation,
} from '@/shared/api/protocols.api'
import type {
  ProtocolDefinitionDraft,
  ProtocolVersion,
  SimulationResult,
  TreatmentProtocol,
} from '@/shared/api/contracts/protocols'
import { PROTOCOL_ERROR_CODES } from '@/shared/api/contracts/protocols'
import { ApiError } from '@/shared/api/contracts/errors'
import { queryKeys } from '@/shared/api/query-keys'
import { useSession } from '@/shared/auth/useSession'
import { useHasPermission } from '@/shared/stores/useUserStore'
import {
  Button,
  FieldLabel,
  Modal,
  Switch,
  TextInput,
} from '@/shared/components'
import { cn } from '@/shared/lib/cn'

const STATUS_VIEW = {
  DRAFT: { label: 'Rascunho', className: 'bg-slate-100 text-slate-600 border-slate-200' },
  PUBLISHED: { label: 'Publicada', className: 'bg-green-50 text-green-700 border-green-200' },
  RETIRED: { label: 'Retirada', className: 'bg-amber-50 text-amber-700 border-amber-200' },
} as const

type ConfirmAction =
  | { type: 'publish'; version: ProtocolVersion }
  | { type: 'default'; version: ProtocolVersion }
  | { type: 'retire'; version: ProtocolVersion }

interface EditorState {
  mode: 'create' | 'new-version' | 'edit-draft'
  protocolId?: string
  versionId?: string
  expectedRevision: number
  name: string
  draft: ProtocolDefinitionDraft
  /** Rascunho recarregado do servidor após um conflito, para comparação. */
  serverDraft?: ProtocolDefinitionDraft
  serverRevision?: number
}

function describe(error: unknown, fallback: string): string {
  if (!(error instanceof ApiError)) return fallback
  if (error.code === PROTOCOL_ERROR_CODES.invalidProtocol) {
    return 'O servidor recusou a definição: revise etapas e transições.'
  }
  return error.message
}

export function ProtocolsPage() {
  const { account } = useSession()
  const organizationId = account?.organization?.id ?? ''
  const queryClient = useQueryClient()
  const canManage = useHasPermission('adjust_protocol')

  const protocolsQuery = useQuery({
    queryKey: queryKeys.protocols(organizationId),
    queryFn: ({ signal }) => listProtocols(signal),
    enabled: organizationId !== '',
  })

  const automationQuery = useQuery({
    queryKey: queryKeys.automation(organizationId),
    queryFn: ({ signal }) => readAutomation(signal),
    enabled: organizationId !== '',
  })

  const [editor, setEditor] = useState<EditorState | null>(null)
  const [editorError, setEditorError] = useState<string | null>(null)
  const [conflict, setConflict] = useState(false)
  const [confirm, setConfirm] = useState<ConfirmAction | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [simulation, setSimulation] = useState<SimulationResult | null>(null)

  const refresh = async () => {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.protocols(organizationId),
    })
    await queryClient.invalidateQueries({
      queryKey: queryKeys.automation(organizationId),
    })
  }

  const saveMutation = useMutation({
    mutationFn: async (state: EditorState) => {
      if (state.mode === 'create') {
        return createProtocol({ name: state.name.trim(), definition: state.draft })
      }
      if (state.mode === 'new-version') {
        return createVersion(state.protocolId!, state.draft)
      }
      return editVersion(state.versionId!, state.expectedRevision, state.draft)
    },
    onSuccess: async () => {
      setEditor(null)
      setEditorError(null)
      setConflict(false)
      await refresh()
    },
    onError: async (error) => {
      // Conflito de revisão: alguém salvou antes. O rascunho local é
      // preservado; o servidor é recarregado só para comparação e para a nova
      // revisão — nada é reenviado por cima sem confirmação.
      if (
        error instanceof ApiError &&
        error.message === PROTOCOL_ERROR_CODES.staleRevision &&
        editor?.versionId
      ) {
        const fresh = await readVersion(editor.versionId)
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
        setEditorError(null)
        return
      }
      setEditorError(describe(error, 'Não foi possível salvar o rascunho.'))
    },
  })

  const confirmMutation = useMutation({
    mutationFn: (action: ConfirmAction) => {
      if (action.type === 'publish') {
        return publishVersion(action.version.id, action.version.revision)
      }
      if (action.type === 'default') {
        return setDefaultVersion(action.version.id, action.version.revision)
      }
      return retireVersion(action.version.id, action.version.revision)
    },
    onSuccess: async () => {
      setConfirm(null)
      setActionError(null)
      await refresh()
    },
    onError: (error) => {
      setConfirm(null)
      setActionError(describe(error, 'Não foi possível concluir a ação.'))
    },
  })

  const automationMutation = useMutation({
    mutationFn: (input: { enabled: boolean; timeZone: string }) =>
      updateAutomation(input),
    onSuccess: refresh,
    onError: (error) =>
      setActionError(describe(error, 'Não foi possível salvar a automação.')),
  })

  const simulateMutation = useMutation({
    mutationFn: async (version: ProtocolVersion) => {
      const definition = version.definition
      const firstStep = definition.steps[0]
      const lastStep = definition.steps[definition.steps.length - 1]
      // Simulação de ponta a ponta: começa na primeira etapa e administra o
      // valor configurado; o motor responde a sucessora real.
      return simulateVersion(version.id, {
        prescription: {
          protocolId: version.protocolId,
          protocolVersionId: version.id,
          route: definition.route,
          stepIds: definition.steps.map((step) => step.id),
          startingStepId: firstStep.id,
          targetStepId: lastStep.id,
        },
        administered: {
          route: definition.route,
          volumeUnit: definition.volumeUnit,
          concentrationUnit: definition.concentrationUnit,
          concentration: firstStep.concentration,
          volume: firstStep.volume,
          intervalDays: firstStep.intervalDays,
        },
        stepId: firstStep.id,
      })
    },
    onSuccess: (result) => setSimulation(result),
    onError: (error) =>
      setActionError(describe(error, 'Não foi possível simular a versão.')),
  })

  const protocols = protocolsQuery.data ?? []
  const defaults = automationQuery.data?.defaults ?? []
  const defaultVersionIds = new Set(defaults.map((item) => item.versionId))

  const openEditor = (state: EditorState) => {
    setEditor(state)
    setEditorError(null)
    setConflict(false)
  }

  const draftProblems = editor ? validateDraft(editor.draft) : []

  return (
    <SettingsLayout subtitle="Protocolos de Imunoterapia">
      <div className="flex flex-col gap-4">
        {!canManage && (
          <p className="rounded-lg border border-(--border-custom) bg-gray-50 px-3 py-2 text-[0.7rem] text-(--text-muted)">
            Você pode consultar o catálogo. A configuração de protocolos é uma
            capacidade clínica concedida a médicos.
          </p>
        )}

        {(protocolsQuery.error || actionError) && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[0.7rem] text-red-700"
          >
            {actionError ??
              describe(protocolsQuery.error, 'Não foi possível carregar o catálogo.')}
          </div>
        )}

        <section className="rounded-2xl border border-(--border-custom) bg-[#F6F8F8] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-(--border-custom) bg-gray-50/50">
            <h2 className="text-xs font-bold text-(--text)">Automação da recomendação</h2>
          </div>
          <div className="p-4 flex flex-wrap items-end gap-4">
            {automationQuery.isPending ? (
              <span className="text-xs text-(--text-muted)">Carregando…</span>
            ) : automationQuery.data ? (
              <>
                <FieldLabel label="Recomendação automática">
                  <Switch
                    checked={automationQuery.data.enabled}
                    disabled={!canManage || automationMutation.isPending}
                    onChange={(checked) =>
                      automationMutation.mutate({
                        enabled: checked,
                        timeZone: automationQuery.data!.timeZone,
                      })
                    }
                    aria-label="Recomendação automática"
                  />
                </FieldLabel>
                <FieldLabel label="Fuso clínico das previsões">
                  <TextInput
                    value={automationQuery.data.timeZone}
                    readOnly
                    className="w-56 text-(--text-muted)"
                  />
                </FieldLabel>
                <p className="basis-full text-[0.65rem] leading-relaxed text-(--text-muted)">
                  A automação calcula a sucessora recomendada após cada
                  aplicação. Desligá-la não restaura fluxos antigos: a
                  aplicação continua registrando pelo servidor. O fuso é
                  alterado junto da organização, em Configurações.
                </p>
              </>
            ) : null}
          </div>
        </section>

        <section className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-(--text)">Catálogo</h2>
          {canManage && (
            <Button
              tone="brand"
              variant="solid"
              prominent
              onClick={() =>
                openEditor({
                  mode: 'create',
                  expectedRevision: 0,
                  name: '',
                  draft: {
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
                  },
                })
              }
            >
              Novo protocolo
            </Button>
          )}
        </section>

        {protocolsQuery.isPending ? (
          <p className="text-xs text-(--text-muted)">Carregando catálogo…</p>
        ) : protocols.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-(--border-custom) bg-white p-8 text-center">
            <p className="text-xs font-semibold text-(--text)">
              Nenhum protocolo configurado
            </p>
            <p className="mt-1 text-[0.7rem] text-(--text-muted)">
              Novas prescrições dependem de uma versão publicada e definida como
              padrão. {canManage ? 'Crie o primeiro protocolo acima.' : 'Um médico da organização precisa configurá-lo.'}
            </p>
          </div>
        ) : (
          protocols.map((protocol: TreatmentProtocol) => (
            <div
              key={protocol.id}
              className="rounded-2xl border border-(--border-custom) bg-white overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-(--border-custom) bg-gray-50/50">
                <div>
                  <h3 className="text-xs font-bold text-(--text)">{protocol.name}</h3>
                  <p className="text-[0.65rem] text-(--text-muted)">
                    Via subcutânea · {protocol.versions.length}{' '}
                    {protocol.versions.length === 1 ? 'versão' : 'versões'}
                  </p>
                </div>
                {canManage && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const latest = protocol.versions[0]
                      openEditor({
                        mode: 'new-version',
                        protocolId: protocol.id,
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
                    }}
                  >
                    Nova versão
                  </Button>
                )}
              </div>
              <ul>
                {protocol.versions.map((version) => {
                  const status = STATUS_VIEW[version.status]
                  const isDefault = defaultVersionIds.has(version.id)
                  return (
                    <li
                      key={version.id}
                      className="flex flex-wrap items-center gap-2 px-4 py-2.5 border-b border-(--border-custom) last:border-0"
                    >
                      <span className="text-xs font-semibold text-(--text)">
                        v{version.number}
                      </span>
                      <span
                        className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded-md text-[0.65rem] font-semibold border',
                          status.className,
                        )}
                      >
                        {status.label}
                      </span>
                      {isDefault && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[0.65rem] font-semibold border bg-brand-50 text-brand-dark border-brand/30">
                          Padrão para novas prescrições
                        </span>
                      )}
                      <span className="text-[0.65rem] text-(--text-muted)">
                        {version.definition.steps.length} etapas
                      </span>
                      <div className="ml-auto flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => simulateMutation.mutate(version)}
                          disabled={version.definition.steps.length === 0}
                        >
                          Simular
                        </Button>
                        {canManage && version.status === 'DRAFT' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                openEditor({
                                  mode: 'edit-draft',
                                  versionId: version.id,
                                  expectedRevision: version.revision,
                                  name: protocol.name,
                                  draft: JSON.parse(
                                    JSON.stringify({
                                      ...EMPTY_DRAFT,
                                      steps: version.definition.steps,
                                    }),
                                  ) as ProtocolDefinitionDraft,
                                })
                              }
                            >
                              Editar rascunho
                            </Button>
                            <Button
                              tone="brand"
                              variant="solid"
                              size="sm"
                              onClick={() => setConfirm({ type: 'publish', version })}
                            >
                              Publicar
                            </Button>
                          </>
                        )}
                        {canManage && version.status === 'PUBLISHED' && (
                          <>
                            {!isDefault && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setConfirm({ type: 'default', version })}
                              >
                                Tornar padrão
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              tone="danger"
                              size="sm"
                              onClick={() => setConfirm({ type: 'retire', version })}
                            >
                              Retirar
                            </Button>
                          </>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))
        )}
      </div>

      <Modal
        open={editor !== null}
        onClose={() => setEditor(null)}
        size="lg"
        title={
          editor?.mode === 'create'
            ? 'Novo protocolo'
            : editor?.mode === 'new-version'
              ? `Nova versão — ${editor.name}`
              : `Editar rascunho — ${editor?.name ?? ''}`
        }
        footer={
          <>
            <Button variant="outline" onClick={() => setEditor(null)}>
              Cancelar
            </Button>
            <Button
              tone="brand"
              variant="solid"
              disabled={
                !editor ||
                saveMutation.isPending ||
                conflict ||
                draftProblems.length > 0 ||
                (editor.mode === 'create' && editor.name.trim().length === 0)
              }
              onClick={() => editor && saveMutation.mutate(editor)}
            >
              Salvar rascunho
            </Button>
          </>
        }
      >
        {editor && (
          <div className="flex flex-col gap-3">
            {editor.mode === 'create' && (
              <FieldLabel label="Nome do protocolo">
                <TextInput
                  value={editor.name}
                  onChange={(e) =>
                    setEditor({ ...editor, name: e.target.value })
                  }
                  placeholder="Ex.: SCIT ácaros — padrão da clínica"
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
                      // Mantém o rascunho local e assume a revisão nova: o
                      // próximo salvar sobrescreve conscientemente.
                      setEditor({
                        ...editor,
                        expectedRevision: editor.serverRevision ?? editor.expectedRevision,
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

            {editorError && (
              <p role="alert" className="text-[0.7rem] text-red-700">
                {editorError}
              </p>
            )}
          </div>
        )}
      </Modal>

      <Modal
        open={confirm !== null}
        onClose={() => setConfirm(null)}
        size="sm"
        title={
          confirm?.type === 'publish'
            ? 'Publicar versão'
            : confirm?.type === 'default'
              ? 'Definir versão padrão'
              : 'Retirar versão'
        }
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirm(null)}>
              Cancelar
            </Button>
            <Button
              tone={confirm?.type === 'retire' ? 'danger' : 'brand'}
              variant="solid"
              disabled={confirmMutation.isPending}
              onClick={() => confirm && confirmMutation.mutate(confirm)}
            >
              Confirmar
            </Button>
          </>
        }
      >
        <p className="text-xs text-(--text-muted) leading-relaxed">
          {confirm?.type === 'publish' && (
            <>
              Publicar congela a definição da v{confirm.version.number}: ela não
              poderá mais ser editada. Publicar não a torna padrão nem altera
              tratamentos existentes.
            </>
          )}
          {confirm?.type === 'default' && (
            <>
              Novas prescrições da via subcutânea passarão a partir da v
              {confirm.version.number}. Tratamentos existentes conservam a
              versão fixada na própria prescrição.
            </>
          )}
          {confirm?.type === 'retire' && (
            <>
              Retirar impede novas prescrições com a v{confirm.version.number}.
              Tratamentos já vinculados continuam lendo a definição adotada.
            </>
          )}
        </p>
      </Modal>

      <Modal
        open={simulation !== null}
        onClose={() => setSimulation(null)}
        size="sm"
        title="Simulação da primeira transição"
        footer={
          <Button variant="outline" onClick={() => setSimulation(null)}>
            Fechar
          </Button>
        }
      >
        {simulation?.kind === 'RECOMMENDED' && (
          <p className="text-xs text-(--text-muted) leading-relaxed">
            Após administrar a primeira etapa, o motor recomenda{' '}
            <span className="font-semibold text-(--text)">{simulation.label}</span>{' '}
            (1:{Number(simulation.values.concentration).toLocaleString('pt-BR')} ·{' '}
            {simulation.values.volume.replace('.', ',')} mL · a cada{' '}
            {simulation.values.intervalDays} dias).
          </p>
        )}
        {simulation?.kind === 'END_OF_SEQUENCE' && (
          <p className="text-xs text-(--text-muted) leading-relaxed">
            A primeira etapa não tem sucessora automática: fim de sequência não
            é encerramento clínico, apenas ausência de recomendação.
          </p>
        )}
        {simulation?.kind === 'UNRESOLVED' && (
          <p className="text-xs text-red-700 leading-relaxed">
            O motor não resolveu a transição ({simulation.code}). Revise etapas
            e valores antes de publicar.
          </p>
        )}
      </Modal>
    </SettingsLayout>
  )
}
