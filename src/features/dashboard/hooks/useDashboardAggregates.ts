import { useQuery } from '@tanstack/react-query'
import {
  getPhaseTimeline,
  getStatusHistory,
} from '@/shared/api/clinical.api'
import type {
  ClinicalMetrics,
  LifecycleEventType,
  PhaseTimeline,
  TherapyStatus,
} from '@/shared/api/contracts/clinical'
import { queryKeys } from '@/shared/api/query-keys'
import { useSession } from '@/shared/auth/useSession'
import { dayInZone } from '@/shared/lib/dates'

export function usePhaseTimeline(
  organizationId: string,
  period: { fromDay: string; toDay: string },
  timeZone: string,
) {
  const filters = { from: period.fromDay, to: period.toDay, timeZone }
  return useQuery({
    queryKey: queryKeys.phaseTimeline(organizationId, filters),
    queryFn: ({ signal }) => getPhaseTimeline(filters, signal),
    enabled: organizationId !== '',
  })
}

export interface TherapyStatusHistory {
  createdAt: string
  events: { type: LifecycleEventType; createdAt: string }[]
}

export function useStatusHistory(organizationId: string, granularity: StatusGranularity = 'month', count = 12) {
  const { account } = useSession()
  const timeZone = account?.organization?.timeZone ?? 'America/Sao_Paulo'
  const to = dayInZone(new Date(), timeZone)
  const anchor = new Date(to + 'T12:00:00Z')
  if (granularity === 'month') anchor.setUTCMonth(anchor.getUTCMonth() - count + 1, 1)
  else anchor.setUTCDate(anchor.getUTCDate() - ((anchor.getUTCDay() + 6) % 7) - (count - 1) * 7)
  const filters = { from: anchor.toISOString().slice(0, 10), to, timeZone, granularity }
  return useQuery({
    queryKey: queryKeys.statusHistory(organizationId, filters),
    queryFn: ({ signal }) => getStatusHistory(filters, signal),
    enabled: organizationId !== '',
  })
}

export function concentrationLabel(concentration: number): string {
  return `1:${concentration.toLocaleString('pt-BR')}`
}

export function volumeLabel(volume: number): string {
  return `${volume.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}ml`
}

export interface CountEntry {
  label: string
  count: number
  pct: number
}

export function concentrationFromMetrics(metrics: ClinicalMetrics): CountEntry[] {
  const rows = metrics.concentration
  const total = rows.reduce((sum, row) => sum + row.count, 0)
  return [...rows]
    .sort((a, b) => b.concentration - a.concentration)
    .map((row) => ({
      label: concentrationLabel(row.concentration),
      count: row.count,
      pct: total > 0 ? Math.round((row.count / total) * 100) : 0,
    }))
}

export function activeByTypeFromMetrics(
  metrics: ClinicalMetrics,
  knownTypes: string[] = [],
): CountEntry[] {
  const counts = new Map<string, number>()
  for (const label of knownTypes) counts.set(label, 0)
  let total = 0
  for (const row of metrics.typesActive) {
    counts.set(row.immunoType, (counts.get(row.immunoType) ?? 0) + row.count)
    total += row.count
  }
  return [...counts.entries()]
    .sort(([labelA, a], [labelB, b]) => b - a || labelA.localeCompare(labelB, 'pt-BR'))
    .map(([label, count]) => ({
      label,
      count,
      pct: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
}

export function filterMatrixByConcentration(
  matrix: VolumeConcentrationMatrix,
  concentration: string,
): VolumeConcentrationMatrix {
  if (concentration === 'all') return matrix
  const row = matrix.concentrations.indexOf(concentration)
  if (row < 0) return matrix
  const counts = [matrix.counts[row]]
  return {
    concentrations: [concentration],
    volumes: matrix.volumes,
    counts,
    max: Math.max(...counts[0], 0),
    total: counts[0].reduce((sum, count) => sum + count, 0),
  }
}

export interface VolumeConcentrationMatrix {
  concentrations: string[]
  volumes: string[]

  counts: number[][]
  max: number
  total: number
}

export function volumeMatrixFromMetrics(
  metrics: ClinicalMetrics,
): VolumeConcentrationMatrix {
  const rows = metrics.volumeMatrix
  const concentrations = [...new Set(rows.map((row) => row.concentration))].sort((a, b) => b - a)
  const volumes = [...new Set(rows.map((row) => row.volume))].sort((a, b) => a - b)
  const cells = new Map<string, number>()
  for (const row of rows) cells.set(`${row.concentration}\0${row.volume}`, row.count)
  const counts = concentrations.map((conc) =>
    volumes.map((vol) => cells.get(`${conc}\0${vol}`) ?? 0),
  )
  const flat = counts.flat()
  return {
    concentrations: concentrations.map(concentrationLabel),
    volumes: volumes.map(volumeLabel),
    counts,
    max: flat.length > 0 ? Math.max(...flat) : 0,
    total: flat.reduce((sum, count) => sum + count, 0),
  }
}

export interface PhaseDayEntry {
  date: string
  label: string
  buildUp: number
  maintenance: number
}

export interface ApplicationDayEntry {
  date: string
  label: string
  value: number
}

export function buildApplicationSeries(
  metrics: ClinicalMetrics,
  fromDay: string,
  toDay: string,
): ApplicationDayEntry[] {
  const counts = new Map(metrics.applications.byDay.map((entry) => [entry.day, entry.count]))
  return eachDay(fromDay, toDay).map((day) => ({
    date: day,
    label: dayLabel(day),
    value: counts.get(day) ?? 0,
  }))
}

export function eachDay(fromDay: string, toDay: string): string[] {
  const parse = (day: string) => {
    const [year, month, date] = day.split('-').map(Number)
    return new Date(Date.UTC(year, month - 1, date))
  }
  const days: string[] = []
  const cursor = parse(fromDay)
  const end = parse(toDay)
  while (cursor <= end && days.length < 366) {
    days.push(cursor.toISOString().slice(0, 10))
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }
  return days
}

function dayLabel(day: string): string {
  return `${day.slice(8, 10)}/${day.slice(5, 7)}`
}

export function phaseSeriesFromTimeline(timeline: PhaseTimeline): PhaseDayEntry[] {
  return timeline.days.map((day) => ({
    date: day.date,
    label: dayLabel(day.date),
    buildUp: day.buildUp,
    maintenance: day.maintenance,
  }))
}

export type StatusGranularity = 'week' | 'month'

export interface StatusBucketEntry {
  date: string
  label: string
  active: number
  suspended: number
  completed: number
}

const EVENT_STATUS: Record<LifecycleEventType, TherapyStatus> = {
  SUSPENSION: 'SUSPENDED',
  RESUMPTION: 'IN_PROGRESS',
  COMPLETION: 'COMPLETED',
}

const MONTHS_SHORT = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
]

function bucketEnds(
  granularity: StatusGranularity,
  count: number,
): { end: Date; label: string }[] {
  const now = new Date()
  const buckets: { end: Date; label: string }[] = []
  if (granularity === 'month') {
    for (let i = count - 1; i >= 0; i--) {
      const end =
        i === 0
          ? now
          : new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59)
      buckets.push({
        end,
        label: `${MONTHS_SHORT[end.getMonth()]}/${String(end.getFullYear()).slice(2)}`,
      })
    }
    return buckets
  }
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7))
  for (let i = count - 1; i >= 0; i--) {
    const end =
      i === 0
        ? now
        : new Date(
            monday.getFullYear(),
            monday.getMonth(),
            monday.getDate() - 7 * i + 6,
            23,
            59,
            59,
          )
    buckets.push({
      end,
      label: `${String(end.getDate()).padStart(2, '0')}/${String(end.getMonth() + 1).padStart(2, '0')}`,
    })
  }
  return buckets
}

export function aggregateStatusHistory(
  histories: TherapyStatusHistory[],
  granularity: StatusGranularity,
  count: number,
): StatusBucketEntry[] {
  return bucketEnds(granularity, count).map(({ end, label }) => {
    const endMs = end.getTime()
    const entry: StatusBucketEntry = {
      date: `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`,
      label,
      active: 0,
      suspended: 0,
      completed: 0,
    }
    for (const history of histories) {
      if (Date.parse(history.createdAt) > endMs) continue
      let status: TherapyStatus = 'IN_PROGRESS'
      for (const event of history.events) {
        if (Date.parse(event.createdAt) > endMs) break
        status = EVENT_STATUS[event.type]
      }
      if (status === 'IN_PROGRESS') entry.active += 1
      else if (status === 'SUSPENDED') entry.suspended += 1
      else entry.completed += 1
    }
    return entry
  })
}
