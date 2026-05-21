import {
  ClipboardList,
  Bell,
  BarChart3,
  BotMessageSquare,
  Syringe,
  ShieldCheck,
  Smartphone,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface Feature {
  icon: LucideIcon
  title: string
  description: string
  large: boolean
}

export const FEATURES: Feature[] = [
  { icon: ClipboardList, title: 'Prontuário Centralizado', description: 'Todos os dados do paciente, histórico de ciclos, doses aplicadas e reações adversas em um único painel intuitivo.', large: false },
  { icon: Bell, title: 'Alertas de Reações Adversas', description: 'Registro e rastreabilidade de reações adversas com notificações em tempo real para a equipe clínica.', large: false },
  { icon: BarChart3, title: 'Dashboards Analíticos', description: 'Visualize a evolução do tratamento com gráficos de progressão de doses, fases e métricas de adesão.', large: false },
  { icon: BotMessageSquare, title: 'Cálculo Automático de Doses', description: 'Motor inteligente que calcula automaticamente a próxima concentração, volume e intervalo com base em protocolos clínicos validados, reduzindo erros manuais.', large: true },
  { icon: Syringe, title: 'Gestão de Protocolos', description: 'Controle completo das fases de indução e manutenção de cada imunoterapia alérgica.', large: false },
  { icon: ShieldCheck, title: 'Segurança LGPD', description: 'Dados criptografados end-to-end e conformidade total com a Lei Geral de Proteção de Dados.', large: false },
  { icon: Smartphone, title: 'Acesso Mobile', description: 'Acompanhe seus pacientes de qualquer lugar, pelo celular ou tablet.', large: false },
]
