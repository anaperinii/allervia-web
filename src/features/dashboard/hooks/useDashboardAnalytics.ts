/**
 * Prévia do relatório exportável. As séries derivadas oficiais (concentração,
 * fases, status, tipos, volumes) chegam com o contrato de relatórios; até lá a
 * prévia mostra estruturas vazias — nunca números sintéticos.
 */
interface UseDashboardAnalyticsOptions {
  modality: 'subcutaneous' | 'sublingual'
  typeFilter?: string
}

export function useDashboardAnalytics(_options: UseDashboardAnalyticsOptions) {
  void _options
  return {
    concentrationData: [] as { name: string; value: number }[],
    phaseData: [] as { month: string; induction: number; maintenance: number }[],
    statusData: [] as {
      month: string
      active: number
      interrupted: number
      completed: number
    }[],
    typeData: [] as { name: string; value: number; pct: number }[],
    volumeData: [] as Record<string, string | number>[],
  }
}
