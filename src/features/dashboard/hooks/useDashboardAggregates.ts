import { collectPages } from '@/shared/api/pagination'
import { useQuery } from '@tanstack/react-query'
import {
  getStatusHistory,
  listDoseSchedule,
  listImmunotherapies,
} from '@/shared/api/clinical.api'
import type {
  ClinicalMetrics,
  DoseValues,
  ImmunotherapyListItem,
  LifecycleEventType,
  ScheduleDoseItem,
  TherapyStatus,
} from '@/shared/api/contracts/clinical'
import { queryKeys } from '@/shared/api/query-keys'
import { useSession } from '@/shared/auth/useSession'
import { dayInZone } from '@/shared/lib/dates'

const PAGE_SIZE = 100
const MAX_PAGES = 20

async function fetchDoseWindow(
  period: { from: string; to: string },
  signal?: AbortSignal,
): Promise<ScheduleDoseItem[]> {
  const result = await collectPages((page) => listDoseSchedule({ ...period, page, pageSize: PAGE_SIZE }, signal), { signal, maxPages: MAX_PAGES })
  if (!result.complete) throw new Error('Aggregate window is incomplete; narrow the period.')
  return result.items
}

async function fetchActiveTherapies(
  signal?: AbortSignal,
): Promise<ImmunotherapyListItem[]> {
  const result = await collectPages((page) => listImmunotherapies({ status: 'IN_PROGRESS', page, pageSize: PAGE_SIZE }, signal), { signal, maxPages: MAX_PAGES })
  if (!result.complete) throw new Error('Aggregate window is incomplete; narrow the period.')
  return result.items
}

export function useDoseWindow(
  organizationId: string,
  period: { from: string; to: string },
) {
  return useQuery({
    queryKey: queryKeys.schedule(organizationId, {
      ...period,
      scope: 'dashboard-aggregates',
    }),
    queryFn: ({ signal }) => fetchDoseWindow(period, signal),
    enabled: organizationId !== '',
  })
}

export function useActiveTherapies(organizationId: string) {
  return useQuery({
    queryKey: queryKeys.immunotherapies(organizationId, {
      status: 'IN_PROGRESS',
      scope: 'dashboard-aggregates',
    }),
    queryFn: ({ signal }) => fetchActiveTherapies(signal),
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

function isAdministered(dose: ScheduleDoseItem): boolean {
  return (
    dose.status === 'ADMINISTERED_ON_SCHEDULE' ||
    dose.status === 'ADMINISTERED_OFF_SCHEDULE'
  )
}

function administeredValues(dose: ScheduleDoseItem): DoseValues | null {
  return dose.administeredValues ?? dose.plannedValues
}

export function concentrationLabel(values: DoseValues): string {
  const parsed = Number(values.concentration)
  return Number.isFinite(parsed)
    ? `1:${parsed.toLocaleString('pt-BR')}`
    : `1:${values.concentration}`
}

export function volumeLabel(values: DoseValues): string {
  const amount = values.volume.replace('.', ',')
  const unit = values.volumeUnit?.trim()
  if (!unit || unit.toLowerCase() === 'ml') return `${amount}ml`
  return `${amount} ${unit}`
}

function concentrationOrder(a: string, b: string): number {
  const parse = (label: string) => {
    const match = /^1:([\d.,]+)/.exec(label)
    if (!match) return null
    return Number(match[1].replace(/\./g, '').replace(',', '.'))
  }
  const va = parse(a)
  const vb = parse(b)
  if (va !== null && vb !== null) return vb - va
  if (va !== null) return -1
  if (vb !== null) return 1
  return a.localeCompare(b, 'pt-BR')
}

function volumeOrder(a: string, b: string): number {
  const parse = (label: string) => Number.parseFloat(label.replace(',', '.'))
  const va = parse(a)
  const vb = parse(b)
  if (Number.isNaN(va) || Number.isNaN(vb)) return a.localeCompare(b, 'pt-BR')
  return va - vb
}

export interface CountEntry {
  label: string
  count: number
  pct: number
}

export function aggregateByConcentration(
  doses: ScheduleDoseItem[],
): CountEntry[] {
  const counts = new Map<string, number>()
  for (const dose of doses) {
    if (!isAdministered(dose)) continue
    const values = administeredValues(dose)
    if (!values) continue
    const label = concentrationLabel(values)
    counts.set(label, (counts.get(label) ?? 0) + 1)
  }
  const total = [...counts.values()].reduce((sum, count) => sum + count, 0)
  return [...counts.entries()]
    .sort(([a], [b]) => concentrationOrder(a, b))
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

export function aggregateVolumeMatrix(
  doses: ScheduleDoseItem[],
): VolumeConcentrationMatrix {
  const cells = new Map<string, number>()
  const concentrations = new Set<string>()
  const volumes = new Set<string>()
  for (const dose of doses) {
    if (!isAdministered(dose)) continue
    const values = administeredValues(dose)
    if (!values) continue
    const conc = concentrationLabel(values)
    const vol = volumeLabel(values)
    concentrations.add(conc)
    volumes.add(vol)
    const key = `${conc}\0${vol}`
    cells.set(key, (cells.get(key) ?? 0) + 1)
  }
  const concList = [...concentrations].sort(concentrationOrder)
  const volList = [...volumes].sort(volumeOrder)
  const counts = concList.map((conc) =>
    volList.map((vol) => cells.get(`${conc}\0${vol}`) ?? 0),
  )
  const flat = counts.flat()
  return {
    concentrations: concList,
    volumes: volList,
    counts,
    max: flat.length > 0 ? Math.max(...flat) : 0,
    total: flat.reduce((sum, count) => sum + count, 0),
  }
}

export function aggregateActiveByType(
  therapies: ImmunotherapyListItem[],
  knownTypes: string[] = [],
): CountEntry[] {
  const counts = new Map<string, number>()
  for (const label of knownTypes) {
    counts.set(label, 0)
  }
  for (const therapy of therapies) {
    counts.set(therapy.immunoType, (counts.get(therapy.immunoType) ?? 0) + 1)
  }
  const total = therapies.length
  return [...counts.entries()]
    .sort(([labelA, a], [labelB, b]) => b - a || labelA.localeCompare(labelB, 'pt-BR'))
    .map(([label, count]) => ({
      label,
      count,
      pct: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
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

export function aggregatePhasesByDay(
  doses: ScheduleDoseItem[],
  fromDay: string,
  toDay: string,
  timeZone: string,
): PhaseDayEntry[] {
  const byDay = new Map<string, { buildUp: number; maintenance: number }>()
  for (const day of eachDay(fromDay, toDay)) {
    byDay.set(day, { buildUp: 0, maintenance: 0 })
  }
  for (const dose of doses) {
    if (!isAdministered(dose) || !dose.administeredAt) continue
    const values = administeredValues(dose)
    if (!values) continue
    const day = dayInZone(new Date(dose.administeredAt), timeZone)
    const bucket = byDay.get(day)
    if (!bucket) continue
    if (values.phase === 'BUILD_UP') bucket.buildUp += 1
    else bucket.maintenance += 1
  }
  return [...byDay.entries()].map(([date, bucket]) => ({
    date,
    label: dayLabel(date),
    ...bucket,
  }))
}

export function aggregatePhasePatientsByDay(
  therapies: ImmunotherapyListItem[],
  fromDay: string,
  toDay: string,
  timeZone = 'America/Sao_Paulo',
): PhaseDayEntry[] {
  return eachDay(fromDay, toDay).map((day) => {
    const buildUp = new Set<string>()
    const maintenance = new Set<string>()
    for (const therapy of therapies) {
      const induction = dayInZone(new Date(therapy.inductionStartDate), timeZone)
      if (induction > day) continue
      const maintenanceStart = therapy.maintenanceStartDate ? dayInZone(new Date(therapy.maintenanceStartDate), timeZone) : null
      if (maintenanceStart !== null && maintenanceStart <= day) {
        maintenance.add(therapy.patient.id)
      } else {
        buildUp.add(therapy.patient.id)
      }
    }
    return {
      date: day,
      label: dayLabel(day),
      buildUp: buildUp.size,
      maintenance: maintenance.size,
    }
  })
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
