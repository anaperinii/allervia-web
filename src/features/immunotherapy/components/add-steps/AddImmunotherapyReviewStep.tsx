import { MODALITY_LABELS, type Modality } from '@/features/immunotherapy/constants/modality'
import { StepHeading } from '@/shared/components'
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
    <div className="space-y-3">
      <StepHeading description="Revise o cadastro do paciente e do protocolo. Ao salvar, a primeira aplicação já é agendada." />
      <div className="grid grid-cols-1 gap-3">
        <ReviewCard title="Dados do Paciente" items={patientItems} />
        <ReviewCard title="Dados da Imunoterapia" items={immunoItems} />
      </div>
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
          className="absolute -left-3.5 h-5 w-[3px] rounded-r-full"
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
    <div>
      <div className="grid grid-cols-3 gap-px bg-(--border-custom) rounded-lg overflow-hidden border border-(--border-custom)">
        {items.map((item) => (
          <div key={item.label} className="bg-white px-3 py-2">
            <div className="text-[0.7rem] font-semibold text-(--text-muted) mb-0.5">{item.label}</div>
            <div className="text-[0.82rem] font-medium text-(--text)">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
