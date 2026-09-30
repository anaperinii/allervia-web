import { StepHeading } from '@/shared/components'
import { cn } from '@/shared/lib/cn'
import { formatIsoToPtOrDash } from '@/shared/lib/dates'
import { formatStepOption } from '@/features/patient/adapters/clinical-presentation'
import type { ProtocolStep } from '@/shared/api/contracts/protocols'
import type { AddImmunotherapyForm } from '@/features/immunotherapy/schemas/add-immunotherapy'

interface AddImmunotherapyReviewStepProps {
  form: AddImmunotherapyForm
  versionLabel: string
  steps: ProtocolStep[]
}

export function AddImmunotherapyReviewStep({
  form,
  versionLabel,
  steps,
}: AddImmunotherapyReviewStepProps) {
  const stepById = new Map(steps.map((step) => [step.id, step]))
  const starting = stepById.get(form.startingStepId)
  const target = stepById.get(form.targetStepId)

  const patientItems = [
    { label: 'Nome', value: form.name || '—' },
    { label: 'CPF', value: form.cpf || '—' },
    { label: 'Telefone', value: form.phone || '—' },
    { label: 'Data de Nascimento', value: formatIsoToPtOrDash(form.birthDate) },
    { label: 'Peso', value: form.weight ? `${form.weight} kg` : '—' },
    {
      label: 'Cadastro',
      value: form.patientId ? 'Paciente já cadastrado' : 'Novo cadastro',
    },
  ]

  const prescriptionItems = [
    { label: 'Tipo', value: form.type || '—' },
    { label: 'Via', value: 'Subcutânea (SCIT)' },
    { label: 'Data de Início', value: formatIsoToPtOrDash(form.startDate) },
    { label: 'Extrato', value: form.extract || '—' },
    { label: 'Versão do protocolo', value: versionLabel || '—' },
    {
      label: 'Etapa inicial',
      value: starting
        ? formatStepOption(starting)
        : '—',
    },
    {
      label: 'Etapa meta',
      value: target ? formatStepOption(target) : '—',
    },
  ]

  return (
    <div className="space-y-3">
      <StepHeading description="Revise a prescrição. Ao salvar, paciente, tratamento e primeira previsão são gravados juntos — ou nada é gravado." />
      <div className="grid grid-cols-1 gap-3">
        <ReviewCard title="Paciente" items={patientItems} />
        <ReviewCard title="Prescrição" items={prescriptionItems} />
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
      {/* As linhas da grade saem das próprias células: sobra na última linha
          fica com o fundo do card, sem o bloco escuro do contêiner. */}
      <div className="grid grid-cols-3 rounded-lg overflow-hidden border border-(--border-custom)">
        {items.map((item, index) => (
          <div
            key={item.label}
            className={cn(
              'bg-white px-3 py-2',
              index % 3 !== 2 && index !== items.length - 1 && 'border-r border-(--border-custom)',
              index < items.length - (items.length % 3 || 3) && 'border-b border-(--border-custom)',
            )}
          >
            <div className="text-[0.7rem] font-semibold text-(--text-muted) mb-0.5">{item.label}</div>
            <div className="text-[0.82rem] font-medium text-(--text)">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
