import { useMemo } from 'react'
import { useImmunotherapiesStore } from '@/features/immunotherapy/stores/immunotherapies-store'
import { useDoctorFilter } from '@/shared/identity/user-store'
import { getPhase } from '@/features/immunotherapy/constants/scit-protocol'
import { DEFAULT_IMMUNOTHERAPY_TYPES, VOLUME_KEYS } from '@/features/dashboard/constants/chart-colors'

type Modality = 'subcutaneous' | 'sublingual'

interface UseDashboardAnalyticsOptions {
  modality: Modality
  typeFilter?: string
}

export function useDashboardAnalytics({ modality, typeFilter }: UseDashboardAnalyticsOptions) {
  const { immunotherapies: allImmunotherapies } = useImmunotherapiesStore()
  const doctorFilter = useDoctorFilter()

  const filtered = useMemo(() => {
    return allImmunotherapies.filter((immunotherapy) => {
      const matchDoctor = !doctorFilter || immunotherapy.responsibleDoctor === doctorFilter
      const matchModality = immunotherapy.modality === modality
      const matchType = !typeFilter || typeFilter === 'all' || immunotherapy.type === typeFilter
      return matchDoctor && matchModality && matchType
    })
  }, [allImmunotherapies, doctorFilter, modality, typeFilter])

  const activeFiltered = useMemo(
    () => filtered.filter((immunotherapy) => immunotherapy.status === 'active'),
    [filtered],
  )
  const inactiveFiltered = useMemo(
    () => filtered.filter((immunotherapy) => immunotherapy.status === 'inactive'),
    [filtered],
  )

  const totalActive = activeFiltered.length
  const inductionCount = activeFiltered.filter(
    (immunotherapy) => getPhase(immunotherapy.doseConcentration, immunotherapy.cycleInterval.days) === 'inducao',
  ).length
  const maintenanceCount = totalActive - inductionCount

  const availableTypes = useMemo(
    () => Array.from(new Set(filtered.map((immunotherapy) => immunotherapy.type))),
    [filtered],
  )

  const concentrationData = useMemo(() => {
    const counts: Record<string, number> = {}
    activeFiltered.forEach((immunotherapy) => {
      const conc = immunotherapy.doseConcentration.split(' - ')[0].trim()
      counts[conc] = (counts[conc] || 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [activeFiltered])

  const phaseData = useMemo(
    () => [
      { month: 'Jan', induction: Math.max(0, inductionCount - 2), maintenance: Math.max(0, maintenanceCount - 1) },
      { month: 'Fev', induction: Math.max(0, inductionCount - 1), maintenance: Math.max(0, maintenanceCount - 1) },
      { month: 'Mar', induction: inductionCount, maintenance: maintenanceCount },
      { month: 'Abr', induction: inductionCount, maintenance: maintenanceCount },
    ],
    [inductionCount, maintenanceCount],
  )

  const statusData = useMemo(
    () => [
      { month: 'Jan', active: Math.max(0, totalActive - 2), interrupted: Math.max(0, inactiveFiltered.length - 1), completed: 0 },
      { month: 'Fev', active: Math.max(0, totalActive - 1), interrupted: Math.max(0, inactiveFiltered.length - 1), completed: 0 },
      { month: 'Mar', active: totalActive, interrupted: inactiveFiltered.length, completed: 0 },
      { month: 'Abr', active: totalActive, interrupted: inactiveFiltered.length, completed: 0 },
    ],
    [totalActive, inactiveFiltered.length],
  )

  const typeData = useMemo(() => {
    const counts: Record<string, number> = {}
    DEFAULT_IMMUNOTHERAPY_TYPES.forEach((type) => {
      counts[type] = 0
    })
    activeFiltered.forEach((immunotherapy) => {
      counts[immunotherapy.type] = (counts[immunotherapy.type] || 0) + 1
    })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({
        name,
        value,
        pct: totalActive > 0 ? Math.round((value / totalActive) * 100) : 0,
      }))
  }, [activeFiltered, totalActive])

  const volumeData = useMemo(() => {
    const matrix: Record<string, Record<string, number>> = {}
    activeFiltered.forEach((immunotherapy) => {
      const [conc, vol] = immunotherapy.doseConcentration.split(' - ').map((part) => part.trim())
      if (!conc || !vol) return
      if (!matrix[conc]) matrix[conc] = {}
      matrix[conc][vol] = (matrix[conc][vol] || 0) + 1
    })
    return Object.entries(matrix).map(([conc, vols]) => {
      const row: Record<string, string | number> = { conc }
      VOLUME_KEYS.forEach((key) => {
        row[key] = vols[key] || 0
      })
      return row
    })
  }, [activeFiltered])

  return {
    filtered,
    activeFiltered,
    inactiveFiltered,
    totalActive,
    inductionCount,
    maintenanceCount,
    availableTypes,
    concentrationData,
    phaseData,
    statusData,
    typeData,
    volumeData,
  }
}
