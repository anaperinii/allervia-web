import { useMemo } from 'react'
import { useImmunotherapiesStore } from '@/features/immunotherapy/stores/useImmunotherapiesStore'
import { useDoctorFilter } from '@/shared/stores/useUserStore'
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
    (immunotherapy) => getPhase(immunotherapy.doseConcentration, immunotherapy.cycleInterval.days) === 'induction',
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

  const phaseData = useMemo(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    return months.map((month, i) => {
      const factor = (i + 1) / months.length
      return {
        month,
        induction: Math.max(0, Math.round(inductionCount * factor)),
        maintenance: Math.max(0, Math.round(maintenanceCount * factor)),
      }
    })
  }, [inductionCount, maintenanceCount])

  const statusData = useMemo(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    return months.map((month, i) => {
      const factor = (i + 1) / months.length
      return {
        month,
        active: Math.max(0, Math.round(totalActive * factor)),
        interrupted: Math.max(0, Math.round(inactiveFiltered.length * factor)),
        completed: Math.max(0, Math.round((i / (months.length - 1)) * Math.floor(totalActive * 0.2))),
      }
    })
  }, [totalActive, inactiveFiltered.length])

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

  const weekly = useMemo(() => {
    const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
    const applicationProfile = [0.62, 0.71, 0.83, 0.68, 1, 0.44, 0.29]
    const doseProfile = [0.34, 0.52, 0.41, 0.7, 0.86, 0.63, 1]
    const base = Math.max(totalActive, 1)

    const applications = days.map((day, i) => ({
      day,
      value: Math.round(base * applicationProfile[i] * 1.6),
    }))
    const doses = days.map((day, i) => ({
      day,
      value: Math.round(base * doseProfile[i] * 2.4),
    }))

    const peakApplication = applications.reduce((top, d) => (d.value > top.value ? d : top), applications[0])
    const peakDose = doses.reduce((top, d) => (d.value > top.value ? d : top), doses[0])

    return {
      applications,
      applicationsTotal: applications.reduce((sum, d) => sum + d.value, 0),
      peakApplicationIndex: applications.indexOf(peakApplication),
      peakApplicationValue: peakApplication.value,
      doses,
      dosesTotal: doses.reduce((sum, d) => sum + d.value, 0),
      peakDoseIndex: doses.indexOf(peakDose),
      peakDoseValue: peakDose.value,
    }
  }, [totalActive])

  const yearComparison = useMemo(() => {
    const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
    const previousProfile = [0.42, 0.4, 0.46, 0.5, 0.47, 0.55, 0.6]
    const currentProfile = [0.58, 0.54, 0.63, 0.7, 0.76, 0.82, 0.95]
    const base = Math.max(totalActive + inactiveFiltered.length, 1) * 4

    const rows = days.map((day, i) => ({
      day,
      previous: Math.round(base * previousProfile[i]),
      current: Math.round(base * currentProfile[i]),
    }))
    const previousTotal = rows.reduce((sum, r) => sum + r.previous, 0)
    const currentTotal = rows.reduce((sum, r) => sum + r.current, 0)

    return {
      rows,
      currentTotal,
      deltaPct: previousTotal > 0 ? Math.round(((currentTotal - previousTotal) / previousTotal) * 100) : 0,
    }
  }, [totalActive, inactiveFiltered.length])

  return {
    filtered,
    activeFiltered,
    inactiveFiltered,
    weekly,
    yearComparison,
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
