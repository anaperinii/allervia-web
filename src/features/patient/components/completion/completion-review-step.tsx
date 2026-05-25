import { AlertOctagon, Check, Lock } from 'lucide-react'
import type { UseFormReturn } from 'react-hook-form'
import { cn } from '@/shared/lib/utils'
import { FieldLabel, TextArea } from '@/shared/components'
import type { CompletionForm } from '@/features/patient/forms/completion'
import type { Patient } from '@/features/patient/stores/patient-store'

interface CompletionReviewStepProps {
  form: UseFormReturn<CompletionForm>
  patient: Patient
  doctorRegistration: string
  inductionStart: string | null
  totalApplications: number
  adverseEventsCount: number
  totalDurationLabel: string
}

const RECOMMENDATION_LABELS: { key: 'recommendRetesting' | 'maintainRescueMed' | 'environmentalControl'; label: string }[] = [
  { key: 'recommendRetesting', label: 'Retestagem alérgica' },
  { key: 'maintainRescueMed', label: 'Medicação de resgate' },
  { key: 'environmentalControl', label: 'Controle ambiental' },
]

export function CompletionReviewStep({
  form,
  patient,
  doctorRegistration,
  inductionStart,
  totalApplications,
  adverseEventsCount,
  totalDurationLabel,
}: CompletionReviewStepProps) {
  const { register, watch, setValue, formState: { errors } } = form
  const recommendations = RECOMMENDATION_LABELS.filter((recommendation) => watch(recommendation.key))
  const customRecommendations = watch('customRecommendations') ?? []
  const allRecommendations = [...recommendations.map((recommendation) => recommendation.label), ...customRecommendations]
  const monitoringSchedule = watch('monitoringSchedule')?.trim()
  const warningSigns = watch('warningSigns')?.trim()
  const confirmation = !!watch('confirmation')

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 rounded-full bg-brand" />
          <h2 className="text-sm font-bold text-(--text)">Revisão e assinatura</h2>
          <span className="inline-flex items-center gap-1 text-[0.55rem] font-semibold text-(--text-muted) bg-gray-100 border border-(--border-custom) rounded-full px-2 py-0.5 ml-auto">
            <Lock size={9} />
            imutável após confirmação
          </span>
        </div>
        <p className="text-[0.65rem] text-(--text-muted) mt-1 leading-relaxed">
          Confira o resumo do que será gravado no prontuário e assine o desfecho.
        </p>
      </div>

      <div className="border border-(--border-custom) rounded-xl bg-white overflow-hidden">
        <div className="px-4 py-2.5 border-b border-(--border-custom) bg-gray-50">
          <div className="text-[0.55rem] font-bold text-(--text-muted) uppercase tracking-wider">Resumo a ser gravado no prontuário</div>
        </div>
        <dl className="divide-y divide-(--border-custom)">
          <Row label="Paciente" value={`${patient.name} · ${patient.cpf}`} />
          <Row label="Imunoterapia" value={`${patient.immunotherapyType} · ${patient.administrationRoute}`} />
          <Row label="Período de tratamento" value={`${inductionStart ?? '-'} → hoje · ${totalDurationLabel}`} />
          <Row label="Aplicações realizadas" value={String(totalApplications)} />
          <Row label="Eventos adversos" value={String(adverseEventsCount)} />
          <Row label="Desfecho" value="Sucesso · objetivo terapêutico atingido" valueClass="text-emerald-700" />
          <Row
            label="Recomendações pós-alta"
            value={allRecommendations.length ? allRecommendations.join(' · ') : 'Nenhuma marcada'}
            multiline
          />
          {monitoringSchedule && <Row label="Retornos" value={monitoringSchedule} multiline />}
          {warningSigns && <Row label="Sinais de alerta" value={warningSigns} multiline />}
        </dl>
      </div>

      <FieldLabel label="Nota de conclusão" hint="(opcional)">
        <TextArea
          rows={2}
          placeholder="Observação clínica adicional, evolução notável, encaminhamentos."
          {...register('note')}
        />
      </FieldLabel>

      <div className="border border-(--border-custom) rounded-xl bg-white p-4 flex items-center justify-between gap-3">
        <div>
          <div className="text-[0.55rem] font-bold text-(--text-muted) uppercase tracking-wider">Médico responsável pela conclusão</div>
          <div className="text-sm font-bold text-(--text) mt-0.5">{patient.responsibleDoctor}</div>
        </div>
        <div className="text-right">
          <div className="text-[0.55rem] font-bold text-(--text-muted) uppercase tracking-wider">CRM</div>
          <div className="text-xs font-semibold text-(--text) mt-0.5">{doctorRegistration}</div>
        </div>
      </div>

      <button
        type="button"
        aria-pressed={confirmation}
        onClick={() => setValue('confirmation', !confirmation, { shouldValidate: true })}
        className={cn(
          'flex w-full items-start gap-2.5 rounded-lg border p-3 text-left transition-all cursor-pointer',
          confirmation ? 'border-brand bg-brand/5' : 'border-(--border-custom) hover:border-brand/40',
          errors.confirmation && !confirmation && 'border-red-300 bg-red-50/40',
        )}
      >
        <div className={cn('flex h-4 w-4 items-center justify-center rounded border transition-all shrink-0 mt-0.5', confirmation ? 'bg-brand border-brand' : 'border-gray-300')}>
          {confirmation && <Check size={10} className="text-white" />}
        </div>
        <span className="text-[0.7rem] text-(--text) leading-relaxed">
          Confirmo que <span className="font-bold">{patient.name}</span> atingiu o objetivo terapêutico e o tratamento será concluído com desfecho de sucesso.
        </span>
      </button>

      <div className="flex items-start gap-2 bg-amber-50/70 border border-amber-200 rounded-lg px-3 py-2.5">
        <AlertOctagon size={14} className="text-amber-600 shrink-0 mt-0.5" />
        <p className="text-[0.6rem] text-amber-800 leading-relaxed">
          Esta ação é <span className="font-bold">irreversível</span>. Após confirmar, o tratamento será marcado como concluído, as aplicações futuras canceladas e este registro tornará imutável no prontuário. Para reiniciar imunoterapia, será necessário criar um novo plano.
        </p>
      </div>
      {errors.confirmation && !confirmation && (
        <p className="text-[0.55rem] text-red-600">{errors.confirmation.message as string}</p>
      )}
    </div>
  )
}

function Row({ label, value, valueClass, multiline }: { label: string; value: string; valueClass?: string; multiline?: boolean }) {
  return (
    <div className="px-4 py-2 flex items-start gap-3">
      <dt className="text-[0.6rem] text-(--text-muted) w-40 shrink-0">{label}</dt>
      <dd className={cn('text-[0.7rem] font-semibold text-(--text) flex-1 min-w-0', multiline ? 'whitespace-pre-wrap leading-relaxed' : 'truncate', valueClass)}>
        {value}
      </dd>
    </div>
  )
}
