import { weekRangeFromKey } from '@/features/dashboard/hooks/useChartWindow'
import { format } from 'date-fns'
import { ptBR as ptBRDateFns } from 'date-fns/locale'
export function formatWeek(value: string) {
  const range = weekRangeFromKey(value)
  if (!range) return 'Semana'
  const from = format(range.from, 'dd/MM', { locale: ptBRDateFns })
  const to = format(range.to, 'dd/MM', { locale: ptBRDateFns })
  return `${from} – ${to}`
}
