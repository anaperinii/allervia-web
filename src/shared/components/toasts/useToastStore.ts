import { create } from 'zustand'
import type { ReactNode } from 'react'
import type { ToastPosition, ToastVariant } from './Toast'

export interface ToastItem {
  id: string
  variant: ToastVariant
  icon: ReactNode
  title: string
  description?: ReactNode
  autoDismissMs?: number
  position?: ToastPosition
  compact?: boolean
}

export type ToastInput = Omit<ToastItem, 'id'>

interface ToastState {
  toasts: ToastItem[]
  push: (toast: ToastInput) => string
  dismiss: (id: string) => void
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    set((state) => ({ toasts: [...state.toasts, { id, ...toast }] }))
    return id
  },
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))

export const toast = {
  success: (input: Omit<ToastInput, 'variant'>) => useToastStore.getState().push({ variant: 'success', ...input }),
  warning: (input: Omit<ToastInput, 'variant'>) => useToastStore.getState().push({ variant: 'warning', ...input }),
  info: (input: Omit<ToastInput, 'variant'>) => useToastStore.getState().push({ variant: 'info', ...input }),
  danger: (input: Omit<ToastInput, 'variant'>) => useToastStore.getState().push({ variant: 'danger', ...input }),
  dismiss: (id: string) => useToastStore.getState().dismiss(id),
}
