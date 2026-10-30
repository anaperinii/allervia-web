export type EmailChangeChannel = 'email' | 'whatsapp'

export type EmailChangeStatus = 'PENDING' | 'DISPATCHED' | 'REJECTED'

export interface EmailChangeRequestDto {
  id: string
  professionalId: string
  professionalName: string
  currentEmail: string
  newEmail: string
  status: EmailChangeStatus
  expiresAt: string
  requestedAt: string
  whatsappUrl?: string
}
