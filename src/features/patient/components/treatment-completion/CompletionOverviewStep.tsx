import { Trophy } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { DottedSpot } from '@/features/patient/components/DottedSpot'
import { CompletionMetrics } from '@/features/patient/components/treatment-completion/CompletionMetrics'
import { TreatmentTimeline } from '@/features/patient/components/treatment-completion/TreatmentTimeline'
import type { Application, Patient } from '@/features/patient/stores/usePatientStore'

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
      <div
        className="rounded-xl border px-5 py-4 flex items-center gap-4 overflow-hidden relative backdrop-blur-xl"
        style={{
          backgroundImage:
            'linear-gradient(160deg, rgba(220,225,229,0.14), rgba(220,225,229,0.04)), linear-gradient(160deg, #0e353d 0%, #08191d 100%)',
          borderColor: 'rgba(220,225,229,0.14)',
          boxShadow:
            '0 12px 30px -14px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.1), 0 0 22px -8px rgba(108,158,165,0.3)',
        }}
      >
        <DottedSpot className="pointer-events-none absolute bottom-0 right-0" />
        <div
          className="relative flex h-12 w-12 items-center justify-center rounded-full shrink-0 overflow-hidden"
          style={{
            background:
              'radial-gradient(circle at 20% 22%, rgba(255,255,255,0.28) 0%, transparent 40%), radial-gradient(circle at 80% 18%, rgba(255,255,255,0.16) 0%, transparent 45%), radial-gradient(circle at 78% 82%, rgba(255,255,255,0.22) 0%, transparent 45%), radial-gradient(circle at 22% 80%, rgba(255,255,255,0.14) 0%, transparent 42%), rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.22)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            boxShadow:
              'inset 0 0 14px rgba(255,255,255,0.18), inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.20)',
          }}
        >
          <Trophy size={22} style={{ color: '#9BC1C4' }} />
        </div>
        <div className="relative min-w-0">
          <div className="text-sm font-semibold" style={{ color: '#F2F6F7' }}>Encerramento do protocolo de imunoterapia</div>
          <div className="text-xs mt-0.5 leading-relaxed" style={{ color: '#8FB4BA' }}>
            Você está revisando o desfecho clínico de <span className="font-bold" style={{ color: '#EAF1F1' }}>{patient.name}</span>. Confira métricas, registre o plano de seguimento pós-alta e assine a conclusão nos próximos passos.
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
    <div className="border border-(--border-custom) rounded-xl bg-white/55 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden">
      <div className="px-4 py-2.5 border-b border-(--border-custom) text-sm font-bold text-(--text)">
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
