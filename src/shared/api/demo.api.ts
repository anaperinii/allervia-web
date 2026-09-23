import { apiRequest } from './client'
import type { TrialForm } from '@/features/auth/schemas/trial'

export interface DemoReceipt {
  received: true
  id: string
  createdAt: string
}

export function requestDemo(form: TrialForm, requestId: string) {
  return apiRequest<DemoReceipt>('/demo-requests', {
    method: 'POST',
    anonymous: true,
    body: {
      ...form,
      requestId,
      phone: form.phone.replace(/\D/g, ''),
      professionals: Number(form.professionals),
    },
  })
}
