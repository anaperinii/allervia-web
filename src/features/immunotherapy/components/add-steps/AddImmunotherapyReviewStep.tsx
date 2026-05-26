import { Info, Syringe, User } from 'lucide-react'
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
      <div className="mb-4">
        <h2 className="text-sm font-bold text-(--text)">Revisão dos dados</h2>
        <p className="text-[0.7rem] text-(--text-muted) mt-1">Confirme os dados antes de salvar a prescrição.</p>
      </div>

      <ReviewSection icon={<User size={13} className="text-teal-600" />} title="Dados do Paciente" items={patientItems} />
      <ReviewSection icon={<Syringe size={13} className="text-teal-600" />} title="Dados da Imunoterapia" items={immunoItems} />

      <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg p-3.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 shrink-0">
          <Info size={14} className="text-amber-600" />
        </div>
        <p className="text-xs text-amber-800 leading-relaxed">
          Após confirmar, o protocolo será iniciado e a primeira dose será agendada para <span className="font-bold">{formatIsoToPtOrDash(form.startDate)}</span>.
        </p>
      </div>
    </div>
  )
}

interface ReviewSectionProps {
  icon: React.ReactNode
  title: string
  items: { label: string; value: string }[]
}

function ReviewSection({ icon, title, items }: ReviewSectionProps) {
  return (
    <div className="border border-(--border-custom) rounded-xl overflow-hidden">
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-(--border-custom) bg-white">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-100 shrink-0">{icon}</div>
        <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-(--text-muted)">{title}</span>
      </div>
      <div className="bg-gray-50/60 p-4">
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
