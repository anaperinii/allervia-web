import { useState } from 'react'
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  History,
  Info,
  Pencil,
  PowerOff,
  SlidersHorizontal,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/components'
import { INACTIVATION_CATEGORY_LABELS } from '@/features/patient/data/clinical-labels'
import type { Inactivation, Patient } from '@/features/patient/stores/patient-store'

interface PatientInfoSidebarProps {
  patient: Patient
  treatmentTime: string | null
  inicioInducao: string
  inicioManutencao: string | null
  activeInactivation: Inactivation | null
  inactivationCount: number
  canReactivate: boolean
  canEvolve: boolean
  canEmitReport: boolean
  canEditPatient: boolean
  canAdjustProtocol: boolean
  canInactivate: boolean
  onReactivate: () => void
  onEditPatient: () => void
  onAdjustProtocol: () => void
  onShowAdjustHistory: () => void
  onInactivate: () => void
  onShowInactivationHistory: () => void
}

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
}

export function PatientInfoSidebar({
  patient,
  treatmentTime,
  inicioInducao,
  inicioManutencao,
  activeInactivation,
  inactivationCount,
  canReactivate,
  canEvolve,
  canEmitReport,
  canEditPatient,
  canAdjustProtocol,
  canInactivate,
  onReactivate,
  onEditPatient,
  onAdjustProtocol,
  onShowAdjustHistory,
  onInactivate,
  onShowInactivationHistory,
}: PatientInfoSidebarProps) {
  const [showPersonal, setShowPersonal] = useState(true)
  const [showImmuno, setShowImmuno] = useState(true)
  const personalId = 'patient-personal-section'
  const immunoId = 'patient-immuno-section'

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
    ['Início Indução', inicioInducao || patient.inductionStart],
    ['Início Manutenção', inicioManutencao || patient.maintenanceStart || '-'],
    ['Meta Concentração e Volume', patient.targetConcentrationVolume],
  ]

  const showImmunoActions =
    canAdjustProtocol ||
    canInactivate ||
    (patient.protocolAdjustments?.length ?? 0) > 0 ||
    inactivationCount > 0

  return (
    <div className="flex w-[320px] shrink-0 flex-col rounded-xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden">
      <div className="border-b border-(--border-custom) px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-brand to-teal-400 text-base font-bold text-white shrink-0">
            {getInitials(patient.name)}
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-extrabold text-(--text) leading-tight">{patient.name}</h1>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              {patient.status === 'active' ? (
                <StatusBadge tone="emerald" dot>Tratamento Ativo</StatusBadge>
              ) : (
                <StatusBadge tone="yellow" dot>Tratamento Inativo</StatusBadge>
              )}
              {treatmentTime && (
                <StatusBadge tone="gray">{treatmentTime}</StatusBadge>
              )}
            </div>
          </div>
        </div>

        {patient.status === 'inactive' && activeInactivation && (
          <div className="mt-2.5 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
            <div className="flex items-center justify-between mb-0.5">
              <div className="text-[0.6rem] font-semibold text-yellow-700 flex items-center gap-1">
                <Info size={9} />
                Motivo da inativação
              </div>
              <span className="text-[0.55rem] text-yellow-700/80">{activeInactivation.startDate}</span>
            </div>
            <div className="text-[0.6rem] font-bold text-yellow-800 mb-0.5">{INACTIVATION_CATEGORY_LABELS[activeInactivation.category]}</div>
            <div className="text-[0.6rem] text-yellow-700 leading-relaxed">{activeInactivation.detail}</div>
            {activeInactivation.expectedReturnDate && (
              <div className="text-[0.55rem] text-yellow-700/80 mt-1">
                Retorno previsto: <span className="font-semibold">{activeInactivation.expectedReturnDate}</span>
              </div>
            )}
            <div className="text-[0.55rem] text-yellow-700/80 mt-0.5">
              Responsável: <span className="font-semibold">{activeInactivation.responsibleDoctor}</span>
            </div>
          </div>
        )}

        <div className="mt-3 flex gap-1.5">
          {patient.status === 'inactive' ? (
            canReactivate && (
              <Button tone="success" variant="solid" prominent fullWidth size="sm" onClick={onReactivate}>
                Reativar paciente
              </Button>
            )
          ) : (
            canEvolve && (
              <Button
                tone="brand"
                variant="solid"
                fullWidth
                to="/patient-evolution"
                search={{ patientId: patient.id }}
              >
                Evoluir Paciente
              </Button>
            )
          )}
          {canEmitReport && (
            <Button tone="brand" variant="outline" fullWidth to="/patient-report" search={{ patientId: patient.id }}>
              Emitir Relatório
            </Button>
          )}
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
            {showPersonal ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <div id={personalId} className={cn('overflow-hidden transition-all duration-300', showPersonal ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0')}>
            <div className="px-3.5 pb-3 space-y-2">
              {personalRows.map(([label, value]) => (
                <Row key={label} label={label} value={value} />
              ))}
              {canEditPatient && (
                <div className="pt-2 mt-1 border-t border-(--border-custom)">
                  <Button variant="outline" size="sm" fullWidth leftIcon={<Pencil size={11} />} onClick={onEditPatient}>
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
            {showImmuno ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <div id={immunoId} className={cn('overflow-hidden transition-all duration-300', showImmuno ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0')}>
            <div className="px-3.5 pb-3 space-y-2">
              {(patient.protocolAdjustments?.length ?? 0) > 0 && (
                <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-md px-2 py-1 text-[0.6rem] text-amber-700 font-semibold">
                  <AlertTriangle size={10} />
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
                <div className="pt-2 mt-1 border-t border-(--border-custom) space-y-1.5">
                  {(canAdjustProtocol || (patient.protocolAdjustments?.length ?? 0) > 0) && (
                    <div className="flex gap-2">
                      {canAdjustProtocol && (
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<SlidersHorizontal size={11} />}
                          disabled={patient.status === 'inactive'}
                          onClick={onAdjustProtocol}
                          className="flex-1"
                        >
                          Ajustar protocolo
                        </Button>
                      )}
                      {(patient.protocolAdjustments?.length ?? 0) > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<History size={11} />}
                          onClick={onShowAdjustHistory}
                          className={cn(!canAdjustProtocol && 'flex-1')}
                        >
                          {canAdjustProtocol ? String(patient.protocolAdjustments!.length) : `Histórico de ajustes (${patient.protocolAdjustments!.length})`}
                        </Button>
                      )}
                    </div>
                  )}
                  {canInactivate && patient.status === 'active' && (
                    <Button tone="warning" variant="outline" size="sm" fullWidth leftIcon={<PowerOff size={11} />} onClick={onInactivate}>
                      Inativar imunoterapia
                    </Button>
                  )}
                  {inactivationCount > 0 && (
                    <Button variant="outline" size="sm" fullWidth leftIcon={<History size={10} />} onClick={onShowInactivationHistory}>
                      Histórico de inativações ({inactivationCount})
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

function Row({ label, value, truncate }: { label: string; value: string; truncate?: boolean }) {
  return (
    <div className="flex justify-between text-[0.7rem]">
      <span className="text-(--text-muted)">{label}:</span>
      <span className={cn('font-medium text-(--text) text-right', truncate && 'max-w-[55%] truncate')}>{value}</span>
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
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.6rem] font-semibold border', s.wrap)}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', s.dot)} />}
      {children}
    </span>
  )
}
