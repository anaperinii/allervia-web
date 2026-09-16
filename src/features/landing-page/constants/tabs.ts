import dashboardImg from '@/assets/dashboard-landing.png'
import reportImg from '@/assets/report-landing.png'
import appointmentsImg from '@/assets/appointments-landing.png'
import patientImg from '@/assets/patient-landing.png'

import { faCalendarDays, faFileLines, faGaugeHigh, faUser } from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'

export type TabId = 'dashboard' | 'reports' | 'scheduling' | 'patient'

export interface ProductTab {
  id: TabId
  label: string
  title: string
  description: string
  linkLabel: string
  icon: IconDefinition
  urlSlug: string
  image: string
}

export const PRODUCT_TABS: ProductTab[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    title: 'Visão geral em tempo real',
    description: 'Acompanhe os principais indicadores da sua clínica em um só lugar: pacientes ativos, distribuição por concentração, fases do protocolo e status de imunoterapias.',
    linkLabel: 'Ver dashboard completo',
    icon: faGaugeHigh,
    urlSlug: 'dashboard',
    image: dashboardImg,
  },
  {
    id: 'reports',
    label: 'Relatórios Clínicos',
    title: 'Relatórios detalhados e exportáveis',
    description: 'Gere relatórios completos com histórico de aplicações, progressão de doses e reações adversas. Exporte em PDF, Excel ou CSV para auditoria e acompanhamento.',
    linkLabel: 'Explorar ferramentas de relatório',
    icon: faFileLines,
    urlSlug: 'export-report',
    image: reportImg,
  },
  {
    id: 'scheduling',
    label: 'Agendamentos',
    title: 'Gestão inteligente de agendamentos',
    description: 'Visualize e gerencie aplicações agendadas em visão semanal ou mensal. Intervalos calculados automaticamente com base no protocolo de cada paciente.',
    linkLabel: 'Ver funcionalidades de agenda',
    icon: faCalendarDays,
    urlSlug: 'appointments',
    image: appointmentsImg,
  },
  {
    id: 'patient',
    label: 'Prontuário',
    title: 'Prontuário eletrônico completo',
    description: 'Acompanhe a evolução de cada paciente em detalhes: histórico de aplicações, progressão de doses, reações adversas, calendário e timeline completa do tratamento.',
    linkLabel: 'Explorar prontuário',
    icon: faUser,
    urlSlug: 'patient',
    image: patientImg,
  },
]
