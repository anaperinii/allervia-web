import { StepHeading } from '@/shared/components'
import { formatIsoToPtOrDash } from '@/shared/lib/dates'
import { formatStepPresentation } from '@/features/patient/adapters/clinical-presentation'
import type { ProtocolStep } from '@/shared/api/contracts/protocols'
import type { AddImmunotherapyForm } from '@/features/immunotherapy/schemas/add-immunotherapy'

interface AddImmunotherapyReviewStepProps {
  form: AddImmunotherapyForm
  versionLabel: string
  steps: ProtocolStep[]
  existingPatientName: string | null
  timeZone: string
}

/**
 * Revisão da intenção antes do envio: valores exatos da versão fixada, fuso da
 * prescrição e paciente resolvido. O que aparece aqui é o que o servidor grava.
 */
export function AddImmunotherapyReviewStep({
  form,
  versionLabel,
  steps,
  existingPatientName,
  timeZone,
}: AddImmunotherapyReviewStepProps) {
  const stepById = new Map(steps.map((step) => [step.id, step]))
  const starting = stepById.get(form.startingStepId)
  const target = stepById.get(form.targetStepId)

  const patientItems =
    form.patientMode === 'existing'
      ? [{ label: 'Paciente', value: existingPatientName ?? '—' }]
      : [
          { label: 'Nome', value: form.name || '—' },
          { label: 'CPF', value: form.cpf || 'Não informado' },
          { label: 'Telefone', value: form.phone || '—' },
          { label: 'Data de Nascimento', value: formatIsoToPtOrDash(form.birthDate) },
          { label: 'Peso', value: form.weight ? `${form.weight} kg` : '—' },
        ]

  const prescriptionItems = [
    { label: 'Tipo', value: form.type || '—' },
    { label: 'Via', value: 'Subcutânea (SCIT)' },
    { label: 'Data de Início', value: formatIsoToPtOrDash(form.startDate) },
    { label: 'Extrato', value: form.extract || '—' },
    { label: 'Versão do protocolo', value: versionLabel || '—' },
    { label: 'Fuso da prescrição', value: timeZone },
    {
      label: 'Etapa inicial',
      value: starting
        ? `${starting.label} — ${formatStepPresentation(starting)}`
        : '—',
    },
    {
      label: 'Etapa meta',
      value: target ? `${target.label} — ${formatStepPresentation(target)}` : '—',
    },
    {
      label: 'Etapas permitidas',
      value:
        form.stepIds
          .map((id) => stepById.get(id)?.label ?? id)
          .join(', ') || '—',
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
