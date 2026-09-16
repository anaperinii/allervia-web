import { useMemo } from 'react'
import { useImmunotherapiesStore } from '@/features/immunotherapy/stores/useImmunotherapiesStore'
import { useDoctorFilter } from '@/shared/stores/useUserStore'
import { getPhase } from '@/features/immunotherapy/constants/scit-protocol'
import { DEFAULT_IMMUNOTHERAPY_TYPES, VOLUME_KEYS } from '@/features/dashboard/constants/chart-colors'

type Modality = 'subcutaneous' | 'sublingual'

const TIMELINE_DAYS = 120

const MONTH_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

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

  // Three-year history for the dark charts, which filter by year.
  const phaseHistory = useMemo(() => {
    const currentYear = new Date().getFullYear()
    return [currentYear - 2, currentYear - 1, currentYear].flatMap((year, yearIndex) => {
      const growth = 0.6 + yearIndex * 0.2
      return MONTH_LABELS.map((month, i) => {
        const factor = ((i + 1) / MONTH_LABELS.length) * growth
        return {
          year,
          month,
          induction: Math.max(0, Math.round(inductionCount * factor)),
          maintenance: Math.max(0, Math.round(maintenanceCount * factor)),
        }
      })
    })
  }, [inductionCount, maintenanceCount])

  const statusHistory = useMemo(() => {
    const currentYear = new Date().getFullYear()
    return [currentYear - 2, currentYear - 1, currentYear].flatMap((year, yearIndex) => {
      const growth = 0.6 + yearIndex * 0.2
      return MONTH_LABELS.map((month, i) => {
        const factor = ((i + 1) / MONTH_LABELS.length) * growth
        return {
          year,
          month,
          active: Math.max(0, Math.round(totalActive * factor)),
          interrupted: Math.max(0, Math.round(inactiveFiltered.length * factor)),
          completed: Math.max(0, Math.round((i / (MONTH_LABELS.length - 1)) * Math.floor(totalActive * 0.2 * growth))),
        }
      })
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

  const modalityMix = useMemo(() => {
    const all = allImmunotherapies.filter((immunotherapy) => {
      const matchDoctor = !doctorFilter || immunotherapy.responsibleDoctor === doctorFilter
      const matchType = !typeFilter || typeFilter === 'all' || immunotherapy.type === typeFilter
      return matchDoctor && matchType && immunotherapy.status === 'active'
    })
    const subcutaneous = all.filter((immunotherapy) => immunotherapy.modality === 'subcutaneous').length
    return { subcutaneous, sublingual: all.length - subcutaneous, total: all.length }
  }, [allImmunotherapies, doctorFilter, typeFilter])

  const doseMix = useMemo(() => {
    const counts = new Map<string, number>()
    activeFiltered.forEach((immunotherapy) => {
      counts.set(immunotherapy.doseConcentration, (counts.get(immunotherapy.doseConcentration) ?? 0) + 1)
    })
    const total = activeFiltered.length || 1
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([label, value]) => ({ label, value, pct: Math.round((value / total) * 100) }))
  }, [activeFiltered])

  const timeline = useMemo(() => {
    const base = Math.max(totalActive, 1)
    const comparisonBase = Math.max(totalActive + inactiveFiltered.length, 1)
    const applicationWeekday = [0.29, 0.62, 0.71, 0.83, 0.68, 1, 0.44]
    const doseWeekday = [1, 0.34, 0.52, 0.41, 0.7, 0.86, 0.63]
    const today = new Date()

    return Array.from({ length: TIMELINE_DAYS }, (_, i) => {
      const date = new Date(today)
      date.setDate(today.getDate() - (TIMELINE_DAYS - 1 - i))
      const weekday = date.getDay()
      const season = 0.78 + 0.22 * Math.sin(i / 11)
      const growth = 0.72 + (0.28 * i) / TIMELINE_DAYS

      return {
        date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
        label: `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`,
        applications: Math.round(base * applicationWeekday[weekday] * season * 1.6),
        doses: Math.round(base * doseWeekday[weekday] * season * 2.4),
        previous: Math.round(comparisonBase * 1.9 * (0.62 + 0.2 * Math.sin(i / 7))),
        current: Math.round(comparisonBase * 1.9 * growth * (0.78 + 0.2 * Math.cos(i / 9))),
        active: Math.round(base * (0.9 + 0.1 * Math.sin(i / 13))),
      }
    })
  }, [totalActive, inactiveFiltered.length])

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
    timeline,
    modalityMix,
    doseMix,
    yearComparison,
    totalActive,
    inductionCount,
    maintenanceCount,
    availableTypes,
    concentrationData,
    phaseData,
    statusData,
    statusHistory,
    phaseHistory,
    typeData,
    volumeData,
  }
}
