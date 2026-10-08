import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cn } from '@/shared/lib/cn'
import { Button, FieldLabel, Modal, showApiErrorToast, TextInput, toast } from '@/shared/components'
import { MediaRow } from '@/features/settings/components/MediaRow'
import { SettingsLayout } from '@/features/settings/components/SettingsLayout'
import { EnrollMfaFactorModal } from '@/features/settings/components/EnrollMfaFactorModal'
import { ReauthenticateModal } from '@/features/settings/components/ReauthenticateModal'
import { RecoveryCodesModal } from '@/features/settings/components/RecoveryCodesModal'
import {
  listDevices,
  listMfaFactors,
  regenerateRecoveryCodes,
  revokeDevice,
  revokeMfaFactor,
} from '@/shared/api/auth.api'
import { ApiError, API_ERROR_CODES } from '@/shared/api/contracts/errors'
import { queryKeys } from '@/shared/api/query-keys'
import { useSession } from '@/shared/auth/useSession'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCheck,
  faChevronRight,
  faEye,
  faFileArrowDown,
  faLock,
  faMobileScreen,
  faPlus,
  faRightFromBracket,
  faShieldHalved,
  faTrashCan,
  faUserXmark,
} from '@fortawesome/free-solid-svg-icons'

function describeUserAgent(userAgent: string | null): string {
  if (!userAgent) return 'Dispositivo desconhecido'
  const browser = /Edg\//.test(userAgent)
    ? 'Edge'
    : /Firefox\//.test(userAgent)
      ? 'Firefox'
      : /Chrome\//.test(userAgent)
        ? 'Chrome'
        : /Safari\//.test(userAgent)
          ? 'Safari'
          : 'Navegador'
  const system = /Windows/.test(userAgent)
    ? 'Windows'
    : /Mac OS X|Macintosh/.test(userAgent)
      ? 'macOS'
      : /Android/.test(userAgent)
        ? 'Android'
        : /iPhone|iPad|iOS/.test(userAgent)
          ? 'iOS'
          : /Linux/.test(userAgent)
            ? 'Linux'
            : 'Sistema desconhecido'
  return `${browser} · ${system}`
}

function describeActivity(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function SecurityPage() {
  const queryClient = useQueryClient()
  const { account, refresh } = useSession()
  const mfaEnabled = account?.security.mfaEnabled ?? false

  const [showEnrollModal, setShowEnrollModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [revokeFactorTarget, setRevokeFactorTarget] = useState<string | null>(null)
  const [revokeSessionTarget, setRevokeSessionTarget] = useState<string | null>(null)
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null)
  const [pendingAction, setPendingAction] = useState<(() => Promise<void>) | null>(null)

  const factorsQuery = useQuery({
    queryKey: queryKeys.mfaFactors(),
    queryFn: ({ signal }) => listMfaFactors(signal),
  })

  const devicesQuery = useQuery({
    queryKey: queryKeys.devices(),
    queryFn: ({ signal }) => listDevices(signal),
  })

  const invalidateMfaState = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.mfaFactors() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.devices() }),
      refresh(),
    ])
  }

  const runSensitive = async (action: () => Promise<void>) => {
    try {
      await action()
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.code === API_ERROR_CODES.reauthenticationRequired
      ) {
        setPendingAction(() => action)
        return
      }
      showApiErrorToast(error)
    }
  }

  const revokeFactor = async (credentialId: string) => {
    await revokeMfaFactor(credentialId)
    setRevokeFactorTarget(null)
    await invalidateMfaState()
    toast.success({
      icon: <FontAwesomeIcon icon={faCheck} style={{ fontSize: 14 }} />,
      title: 'Fator de autenticação removido',
      position: 'top-right',
      compact: true,
      autoDismissMs: 3000,
    })
  }

  const regenerateCodes = async () => {
    const result = await regenerateRecoveryCodes()
    setRecoveryCodes(result.recoveryCodes)
    await queryClient.invalidateQueries({ queryKey: queryKeys.mfaFactors() })
  }

  const revokeSessionMutation = useMutation({
    mutationFn: revokeDevice,
    onSuccess: async () => {
      setRevokeSessionTarget(null)
      await queryClient.invalidateQueries({ queryKey: queryKeys.devices() })
      toast.success({
        icon: <FontAwesomeIcon icon={faCheck} style={{ fontSize: 14 }} />,
        title: 'Sessão encerrada',
        position: 'top-right',
        compact: true,
        autoDismissMs: 3000,
      })
    },
    onError: (error) => showApiErrorToast(error),
  })

  const factors = factorsQuery.data?.factors.filter((f) => f.confirmed) ?? []
  const recoveryCodesRemaining = factorsQuery.data?.recoveryCodesRemaining ?? 0
  const devices = devicesQuery.data ?? []

  return (
    <SettingsLayout subtitle="Segurança e Privacidade">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        <section className="lg:col-span-2 border border-(--border-custom) rounded-xl overflow-hidden bg-[#F6F8F8]">
          <div className="px-4 py-3 border-b border-(--border-custom) bg-gray-50/50">
            <h2 className="text-xs font-bold text-(--text)">Autenticação</h2>
          </div>
          <div className="p-4 space-y-3">
            <MediaRow
              icon={<FontAwesomeIcon icon={faLock} style={{ fontSize: 14 }} />}
              title="Alterar senha"
              description="Atualize sua senha de acesso"
              trailing={
                <Button variant="outline" size="sm" rightIcon={<FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 12 }} />} onClick={() => setShowPasswordModal(true)}>
                  Alterar
                </Button>
              }
            />
            <div className="border-t border-(--border-custom)" />
            <MediaRow
              icon={<FontAwesomeIcon icon={faMobileScreen} style={{ fontSize: 14 }} />}
              title="Aplicativo autenticador"
              description={
                mfaEnabled
                  ? 'Sua conta exige um código do aplicativo a cada login'
                  : 'Proteja sua conta com códigos gerados pelo seu celular'
              }
              trailing={
                <div className="flex items-center gap-2">
                  {mfaEnabled && (
                    <span className="text-[0.55rem] font-medium text-green-600 bg-green-50 px-1.5 py-px rounded-full">
                      Ativa
                    </span>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<FontAwesomeIcon icon={faPlus} style={{ fontSize: 10 }} />}
                    onClick={() => setShowEnrollModal(true)}
                  >
                    Adicionar fator
                  </Button>
                </div>
              }
            />

            {factorsQuery.isLoading && (
              <div className="text-[0.65rem] text-(--text-muted)">Carregando fatores…</div>
            )}

            {factors.map((factor) => (
              <div key={factor.id}>
                <div className="border-t border-(--border-custom)" />
                <div className="pt-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0 bg-brand-50">
                      <FontAwesomeIcon icon={faShieldHalved} className="text-brand" style={{ fontSize: 14 }} />
                    </div>
                    <div className="text-xs font-semibold text-(--text)">{factor.label}</div>
                  </div>
                  <Button
                    tone="danger"
                    variant="outline"
                    size="sm"
                    leftIcon={<FontAwesomeIcon icon={faTrashCan} style={{ fontSize: 10 }} />}
                    onClick={() => setRevokeFactorTarget(factor.id)}
                  >
                    Remover
                  </Button>
                </div>
              </div>
            ))}

            {mfaEnabled && (
              <>
                <div className="border-t border-(--border-custom)" />
                <MediaRow
                  icon={<FontAwesomeIcon icon={faShieldHalved} style={{ fontSize: 14 }} />}
                  title="Códigos de recuperação"
                  description={`${recoveryCodesRemaining} código${recoveryCodesRemaining === 1 ? '' : 's'} disponível${recoveryCodesRemaining === 1 ? '' : 'eis'}`}
                  trailing={
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => void runSensitive(regenerateCodes)}
                    >
                      Gerar novos
                    </Button>
                  }
                />
              </>
            )}
          </div>
        </section>

        <section className="border border-(--border-custom) rounded-xl overflow-hidden bg-[#F6F8F8]">
          <div className="px-4 py-3 border-b border-(--border-custom) bg-gray-50/50 flex items-center justify-between">
            <h2 className="text-xs font-bold text-(--text)">Sessões ativas</h2>
            <span className="text-[0.6rem] text-(--text-muted) bg-gray-100 px-2 py-0.5 rounded-full">
              {devices.length} dispositivo{devices.length === 1 ? '' : 's'}
            </span>
          </div>
          <div className="divide-y divide-(--border-custom)">
            {devicesQuery.isLoading && (
              <div className="px-4 py-3 text-[0.65rem] text-(--text-muted)">Carregando sessões…</div>
            )}
            {devices.map((device) => (
              <div key={device.id} className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg shrink-0', device.current ? 'bg-brand-50' : 'bg-gray-100')}>
                    <FontAwesomeIcon icon={faMobileScreen} className={device.current ? 'text-brand' : 'text-(--text-muted)'} style={{ fontSize: 14 }} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-(--text) flex items-center gap-1.5">
                      {describeUserAgent(device.userAgent)}
                      {device.current && <span className="text-[0.55rem] font-medium text-green-600 bg-green-50 px-1.5 py-px rounded-full">Atual</span>}
                    </div>
                    <div className="text-[0.65rem] text-(--text-muted)">
                      Última atividade em {describeActivity(device.lastInteractiveAt)}
                    </div>
                  </div>
                </div>
                {!device.current && (
                  <Button
                    tone="danger"
                    variant="outline"
                    size="sm"
                    leftIcon={<FontAwesomeIcon icon={faRightFromBracket} style={{ fontSize: 10 }} />}
                    onClick={() => setRevokeSessionTarget(device.id)}
                  >
                    Encerrar
                  </Button>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="border border-(--border-custom) rounded-xl overflow-hidden bg-[#F6F8F8]">
          <div className="px-4 py-3 border-b border-(--border-custom) bg-gray-50/50">
            <h2 className="text-xs font-bold text-(--text)">Privacidade e LGPD</h2>
          </div>
          <div className="p-4 space-y-3">
            <MediaRow
              icon={<FontAwesomeIcon icon={faEye} style={{ fontSize: 14 }} />}
              title="Visibilidade do perfil"
              description="Controle quem pode ver seus dados na equipe"
              trailing={<span className="text-[0.65rem] font-medium text-brand bg-brand-50 px-2 py-0.5 rounded-full">Equipe</span>}
            />
            <div className="border-t border-(--border-custom)" />
            <MediaRow
              icon={<FontAwesomeIcon icon={faFileArrowDown} style={{ fontSize: 14 }} />}
              title="Exportar meus dados"
              description="Solicite uma cópia de todos os seus dados pessoais"
              trailing={
                <Button variant="outline" size="sm" rightIcon={<FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 12 }} />} onClick={() => setShowExportModal(true)}>
                  Solicitar
                </Button>
              }
            />
            <div className="border-t border-(--border-custom)" />
            <MediaRow
              icon={<FontAwesomeIcon icon={faUserXmark} style={{ fontSize: 14 }} />}
              title="Anonimização de pacientes"
              description="Gerencie solicitações de anonimização de dados de pacientes (Art. 18 LGPD)"
              trailing={
                <Button variant="outline" size="sm" rightIcon={<FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 12 }} />}>
                  Gerenciar
                </Button>
              }
            />
          </div>
        </section>
      </div>

      <Modal
        open={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Alterar senha"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowPasswordModal(false)}>Cancelar</Button>
            <Button tone="brand" variant="solid" onClick={() => setShowPasswordModal(false)}>Alterar senha</Button>
          </>
        }
      >
        <FieldLabel label="Senha atual">
          <TextInput type="password" placeholder="Insira aqui" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
        </FieldLabel>
        <FieldLabel label="Nova senha">
          <TextInput type="password" placeholder="Insira aqui" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        </FieldLabel>
        <FieldLabel label="Confirmar nova senha">
          <TextInput type="password" placeholder="Insira aqui" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        </FieldLabel>
      </Modal>

      <Modal
        open={showExportModal}
        onClose={() => setShowExportModal(false)}
        size="sm"
        title="Exportar dados"
        icon={<FontAwesomeIcon icon={faFileArrowDown} style={{ fontSize: 16 }} />}
        footer={
          <>
            <Button variant="outline" onClick={() => setShowExportModal(false)}>Cancelar</Button>
            <Button tone="brand" variant="solid" onClick={() => setShowExportModal(false)}>Solicitar exportação</Button>
          </>
        }
      >
        <p className="text-xs text-(--text-muted)">
          Uma cópia dos seus dados pessoais será preparada e enviada para seu e-mail em até 48 horas, conforme previsto pela LGPD.
        </p>
      </Modal>

      {showEnrollModal && (
        <EnrollMfaFactorModal
          open
          onClose={() => setShowEnrollModal(false)}
          onCompleted={() => void invalidateMfaState()}
        />
      )}

      <RecoveryCodesModal codes={recoveryCodes} onClose={() => setRecoveryCodes(null)} />

      {pendingAction && (
      <ReauthenticateModal
        open
        requireCode={mfaEnabled}
        onClose={() => setPendingAction(null)}
        onSuccess={() => {
          const action = pendingAction
          setPendingAction(null)
          if (action) {
            void action().catch((error: unknown) => showApiErrorToast(error))
          }
        }}
      />
      )}

      <Modal
        open={!!revokeFactorTarget}
        onClose={() => setRevokeFactorTarget(null)}
        size="sm"
        title="Remover fator de autenticação"
        icon={<FontAwesomeIcon icon={faTrashCan} style={{ fontSize: 16 }} />}
        tone="danger"
        footer={
          <>
            <Button variant="outline" onClick={() => setRevokeFactorTarget(null)}>Cancelar</Button>
            <Button
              tone="danger"
              variant="solid"
              onClick={() => {
                const target = revokeFactorTarget
                if (target) void runSensitive(() => revokeFactor(target))
              }}
            >
              Remover
            </Button>
          </>
        }
      >
        <p className="text-xs text-(--text-muted)">
          Sua conta deixará de exigir este fator no login e todas as outras
          sessões serão encerradas por segurança.
        </p>
      </Modal>

      <Modal
        open={!!revokeSessionTarget}
        onClose={() => setRevokeSessionTarget(null)}
        size="sm"
        title="Encerrar sessão"
        icon={<FontAwesomeIcon icon={faRightFromBracket} style={{ fontSize: 16 }} />}
        tone="danger"
        footer={
          <>
            <Button variant="outline" onClick={() => setRevokeSessionTarget(null)}>Cancelar</Button>
            <Button
              tone="danger"
              variant="solid"
              disabled={revokeSessionMutation.isPending}
              onClick={() => {
                if (revokeSessionTarget) revokeSessionMutation.mutate(revokeSessionTarget)
              }}
            >
              Encerrar
            </Button>
          </>
        }
      >
        <p className="text-xs text-(--text-muted)">
          Este dispositivo será desconectado imediatamente e precisará fazer
          login novamente para acessar o sistema.
        </p>
      </Modal>
    </SettingsLayout>
  )
}
