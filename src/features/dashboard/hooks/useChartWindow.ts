import { useMemo, useState } from 'react'

export const CHART_RANGES = [
  { value: '7', label: '7 dias' },
  { value: '14', label: '14 dias' },
  { value: '30', label: '30 dias' },
  { value: '90', label: '90 dias' },
]

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

export interface SeriesEntry {
  date: string
  label: string
}

export interface CardFilter {
  key: string
  kind?: 'select' | 'week'
  value: string
  onChange: (value: string) => void
  options?: { value: string; label: string }[]
  ariaLabel: string
}

function parse(date: string) {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function weekStart(date: Date) {
  const start = new Date(date)
  const weekday = (start.getDay() + 6) % 7
  start.setDate(start.getDate() - weekday)
  return start
}

export function weekKey(date: Date) {
  const start = weekStart(date)
  return `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`
}

export function weekRangeFromKey(key: string) {
  if (key === 'all') return undefined
  const from = parse(key)
  const to = new Date(from)
  to.setDate(from.getDate() + 6)
  return { from, to }
}

export function useSeriesFilters<T extends SeriesEntry>(series: T[], options?: { range?: boolean }) {
  const withRange = options?.range ?? false
  const [week, setWeek] = useState('all')
  const [month, setMonth] = useState('all')
  const [year, setYear] = useState('all')
  const [size, setSize] = useState('7')

  const { monthOptions, yearOptions } = useMemo(() => {
    const months = new Map<string, string>()
    const years = new Set<string>()

    series.forEach((entry) => {
      const date = parse(entry.date)
      months.set(String(date.getMonth()), MONTH_NAMES[date.getMonth()])
      years.add(String(date.getFullYear()))
    })

    return {
      monthOptions: [
        { value: 'all', label: 'Todos os meses' },
        ...Array.from(months.entries()).map(([value, label]) => ({ value, label })),
      ],
      yearOptions: [
        { value: 'all', label: 'Todos os anos' },
        ...Array.from(years).map((value) => ({ value, label: value })),
      ],
    }
  }, [series])

  const slice = useMemo(() => {
    const filtered = series.filter((entry) => {
      const date = parse(entry.date)
      if (year !== 'all' && String(date.getFullYear()) !== year) return false
      if (month !== 'all' && String(date.getMonth()) !== month) return false
      if (week !== 'all' && weekKey(date) !== week) return false
      return true
    })

    const narrowed = week !== 'all' || month !== 'all' || year !== 'all'
    if (withRange) return filtered.slice(-Number(size))
    return narrowed ? filtered : filtered.slice(-7)
  }, [series, week, month, year, size, withRange])

  const filters: CardFilter[] = [
    { key: 'week', kind: 'week', value: week, onChange: setWeek, ariaLabel: 'Filtrar por semana' },
    { key: 'month', value: month, onChange: setMonth, options: monthOptions, ariaLabel: 'Filtrar por mês' },
    { key: 'year', value: year, onChange: setYear, options: yearOptions, ariaLabel: 'Filtrar por ano' },
  ]
  if (withRange) {
    filters.push({
      key: 'range',
      value: size,
      onChange: setSize,
      options: CHART_RANGES,
      ariaLabel: 'Quantidade de dias',
    })
  }

  const active = week !== 'all' || month !== 'all' || year !== 'all'

  const stepWeek = (delta: number) => {
    if (series.length === 0) return
    const first = weekKey(parse(series[0].date))
    const last = weekKey(parse(series[series.length - 1].date))
    const base = week === 'all' ? last : week
    const target = parse(base)
    target.setDate(target.getDate() + delta * 7)
    const key = weekKey(target)
    if (key < first || key > last) return
    setWeek(key)
  }

  const canStepWeek = (delta: number) => {
    if (series.length === 0) return false
    const first = weekKey(parse(series[0].date))
    const last = weekKey(parse(series[series.length - 1].date))
    const base = week === 'all' ? last : week
    const target = parse(base)
    target.setDate(target.getDate() + delta * 7)
    const key = weekKey(target)
    return key >= first && key <= last
  }

  return { slice, filters, active, size: Number(size), stepWeek, canStepWeek }
}

const MONTH_RANGES = [
  { value: '3', label: 'Últimos 3 meses' },
  { value: '6', label: 'Últimos 6 meses' },
  { value: '12', label: 'Ano inteiro' },
]

/** Same filter contract as the light panel, applied to the monthly dark charts. */
export function useMonthlyFilters<T extends { month: string; year?: number }>(data: T[]) {
  const defaultYear = String(new Date().getFullYear())
  const [size, setSize] = useState('12')
  const [month, setMonth] = useState('all')
  const [year, setYear] = useState(defaultYear)

  const { monthOptions, yearOptions } = useMemo(() => {
    const months = new Set<string>()
    const years = new Set<string>()
    data.forEach((entry) => {
      months.add(entry.month)
      if (entry.year !== undefined) years.add(String(entry.year))
    })
    return {
      monthOptions: [
        { value: 'all', label: 'Todos os meses' },
        ...Array.from(months).map((value) => ({ value, label: value })),
      ],
      yearOptions: Array.from(years)
        .sort()
        .reverse()
        .map((value) => ({ value, label: value })),
    }
  }, [data])

  const slice = useMemo(() => {
    const scoped = yearOptions.length > 0 ? data.filter((entry) => String(entry.year) === year) : data
    if (month !== 'all') return scoped.filter((entry) => entry.month === month)
    return scoped.slice(-Number(size))
  }, [data, month, size, year, yearOptions.length])

  const filters: CardFilter[] = [
    { key: 'range', value: size, onChange: setSize, options: MONTH_RANGES, ariaLabel: 'Intervalo de meses' },
    { key: 'month', value: month, onChange: setMonth, options: monthOptions, ariaLabel: 'Filtrar por mês' },
  ]
  if (yearOptions.length > 0) {
    filters.push({ key: 'year', value: year, onChange: setYear, options: yearOptions, ariaLabel: 'Filtrar por ano' })
  }

  return { slice, filters, active: month !== 'all' || size !== '12' || year !== defaultYear }
}

const TOP_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: '3', label: 'Top 3' },
  { value: '5', label: 'Top 5' },
]

const ORDER_OPTIONS = [
  { value: 'desc', label: 'Maior primeiro' },
  { value: 'asc', label: 'Menor primeiro' },
]

/** Filters for the distribution charts, which have no time axis. */
export function useSnapshotFilters<T>(data: T[], getValue: (item: T) => number) {
  const [top, setTop] = useState('all')
  const [order, setOrder] = useState('desc')

  const slice = useMemo(() => {
    const sorted = [...data].sort((a, b) => (order === 'desc' ? getValue(b) - getValue(a) : getValue(a) - getValue(b)))
    return top === 'all' ? sorted : sorted.slice(0, Number(top))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, top, order])

  const filters: CardFilter[] = [
    { key: 'top', value: top, onChange: setTop, options: TOP_OPTIONS, ariaLabel: 'Quantidade exibida' },
    { key: 'order', value: order, onChange: setOrder, options: ORDER_OPTIONS, ariaLabel: 'Ordenação' },
  ]

  return { slice, filters, active: top !== 'all' || order !== 'desc' }
}

export function todayIndex(slice: SeriesEntry[]) {
  const now = new Date()
  const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  return slice.findIndex((entry) => entry.date === key)
}

export function axisLabels(labels: string[], max = 7) {
  if (labels.length <= max) return labels
  const step = Math.ceil(labels.length / max)
  return labels.map((label, i) => (i % step === 0 ? label : ''))
}

export function windowCaption(caption: string, slice: { label: string }[]) {
  if (slice.length === 0) return caption
  return `${caption} · ${slice[0].label} – ${slice[slice.length - 1].label}`
}
