import { create } from 'zustand'

export type NotificationType =
  | 'upcoming_application'
  | 'missed_appointment'
  | 'adverse_reaction'
  | 'protocol_milestone'
  | 'patient_inactivity'
  | 'system_alert'
export type NotificationPriority = 'critical' | 'high' | 'medium' | 'low'
export type NotificationCategory = 'clinical' | 'scheduling' | 'system'

export interface Notification {
  id: string
  type: NotificationType
  priority: NotificationPriority
  title: string
  message: string
  details?: string
  timestamp: Date
  read: boolean
  patientId?: string
  actionUrl?: string
  actionLabel?: string
}

export const TYPE_TO_CATEGORY: Record<NotificationType, NotificationCategory> = {
  upcoming_application: 'scheduling',
  missed_appointment: 'scheduling',
  adverse_reaction: 'clinical',
  protocol_milestone: 'clinical',
  patient_inactivity: 'clinical',
  system_alert: 'system',
}

const now = Date.now()
const hoursAgo = (hours: number) => new Date(now - hours * 60 * 60 * 1000)
const daysAgo = (days: number) => new Date(now - days * 24 * 60 * 60 * 1000)

interface NotificationsState {
  notifications: Notification[]
  markAsRead: (id: string) => void
  markAsUnread: (id: string) => void
  markAllAsRead: () => void
  markSelectedAsRead: (ids: string[]) => void
  markSelectedAsUnread: (ids: string[]) => void
  deleteSelected: (ids: string[]) => void
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  notifications: [

    { id: 'n1', type: 'adverse_reaction', priority: 'critical', title: 'Reação adversa grave registrada', message: 'Valentina Bittencourt apresentou urticária generalizada após aplicação de 1:100 — 0,4ml. Necessidade de medicação registrada.', details: 'A paciente apresentou urticária generalizada 20 minutos após a aplicação. Foi administrado anti-histamínico e a paciente permaneceu em observação por 1 hora. Recomenda-se reavaliar o protocolo antes da próxima dose.', timestamp: hoursAgo(0.5), read: false, patientId: '4', actionUrl: '/patient/4', actionLabel: 'Ver prontuário' },
    { id: 'n2', type: 'adverse_reaction', priority: 'critical', title: 'Reação adversa com medicação', message: 'Ana Clara de Souza Martins relatou edema local persistente após aplicação sublingual.', details: 'Edema sublingual relatado pela paciente via contato telefônico 3 horas após a aplicação. Orientada a suspender a dose seguinte e retornar para avaliação presencial.', timestamp: hoursAgo(3), read: false, patientId: '3', actionUrl: '/patient/3', actionLabel: 'Ver prontuário' },

    { id: 'n3', type: 'missed_appointment', priority: 'high', title: 'Paciente não compareceu', message: 'Pedro Luccas Pereira não compareceu à 3ª aplicação consecutiva agendada para hoje às 09:00.', details: 'O paciente acumula 3 faltas consecutivas. De acordo com o protocolo SCIT, a ausência prolongada pode exigir reinício da fase de indução. Recomenda-se contato via WhatsApp para verificar situação.', timestamp: hoursAgo(1), read: false, patientId: '9', actionUrl: '/patient/9', actionLabel: 'Ver prontuário' },
    { id: 'n4', type: 'patient_inactivity', priority: 'high', title: 'Paciente sem retorno há 45 dias', message: 'Heitor Guimarães de Assis não realiza aplicação há 45 dias. O intervalo previsto era de 14 dias.', details: 'Última aplicação realizada em 01/03/2026. O protocolo atual prevê intervalo de 14 dias entre doses. A ausência de mais de 3 intervalos pode comprometer a eficácia do tratamento.', timestamp: hoursAgo(4), read: false, patientId: '5', actionUrl: '/patient/5', actionLabel: 'Ver prontuário' },
    { id: 'n5', type: 'missed_appointment', priority: 'high', title: 'Ausência não justificada', message: 'Patrício Gomes Cardoso faltou à aplicação sublingual agendada para ontem.', details: 'Tentativa de contato via telefone não atendida. Segunda falta no mês corrente.', timestamp: hoursAgo(18), read: false, patientId: '8', actionUrl: '/patient/8', actionLabel: 'Ver prontuário' },

    { id: 'n6', type: 'upcoming_application', priority: 'medium', title: 'Aplicação agendada para amanhã', message: 'Bárbara Sofia Diniz tem aplicação agendada para amanhã às 08:30 — 1:10.000, 0,2ml.', details: 'Dose prevista: 1:10.000 — 0,2ml (2ª dose da fase de indução). Intervalo de 7 dias desde a última aplicação. Paciente sem reações adversas anteriores.', timestamp: hoursAgo(2), read: false, patientId: '1', actionUrl: '/patient/1', actionLabel: 'Ver prontuário' },
    { id: 'n7', type: 'protocol_milestone', priority: 'medium', title: 'Progressão de concentração', message: 'Camilla Martins avançou para concentração 1:1.000 — 0,4ml com sucesso.', details: 'A paciente completou as 4 doses da concentração 1:10.000 sem intercorrências. Progride para 1:1.000 conforme protocolo SCIT. Próxima aplicação em 7 dias.', timestamp: hoursAgo(6), read: false, patientId: '2', actionUrl: '/patient/2', actionLabel: 'Ver prontuário' },
    { id: 'n8', type: 'upcoming_application', priority: 'medium', title: 'Aplicação em 2 dias', message: 'Marta Gabriela de Sousa — próxima aplicação em 2 dias (intervalo de 28 dias).', timestamp: hoursAgo(8), read: true, patientId: '7' },
    { id: 'n9', type: 'protocol_milestone', priority: 'medium', title: 'Dose de manutenção atingida', message: 'Caroline Ferreira de Abreu atingiu a dose de manutenção: 1:10 — 0,5ml.', details: 'A paciente completou toda a fase de indução e atinge agora a fase de manutenção. Os intervalos serão progressivamente ampliados de 14 para 21 e 28 dias conforme resposta clínica.', timestamp: daysAgo(1), read: true, patientId: '6', actionUrl: '/patient/6', actionLabel: 'Ver prontuário' },
    { id: 'n10', type: 'upcoming_application', priority: 'medium', title: 'Lembrete de ciclo', message: 'Heitor Guimarães de Assis — próxima aplicação prevista para 16/04 (intervalo de 14 dias).', timestamp: daysAgo(1), read: true, patientId: '5' },

    { id: 'n11', type: 'system_alert', priority: 'low', title: 'Backup automático concluído', message: 'Backup diário dos dados clínicos realizado com sucesso às 03:00.', timestamp: daysAgo(0.5), read: true },
    { id: 'n12', type: 'system_alert', priority: 'low', title: 'Sincronização Google Agenda', message: '12 eventos sincronizados com sucesso com o Google Agenda.', timestamp: daysAgo(0.5), read: true },
    { id: 'n13', type: 'system_alert', priority: 'low', title: 'Atualização do sistema', message: 'ImuneCare foi atualizado para a versão 2.1.0. Novas funcionalidades disponíveis.', details: 'Novidades: central de notificações, integração com Google Agenda, exportação com LGPD, calendário no prontuário do paciente.', timestamp: daysAgo(2), read: true },
    { id: 'n14', type: 'patient_inactivity', priority: 'low', title: 'Paciente com protocolo pausado', message: 'Lucas Ferreira Lima — protocolo inativo há 60 dias por solicitação do paciente.', details: 'O paciente solicitou pausa no tratamento por motivos pessoais. Retorno previsto para reavaliação em 3 meses.', timestamp: daysAgo(3), read: true, patientId: '10' },
    { id: 'n15', type: 'system_alert', priority: 'low', title: 'Relatório mensal gerado', message: 'O relatório clínico mensal de março/2026 está disponível para download.', timestamp: daysAgo(5), read: true },
  ],
  markAsRead: (id) => set((state) => ({ notifications: state.notifications.map((notification) => notification.id === id ? { ...notification, read: true } : notification) })),
  markAsUnread: (id) => set((state) => ({ notifications: state.notifications.map((notification) => notification.id === id ? { ...notification, read: false } : notification) })),
  markAllAsRead: () => set((state) => ({ notifications: state.notifications.map((notification) => ({ ...notification, read: true })) })),
  markSelectedAsRead: (ids) => set((state) => ({ notifications: state.notifications.map((notification) => ids.includes(notification.id) ? { ...notification, read: true } : notification) })),
  markSelectedAsUnread: (ids) => set((state) => ({ notifications: state.notifications.map((notification) => ids.includes(notification.id) ? { ...notification, read: false } : notification) })),
  deleteSelected: (ids) => set((state) => ({ notifications: state.notifications.filter((notification) => !ids.includes(notification.id)) })),
}))
