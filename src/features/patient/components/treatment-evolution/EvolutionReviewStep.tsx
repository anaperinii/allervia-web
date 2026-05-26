import { CalendarDays } from 'lucide-react'
import { format, parse } from 'date-fns'
import { cn } from '@/shared/lib/cn'
import type { EvolutionForm } from '@/features/patient/schemas/evolution'

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
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-(--text)">Revisão da evolução</h2>
          <p className="text-[0.7rem] text-(--text-muted) mt-1">Confirme os dados antes de registrar a dose.</p>
        </div>
        {plannedNextDate && (
          <div className="flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-lg px-3 py-2 shrink-0">
            <CalendarDays size={13} className="text-teal-600 shrink-0" />
            <p className="text-[0.7rem] text-teal-800 leading-relaxed">
              Próxima dose agendada para <span className="font-bold">{plannedNextDate}</span>
              {plannedNextInterval != null && (
                <> (intervalo de <span className="font-bold">{plannedNextInterval} dias</span> a partir da aplicação).</>
              )}
            </p>
          </div>
        )}
      </div>

      <Section title="Pré-Aplicação">
        <Grid
          items={preItems}
          header={form.intervalReport ? { label: 'Relato do intervalo', value: form.intervalReport } : undefined}
        />
      </Section>

      <Section title="Pós-Aplicação">
        <Grid items={postItems} />
      </Section>
    </div>
  )
}

interface SectionProps {
  title: string
  children: React.ReactNode
}

function Section({ title, children }: SectionProps) {
  return (
    <div className="border border-(--border-custom) rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-(--border-custom) bg-white">
        <span className="text-xs font-bold text-(--text)">{title}</span>
      </div>
      <div className="bg-gray-50/60 p-4">{children}</div>
    </div>
  )
}

function Grid({
  items,
  header,
}: {
  items: { label: string; value: string }[]
  header?: { label: string; value: string }
}) {
  return (
    <div className="rounded-lg overflow-hidden border border-(--border-custom) bg-(--border-custom)">
      {header && (
        <div className="bg-white px-3.5 py-2.5">
          <div className="text-[0.6rem] font-semibold uppercase tracking-wider text-(--text-muted) mb-0.5">{header.label}</div>
          <div className="text-xs font-medium text-(--text) leading-relaxed">{header.value}</div>
        </div>
      )}
      <div className={cn('grid grid-cols-2 gap-px', header && 'mt-px')}>
        {items.map((item) => (
          <div key={item.label} className="bg-white px-3.5 py-2.5">
            <div className="text-[0.6rem] font-semibold uppercase tracking-wider text-(--text-muted) mb-0.5">{item.label}</div>
            <div className="text-xs font-medium text-(--text)">{item.value || '—'}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
