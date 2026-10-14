import { humanErrorMessage } from '@/shared/api/error-copy'
import { FieldLabel, Switch } from '@/shared/components'

interface AutomationCardProps {
  enabled: boolean
  loading: boolean
  saving: boolean
  canManage: boolean
  onToggle: (enabled: boolean) => void




  stale?: boolean
  onAcknowledgeStale?: () => void

  error?: unknown
  onRetry?: () => void
}

export function AutomationCard({
  enabled,
  loading,
  saving,
  canManage,
  onToggle,
  stale = false,
  onAcknowledgeStale,
  error,
  onRetry,
}: AutomationCardProps) {
  return (
    <section className="rounded-2xl border border-(--border-custom) bg-[#F6F8F8] overflow-hidden">
      <div className="px-4 py-3 border-b border-(--border-custom) bg-gray-50/50">
        <h2 className="text-xs font-bold text-(--text)">Automação da recomendação</h2>
      </div>
      <div className="p-4">
        {error ? (
          <div role="alert" className="space-y-2">
            <p className="text-[0.7rem] text-red-700">
              {humanErrorMessage(
                error,
                'Não foi possível ler a configuração de automação.',
              )}
            </p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="text-[0.7rem] font-semibold text-brand underline"
              >
                Tentar novamente
              </button>
            )}
          </div>
        ) : loading ? (
          <span className="text-xs text-(--text-muted)">Carregando…</span>
        ) : (
          <>
            {stale && (
              <div
                role="alert"
                className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[0.7rem] text-amber-800"
              >
                <p>
                  Outra pessoa alterou a automação. O valor exibido agora é o atual:{' '}
                  <strong>{enabled ? 'ligada' : 'desligada'}</strong>. Confirme de novo se
                  ainda quiser mudar.
                </p>
                <button
                  type="button"
                  onClick={onAcknowledgeStale}
                  className="mt-1 font-semibold underline"
                >
                  Revisei os valores atuais
                </button>
              </div>
            )}
            <FieldLabel label="Recomendação automática">
              <Switch
                checked={enabled}
                disabled={!canManage || saving || stale}
                onChange={onToggle}
                aria-label="Recomendação automática"
              />
            </FieldLabel>
            <p className="mt-3 text-[0.65rem] leading-relaxed text-(--text-muted)">
              A automação calcula a sucessora recomendada após cada aplicação.
              Desligá-la não restaura fluxos antigos: a aplicação continua
              registrando pelo servidor. As previsões usam o fuso clínico da
              organização, definido em Configurações Avançadas.
            </p>
          </>
        )}
      </div>
    </section>
  )
}
