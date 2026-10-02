import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useHasPermission } from '@/shared/stores/useUserStore'
import { useCustomTypesStore } from '@/features/immunotherapy/stores/useCustomTypesStore'
import {
  useSettingsStore,
  type EventColor,
  type Language,
} from '@/features/settings/stores/useSettingsStore'
import { readOrganization, updateOrganization } from '@/shared/api/team.api'
import { queryKeys } from '@/shared/api/query-keys'
import { ApiError } from '@/shared/api/contracts/errors'
import {
  Button,
  FieldLabel,
  IconButton,
  Select,
  TextInput,
} from '@/shared/components'
import { MediaRow } from '@/features/settings/components/MediaRow'
import { GoogleCalendarRow } from '@/features/settings/components/GoogleCalendarRow'
import { SettingsLayout } from '@/features/settings/components/SettingsLayout'
import { AuditTrailPanel } from '@/features/settings/components/AuditTrailPanel'
import { NotificationPreferencesPanel } from '@/features/settings/components/NotificationPreferencesPanel'

function UnavailableBadge() {
  return (
    <span className="text-[0.6rem] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full shrink-0">
      Indisponível
    </span>
  )
}

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBell, faCheck, faDatabase, faLock, faPalette, faPencil, faPlus, faTrash, faXmark } from '@fortawesome/free-solid-svg-icons'

const FIXED_EVENT_IDS = ['subcutaneous', 'sublingual', 'missed']

const SESSION_TIMEOUT_MIN = 5
const SESSION_TIMEOUT_MAX = 720

const SESSION_TIMEOUT_OPTIONS: { value: string; label: string }[] = [
  { value: '15', label: '15 minutos' },
  { value: '30', label: '30 minutos' },
  { value: '60', label: '1 hora' },
  { value: '120', label: '2 horas' },
]

function isValidTimeout(value: string): boolean {
  const minutes = Number(value)
  return (
    Number.isInteger(minutes) &&
    minutes >= SESSION_TIMEOUT_MIN &&
    minutes <= SESSION_TIMEOUT_MAX
  )
}

const TIMEZONE_OPTIONS: { value: string; label: string }[] = [
  { value: 'America/Noronha', label: 'Fernando de Noronha (GMT-2)' },
  { value: 'America/Sao_Paulo', label: 'Brasília (GMT-3)' },
  { value: 'America/Bahia', label: 'Salvador (GMT-3)' },
  { value: 'America/Fortaleza', label: 'Fortaleza (GMT-3)' },
  { value: 'America/Recife', label: 'Recife (GMT-3)' },
  { value: 'America/Belem', label: 'Belém (GMT-3)' },
  { value: 'America/Araguaina', label: 'Araguaína (GMT-3)' },
  { value: 'America/Maceio', label: 'Maceió (GMT-3)' },
  { value: 'America/Santarem', label: 'Santarém (GMT-3)' },
  { value: 'America/Campo_Grande', label: 'Campo Grande (GMT-4)' },
  { value: 'America/Cuiaba', label: 'Cuiabá (GMT-4)' },
  { value: 'America/Manaus', label: 'Manaus (GMT-4)' },
  { value: 'America/Porto_Velho', label: 'Porto Velho (GMT-4)' },
  { value: 'America/Boa_Vista', label: 'Boa Vista (GMT-4)' },
  { value: 'America/Eirunepe', label: 'Eirunepé (GMT-5)' },
  { value: 'America/Rio_Branco', label: 'Rio Branco (GMT-5)' },
]

export function AdvancedSettingsPage() {
  const canAdvanced = useHasPermission('advanced_settings')
  const canViewAudit = useHasPermission('view_audit')
  const queryClient = useQueryClient()
  const [timezoneError, setTimezoneError] = useState<string | null>(null)
  const organizationQuery = useQuery({
    queryKey: queryKeys.organization(),
    queryFn: ({ signal }) => readOrganization(signal),
    enabled: canAdvanced,
  })
  const timezoneMutation = useMutation({
    mutationFn: (timeZone: string) => updateOrganization({ timeZone }),
    onSuccess: async () => {
      setTimezoneError(null)
      await queryClient.invalidateQueries({ queryKey: queryKeys.organization() })
      await queryClient.invalidateQueries({ queryKey: queryKeys.account() })
      await queryClient.invalidateQueries({ queryKey: ['clinical'] })
    },
    onError: (error) =>
      setTimezoneError(
        error instanceof ApiError
          ? error.message
          : 'Não foi possível alterar o fuso horário.',
      ),
  })
  const timezone = organizationQuery.data?.timeZone ?? ''
  const timezoneOptions =
    timezone && !TIMEZONE_OPTIONS.some((option) => option.value === timezone)
      ? [{ value: timezone, label: timezone }, ...TIMEZONE_OPTIONS]
      : TIMEZONE_OPTIONS
  const sessionTimeout = useSettingsStore((s) => s.sessionTimeout)
  const setSessionTimeout = useSettingsStore((s) => s.setSessionTimeout)
  const [customTimeout, setCustomTimeout] = useState(
    () => !SESSION_TIMEOUT_OPTIONS.some((option) => option.value === sessionTimeout),
  )
  const language = useSettingsStore((s) => s.language)
  const setLanguage = useSettingsStore((s) => s.setLanguage)
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

  const unavailableChannels = [
    { label: 'Notificações por e-mail', desc: 'Entrega automática requer provedor de e-mail definido para notificações' },
    { label: 'Notificações push', desc: 'Entrega em tempo real requer serviço de push contratado' },
  ] as const

  if (!canAdvanced) {
    return (
      <SettingsLayout subtitle="Configurações Avançadas">
        <div className="flex flex-1 flex-col items-center justify-center p-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 mb-4">
            <FontAwesomeIcon icon={faLock} className="text-(--text-muted)" style={{ fontSize: 22 }} />
          </div>
          <h2 className="text-base font-bold text-(--text) mb-1.5">Acesso restrito</h2>
          <p className="text-xs text-(--text-muted) max-w-sm leading-relaxed mb-5">
            As configurações avançadas são restritas a perfis <span className="font-semibold text-(--text)">Administrador</span> e <span className="font-semibold text-(--text)">Médico</span>.
          </p>
          <Button variant="outline" to="/settings">Voltar para configurações</Button>
        </div>
      </SettingsLayout>
    )
  }

  return (
    <SettingsLayout subtitle="Configurações Avançadas">
      <div className="flex flex-col gap-5">
            <section className="border border-(--border-custom) rounded-3xl overflow-hidden bg-[#F6F8F8]">
              <div className="px-4 py-3 border-b border-(--border-custom) bg-gray-50/50">
                <h2 className="text-xs font-bold text-(--text)">Notificações</h2>
              </div>
              <div className="p-4 space-y-3">
                <NotificationPreferencesPanel />
                <div className="border-t border-(--border-custom)" />
                {unavailableChannels.map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 shrink-0">
                        <FontAwesomeIcon icon={faBell} className="text-gray-400" style={{ fontSize: 14 }} />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-(--text-muted)">{item.label}</div>
                        <div className="text-[0.65rem] text-(--text-muted)">{item.desc}</div>
                      </div>
                    </div>
                    <UnavailableBadge />
                  </div>
                ))}
              </div>
            </section>

            <section className="border border-(--border-custom) rounded-3xl overflow-hidden bg-[#F6F8F8]">
              <div className="px-4 py-3 border-b border-(--border-custom) bg-gray-50/50">
                <h2 className="text-xs font-bold text-(--text)">Sistema</h2>
              </div>
              <div className="p-4 grid grid-cols-2 gap-4">
                <FieldLabel label="Fuso horário">
                  <Select
                    value={timezone}
                    disabled={organizationQuery.isPending || timezoneMutation.isPending}
                    onChange={(e) => {
                      setTimezoneError(null)
                      timezoneMutation.mutate(e.target.value)
                    }}
                  >
                    {timezoneOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                  <p className="mt-1 text-[0.6rem] leading-relaxed text-(--text-muted)">
                    Fuso clínico da organização: governa as datas previstas das
                    aplicações.
                  </p>
                  {(timezoneError || organizationQuery.error) && (
                    <p role="alert" className="mt-1 text-[0.6rem] text-red-700">
                      {timezoneError ??
                        'Não foi possível carregar o fuso da organização.'}
                    </p>
                  )}
                </FieldLabel>
                <FieldLabel label="Tempo de sessão (minutos)">
                  <Select
                    value={customTimeout ? 'custom' : sessionTimeout}
                    onChange={(e) => {
                      if (e.target.value === 'custom') {
                        setCustomTimeout(true)
                        return
                      }
                      setCustomTimeout(false)
                      setSessionTimeout(e.target.value)
                    }}
                  >
                    {SESSION_TIMEOUT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                    <option value="custom">Outro…</option>
                  </Select>
                  {customTimeout && (
                    <TextInput
                      type="number"
                      min={SESSION_TIMEOUT_MIN}
                      max={SESSION_TIMEOUT_MAX}
                      step={1}
                      value={sessionTimeout}
                      aria-label="Tempo de sessão personalizado, em minutos"
                      onChange={(e) => setSessionTimeout(e.target.value)}
                      className="mt-2"
                    />
                  )}
                  {customTimeout && !isValidTimeout(sessionTimeout) && (
                    <p role="alert" className="mt-1 text-[0.6rem] text-red-700">
                      Informe um valor inteiro entre {SESSION_TIMEOUT_MIN} e{' '}
                      {SESSION_TIMEOUT_MAX} minutos.
                    </p>
                  )}
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

            <section className="border border-(--border-custom) rounded-3xl overflow-hidden bg-[#F6F8F8]">
              <div className="px-4 py-3 border-b border-(--border-custom) bg-gray-50/50">
                <h2 className="text-xs font-bold text-(--text)">Agendamentos</h2>
              </div>
              <div className="p-4 space-y-4">
                <div className="mb-3">
                  <GoogleCalendarRow />
                </div>

                <div className="border-t border-(--border-custom)" />

                <MediaRow
                  icon={<FontAwesomeIcon icon={faBell} style={{ fontSize: 14 }} />}
                  title="Lembrete automático via WhatsApp"
                  description="Envio automático exige canal/provedor definido; o lembrete manual pelo link do WhatsApp continua disponível na agenda"
                  trailing={<UnavailableBadge />}
                />

                <div className="border-t border-(--border-custom)" />

                <div>
                  <MediaRow
                    className="mb-3"
                    icon={<FontAwesomeIcon icon={faPalette} style={{ fontSize: 14 }} />}
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
                                <FontAwesomeIcon icon={faXmark} style={{ fontSize: 11 }} />
                              </IconButton>
                            )}
                          </div>
                        </div>
                      )
                    })}
                    <Button variant="ghost" size="sm" leftIcon={<FontAwesomeIcon icon={faPlus} style={{ fontSize: 12 }} />} onClick={addEventColor}>
                      Adicionar tipo de evento
                    </Button>
                  </div>
                </div>
              </div>
            </section>

            <section className="border border-(--border-custom) rounded-3xl overflow-hidden bg-[#F6F8F8]">
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
                  <Button tone="brand" variant="solid" leftIcon={<FontAwesomeIcon icon={faPlus} style={{ fontSize: 13 }} />} onClick={handleAddType} className="h-9 px-3">
                    Adicionar
                  </Button>
                </div>
                <div className="space-y-1.5">
                  {customTypes.map((t) => (
                    <div key={t.id} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-(--border-custom) bg-gray-50/40">
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
                            <FontAwesomeIcon icon={faCheck} style={{ fontSize: 14 }} />
                          </IconButton>
                          <IconButton aria-label="Cancelar edição" size="sm" onClick={() => setEditingTypeId(null)}>
                            <FontAwesomeIcon icon={faXmark} style={{ fontSize: 14 }} />
                          </IconButton>
                        </>
                      ) : (
                        <>
                          <span className="flex-1 text-xs font-medium text-(--text)">{t.label}</span>
                          <IconButton aria-label={`Editar ${t.label}`} size="sm" tone="brand" onClick={() => startEditType(t.id, t.label)} className="hover:bg-brand/15! hover:text-brand-dark!">
                            <FontAwesomeIcon icon={faPencil} style={{ fontSize: 12 }} />
                          </IconButton>
                          <IconButton aria-label={`Remover ${t.label}`} size="sm" tone="danger" onClick={() => removeType(t.id)}>
                            <FontAwesomeIcon icon={faTrash} style={{ fontSize: 12 }} />
                          </IconButton>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="border border-(--border-custom) rounded-3xl overflow-hidden bg-[#F6F8F8]">
              <div className="px-4 py-3 border-b border-(--border-custom) bg-gray-50/50">
                <h2 className="text-xs font-bold text-(--text)">Dados e Backup</h2>
              </div>
              <div className="p-4 space-y-3">
                <MediaRow
                  icon={<FontAwesomeIcon icon={faDatabase} style={{ fontSize: 14 }} />}
                  title="Backup"
                  description="Backup é operação real de infraestrutura com evidência de restauração — não uma preferência desta tela; capacidade bloqueada até a operação existir"
                  trailing={<UnavailableBadge />}
                />
              </div>
        </section>

            {canViewAudit && (
              <section className="border border-(--border-custom) rounded-3xl overflow-hidden bg-[#F6F8F8]">
                <div className="px-4 py-3 border-b border-(--border-custom) bg-gray-50/50">
                  <h2 className="text-xs font-bold text-(--text)">Auditoria administrativa</h2>
                  <p className="text-[0.62rem] text-(--text-muted) mt-0.5">
                    Trilha oficial do servidor. O histórico clínico de cada tratamento
                    tem leitura própria no prontuário.
                  </p>
                </div>
                <div className="p-4">
                  <AuditTrailPanel />
                </div>
              </section>
            )}
      </div>
    </SettingsLayout>
  )
}
