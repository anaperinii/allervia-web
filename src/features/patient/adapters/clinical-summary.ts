import type { DoseDetail, DoseRecord } from '@/shared/api/contracts/clinical'
import { formatStepPresentation } from './clinical-presentation'


export function buildClinicalSummary(records: DoseRecord[], detail: DoseDetail | null) {
  const administered = records
    .filter((dose) => dose.administeredAt !== null && dose.status !== 'ENTERED_IN_ERROR' && !dose.isArchived)
    .sort((a, b) => (b.administeredAt ?? '').localeCompare(a.administeredAt ?? '') || a.id.localeCompare(b.id))
  const pending = records.find((dose) => dose.status === 'SCHEDULED' && !dose.isArchived) ?? null
  const last = administered[0] ?? null
  const targetId = detail?.immunotherapy.currentPrescription?.resolved.targetStepId
  const target = targetId ? detail?.allowedValues.find((step) => step.id === targetId) : null
  const current = pending?.plannedValues ?? last?.administeredValues ?? null
  return {
    administered,
    detailDoseId: pending?.id ?? last?.id ?? null,
    targetPresentation: target ? formatStepPresentation(target) : null,
    currentPresentation: current ? formatStepPresentation(current) : null,
    intervalDays: last?.administeredValues?.intervalDays ?? pending?.plannedValues?.intervalDays ?? null,
    targetReached: targetId && last?.administeredStepId ? last.administeredStepId === targetId : null,
    reactionsCount: null as number | null,
  }
}
