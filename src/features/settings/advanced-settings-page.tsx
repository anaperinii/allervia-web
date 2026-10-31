import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useHasPermission } from '@/shared/stores/useUserStore'
import { useSession } from '@/shared/auth/useSession'
import { listImmunotherapyTypes } from '@/shared/api/clinical.api'
import { useSettingsStore } from '@/features/settings/stores/useSettingsStore'
import { readOrganization, updateOrganization } from '@/shared/api/team.api'
import { queryKeys } from '@/shared/api/query-keys'
import { ApiError } from '@/shared/api/contracts/errors'
import {
  Button,
  FieldLabel,
  ReadOnlyField,
  Select,
} from '@/shared/components'
import { MediaRow } from '@/features/settings/components/MediaRow'
import { GoogleCalendarRow } from '@/features/settings/components/GoogleCalendarRow'
import { GoogleCalendarCallbackToast } from '@/features/settings/components/GoogleCalendarCallbackToast'
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
import { faBell, faDatabase, faLock, faPalette } from '@fortawesome/free-solid-svg-icons'

function formatSessionExpiry(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
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
  const { account, session } = useSession()
  const organizationId = account?.organization?.id ?? ''
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
      if (organizationId) {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.clinical(organizationId),
        })
      }
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
  const eventColors = useSettingsStore((s) => s.eventColors)
  const setEventColor = useSettingsStore((s) => s.setEventColor)

  const typesQuery = useQuery({
    queryKey: queryKeys.immunotherapyTypes(organizationId),
    queryFn: ({ signal }) => listImmunotherapyTypes(signal),
    enabled: canAdvanced && organizationId !== '',
  })

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
            <section className="border border-(--border-custom) rounded-xl overflow-hidden bg-white">
              <div className="px-4 py-3 border-b border-(--border-custom) bg-[#F7F9F9]">
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

            <section className="border border-(--border-custom) rounded-xl overflow-hidden bg-white">
              <div className="px-4 py-3 border-b border-(--border-custom) bg-[#F7F9F9]">
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
                <FieldLabel label="Tempo de sessão">
                  <ReadOnlyField>
                    15 min de inatividade · 8 h de duração máxima
                  </ReadOnlyField>
                  <p className="mt-1 text-[0.6rem] leading-relaxed text-(--text-muted)">
                    Política imposta pelo servidor; não é configurável por
                    organização.
                    {session
                      ? ` Sua sessão atual expira em ${formatSessionExpiry(session.expiresAt)}.`
                      : ''}
                  </p>
                </FieldLabel>
              </div>
            </section>

            <section className="border border-(--border-custom) rounded-xl overflow-hidden bg-white">
              <div className="px-4 py-3 border-b border-(--border-custom) bg-[#F7F9F9]">
                <h2 className="text-xs font-bold text-(--text)">Agendamentos</h2>
              </div>
              <div className="p-4 space-y-4">
                <div className="mb-3">
                  <GoogleCalendarCallbackToast />
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
                    description="Preferência visual deste navegador, aplicada à agenda"
                  />
                  <div className="space-y-2 ml-11">
                    {eventColors.map((ec) => (
                      <div key={ec.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <input
                            type="color"
                            value={ec.color}
                            onChange={(e) => setEventColor(ec.id, e.target.value)}
                            aria-label={`Cor do evento ${ec.label}`}
                            className="w-7 h-7 rounded-lg border border-(--border-custom) cursor-pointer p-0.5"
                          />
                          <span className="text-xs font-medium text-(--text)">{ec.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[0.6rem] font-mono text-(--text-muted)">{ec.color}</span>
                          <div
                            className="w-16 h-5 rounded flex items-center justify-center text-[0.45rem] font-bold"
                            style={{ backgroundColor: ec.color + '20', border: `1.5px solid ${ec.color}`, color: ec.color }}
                          >
                            Prévia
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="border border-(--border-custom) rounded-xl overflow-hidden bg-white">
              <div className="px-4 py-3 border-b border-(--border-custom) bg-[#F7F9F9]">
                <h2 className="text-xs font-bold text-(--text)">Tipos de Imunoterapia</h2>
              </div>
              <div className="p-4 space-y-3">
                <p className="text-[0.65rem] text-(--text-muted) leading-relaxed">
                  Tipos derivados das imunoterapias já prescritas na clínica —
                  somente leitura. Novos tipos são criados ao prescrever uma
                  imunoterapia.
                </p>
                {typesQuery.isPending ? (
                  <p className="text-xs text-(--text-muted)">Carregando tipos…</p>
                ) : typesQuery.isError ? (
                  <p role="alert" className="text-[0.65rem] text-red-700">
                    Não foi possível carregar os tipos de imunoterapia.
                  </p>
                ) : typesQuery.data.length === 0 ? (
                  <p className="text-xs text-(--text-muted)">
                    Nenhum tipo cadastrado ainda.
                  </p>
                ) : (
                  <ul className="flex flex-wrap gap-1.5">
                    {typesQuery.data.map((label) => (
                      <li
                        key={label}
                        className="px-3 py-1.5 rounded-lg border border-(--border-custom) bg-gray-50/40 text-xs font-medium text-(--text)"
                      >
                        {label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            <section className="border border-(--border-custom) rounded-xl overflow-hidden bg-white">
              <div className="px-4 py-3 border-b border-(--border-custom) bg-[#F7F9F9]">
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
              <section className="border border-(--border-custom) rounded-xl overflow-hidden bg-white">
                <div className="px-4 py-3 border-b border-(--border-custom) bg-[#F7F9F9]">
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
