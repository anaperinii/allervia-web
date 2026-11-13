import { useSettingsStore } from '@/features/settings/stores/useSettingsStore'
import type { Application } from '@/features/patient/stores/usePatientStore'

export const FALLBACK_EVENT_COLORS: Record<string, string> = {
  subcutaneous: '#B7E06A',
  sublingual: '#74C3B9',
  appointment: '#B39DDB',
  missed: '#EF4444',
}

export interface EventTone {
  surface: string
  border: string
  ink: string
  dot: string
  base: string
}

export function useModalityStyle(): (application: Application) => EventTone {
  const eventColors = useSettingsStore((s) => s.eventColors)
  return (application) => {
    const id = application.isAppointment
      ? 'appointment'
      : application.modality === 'sublingual'
        ? 'sublingual'
        : 'subcutaneous'
    const color =
      eventColors.find((entry) => entry.id === id)?.color ?? FALLBACK_EVENT_COLORS[id]
    if (application.status === 'completed') {
      return {
        surface: `${color}66`,
        border: `${color}E6`,
        ink: `color-mix(in srgb, ${color} 55%, #1F2937)`,
        dot: `color-mix(in srgb, ${color} 40%, #1F2937)`,
        base: color,
      }
    }
    return {
      surface: `${color}33`,
      border: `${color}99`,
      ink: `color-mix(in srgb, ${color} 70%, #1F2937)`,
      dot: color,
      base: color,
    }
  }
}
