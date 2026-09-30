import { FieldLabel, Switch } from '@/shared/components'

interface AutomationCardProps {
  enabled: boolean
  loading: boolean
  saving: boolean
  canManage: boolean
  onToggle: (enabled: boolean) => void
}

export function AutomationCard({
  enabled,
  loading,
  saving,
  canManage,
  onToggle,
}: AutomationCardProps) {
  return (
    <section className="rounded-2xl border border-(--border-custom) bg-[#F6F8F8] overflow-hidden">
      <div className="px-4 py-3 border-b border-(--border-custom) bg-gray-50/50">
        <h2 className="text-xs font-bold text-(--text)">Automação da recomendação</h2>
      </div>
      <div className="p-4">
        {loading ? (
          <span className="text-xs text-(--text-muted)">Carregando…</span>
        ) : (
          <>
            <FieldLabel label="Recomendação automática">
              <Switch
                checked={enabled}
                disabled={!canManage || saving}
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
