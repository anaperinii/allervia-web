import { faBell, faChartColumn, faClipboardList, faMobileScreen, faRobot, faShieldHalved, faSyringe } from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'

export interface Feature {
  icon: IconDefinition
  title: string
  description: string
  large: boolean
}

export const FEATURES: Feature[] = [
  { icon: faClipboardList, title: 'Prontuário Centralizado', description: 'Todos os dados do paciente, histórico de ciclos, doses aplicadas e reações adversas em um único painel intuitivo.', large: false },
  { icon: faBell, title: 'Alertas de Reações Adversas', description: 'Registro e rastreabilidade de reações adversas com notificações em tempo real para a equipe clínica.', large: false },
  { icon: faRobot, title: 'Cálculo Automático de Doses', description: 'Motor inteligente que calcula automaticamente a próxima concentração, volume e intervalo com base em protocolos clínicos validados, reduzindo erros manuais.', large: true },
  { icon: faChartColumn, title: 'Dashboards Analíticos', description: 'Visualize a evolução do tratamento com gráficos de progressão de doses, fases e métricas de adesão.', large: false },
  { icon: faSyringe, title: 'Gestão de Protocolos', description: 'Controle completo das fases de indução e manutenção de cada imunoterapia alérgica.', large: false },
  { icon: faMobileScreen, title: 'Acesso Mobile', description: 'Acompanhe seus pacientes de qualquer lugar, pelo celular ou tablet.', large: false },
  { icon: faShieldHalved, title: 'Segurança LGPD', description: 'Dados criptografados end-to-end e conformidade total com a Lei Geral de Proteção de Dados.', large: false },
]
