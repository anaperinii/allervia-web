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
import { faChevronDown, faChevronUp, faCircleInfo, faClockRotateLeft, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'

interface PatientInfoSidebarProps {
  patient: Patient
  /** Meta da prescrição: última etapa permitida da versão fixada. */
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

  const therapyStatusDisplay =
    therapyStatus === 'IN_PROGRESS'
      ? { label: 'Tratamento em andamento', dot: 'bg-emerald-500' }
      : therapyStatus === 'SUSPENDED'
        ? { label: 'Tratamento suspenso', dot: 'bg-yellow-500' }
        : therapyStatus === 'COMPLETED'
          ? { label: 'Tratamento concluído', dot: 'bg-gray-400' }
          : { label: 'Sem tratamento selecionado', dot: 'bg-gray-300' }

  const immunoRows: [string, React.ReactNode][] = [
    ['Tipo', patient.immunotherapyType],
    ['Via de Administração', patient.administrationRoute],
    [
      'Início Indução',
      <span className="inline-flex items-center gap-1.5">
        {treatmentTime && <StatusBadge tone="gray">{treatmentTime}</StatusBadge>}
        {inductionStart || '-'}
      </span>,
    ],
    ['Início Manutenção', maintenanceStart || '-'],
    ['Meta Concentração e Volume', targetValues || patient.targetConcentrationVolume || '-'],
  ]

  const showImmunoActions =
    canRevisePrescription ||
    therapyStatus !== null ||
    (patient.protocolAdjustments?.length ?? 0) > 0 ||
    inactivationCount > 0

  return (
    <div className="flex w-104 shrink-0 flex-col overflow-hidden rounded-xl border border-(--border-custom) bg-white">
      <div className="border-b border-(--border-custom) px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="relative shrink-0">
            <PatientInitials name={patient.name} size={48} />
            <span
              title={therapyStatusDisplay.label}
              aria-label={therapyStatusDisplay.label}
              className={cn(
                'absolute -left-0.5 top-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white',
                therapyStatusDisplay.dot,
              )}
            />
          </span>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-(--text) leading-tight">{patient.name}</h1>
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
            completeDisabled={completeDisabled}
            patientStatus={patient.status}
            onInactivate={onInactivate}
            onPortability={onPortability}
            onComplete={onComplete}
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
              {showImmunoActions && (
                <div className="pt-2 mt-1 border-t border-(--border-custom) flex items-center gap-1.5">
                  {canRevisePrescription && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      disabled={therapyStatus !== 'IN_PROGRESS'}
                      onClick={onRevisePrescription}
                    >
                      Revisar prescrição
                    </Button>
                  )}
                  {therapyStatus !== null && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      leftIcon={<FontAwesomeIcon icon={faClockRotateLeft} style={{ fontSize: 10 }} />}
                      onClick={onShowLifecycleHistory}
                    >
                      Histórico
                    </Button>
                  )}
                </div>
              )}
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

function StatusBadge({ tone, dot, children }: { tone: 'emerald' | 'yellow' | 'gray'; dot?: boolean; children: React.ReactNode }) {
  const map = {
    emerald: { wrap: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
    yellow: { wrap: 'bg-yellow-50 text-yellow-700 border-yellow-200', dot: 'bg-yellow-500' },
    gray: { wrap: 'bg-gray-100 text-gray-600 border-gray-200', dot: 'bg-gray-400' },
  }
  const s = map[tone]
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[0.6rem] font-semibold border', s.wrap)}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', s.dot)} />}
      {children}
    </span>
  )
}
