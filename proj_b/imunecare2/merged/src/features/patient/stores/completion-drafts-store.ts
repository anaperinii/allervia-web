import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CompletionForm } from '@/features/patient/forms/completion'

export interface CompletionDraft {
  patientId: string
  step: 0 | 1 | 2
  values: CompletionForm
  savedAt: string
}

interface CompletionDraftsState {
  drafts: Record<string, CompletionDraft>
  saveDraft: (draft: CompletionDraft) => void
  loadDraft: (patientId: string) => CompletionDraft | null
  clearDraft: (patientId: string) => void
}

export const useCompletionDraftsStore = create<CompletionDraftsState>()(
  persist(
    (set, get) => ({
      drafts: {},
      saveDraft: (draft) =>
        set((s) => ({ drafts: { ...s.drafts, [draft.patientId]: draft } })),
      loadDraft: (patientId) => get().drafts[patientId] ?? null,
      clearDraft: (patientId) =>
        set((s) => {
          const next = { ...s.drafts }
          delete next[patientId]
          return { drafts: next }
        }),
    }),
    { name: 'imunecare:completion-drafts' },
  ),
)
