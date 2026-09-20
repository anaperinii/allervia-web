import { format } from 'date-fns'
import { ptBR as ptBRDateFns } from 'date-fns/locale'
import type { DateRange } from 'react-day-picker'
export function formatRange(range: DateRange | undefined) {
  if (!range?.from) return 'Selecionar período'
  const from = format(range.from, 'dd MMM yyyy', { locale: ptBRDateFns })
  if (!range.to) return from
  return `${from} – ${format(range.to, 'dd MMM yyyy', { locale: ptBRDateFns })}`
}
