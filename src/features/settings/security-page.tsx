import { useState } from 'react'
import { cn } from '@/shared/lib/cn'
import { Button, FieldLabel, Modal, Switch, TextInput } from '@/shared/components'
import { MediaRow } from '@/features/settings/components/MediaRow'
import { SettingsLayout } from '@/features/settings/components/SettingsLayout'
import { useSettingsStore } from '@/features/settings/stores/useSettingsStore'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronRight, faEye, faFileArrowDown, faLock, faMobileScreen, faRightFromBracket, faUserXmark } from '@fortawesome/free-solid-svg-icons'

const sessions = [
  { id: '1', device: 'Chrome · Windows 11', location: 'Anápolis, GO', time: 'Agora (sessão atual)', current: true },
  { id: '2', device: 'Safari · iPhone 15', location: 'Anápolis, GO', time: 'há 2 horas', current: false },
  { id: '3', device: 'Chrome · MacBook Pro', location: 'Goiânia, GO', time: 'há 3 dias', current: false },
]

export function SecurityPage() {
  const twoFaEnabled = useSettingsStore((s) => s.twoFaEnabled)
  const setTwoFaEnabled = useSettingsStore((s) => s.setTwoFaEnabled)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showRevokeModal, setShowRevokeModal] = useState<string | null>(null)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  return (
    <SettingsLayout subtitle="Segurança e Privacidade">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
            <section className="lg:col-span-2 border border-(--border-custom) rounded-3xl overflow-hidden bg-[#F6F8F8]">
              <div className="px-4 py-3 border-b border-(--border-custom) bg-gray-50/50">
                <h2 className="text-xs font-bold text-(--text)">Autenticação</h2>
              </div>
              <div className="p-4 space-y-3">
                <MediaRow
                  icon={<FontAwesomeIcon icon={faLock} style={{ fontSize: 14 }} />}
                  title="Alterar senha"
                  description="Última alteração há 30 dias"
                  trailing={
                    <Button variant="outline" size="sm" rightIcon={<FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 12 }} />} onClick={() => setShowPasswordModal(true)}>
                      Alterar
                    </Button>
                  }
                />
                <div className="border-t border-(--border-custom)" />
                <MediaRow
                  icon={<FontAwesomeIcon icon={faMobileScreen} style={{ fontSize: 14 }} />}
                  title="Autenticação em dois fatores (2FA)"
                  description="Proteja sua conta com verificação adicional"
                  trailing={<Switch checked={twoFaEnabled} onChange={setTwoFaEnabled} aria-label="Autenticação em dois fatores" />}
                />
              </div>
            </section>

            <section className="border border-(--border-custom) rounded-3xl overflow-hidden bg-[#F6F8F8]">
              <div className="px-4 py-3 border-b border-(--border-custom) bg-gray-50/50 flex items-center justify-between">
                <h2 className="text-xs font-bold text-(--text)">Sessões ativas</h2>
                <span className="text-[0.6rem] text-(--text-muted) bg-gray-100 px-2 py-0.5 rounded-full">{sessions.length} dispositivos</span>
              </div>
              <div className="divide-y divide-(--border-custom)">
                {sessions.map((session) => (
                  <div key={session.id} className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg shrink-0', session.current ? 'bg-brand-50' : 'bg-gray-100')}>
                        <FontAwesomeIcon icon={faMobileScreen} className={session.current ? 'text-brand' : 'text-(--text-muted)'} style={{ fontSize: 14 }} />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-(--text) flex items-center gap-1.5">
                          {session.device}
                          {session.current && <span className="text-[0.55rem] font-medium text-green-600 bg-green-50 px-1.5 py-px rounded-full">Atual</span>}
                        </div>
                        <div className="text-[0.65rem] text-(--text-muted)">{session.location} · {session.time}</div>
                      </div>
                    </div>
                    {!session.current && (
                      <Button tone="danger" variant="outline" size="sm" leftIcon={<FontAwesomeIcon icon={faRightFromBracket} style={{ fontSize: 10 }} />} onClick={() => setShowRevokeModal(session.id)}>
                        Encerrar
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section className="border border-(--border-custom) rounded-3xl overflow-hidden bg-[#F6F8F8]">
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

      <Modal
        open={!!showRevokeModal}
        onClose={() => setShowRevokeModal(null)}
        size="sm"
        title="Encerrar sessão"
        icon={<FontAwesomeIcon icon={faRightFromBracket} style={{ fontSize: 16 }} />}
        tone="danger"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowRevokeModal(null)}>Cancelar</Button>
            <Button tone="danger" variant="solid" onClick={() => setShowRevokeModal(null)}>Encerrar</Button>
          </>
        }
      >
        <p className="text-xs text-(--text-muted)">
          Este dispositivo será desconectado imediatamente e precisará fazer login novamente para acessar o sistema.
        </p>
      </Modal>
    </SettingsLayout>
  )
}
