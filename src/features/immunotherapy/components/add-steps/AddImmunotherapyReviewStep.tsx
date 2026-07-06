import { GLASS_CARD_SHADOW, PaperIcon } from '@/shared/components/glass-card'
import { MODALITY_LABELS, type Modality } from '@/features/immunotherapy/constants/modality'
import { formatIsoToPtOrDash } from '@/shared/lib/dates'
import type { AddImmunotherapyForm } from '@/features/immunotherapy/schemas/add-immunotherapy'

interface AddImmunotherapyReviewStepProps {
  form: AddImmunotherapyForm
}

export function AddImmunotherapyReviewStep({ form }: AddImmunotherapyReviewStepProps) {
  const patientItems = [
    { label: 'Nome', value: form.name || '—' },
    { label: 'CPF', value: form.cpf || '—' },
    { label: 'Telefone', value: form.phone || '—' },
    { label: 'Data de Nascimento', value: formatIsoToPtOrDash(form.birthDate) },
    { label: 'Peso', value: form.weight ? `${form.weight} kg` : '—' },
    { label: 'Médico Responsável', value: form.responsibleDoctor || '—' },
  ]

  const immunoItems = [
    { label: 'Tipo', value: form.type || '—' },
    { label: 'Via Cutânea', value: MODALITY_LABELS[form.modality as Modality] || '—' },
    { label: 'Data de Início', value: formatIsoToPtOrDash(form.startDate) },
    { label: 'Extrato', value: form.extract || '—' },
    { label: 'Meta de Concentração', value: form.targetConcentration || '—' },
    { label: 'Meta de Volume', value: form.targetVolume ? `${form.targetVolume} ml` : '—' },
  ]

  return (
    <div className="space-y-3.5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-(--text)">Revisão dos dados</h2>
          <p className="text-[0.7rem] text-(--text-muted) mt-1">Confirme os dados antes de salvar a prescrição.</p>
        </div>
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
          <PaperIcon size={32} />
          <p className="text-[0.75rem] text-slate-600 leading-relaxed whitespace-nowrap">
            Após confirmar, o protocolo será iniciado e a primeira dose será agendada para <span className="font-bold text-slate-800">{formatIsoToPtOrDash(form.startDate)}</span>.
          </p>
        </div>
      </div>

      <ReviewSection title="Dados do Paciente" items={patientItems} />
      <ReviewSection title="Dados da Imunoterapia" items={immunoItems} />
    </div>
  )
}

interface ReviewSectionProps {
  title: string
  items: { label: string; value: string }[]
}

function ReviewSection({ title, items }: ReviewSectionProps) {
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
      <div className="-mt-px rounded-b-xl rounded-tr-xl border border-(--border-custom) bg-gray-50/80 p-4">
        <div className="grid grid-cols-2 gap-px bg-(--border-custom) rounded-lg overflow-hidden border border-(--border-custom)">
          {items.map((item) => (
            <div key={item.label} className="bg-white px-3.5 py-2.5">
              <div className="text-[0.6rem] font-semibold uppercase tracking-wider text-(--text-muted) mb-0.5">{item.label}</div>
              <div className="text-xs font-medium text-(--text)">{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
