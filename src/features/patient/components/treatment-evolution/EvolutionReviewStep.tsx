import { format, parse } from 'date-fns'
import { CalendarCheck } from 'lucide-react'
import type { EvolutionForm } from '@/features/patient/schemas/evolution'

const REACTION_LABELS: Record<string, string> = {
  reduce_dose: 'Reduzir dose',
  increase_interval: 'Aumentar intervalo',
  suspend: 'Suspender temporariamente',
  maintain: 'Manter protocolo',
}

interface ReviewStepProps {
  form: EvolutionForm
  plannedNextDate: string | null
  plannedNextInterval: number | null
}

export function EvolutionReviewStep({ form, plannedNextDate, plannedNextInterval }: ReviewStepProps) {
  const preItems: { label: string; value: string }[] = [
    ...(form.intervalReport ? [{ label: 'Relato do intervalo', value: form.intervalReport }] : []),
    { label: 'Efeito Colateral', value: form.sideEffect === 'yes' ? 'Sim' : 'Não' },
    { label: 'Necessidade de Medicação', value: form.medicationNeeded === 'yes' ? 'Sim' : 'Não' },
    ...(form.sideEffect === 'yes' ? [{ label: 'Efeitos Relatados', value: form.reportedEffects || '—' }] : []),
    ...(form.medicationNeeded === 'yes' ? [{ label: 'Medicações', value: form.medications || '—' }] : []),
    ...(form.notesPre ? [{ label: 'Notas', value: form.notesPre }] : []),
  ]

  const postItems: { label: string; value: string }[] = [
    { label: 'Data', value: form.applicationDate ? format(parse(form.applicationDate, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy') : '—' },
    { label: 'Horário', value: form.startTime && form.endTime ? `${form.startTime} – ${form.endTime}` : '—' },
    { label: 'Volume Aplicado', value: form.appliedVolume ? `${form.appliedVolume} ml` : '—' },
    { label: 'Concentração', value: form.concentration || '—' },
    { label: 'Intervalo Próxima Dose', value: form.nextInterval ? `${form.nextInterval} dias` : '—' },
    { label: 'Responsável', value: form.administrator || '—' },
    { label: 'Efeito Colateral', value: form.sideEffectPost === 'yes' ? 'Sim' : 'Não' },
    ...(form.sideEffectPost === 'yes' ? [{ label: 'Efeitos Relatados', value: form.reportedEffectsPost || '—' }] : []),
    { label: 'Necessidade de Medicação', value: form.medicationNeededPost === 'yes' ? 'Sim' : 'Não' },
    ...(form.medicationNeededPost === 'yes' ? [{ label: 'Medicações', value: form.medicationsPost || '—' }] : []),
    ...(form.sideEffectPost === 'yes' && form.medicationNeededPost === 'yes' && form.reactionAdjustment
      ? [{ label: 'Conduta no protocolo', value: REACTION_LABELS[form.reactionAdjustment] ?? '—' }]
      : []),
    ...(form.reactionAdjustmentJustification
      ? [{ label: 'Justificativa da conduta', value: form.reactionAdjustmentJustification }]
      : []),
    ...(form.notesPost ? [{ label: 'Notas', value: form.notesPost }] : []),
  ]

  return (
    <div className="mt-1 space-y-3">
      <div className="grid grid-cols-1 gap-3">
        <ReviewCard title="Pré-Aplicação" items={preItems} />
        <ReviewCard title="Pós-Aplicação" items={postItems} />
      </div>

      {plannedNextDate && (
        <div
          className="relative flex items-center gap-3 overflow-hidden rounded-xl px-4 py-3"
          style={{
            background: 'linear-gradient(120deg, #fbfcfc, #f4f7f7)',
            boxShadow: '0 6px 18px -6px rgba(16,60,68,0.18)',
          }}
        >
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
            style={{ background: '#10b981', boxShadow: '0 2px 8px rgba(16,185,129,0.35)' }}
          >
            <CalendarCheck size={16} strokeWidth={2} style={{ color: '#ffffff' }} />
          </span>
          <p className="text-[0.78rem] leading-relaxed text-slate-600">
            Próxima dose agendada para <span className="font-bold text-slate-800">{plannedNextDate}</span>
            {plannedNextInterval != null && (
              <> (intervalo de <span className="font-bold text-slate-800">{plannedNextInterval} dias</span> a partir da aplicação).</>
            )}
          </p>
        </div>
      )}
    </div>
  )
}

interface ReviewCardProps {
  title: string
  items: { label: string; value: string }[]
}

function ReviewCard({ title, items }: ReviewCardProps) {
  return (
    <div
      className="relative overflow-hidden rounded-xl px-3.5 pt-4 pb-4"
      style={{
        background: 'radial-gradient(120% 130% at 12% 10%, #f5f8f8 0%, #eff4f4 52%, #e9f0f0 100%)',
        border: '1px solid rgba(16,113,129,0.14)',
      }}
    >
      <div className="relative mb-3 flex items-center">
        <span
          aria-hidden="true"
          className="absolute -left-3.5 h-5 w-0.75 rounded-r-full"
          style={{ background: '#257E8C' }}
        />
        <div className="text-[0.8rem] font-bold text-(--text)">{title}</div>
      </div>
      <ReviewGroup items={items} />
    </div>
  )
}

interface ReviewGroupProps {
  items: { label: string; value: string }[]
}

function ReviewGroup({ items }: ReviewGroupProps) {
  return (
    <div className="grid grid-cols-3 gap-px bg-(--border-custom) rounded-lg overflow-hidden border border-(--border-custom)">
      {items.map((item) => (
        <div key={item.label} className="bg-white px-3 py-2">
          <div className="text-[0.7rem] font-semibold text-(--text-muted) mb-0.5">{item.label}</div>
          <div className="text-[0.82rem] font-medium text-(--text)">{item.value || '—'}</div>
        </div>
      ))}
    </div>
  )
}
