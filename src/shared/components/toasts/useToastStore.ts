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

  dedupeKey?: string

  repeats: number
}

export type ToastInput = Omit<ToastItem, 'id' | 'repeats'>

interface ToastState {
  toasts: ToastItem[]
  push: (toast: ToastInput) => string
  dismiss: (id: string) => void
  dismissAll: () => void
}


function keyOf(toast: ToastInput): string {
  if (toast.dedupeKey) return toast.dedupeKey
  const description =
    typeof toast.description === 'string' ? toast.description : ''
  return `${toast.variant}|${toast.title}|${description}`
}

let sequence = 0

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (toast) => {
    const key = keyOf(toast)
    let id = ''
    set((state) => {
      const existing = state.toasts.find((item) => keyOf(item) === key)
      if (existing) {
        id = existing.id
        return {
          toasts: state.toasts.map((item) =>
            item.id === existing.id
              ? { ...item, ...toast, repeats: item.repeats + 1 }
              : item,
          ),
        }
      }
      sequence += 1
      id = `toast-${sequence}`
      return { toasts: [...state.toasts, { id, repeats: 1, ...toast }] }
    })
    return id
  },
  dismiss: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
  dismissAll: () => set({ toasts: [] }),
}))

export const toast = {
  success: (input: Omit<ToastInput, 'variant'>) =>
    useToastStore.getState().push({ variant: 'success', ...input }),
  warning: (input: Omit<ToastInput, 'variant'>) =>
    useToastStore.getState().push({ variant: 'warning', ...input }),
  info: (input: Omit<ToastInput, 'variant'>) =>
    useToastStore.getState().push({ variant: 'info', ...input }),
  danger: (input: Omit<ToastInput, 'variant'>) =>
    useToastStore.getState().push({ variant: 'danger', ...input }),
}
