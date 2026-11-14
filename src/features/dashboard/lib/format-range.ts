import { format } from 'date-fns'
import { ptBR as ptBRDateFns } from 'date-fns/locale'
import type { DateRange } from 'react-day-picker'

function capitalizeMonth(formatted: string) {
  return formatted.replace(/\s([a-zç]+)\s/i, (_, month) => ` ${month.charAt(0).toUpperCase()}${month.slice(1)} `)
}

function formatDay(date: Date) {
  return capitalizeMonth(format(date, 'dd MMM yyyy', { locale: ptBRDateFns }))
}

export function formatRange(range: DateRange | undefined) {
  if (!range?.from) return 'Selecionar período'
  const from = formatDay(range.from)
  if (!range.to) return from
  return `${from} – ${formatDay(range.to)}`
}
