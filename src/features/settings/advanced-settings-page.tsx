import { useState } from 'react'
import {
  ArrowLeft,
  Bell,
  Calendar,
  Check,
  CheckCircle,
  Database,
  ExternalLink,
  Lock,
  Palette,
  Pencil,
  Plus,
  Server,
  Syringe,
  Trash2,
  X,
} from 'lucide-react'
import { useHasPermission } from '@/shared/identity/user-store'
import { useCustomTypesStore } from '@/features/immunotherapy/stores/custom-types-store'
import {
  useSettingsStore,
  type EventColor,
  type Language,
  type Timezone,
} from '@/features/settings/stores/settings-store'
import {
  Button,
  FieldLabel,
  IconButton,
  MediaRow,
  Select,
  Switch,
  TextInput,
} from '@/shared/components'

const FIXED_EVENT_IDS = ['subcutaneous', 'sublingual', 'missed']

export function AdvancedSettingsPage() {
  const canAdvanced = useHasPermission('advanced_settings')
  const autoBackup = useSettingsStore((s) => s.autoBackup)
  const setAutoBackup = useSettingsStore((s) => s.setAutoBackup)
  const emailNotifications = useSettingsStore((s) => s.emailNotifications)
  const setEmailNotifications = useSettingsStore((s) => s.setEmailNotifications)
  const pushNotifications = useSettingsStore((s) => s.pushNotifications)
  const setPushNotifications = useSettingsStore((s) => s.setPushNotifications)
  const timezone = useSettingsStore((s) => s.timezone)
  const setTimezone = useSettingsStore((s) => s.setTimezone)
  const sessionTimeout = useSettingsStore((s) => s.sessionTimeout)
  const setSessionTimeout = useSettingsStore((s) => s.setSessionTimeout)
  const language = useSettingsStore((s) => s.language)
  const setLanguage = useSettingsStore((s) => s.setLanguage)
  const googleConnected = useSettingsStore((s) => s.googleCalendarConnected)
  const setGoogleConnected = useSettingsStore((s) => s.setGoogleCalendarConnected)
  const autoSync = useSettingsStore((s) => s.autoSync)
  const setAutoSync = useSettingsStore((s) => s.setAutoSync)
  const reminderWhatsapp = useSettingsStore((s) => s.reminderWhatsapp)
  const setReminderWhatsapp = useSettingsStore((s) => s.setReminderWhatsapp)
  const reminderHours = useSettingsStore((s) => s.reminderHours)
  const setReminderHours = useSettingsStore((s) => s.setReminderHours)
  const eventColors = useSettingsStore((s) => s.eventColors)
  const setEventColors = useSettingsStore((s) => s.setEventColors)

  const customTypes = useCustomTypesStore((s) => s.types)
  const addType = useCustomTypesStore((s) => s.add)
  const updateType = useCustomTypesStore((s) => s.update)
  const removeType = useCustomTypesStore((s) => s.remove)
  const [newTypeLabel, setNewTypeLabel] = useState('')
  const [editingTypeId, setEditingTypeId] = useState<string | null>(null)
  const [editingTypeLabel, setEditingTypeLabel] = useState('')

  const handleAddType = () => {
    if (newTypeLabel.trim()) {
      addType(newTypeLabel)
      setNewTypeLabel('')
    }
  }

  const startEditType = (id: string, label: string) => {
    setEditingTypeId(id)
    setEditingTypeLabel(label)
  }

  const saveEditType = () => {
    if (editingTypeId) {
      updateType(editingTypeId, editingTypeLabel)
      setEditingTypeId(null)
      setEditingTypeLabel('')
    }
  }

  const updateEventColor = (id: string, patch: Partial<EventColor>) => {
    setEventColors(eventColors.map((color) => (color.id === id ? { ...color, ...patch } : color)))
  }

  const removeEventColor = (id: string) => {
    setEventColors(eventColors.filter((color) => color.id !== id))
  }

  const addEventColor = () => {
    setEventColors([
      ...eventColors,
      { id: `custom-${Date.now()}`, label: 'Novo tipo', color: '#6B7280' },
    ])
  }

  const notificationToggles = [
    { label: 'Notificações por e-mail', desc: 'Receba alertas de aplicações, reações e agendamentos por e-mail', value: emailNotifications, set: setEmailNotifications },
    { label: 'Notificações push', desc: 'Receba notificações em tempo real no navegador', value: pushNotifications, set: setPushNotifications },
  ] as const

  if (!canAdvanced) {
    return (
      <div className="flex flex-1 flex-col bg-gray-50/80 min-h-0 overflow-hidden">
        <div className="flex flex-1 min-h-0 flex-col items-center justify-center rounded-xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] m-4 p-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 mb-4">
            <Lock size={22} className="text-(--text-muted)" />
          </div>
          <h2 className="text-base font-bold text-(--text) mb-1.5">Acesso restrito</h2>
          <p className="text-xs text-(--text-muted) max-w-sm leading-relaxed mb-5">
            As configurações avançadas são restritas a perfis <span className="font-semibold text-(--text)">Administrador</span> e <span className="font-semibold text-(--text)">Médico</span>.
          </p>
          <Button variant="outline" to="/settings">Voltar para configurações</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col bg-gray-50/80 min-h-0 overflow-hidden">
      <div className="flex flex-1 min-h-0 flex-col rounded-xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden m-4">
        <div className="border-b border-(--border-custom) px-5 py-4 flex items-center gap-3">
          <IconButton aria-label="Voltar" to="/settings"><ArrowLeft size={16} /></IconButton>
          <h1 className="text-2xl font-bold text-(--text)">Configurações Avançadas</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="max-w-2xl mx-auto space-y-5">
            <section className="border border-(--border-custom) rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-(--border-custom) bg-gray-50/50">
                <h2 className="text-xs font-bold text-(--text)">Notificações</h2>
              </div>
              <div className="p-4 space-y-3">
                {notificationToggles.map((item, i) => (
                  <div key={item.label}>
                    {i > 0 && <div className="border-t border-(--border-custom) mb-3" />}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 shrink-0">
                          <Bell size={14} className="text-brand" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-(--text)">{item.label}</div>
                          <div className="text-[0.65rem] text-(--text-muted)">{item.desc}</div>
                        </div>
                      </div>
                      <Switch checked={item.value} onChange={item.set} aria-label={item.label} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="border border-(--border-custom) rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-(--border-custom) bg-gray-50/50">
                <h2 className="text-xs font-bold text-(--text)">Sistema</h2>
              </div>
              <div className="p-4 grid grid-cols-2 gap-4">
                <FieldLabel label="Fuso horário">
                  <Select value={timezone} onChange={(e) => setTimezone(e.target.value as Timezone)}>
                    <option value="America/Sao_Paulo">Brasília (GMT-3)</option>
                    <option value="America/Manaus">Manaus (GMT-4)</option>
                    <option value="America/Noronha">Fernando de Noronha (GMT-2)</option>
                  </Select>
                </FieldLabel>
                <FieldLabel label="Tempo de sessão (minutos)">
                  <Select
                    value={sessionTimeout}
                    onChange={(e) => setSessionTimeout(e.target.value as typeof sessionTimeout)}
                  >
                    <option value="15">15 minutos</option>
                    <option value="30">30 minutos</option>
                    <option value="60">1 hora</option>
                    <option value="120">2 horas</option>
                  </Select>
                </FieldLabel>
                <FieldLabel label="Idioma">
                  <Select value={language} onChange={(e) => setLanguage(e.target.value as Language)}>
                    <option value="pt-BR">Português (Brasil)</option>
                    <option value="en">English</option>
                    <option value="es">Español</option>
                  </Select>
                </FieldLabel>
              </div>
            </section>

            <section className="border border-(--border-custom) rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-(--border-custom) bg-gray-50/50">
                <h2 className="text-xs font-bold text-(--text)">Agendamentos</h2>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <MediaRow
                    className="mb-3"
                    icon={<Calendar size={14} />}
                    title="Google Agenda"
                    description="Sincronize agendamentos automaticamente"
                    trailing={googleConnected ? (
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-[0.6rem] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <CheckCircle size={10} />
                          Conectado
                        </span>
                        <Button tone="danger" variant="ghost" size="sm" onClick={() => setGoogleConnected(false)}>
                          Desconectar
                        </Button>
                      </div>
                    ) : (
                      <Button variant="outline" onClick={() => setGoogleConnected(true)}>
                        Conectar conta Google
                      </Button>
                    )}
                  />

                  {googleConnected && (
                    <div className="bg-gray-50 rounded-lg p-3 space-y-3 ml-11">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[0.7rem] font-medium text-(--text)">Sincronização automática</div>
                          <div className="text-[0.55rem] text-(--text-muted)">Novos agendamentos são enviados ao Google Agenda</div>
                        </div>
                        <Switch checked={autoSync} onChange={setAutoSync} aria-label="Sincronização automática" />
                      </div>
                      <div className="flex items-center gap-1.5 text-[0.6rem] text-(--text-muted)">
                        <ExternalLink size={10} />
                        <span>Conta vinculada: <span className="font-medium text-(--text)">clinica@imunecare.com.br</span></span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-(--border-custom)" />

                <MediaRow
                  icon={<Bell size={14} />}
                  title="Lembrete via WhatsApp"
                  description="Enviar lembrete automático ao paciente antes da consulta"
                  trailing={<Switch checked={reminderWhatsapp} onChange={setReminderWhatsapp} aria-label="Lembrete via WhatsApp" />}
                />

                {reminderWhatsapp && (
                  <div className="ml-11 w-40">
                    <FieldLabel label="Antecedência do lembrete">
                      <Select
                        value={reminderHours}
                        onChange={(e) => setReminderHours(e.target.value as typeof reminderHours)}
                      >
                        <option value="2">2 horas antes</option>
                        <option value="6">6 horas antes</option>
                        <option value="12">12 horas antes</option>
                        <option value="24">24 horas antes</option>
                        <option value="48">48 horas antes</option>
                      </Select>
                    </FieldLabel>
                  </div>
                )}

                <div className="border-t border-(--border-custom)" />

                <div>
                  <MediaRow
                    className="mb-3"
                    icon={<Palette size={14} />}
                    title="Cores dos eventos"
                    description="Personalize as cores para cada tipo de agendamento"
                  />
                  <div className="space-y-2 ml-11">
                    {eventColors.map((ec) => {
                      const isFixed = FIXED_EVENT_IDS.includes(ec.id)
                      return (
                        <div key={ec.id} className="flex items-center justify-between group">
                          <div className="flex items-center gap-2.5">
                            <input
                              type="color"
                              value={ec.color}
                              onChange={(e) => updateEventColor(ec.id, { color: e.target.value })}
                              aria-label={`Cor do evento ${ec.label}`}
                              className="w-7 h-7 rounded-lg border border-(--border-custom) cursor-pointer p-0.5"
                            />
                            {isFixed ? (
                              <span className="text-xs font-medium text-(--text)">{ec.label}</span>
                            ) : (
                              <input
                                value={ec.label}
                                onChange={(e) => updateEventColor(ec.id, { label: e.target.value })}
                                aria-label="Nome do tipo de evento"
                                className="text-xs font-medium text-(--text) bg-transparent border-b border-(--border-custom) focus:outline-none focus:border-brand w-28 px-0"
                              />
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[0.6rem] font-mono text-(--text-muted)">{ec.color}</span>
                            <div
                              className="w-16 h-5 rounded flex items-center justify-center text-[0.45rem] font-bold"
                              style={{ backgroundColor: ec.color + '20', border: `1.5px solid ${ec.color}`, color: ec.color }}
                            >
                              Prévia
                            </div>
                            {!isFixed && (
                              <IconButton
                                aria-label={`Remover ${ec.label}`}
                                size="sm"
                                tone="danger"
                                onClick={() => removeEventColor(ec.id)}
                                className="opacity-0 group-hover:opacity-100 h-5 w-5"
                              >
                                <X size={11} />
                              </IconButton>
                            )}
                          </div>
                        </div>
                      )
                    })}
                    <Button variant="ghost" size="sm" leftIcon={<Plus size={12} />} onClick={addEventColor}>
                      Adicionar tipo de evento
                    </Button>
                  </div>
                </div>
              </div>
            </section>

            <section className="border border-(--border-custom) rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-(--border-custom) bg-gray-50/50">
                <h2 className="text-xs font-bold text-(--text)">Tipos de Imunoterapia</h2>
              </div>
              <div className="p-4 space-y-3">
                <p className="text-[0.65rem] text-(--text-muted) leading-relaxed">
                  Gerencie os tipos disponíveis ao cadastrar uma imunoterapia. Alterações refletem em toda a clínica.
                </p>
                <div className="flex gap-2">
                  <TextInput
                    value={newTypeLabel}
                    onChange={(e) => setNewTypeLabel(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddType() } }}
                    placeholder="Ex: Pólen, Pelos de Gato..."
                    className="flex-1"
                  />
                  <Button tone="brand" variant="solid" leftIcon={<Plus size={13} />} onClick={handleAddType} className="h-9 px-3">
                    Adicionar
                  </Button>
                </div>
                <div className="space-y-1.5">
                  {customTypes.map((t) => (
                    <div key={t.id} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-(--border-custom) bg-gray-50/40">
                      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-50 shrink-0">
                        <Syringe size={11} className="text-brand" />
                      </div>
                      {editingTypeId === t.id ? (
                        <>
                          <TextInput
                            value={editingTypeLabel}
                            onChange={(e) => setEditingTypeLabel(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); saveEditType() } }}
                            autoFocus
                            className="flex-1 h-7"
                          />
                          <IconButton aria-label="Salvar" size="sm" tone="success" onClick={saveEditType}>
                            <Check size={14} />
                          </IconButton>
                          <IconButton aria-label="Cancelar edição" size="sm" onClick={() => setEditingTypeId(null)}>
                            <X size={14} />
                          </IconButton>
                        </>
                      ) : (
                        <>
                          <span className="flex-1 text-xs font-medium text-(--text)">{t.label}</span>
                          <IconButton aria-label={`Editar ${t.label}`} size="sm" tone="brand" onClick={() => startEditType(t.id, t.label)}>
                            <Pencil size={12} />
                          </IconButton>
                          <IconButton aria-label={`Remover ${t.label}`} size="sm" tone="danger" onClick={() => removeType(t.id)}>
                            <Trash2 size={12} />
                          </IconButton>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="border border-(--border-custom) rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-(--border-custom) bg-gray-50/50">
                <h2 className="text-xs font-bold text-(--text)">Dados e Backup</h2>
              </div>
              <div className="p-4 space-y-3">
                <MediaRow
                  icon={<Database size={14} />}
                  title="Backup automático"
                  description="Backup diário dos dados clínicos às 03:00"
                  trailing={<Switch checked={autoBackup} onChange={setAutoBackup} aria-label="Backup automático" />}
                />
                <div className="border-t border-(--border-custom)" />
                <MediaRow
                  icon={<Server size={14} />}
                  title="Último backup"
                  description="10/04/2026 às 03:00 — 42.3 MB"
                  trailing={<span className="text-[0.65rem] font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Sucesso</span>}
                />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
