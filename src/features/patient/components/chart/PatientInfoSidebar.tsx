import { useState } from 'react'
import { PatientInitials } from '@/shared/components/glass-card'
import { cn } from '@/shared/lib/cn'
import { formatCPF, formatPhone } from '@/shared/lib/formatters'
import { Button } from '@/shared/components'
import { INACTIVATION_CATEGORY_LABELS } from '@/features/patient/constants/clinical-labels'
import { PatientActionsMenu } from '@/features/patient/components/chart/PatientActionsMenu'
import type { Inactivation, Patient } from '@/features/patient/stores/usePatientStore'
import type { TherapyStatus } from '@/shared/api/contracts/clinical'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faChevronUp, faCircleInfo, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'

interface PatientInfoSidebarProps {
  patient: Patient

  targetValues: string | null
  therapyStatus: TherapyStatus | null
  evolutionTherapyId: string | null
  treatmentTime: string | null
  inductionStart: string | null
  maintenanceStart: string | null
  activeInactivation: Inactivation | null
  inactivationCount: number
  canReactivate: boolean
  canEvolve: boolean
  canEmitReport: boolean
  canEditPatient: boolean
  canInactivate: boolean
  canComplete: boolean
  completeDisabled: boolean
  canLgpdPortability: boolean
  canRevisePrescription: boolean
  onRevisePrescription: () => void
  onShowLifecycleHistory: () => void
  onReactivate: () => void
  onEditPatient: () => void
  onInactivate: () => void
  onPortability: () => void
  onComplete: () => void
}

export function PatientInfoSidebar({
  patient,
  targetValues,
  therapyStatus,
  evolutionTherapyId,
  treatmentTime,
  inductionStart,
  maintenanceStart,
  activeInactivation,
  inactivationCount,
  canReactivate,
  canEvolve,
  canEmitReport,
  canEditPatient,
  canInactivate,
  canComplete,
  completeDisabled,
  canLgpdPortability,
  canRevisePrescription,
  onRevisePrescription,
  onShowLifecycleHistory,
  onReactivate,
  onEditPatient,
  onInactivate,
  onPortability,
  onComplete,
}: PatientInfoSidebarProps) {
  const [showPersonal, setShowPersonal] = useState(true)
  const [showImmuno, setShowImmuno] = useState(true)
  const personalId = 'patient-personal-section'
  const immunoId = 'patient-immuno-section'

  const personalRows: [string, string][] = [
    ['Data de Nascimento', patient.birthDate],
    ['Idade', `${patient.age} anos`],
    ['CPF', formatCPF(patient.cpf)],
    ['Telefone', formatPhone(patient.phone)],
    ['Peso', patient.weight],
    ['Médico Responsável', patient.responsibleDoctor],
    ...(patient.guardian
      ? ([
          ['Responsável Legal', patient.guardian.name],
          ['CPF do Responsável', patient.guardian.cpf ? formatCPF(patient.guardian.cpf) : '—'],
          ['Tel. do Responsável', formatPhone(patient.guardian.phone)],
        ] as [string, string][])
      : []),
  ]

  const therapyStatusLabel =
    therapyStatus === 'IN_PROGRESS'
      ? 'Em andamento'
      : therapyStatus === 'SUSPENDED'
        ? 'Suspenso'
        : therapyStatus === 'COMPLETED'
          ? 'Concluído'
          : null

  const immunoRows: [string, React.ReactNode][] = [
    ...(therapyStatusLabel
      ? ([[
          'Status',
          <span className="inline-flex items-center gap-1.5">
            {therapyStatusLabel}
            {treatmentTime && <span className="text-(--text-muted)">({treatmentTime})</span>}
          </span>,
        ]] as [string, React.ReactNode][])
      : []),
    ['Tipo', patient.immunotherapyType],
    ['Via de Administração', patient.administrationRoute],
    ['Início Indução', inductionStart || '-'],
    ['Início Manutenção', maintenanceStart || '-'],
    ['Meta Concentração e Volume', targetValues || patient.targetConcentrationVolume || '-'],
  ]

  return (
    <div className="flex w-104 shrink-0 flex-col overflow-hidden rounded-xl border border-(--border-custom) bg-white">
      <div className="border-b border-(--border-custom) px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="shrink-0">
            <PatientInitials
              name={patient.name}
              size={48}
              muted={patient.status === 'inactive' || therapyStatus === 'SUSPENDED'}
            />
          </span>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-(--text) leading-tight">{patient.name}</h1>
          </div>
        </div>

        {patient.status === 'inactive' && activeInactivation && (
          <div className="mt-2.5 bg-gray-50 border border-(--border-custom) rounded-lg px-3 py-2">
            <div className="flex items-center justify-between mb-0.5">
              <div className="text-[0.6rem] font-semibold text-(--text-muted) flex items-center gap-1">
                <FontAwesomeIcon icon={faCircleInfo} style={{ fontSize: 9 }} />
                Motivo da inativação
              </div>
              <span className="text-[0.55rem] text-(--text-muted)">{activeInactivation.startDate}</span>
            </div>
            <div className="text-[0.6rem] font-bold text-(--text) mb-0.5">{INACTIVATION_CATEGORY_LABELS[activeInactivation.category]}</div>
            <div className="text-[0.6rem] text-(--text-muted) leading-relaxed">{activeInactivation.detail}</div>
            {activeInactivation.expectedReturnDate && (
              <div className="text-[0.55rem] text-(--text-muted) mt-1">
                Retorno previsto: <span className="font-semibold text-(--text)">{activeInactivation.expectedReturnDate}</span>
              </div>
            )}
            <div className="text-[0.55rem] text-(--text-muted) mt-0.5">
              Responsável: <span className="font-semibold text-(--text)">{activeInactivation.responsibleDoctor}</span>
            </div>
          </div>
        )}

        <div className="mt-3 flex gap-1.5">
          {therapyStatus === 'SUSPENDED' ? (
            canReactivate && (
              <Button tone="brand" variant="solid" fullWidth onClick={onReactivate}>
                Retomar tratamento
              </Button>
            )
          ) : (
            canEvolve &&
            evolutionTherapyId !== null &&
            therapyStatus === 'IN_PROGRESS' && (
              <Button
                tone="brand"
                variant="solid"
                fullWidth
                to="/patient-evolution"
                search={{ therapy: evolutionTherapyId }}
              >
                Evoluir Paciente
              </Button>
            )
          )}
          {canEmitReport && (
            <Button
              tone="brand"
              variant="outline"
              fullWidth
              to="/patient-report"
              search={{ patientId: patient.id, therapy: evolutionTherapyId ?? undefined }}
            >
              Emitir Relatório
            </Button>
          )}
          <PatientActionsMenu
            canInactivate={canInactivate}
            canLgpdPortability={canLgpdPortability}
            canComplete={canComplete}
            canRevisePrescription={canRevisePrescription}
            canShowLifecycleHistory={therapyStatus !== null}
            lifecycleEventCount={inactivationCount}
            completeDisabled={completeDisabled}
            revisePrescriptionDisabled={therapyStatus !== 'IN_PROGRESS'}
            patientStatus={patient.status}
            onInactivate={onInactivate}
            onPortability={onPortability}
            onComplete={onComplete}
            onRevisePrescription={onRevisePrescription}
            onShowLifecycleHistory={onShowLifecycleHistory}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        <div className="border border-(--border-custom) rounded-lg overflow-hidden">
          <button
            type="button"
            aria-expanded={showPersonal}
            aria-controls={personalId}
            onClick={() => setShowPersonal(!showPersonal)}
            className="flex w-full items-center justify-between px-3.5 py-2.5 text-xs font-bold text-(--text) hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Dados Pessoais
            {showPersonal ? <FontAwesomeIcon icon={faChevronUp} style={{ fontSize: 14 }} /> : <FontAwesomeIcon icon={faChevronDown} style={{ fontSize: 14 }} />}
          </button>
          <div id={personalId} className={cn('overflow-hidden transition-all duration-300', showPersonal ? 'max-h-120 opacity-100' : 'max-h-0 opacity-0')}>
            <div className="px-3.5 pb-3 space-y-2">
              {personalRows.map(([label, value]) => (
                <Row key={label} label={label} value={value} />
              ))}
              {canEditPatient && (
                <div className="pt-2 mt-1 border-t border-(--border-custom)">
                  <Button variant="outline" size="sm" fullWidth onClick={onEditPatient}>
                    Editar dados pessoais
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border border-(--border-custom) rounded-lg overflow-hidden">
          <button
            type="button"
            aria-expanded={showImmuno}
            aria-controls={immunoId}
            onClick={() => setShowImmuno(!showImmuno)}
            className="flex w-full items-center justify-between px-3.5 py-2.5 text-xs font-bold text-(--text) hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              Dados da Imunoterapia
              {(patient.protocolAdjustments?.length ?? 0) > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" title="Protocolo ajustado" />
              )}
            </span>
            {showImmuno ? <FontAwesomeIcon icon={faChevronUp} style={{ fontSize: 14 }} /> : <FontAwesomeIcon icon={faChevronDown} style={{ fontSize: 14 }} />}
          </button>
          <div id={immunoId} className={cn('overflow-hidden transition-all duration-300', showImmuno ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0')}>
            <div className="px-3.5 pb-3 space-y-2">
              {(patient.protocolAdjustments?.length ?? 0) > 0 && (
                <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-md px-2 py-1 text-[0.6rem] text-amber-700 font-semibold">
                  <FontAwesomeIcon icon={faTriangleExclamation} style={{ fontSize: 10 }} />
                  Protocolo ajustado · {patient.protocolAdjustments!.length} {patient.protocolAdjustments!.length === 1 ? 'alteração' : 'alterações'}
                </div>
              )}
              {immunoRows.map(([label, value]) => (
                <Row key={label} label={label} value={value} truncate />
              ))}
              <div className="flex justify-between text-[0.7rem]">
                <span className="text-(--text-muted) shrink-0">Extrato:</span>
                <span className="font-medium text-(--text) text-right max-w-[55%] wrap-break-word leading-relaxed">{patient.extract}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Row({
  label,
  value,
  truncate,
}: {
  label: string
  value: React.ReactNode
  truncate?: boolean
}) {
  return (
    <div className="flex justify-between gap-2 text-[0.7rem]">
      <span className="shrink-0 text-(--text-muted)">{label}:</span>
      <span className={cn('font-medium text-(--text) text-right', truncate && 'max-w-[62%] truncate')}>
        {value}
      </span>
    </div>
  )
}
