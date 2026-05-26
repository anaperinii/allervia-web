import { useState } from 'react'
import { Check, Eye, Pencil, Pill, Plus, Sprout, X } from 'lucide-react'
import type { UseFormReturn } from 'react-hook-form'
import { cn } from '@/shared/lib/utils'
import { Button, FieldLabel, TextArea, TextInput } from '@/shared/components'
import type { CompletionForm } from '@/features/patient/schemas/completion'

interface RecommendationItem {
  key: keyof Pick<CompletionForm, 'recommendRetesting' | 'maintainRescueMed' | 'environmentalControl'>
  icon: typeof Eye
  title: string
  hint: string
}

const RECOMMENDATIONS: RecommendationItem[] = [
  {
    key: 'recommendRetesting',
    icon: Eye,
    title: 'Recomendar retestagem alérgica',
    hint: 'Skin prick test ou IgE específica para documentar mudança imunológica.',
  },
  {
    key: 'maintainRescueMed',
    icon: Pill,
    title: 'Manter medicação de resgate prescrita',
    hint: 'Anti-histamínico oral e corticoide nasal SOS.',
  },
  {
    key: 'environmentalControl',
    icon: Sprout,
    title: 'Manter orientações de controle ambiental',
    hint: 'Encapamento de colchão e travesseiro, controle de ácaros, evicção de gatilhos.',
  },
]

interface CompletionFollowupStepProps {
  form: UseFormReturn<CompletionForm>
}

export function CompletionFollowupStep({ form }: CompletionFollowupStepProps) {
  const { register, watch, setValue } = form
  const customRecommendations = watch('customRecommendations') ?? []
  const [newRecommendation, setNewRecommendation] = useState('')

  const addCustomRecommendation = () => {
    const v = newRecommendation.trim()
    if (!v) return
    setValue('customRecommendations', [...customRecommendations, v], { shouldDirty: true })
    setNewRecommendation('')
  }

  const removeCustomRecommendation = (idx: number) => {
    setValue(
      'customRecommendations',
      customRecommendations.filter((_, i) => i !== idx),
      { shouldDirty: true },
    )
  }

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Plano de seguimento pós-alta"
        subtitle="Defina a vigilância de recidiva e as recomendações para os meses seguintes ao encerramento."
      />

      <div>
        <div className="text-[0.65rem] font-bold text-(--text-muted) uppercase tracking-wider mb-2">Recomendações</div>
        <div className="grid grid-cols-1 gap-2">
          {RECOMMENDATIONS.map((rec) => {
            const Icon = rec.icon
            const checked = !!watch(rec.key)
            return (
              <button
                key={rec.key}
                type="button"
                aria-pressed={checked}
                onClick={() => setValue(rec.key, !checked, { shouldDirty: true })}
                className={cn(
                  'flex items-start gap-3 rounded-lg border p-3 text-left transition-all cursor-pointer',
                  checked
                    ? 'border-brand bg-brand/5'
                    : 'border-(--border-custom) hover:border-brand/40',
                )}
              >
                <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg shrink-0', checked ? 'bg-brand text-white' : 'bg-gray-100 text-(--text-muted)')}>
                  <Icon size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[0.75rem] font-semibold text-(--text)">{rec.title}</div>
                  <div className="text-[0.6rem] text-(--text-muted) mt-0.5 leading-relaxed">{rec.hint}</div>
                </div>
                <div className={cn('flex h-4 w-4 items-center justify-center rounded border transition-all shrink-0 mt-1', checked ? 'bg-brand border-brand' : 'border-gray-300')}>
                  {checked && <Check size={10} className="text-white" />}
                </div>
              </button>
            )
          })}

          {customRecommendations.map((rec, idx) => (
            <div
              key={`custom-${idx}`}
              className="flex items-start gap-3 rounded-lg border border-brand bg-brand/5 p-3 animate-in fade-in-0 slide-in-from-top-1 duration-200"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0 bg-brand text-white">
                <Pencil size={13} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[0.65rem] font-semibold text-brand uppercase tracking-wider mb-0.5">Recomendação personalizada</div>
                <div className="text-[0.7rem] text-(--text) leading-relaxed">{rec}</div>
              </div>
              <button
                type="button"
                onClick={() => removeCustomRecommendation(idx)}
                aria-label="Remover recomendação"
                className="flex h-5 w-5 items-center justify-center rounded text-(--text-muted) hover:bg-gray-100 hover:text-(--text) transition-colors shrink-0 cursor-pointer"
              >
                <X size={12} />
              </button>
            </div>
          ))}

          <div className="flex items-center gap-2">
            <TextInput
              placeholder="Adicione uma recomendação personalizada"
              value={newRecommendation}
              onChange={(e) => setNewRecommendation(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addCustomRecommendation()
                }
              }}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              leftIcon={<Plus size={12} />}
              onClick={addCustomRecommendation}
              disabled={!newRecommendation.trim()}
            >
              Adicionar
            </Button>
          </div>
        </div>
      </div>

      <FieldLabel label="Retornos de monitoramento" hint="(opcional)">
        <TextArea
          rows={2}
          placeholder="Ex: Retornos a cada 6 meses no primeiro ano e anualmente após o segundo ano."
          {...register('monitoringSchedule')}
        />
      </FieldLabel>

      <FieldLabel
        label="Sinais de alerta para retorno antecipado"
        hint="(opcional)"
        helperText="Liste sintomas que devem motivar o paciente a buscar avaliação fora da agenda de retornos."
      >
        <TextArea
          rows={3}
          placeholder="Ex: Reaparecimento de coriza persistente, crises de asma fora de controle, anafilaxia após exposição."
          {...register('warningSigns')}
        />
      </FieldLabel>

    </div>
  )
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <div className="w-1 h-4 rounded-full bg-brand" />
        <h2 className="text-sm font-bold text-(--text)">{title}</h2>
      </div>
      <p className="text-[0.65rem] text-(--text-muted) mt-1 leading-relaxed">{subtitle}</p>
    </div>
  )
}
