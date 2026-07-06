import { format, parse } from 'date-fns'
import { cn } from '@/shared/lib/cn'
import { GLASS_CARD_SHADOW, TickIcon } from '@/shared/components/glass-card'
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
          <div
            className="flex items-center gap-3 rounded-2xl bg-white/25 px-4 py-2 backdrop-blur-xl shrink-0"
            style={{
              boxShadow: GLASS_CARD_SHADOW,
              backdropFilter: 'blur(20px) saturate(150%)',
              WebkitBackdropFilter: 'blur(20px) saturate(150%)',
              backgroundImage:
                'linear-gradient(105deg, rgba(20,184,166,0.18) 0%, rgba(94,234,212,0.10) 25%, rgba(240,253,250,0.04) 55%, transparent 80%)',
            }}
          >
            <TickIcon size={32} variant="aqua" />
            <p className="text-[0.75rem] text-slate-600 leading-relaxed whitespace-nowrap">
              Próxima dose agendada para <span className="font-bold text-slate-800">{plannedNextDate}</span>
              {plannedNextInterval != null && (
                <> (intervalo de <span className="font-bold text-slate-800">{plannedNextInterval} dias</span> a partir da aplicação).</>
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
    <div>
      <div className="relative inline-block rounded-t-xl border border-b-0 border-(--border-custom) bg-gray-50/80 px-4 py-2">
        <span className="text-[0.82rem] font-bold text-(--text)">{title}</span>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-3 bottom-0 h-3 w-3"
          style={{
            background:
              'radial-gradient(circle at 100% 0%, transparent 11.5px, rgba(249,250,251,0.8) 12.5px)',
          }}
        />
      </div>
      <div className="-mt-px rounded-b-xl rounded-tr-xl border border-(--border-custom) bg-gray-50/80 p-4">{children}</div>
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
