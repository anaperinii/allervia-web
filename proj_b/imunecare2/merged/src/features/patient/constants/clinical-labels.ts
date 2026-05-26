import type {
  InactivationCategory,
  ProtocolAdjustmentType,
} from '@/features/patient/stores/patient-store'

export const INACTIVATION_CATEGORY_LABELS: Record<InactivationCategory, string> = {
  treatment_completion: 'Conclusão do tratamento',
  mild_adverse_reaction: 'Reação adversa leve',
  severe_adverse_reaction: 'Reação adversa grave',
  acute_infection: 'Infecção aguda',
  pregnancy: 'Gestação',
  scheduled_surgery: 'Cirurgia programada',
  recent_vaccination: 'Vacinação recente',
  clinical_contraindication: 'Contraindicação clínica',
  protocol_change: 'Mudança de conduta clínica',
  lack_of_adherence: 'Falta de adesão',
  patient_request: 'Solicitação do paciente',
  other: 'Outro',
}

export const ADJUSTMENT_TYPE_LABELS: Record<ProtocolAdjustmentType, string> = {
  dose_reduction: 'Redução de dose',
  interval_increase: 'Aumento de intervalo',
  concentration_change: 'Alteração de concentração',
  suspension: 'Suspensão temporária',
  other: 'Outro',
}
