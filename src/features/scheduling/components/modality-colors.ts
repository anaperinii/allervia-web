import { useSettingsStore } from '@/features/settings/stores/useSettingsStore'
import type { Application } from '@/features/patient/stores/usePatientStore'

export const FALLBACK_EVENT_COLORS: Record<string, string> = {
  subcutaneous: '#B7E06A',
  sublingual: '#74C3B9',
  missed: '#EF4444',
}

export interface EventTone {
  surface: string
  border: string
  ink: string
}

export function useModalityStyle(): (application: Application) => EventTone {
  const eventColors = useSettingsStore((s) => s.eventColors)
  return (application) => {
    const id =
      application.status === 'missed'
        ? 'missed'
        : application.modality === 'sublingual'
          ? 'sublingual'
          : 'subcutaneous'
    const color =
      eventColors.find((entry) => entry.id === id)?.color ?? FALLBACK_EVENT_COLORS[id]
    return {
      surface: `${color}33`,
      border: `${color}99`,
      ink: `color-mix(in srgb, ${color} 70%, #1F2937)`,
    }
  }
}
