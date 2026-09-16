import { faBolt, faBuilding, faCrown } from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'

export type PlanId = 'starter' | 'professional' | 'enterprise'

export interface Plan {
  id: PlanId
  name: string
  price: string
  period: string
  description: string
  icon: IconDefinition
  features: string[]
}

export const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 'R$ 89',
    period: '/mês',
    description: 'Para clínicas iniciando com imunoterapia alérgica',
    icon: faBolt,
    features: ['Até 50 pacientes', 'Protocolos SCIT e SLIT', 'Até 4 profissionais', 'Dashboard padrão', 'Agendamentos'],
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 'R$ 197',
    period: '/mês',
    description: 'Para clínicas em crescimento',
    icon: faBuilding,
    features: ['Até 500 pacientes', 'Protocolos SCIT e SLIT', 'Até 10 profissionais', 'Dashboard personalizável', 'Relatórios exportáveis', 'Integração com Google Agenda'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Sob consulta',
    period: '',
    description: 'Para redes de clínicas e hospitais',
    icon: faCrown,
    features: ['Pacientes ilimitados', 'Protocolos além da imunoterapia alérgica', 'Profissionais ilimitados', 'Multi-unidade', 'API de integração', 'Auditoria avançada', 'Suporte dedicado'],
  },
]

export const MAX_PLAN_FEATURES = Math.max(...PLANS.map((plan) => plan.features.length))
