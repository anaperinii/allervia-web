import { useState } from 'react'
import { ArrowLeft, ChevronRight, Eye, FileDown, Lock, LogOut, Smartphone, UserX } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { Button, FieldLabel, IconButton, Modal, Switch, TextInput } from '@/shared/components'
import { MediaRow } from '@/features/settings/components/MediaRow'
import { useSettingsStore } from '@/features/settings/stores/useSettingsStore'

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
    <div className="flex flex-1 flex-col bg-gray-50/80 min-h-0 overflow-hidden">
      <div className="flex flex-1 min-h-0 flex-col rounded-xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden m-4">
        <div className="border-b border-(--border-custom) px-5 py-4 flex items-center gap-3">
          <IconButton aria-label="Voltar" to="/settings"><ArrowLeft size={16} /></IconButton>
          <h1 className="text-2xl font-bold text-(--text)">Segurança e Privacidade</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="max-w-2xl mx-auto space-y-5">
            <section className="border border-(--border-custom) rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-(--border-custom) bg-gray-50/50">
                <h2 className="text-xs font-bold text-(--text)">Autenticação</h2>
              </div>
              <div className="p-4 space-y-3">
                <MediaRow
                  icon={<Lock size={14} />}
                  title="Alterar senha"
                  description="Última alteração há 30 dias"
                  trailing={
                    <Button variant="outline" size="sm" rightIcon={<ChevronRight size={12} />} onClick={() => setShowPasswordModal(true)}>
                      Alterar
                    </Button>
                  }
                />
                <div className="border-t border-(--border-custom)" />
                <MediaRow
                  icon={<Smartphone size={14} />}
                  title="Autenticação em dois fatores (2FA)"
                  description="Proteja sua conta com verificação adicional"
                  trailing={<Switch checked={twoFaEnabled} onChange={setTwoFaEnabled} aria-label="Autenticação em dois fatores" />}
                />
              </div>
            </section>

            <section className="border border-(--border-custom) rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-(--border-custom) bg-gray-50/50 flex items-center justify-between">
                <h2 className="text-xs font-bold text-(--text)">Sessões ativas</h2>
                <span className="text-[0.6rem] text-(--text-muted) bg-gray-100 px-2 py-0.5 rounded-full">{sessions.length} dispositivos</span>
              </div>
              <div className="divide-y divide-(--border-custom)">
                {sessions.map((session) => (
                  <div key={session.id} className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg shrink-0', session.current ? 'bg-brand-50' : 'bg-gray-100')}>
                        <Smartphone size={14} className={session.current ? 'text-brand' : 'text-(--text-muted)'} />
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
                      <Button tone="danger" variant="outline" size="sm" leftIcon={<LogOut size={10} />} onClick={() => setShowRevokeModal(session.id)}>
                        Encerrar
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section className="border border-(--border-custom) rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-(--border-custom) bg-gray-50/50">
                <h2 className="text-xs font-bold text-(--text)">Privacidade e LGPD</h2>
              </div>
              <div className="p-4 space-y-3">
                <MediaRow
                  icon={<Eye size={14} />}
                  title="Visibilidade do perfil"
                  description="Controle quem pode ver seus dados na equipe"
                  trailing={<span className="text-[0.65rem] font-medium text-brand bg-brand-50 px-2 py-0.5 rounded-full">Equipe</span>}
                />
                <div className="border-t border-(--border-custom)" />
                <MediaRow
                  icon={<FileDown size={14} />}
                  title="Exportar meus dados"
                  description="Solicite uma cópia de todos os seus dados pessoais"
                  trailing={
                    <Button variant="outline" size="sm" rightIcon={<ChevronRight size={12} />} onClick={() => setShowExportModal(true)}>
                      Solicitar
                    </Button>
                  }
                />
                <div className="border-t border-(--border-custom)" />
                <MediaRow
                  icon={<UserX size={14} />}
                  title="Anonimização de pacientes"
                  description="Gerencie solicitações de anonimização de dados de pacientes (Art. 18 LGPD)"
                  trailing={
                    <Button variant="outline" size="sm" rightIcon={<ChevronRight size={12} />}>
                      Gerenciar
                    </Button>
                  }
                />
              </div>
            </section>
          </div>
        </div>
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
        icon={<FileDown size={16} />}
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
        icon={<LogOut size={16} />}
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
    </div>
  )
}
