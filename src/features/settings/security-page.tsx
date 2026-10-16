import { useState } from 'react'
import { useReauthenticatedAction } from '@/shared/auth/useReauthenticatedAction'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cn } from '@/shared/lib/cn'
import {
  Button,
  FieldLabel,
  isPasswordValid,
  Modal,
  PasswordInput,
  PasswordRequirements,
  showApiErrorToast,
  toast,
} from '@/shared/components'
import { MediaRow } from '@/features/settings/components/MediaRow'
import { SettingsLayout } from '@/features/settings/components/SettingsLayout'
import { EnrollMfaFactorModal } from '@/features/settings/components/EnrollMfaFactorModal'
import { ReauthenticateModal } from '@/features/settings/components/ReauthenticateModal'
import { RecoveryCodesModal } from '@/features/settings/components/RecoveryCodesModal'
import {
  changePassword,
  enrollMfaFactor,
  endAllSessions,
  listDevices,
  listMfaFactors,
  regenerateRecoveryCodes,
  revokeDevice,
  revokeMfaFactor,
} from '@/shared/api/auth.api'
import { ApiError, API_ERROR_CODES } from '@/shared/api/contracts/errors'
import { humanErrorMessage } from '@/shared/api/error-copy'
import { queryKeys } from '@/shared/api/query-keys'
import { useSession } from '@/shared/auth/useSession'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCheck,
  faFileArrowDown,
  faLock,
  faMobileScreen,
  faPlus,
  faRightFromBracket,
  faShieldHalved,
  faTrashCan,
  faUserXmark,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons'


interface PasswordFormErrors {
  current?: string
  newPassword?: string
  confirm?: string
  general?: string
}

function UnavailableBadge() {
  return (
    <span className="text-[0.6rem] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full shrink-0">
      Indisponível
    </span>
  )
}

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
  const [initialEnrollment, setInitialEnrollment] = useState<Awaited<ReturnType<typeof enrollMfaFactor>> | null>(null)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showLogoutAllModal, setShowLogoutAllModal] = useState(false)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordErrors, setPasswordErrors] = useState<PasswordFormErrors>({})
  const [revokeFactorTarget, setRevokeFactorTarget] = useState<string | null>(null)
  const [revokeSessionTarget, setRevokeSessionTarget] = useState<string | null>(null)
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null)
  const sensitive = useReauthenticatedAction()

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

  const runSensitive = sensitive.run

  const closeEnrollment = () => { setShowEnrollModal(false); setInitialEnrollment(null) }
  const startEnrollment = async () => {
    const result = await enrollMfaFactor({})
    setInitialEnrollment(result)
    setShowEnrollModal(true)
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

  const changePasswordMutation = useMutation({
    mutationFn: changePassword,
    meta: { suppressErrorToast: true },
  })
  const logoutAllMutation = useMutation({ mutationFn: endAllSessions })

  const closePasswordModal = () => {
    setShowPasswordModal(false)
    setOldPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setPasswordErrors({})
  }

  const submitPasswordChange = async () => {
    const errors: PasswordFormErrors = {}
    if (!oldPassword) errors.current = 'Informe sua senha atual.'
    if (!isPasswordValid(newPassword)) {
      errors.newPassword = 'A nova senha não atende aos requisitos.'
    } else if (newPassword === oldPassword) {
      errors.newPassword = 'A nova senha deve ser diferente da senha atual.'
    }
    if (newPassword !== confirmPassword) {
      errors.confirm = 'As senhas não coincidem.'
    }
    setPasswordErrors(errors)
    if (Object.keys(errors).length > 0) return

    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: oldPassword,
        newPassword,
      })
      closePasswordModal()
      toast.success({
        icon: <FontAwesomeIcon icon={faCheck} style={{ fontSize: 14 }} />,
        title: 'Senha alterada com sucesso',
        description: 'Entre novamente com a nova senha.',
        position: 'top-right',
        compact: true,
        autoDismissMs: 4000,
      })
      await refresh()
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.code === API_ERROR_CODES.reauthenticationRequired
      ) {
        throw error
      }
      if (error instanceof ApiError) {
        const isSameAsCurrent = error.code === API_ERROR_CODES.passwordSameAsCurrent
        setPasswordErrors({
          current: error.fieldErrors?.currentPassword?.join(' '),
          newPassword: error.fieldErrors?.newPassword?.join(' ') ?? (isSameAsCurrent ? error.message : undefined),
          general: error.fieldErrors || isSameAsCurrent
            ? undefined
            : humanErrorMessage(error, 'Não foi possível alterar a senha.'),
        })
      } else {
        setPasswordErrors({ general: 'Não foi possível alterar a senha.' })
      }
    }
  }

  const confirmLogoutAll = async () => {
    try {
      await logoutAllMutation.mutateAsync()
      setShowLogoutAllModal(false)
      toast.success({
        icon: <FontAwesomeIcon icon={faCheck} style={{ fontSize: 14 }} />,
        title: 'Todas as sessões foram encerradas',
        description: 'Entre novamente para continuar.',
        position: 'top-right',
        compact: true,
        autoDismissMs: 4000,
      })
      await refresh()
    } catch {
      return
    }
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
                    disabled={sensitive.busy || sensitive.pending}
                    onClick={() => void runSensitive(startEnrollment)}
                  >
                    Adicionar fator
                  </Button>
                </div>
              }
            />

            {factorsQuery.isLoading && (
              <div className="text-[0.65rem] text-(--text-muted)">Carregando fatores…</div>
            )}

            {factorsQuery.isError && <p role="alert">Não foi possível carregar os fatores de autenticação. <button type="button" onClick={() => { void factorsQuery.refetch() }}>Recarregar fatores</button></p>}
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
                  description={factorsQuery.isSuccess ? `${recoveryCodesRemaining} código${recoveryCodesRemaining === 1 ? '' : 's'} disponível${recoveryCodesRemaining === 1 ? '' : 'eis'}` : 'Contagem de códigos indisponível'}
                  trailing={
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={sensitive.busy || sensitive.pending || !factorsQuery.isSuccess}
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
            <div className="flex items-center gap-2">
              <span className="text-[0.6rem] text-(--text-muted) bg-gray-100 px-2 py-0.5 rounded-full">
                {devicesQuery.isSuccess ? `${devices.length} dispositivo${devices.length === 1 ? '' : 's'}` : 'Contagem indisponível'}
              </span>
              <Button
                tone="danger"
                variant="outline"
                size="sm"
                leftIcon={<FontAwesomeIcon icon={faRightFromBracket} style={{ fontSize: 10 }} />}
                onClick={() => setShowLogoutAllModal(true)}
              >
                Encerrar todas
              </Button>
            </div>
          </div>
          <div className="divide-y divide-(--border-custom)">
            {devicesQuery.isLoading && (
              <div className="px-4 py-3 text-[0.65rem] text-(--text-muted)">Carregando sessões…</div>
            )}
            {devicesQuery.isError && <p role="alert">Não foi possível carregar as sessões. <button type="button" onClick={() => { void devicesQuery.refetch() }}>Recarregar sessões</button></p>}
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
              icon={<FontAwesomeIcon icon={faFileArrowDown} style={{ fontSize: 14 }} />}
              title="Exportar meus dados"
              description="A exportação de dados pessoais (LGPD) ainda não possui operação no servidor"
              trailing={<UnavailableBadge />}
            />
            <div className="border-t border-(--border-custom)" />
            <MediaRow
              icon={<FontAwesomeIcon icon={faUserXmark} style={{ fontSize: 14 }} />}
              title="Anonimização de pacientes"
              description="O fluxo auditado de anonimização (Art. 18 LGPD) ainda não possui operação no servidor"
              trailing={<UnavailableBadge />}
            />
          </div>
        </section>
      </div>

      <Modal
        open={showPasswordModal}
        pending={changePasswordMutation.isPending || sensitive.busy || sensitive.pending}
        onClose={closePasswordModal}
        title="Alterar senha"
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              disabled={changePasswordMutation.isPending}
              onClick={closePasswordModal}
            >
              Cancelar
            </Button>
            <Button
              tone="brand"
              variant="solid"
              disabled={changePasswordMutation.isPending}
              onClick={() => void runSensitive(submitPasswordChange)}
            >
              {changePasswordMutation.isPending ? 'Alterando…' : 'Alterar senha'}
            </Button>
          </>
        }
      >
        <FieldLabel label="Senha atual" error={passwordErrors.current}>
          <PasswordInput
            placeholder="Insira aqui"
            autoComplete="current-password"
            invalid={!!passwordErrors.current}
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
        </FieldLabel>
        <FieldLabel label="Nova senha" error={passwordErrors.newPassword}>
          <PasswordInput
            placeholder="Insira aqui"
            autoComplete="new-password"
            invalid={!!passwordErrors.newPassword}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </FieldLabel>
        <FieldLabel label="Confirmar nova senha" error={passwordErrors.confirm}>
          <PasswordInput
            placeholder="Insira aqui"
            autoComplete="new-password"
            invalid={!!passwordErrors.confirm}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </FieldLabel>
        <PasswordRequirements password={newPassword} />
        {passwordErrors.general && (
          <p className="text-xs text-red-500" role="alert">
            {passwordErrors.general}
          </p>
        )}
        <p className="text-[0.65rem] text-(--text-muted)">
          Por segurança, todas as suas sessões são encerradas após a troca e
          será preciso entrar novamente.
        </p>
      </Modal>

      <Modal
        open={showLogoutAllModal}
        pending={logoutAllMutation.isPending}
        onClose={() => setShowLogoutAllModal(false)}
        size="sm"
        title="Encerrar todas as sessões"
        icon={<FontAwesomeIcon icon={faRightFromBracket} style={{ fontSize: 16 }} />}
        tone="danger"
        footer={
          <>
            <Button
              variant="outline"
              disabled={logoutAllMutation.isPending}
              onClick={() => setShowLogoutAllModal(false)}
            >
              Cancelar
            </Button>
            <Button
              tone="danger"
              variant="solid"
              disabled={logoutAllMutation.isPending}
              onClick={() => void confirmLogoutAll()}
            >
              {logoutAllMutation.isPending ? 'Encerrando…' : 'Encerrar todas'}
            </Button>
          </>
        }
      >
        <p className="text-xs text-(--text-muted)">
          Todas as sessões serão encerradas, incluindo esta. Você precisará
          fazer login novamente em todos os dispositivos.
        </p>
      </Modal>

      {showEnrollModal && initialEnrollment && (
        <EnrollMfaFactorModal
          open
          initialEnrollment={initialEnrollment}
          runSensitive={runSensitive}
          reauthenticationPending={sensitive.pending}
          onClose={closeEnrollment}
          onCompleted={() => void invalidateMfaState()}
        />
      )}

      <RecoveryCodesModal codes={recoveryCodes} onClose={() => setRecoveryCodes(null)} />

      {sensitive.pending && (
        <ReauthenticateModal open requireCode={mfaEnabled}
          onClose={() => { sensitive.cancel(); closePasswordModal(); closeEnrollment(); setRevokeFactorTarget(null) }}
          onSuccess={() => { void sensitive.resume() }} />
      )}

      <Modal
        open={!!revokeFactorTarget}
        pending={sensitive.busy || sensitive.pending}
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
        pending={revokeSessionMutation.isPending}
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
