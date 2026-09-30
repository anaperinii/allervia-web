import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { SettingsLayout } from '@/features/settings/components/SettingsLayout'
import { ProgressionViewer } from '@/features/protocols/components/ProgressionViewer'
import { AutomationCard } from '@/features/protocols/components/AutomationCard'
import {
  discardDraftVersion,
  listProtocols,
  publishVersion,
  readAutomation,
  retireVersion,
  setDefaultVersion,
  updateAutomation,
} from '@/shared/api/protocols.api'
import type {
  ProtocolVersion,
  TreatmentProtocol,
} from '@/shared/api/contracts/protocols'
import { PROTOCOL_ERROR_CODES } from '@/shared/api/contracts/protocols'
import { ApiError } from '@/shared/api/contracts/errors'
import { queryKeys } from '@/shared/api/query-keys'
import { useSession } from '@/shared/auth/useSession'
import { useHasPermission } from '@/shared/stores/useUserStore'
import { Button, Modal, TextInput } from '@/shared/components'
import { faMagnifyingGlass, faPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
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
  | { type: 'discard'; version: ProtocolVersion; isOnlyVersion: boolean }

interface ProgressionTarget {
  protocolName: string
  version: ProtocolVersion
}

function describe(error: unknown, fallback: string): string {
  if (!(error instanceof ApiError)) return fallback
  if (error.code === PROTOCOL_ERROR_CODES.invalidProtocol) {
    return 'O servidor recusou a definição: revise etapas e transições.'
  }
  return error.message
}

export function ProtocolsPage() {
  const navigate = useNavigate()
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

  const [confirm, setConfirm] = useState<ConfirmAction | null>(null)
  const [progression, setProgression] = useState<ProgressionTarget | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const refresh = async () => {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.protocols(organizationId),
    })
    await queryClient.invalidateQueries({
      queryKey: queryKeys.automation(organizationId),
    })
  }

  const confirmMutation = useMutation({
    mutationFn: async (action: ConfirmAction): Promise<void> => {
      if (action.type === 'publish') {
        await publishVersion(action.version.id, action.version.revision)
        return
      }
      if (action.type === 'default') {
        await setDefaultVersion(action.version.id, action.version.revision)
        return
      }
      if (action.type === 'discard') {
        await discardDraftVersion(action.version.id, action.version.revision)
        return
      }
      await retireVersion(action.version.id, action.version.revision)
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

  const allProtocols = protocolsQuery.data ?? []
  const term = search.trim().toLowerCase()
  const protocols = term
    ? allProtocols.filter((protocol: TreatmentProtocol) =>
        protocol.name.toLowerCase().includes(term),
      )
    : allProtocols
  const defaults = automationQuery.data?.defaults ?? []
  const defaultVersionIds = new Set(defaults.map((item) => item.versionId))

  return (
    <SettingsLayout subtitle="Protocolos de Imunoterapia">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
        <section className="flex flex-wrap items-center gap-3">
          <h2 className="text-sm font-bold text-(--text)">Catálogo</h2>
          <div className="relative ml-auto min-w-45 flex-1 sm:max-w-64">
            <label htmlFor="protocol-search" className="sr-only">
              Pesquisar protocolo
            </label>
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="absolute left-2.5 top-1/2 z-10 -translate-y-1/2 text-(--text-muted)"
              style={{ fontSize: 14 }}
            />
            <TextInput
              id="protocol-search"
              placeholder="Pesquisar por nome"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-8"
            />
          </div>
          {canManage && (
            <Button
              tone="brand"
              variant="solid"
              prominent
              onClick={() =>
                void navigate({
                  to: '/protocol-editor',
                  search: { mode: 'create' },
                })
              }
            >
              Novo protocolo
            </Button>
          )}
        </section>

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

        {protocolsQuery.isPending ? (
          <p className="text-xs text-(--text-muted)">Carregando catálogo…</p>
        ) : protocols.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-(--border-custom) bg-white p-8 text-center">
            {term ? (
              <>
                <p className="text-xs font-semibold text-(--text)">
                  Nenhum protocolo encontrado
                </p>
                <p className="mt-1 text-[0.7rem] text-(--text-muted)">
                  Nenhum nome do catálogo corresponde a “{search.trim()}”.
                </p>
              </>
            ) : (
              <>
                <p className="text-xs font-semibold text-(--text)">
                  Nenhum protocolo configurado
                </p>
                <p className="mt-1 text-[0.7rem] text-(--text-muted)">
                  Novas prescrições dependem de uma versão publicada e definida como
                  padrão. {canManage ? 'Crie o primeiro protocolo acima.' : 'Um médico da organização precisa configurá-lo.'}
                </p>
              </>
            )}
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
                    className="border-[#12333a]/40 text-[#12333a] hover:border-[#12333a]/70 hover:bg-[#12333a]/6"
                    leftIcon={
                      <FontAwesomeIcon icon={faPlus} style={{ fontSize: 11 }} />
                    }
                    onClick={() =>
                      void navigate({
                        to: '/protocol-editor',
                        search: { mode: 'new-version', protocolId: protocol.id },
                      })
                    }
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
                      className="flex flex-wrap items-center gap-2 px-4 py-2.5 border-b border-(--border-custom) last:border-0 bg-white"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setProgression({
                            protocolName: protocol.name,
                            version,
                          })
                        }
                        aria-label={`Ver progressão da versão ${version.number} de ${protocol.name}`}
                        className="group flex flex-1 flex-wrap items-center gap-2 text-left cursor-pointer rounded-md -m-1 p-1 transition-colors hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                      >
                        <span className="text-xs font-semibold text-(--text) group-hover:text-brand-dark transition-colors">
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
                        <span className="text-[0.65rem] font-semibold text-brand opacity-0 transition-opacity group-hover:opacity-100">
                          Ver progressão
                        </span>
                      </button>
                      <div className="ml-auto flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            void navigate({
                              to: '/protocol-lab',
                              search: { versionId: version.id },
                            })
                          }
                          disabled={version.definition.steps.length === 0}
                        >
                          Simular fluxo
                        </Button>
                        {canManage && version.status === 'DRAFT' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                void navigate({
                                  to: '/protocol-editor',
                                  search: {
                                    mode: 'edit-draft',
                                    versionId: version.id,
                                  },
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
                            <Button
                              variant="outline"
                              tone="danger"
                              size="sm"
                              onClick={() =>
                                setConfirm({
                                  type: 'discard',
                                  version,
                                  isOnlyVersion: protocol.versions.length === 1,
                                })
                              }
                            >
                              Excluir rascunho
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

        <aside className="w-full lg:sticky lg:top-0 lg:w-72 lg:shrink-0">
          <AutomationCard
            enabled={automationQuery.data?.enabled ?? false}
            loading={automationQuery.isPending || !automationQuery.data}
            saving={automationMutation.isPending}
            canManage={canManage}
            onToggle={(enabled) =>
              automationMutation.mutate({
                enabled,
                timeZone: automationQuery.data!.timeZone,
              })
            }
          />
        </aside>
      </div>

      <ProgressionViewer
        open={progression !== null}
        onClose={() => setProgression(null)}
        protocolName={progression?.protocolName ?? ''}
        version={progression?.version ?? null}
        isDefault={
          progression ? defaultVersionIds.has(progression.version.id) : false
        }
      />

      <Modal
        open={confirm !== null}
        onClose={() => setConfirm(null)}
        size="sm"
        title={
          confirm?.type === 'publish'
            ? 'Publicar versão'
            : confirm?.type === 'default'
              ? 'Definir versão padrão'
              : confirm?.type === 'discard'
                ? 'Excluir rascunho'
                : 'Retirar versão'
        }
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirm(null)}>
              Cancelar
            </Button>
            <Button
              tone={
                confirm?.type === 'retire' || confirm?.type === 'discard'
                  ? 'danger'
                  : 'brand'
              }
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
          {confirm?.type === 'discard' && (
            <>
              A v{confirm.version.number} será apagada e não poderá ser
              recuperada. Rascunho nunca foi prescrito, então nenhum tratamento
              é afetado.
              {confirm.isOnlyVersion && (
                <>
                  {' '}
                  Como é a única versão deste protocolo, o protocolo inteiro sai
                  do catálogo.
                </>
              )}
            </>
          )}
        </p>
      </Modal>

    </SettingsLayout>
  )
}
