import { Zap, Building, Crown } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type PlanId = 'starter' | 'professional' | 'enterprise'

export interface Plan {
  id: PlanId
  name: string
  price: string
  period: string
  description: string
  icon: LucideIcon
  features: string[]
}

export const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 'Gratuito',
    period: '',
    description: 'Para clínicas iniciando com imunoterapia alérgica',
    icon: Zap,
    features: ['Até 50 pacientes', 'Protocolo SCIT básico', '1 profissional', 'Dashboard básico', 'Suporte por e-mail'],
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 'R$ 197',
    period: '/mês',
    description: 'Para clínicas em crescimento',
    icon: Building,
    features: ['Até 500 pacientes', 'Protocolos SCIT e SLIT', 'Até 10 profissionais', 'Dashboard completo', 'Relatórios exportáveis', 'Agendamentos', 'Suporte prioritário'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Sob consulta',
    period: '',
    description: 'Para redes de clínicas e hospitais',
    icon: Crown,
    features: ['Pacientes ilimitados', 'Todos os protocolos', 'Profissionais ilimitados', 'Multi-unidade', 'API de integração', 'Auditoria avançada', 'Gerente de conta dedicado', 'SLA 99.9%'],
  },
]

export const MAX_PLAN_FEATURES = Math.max(...PLANS.map((plan) => plan.features.length))
