import { CalendarDays, ClipboardList, Syringe } from 'lucide-react'
import { format, parse } from 'date-fns'
import type { EvolutionForm } from '@/features/patient/forms/evolution'

interface ReviewStepProps {
  form: EvolutionForm
  plannedNextDate: string | null
  plannedNextInterval: number | null
}

export function EvolutionReviewStep({ form, plannedNextDate, plannedNextInterval }: ReviewStepProps) {
  const preItems: { label: string; value: string }[] = [
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
    { label: 'Necessidade de Medicação', value: form.medicationNeededPost === 'yes' ? 'Sim' : 'Não' },
    ...(form.notesPost ? [{ label: 'Notas', value: form.notesPost }] : []),
  ]

  return (
    <div className="space-y-3.5">
      <div className="mb-4">
        <h2 className="text-sm font-bold text-(--text)">Revisão da evolução</h2>
        <p className="text-[0.7rem] text-(--text-muted) mt-1">Confirme os dados antes de registrar a dose.</p>
      </div>

      <Section icon={<ClipboardList size={13} className="text-teal-600" />} title="Pré-Aplicação">
        {form.intervalReport && (
          <div className="mb-3 bg-teal-50 border-l-2 border-teal-400 rounded-r-lg px-3 py-2.5">
            <div className="text-[0.6rem] font-semibold uppercase tracking-wider text-teal-700 mb-1">Relato do intervalo</div>
            <div className="text-xs text-teal-900 leading-relaxed">{form.intervalReport}</div>
          </div>
        )}
        <Grid items={preItems} />
      </Section>

      <Section icon={<Syringe size={13} className="text-teal-600" />} title="Pós-Aplicação">
        <Grid items={postItems} />
      </Section>

      <div className="flex items-center gap-2.5 bg-teal-50 border border-teal-200 rounded-lg px-3.5 py-3">
        <CalendarDays size={15} className="text-teal-600 shrink-0" />
        <p className="text-xs text-teal-800 leading-relaxed">
          Próxima dose agendada para <span className="font-bold">{plannedNextDate || '—'}</span>
          {plannedNextDate && plannedNextInterval != null && (
            <> (intervalo de <span className="font-bold">{plannedNextInterval} dias</span> a partir da aplicação).</>
          )}
        </p>
      </div>
    </div>
  )
}

interface SectionProps {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}

function Section({ icon, title, children }: SectionProps) {
  return (
    <div className="border border-(--border-custom) rounded-xl overflow-hidden">
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-(--border-custom) bg-white">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-100 shrink-0">
          {icon}
        </div>
        <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-(--text-muted)">{title}</span>
      </div>
      <div className="bg-gray-50/60 p-4">{children}</div>
    </div>
  )
}

function Grid({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-px bg-(--border-custom) rounded-lg overflow-hidden border border-(--border-custom)">
      {items.map((item) => (
        <div key={item.label} className="bg-white px-3.5 py-2.5">
          <div className="text-[0.6rem] font-semibold uppercase tracking-wider text-(--text-muted) mb-0.5">{item.label}</div>
          <div className="text-xs font-medium text-(--text)">{item.value || '—'}</div>
        </div>
      ))}
    </div>
  )
}
