import { Trophy } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { CompletionMetrics } from '@/features/patient/components/completion/completion-metrics'
import { TreatmentTimeline } from '@/features/patient/components/completion/treatment-timeline'
import type { Application, Patient } from '@/features/patient/stores/patient-store'

interface CompletionOverviewStepProps {
  patient: Patient
  applications: Application[]
  inductionStart: string | null
  maintenanceStart: string | null
  totalApplications: number
  adherencePct: number
  rescheduledCount: number
  adverseEventsCount: number
  totalDurationLabel: string
}

export function CompletionOverviewStep({
  patient,
  applications,
  inductionStart,
  maintenanceStart,
  totalApplications,
  adherencePct,
  rescheduledCount,
  adverseEventsCount,
  totalDurationLabel,
}: CompletionOverviewStepProps) {
  const personalRows: [string, string][] = [
    ['Data de Nascimento', patient.birthDate],
    ['Idade', `${patient.age} anos`],
    ['CPF', patient.cpf],
    ['Telefone', patient.phone],
    ['Peso', patient.weight],
    ['Médico Responsável', patient.responsibleDoctor],
  ]

  const immunoRows: [string, string][] = [
    ['Tipo', patient.immunotherapyType],
    ['Via de Administração', patient.administrationRoute],
    ['Início Indução', inductionStart ?? '-'],
    ['Início Manutenção', maintenanceStart ?? '-'],
    ['Meta Concentração e Volume', patient.targetConcentrationVolume],
    ['Extrato', patient.extract],
  ]

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-linear-to-br from-teal-50 via-white to-white border border-teal-200 px-5 py-4 flex items-center gap-4 overflow-hidden relative">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-white shrink-0 shadow-[0_4px_16px_rgba(20,184,166,0.35)]">
          <Trophy size={20} />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-bold text-teal-800">Encerramento do protocolo de imunoterapia</div>
          <div className="text-[0.7rem] text-teal-800/80 mt-0.5 leading-relaxed">
            Você está revisando o desfecho clínico de <span className="font-bold">{patient.name}</span>. Confira métricas, registre o plano de seguimento pós-alta e assine a conclusão nos próximos passos.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <DetailsCard title="Dados Pessoais" rows={personalRows} />
        <DetailsCard title="Dados da Imunoterapia" rows={immunoRows} />
      </div>

      <CompletionMetrics
        totalApplications={totalApplications}
        adherencePct={adherencePct}
        rescheduledCount={rescheduledCount}
        adverseEventsCount={adverseEventsCount}
        totalDurationLabel={totalDurationLabel}
      />

      <TreatmentTimeline
        applications={applications}
        inductionStart={inductionStart ?? '—'}
        maintenanceStart={maintenanceStart}
      />
    </div>
  )
}

function DetailsCard({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <div className="border border-(--border-custom) rounded-xl bg-white overflow-hidden">
      <div className="px-4 py-2.5 border-b border-(--border-custom) text-xs font-bold text-(--text)">
        {title}
      </div>
      <div className="px-4 py-3 space-y-2">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-3 text-[0.7rem]">
            <span className="text-(--text-muted) shrink-0">{label}:</span>
            <span className={cn('font-medium text-(--text) text-right max-w-[55%] wrap-break-word leading-relaxed')}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
