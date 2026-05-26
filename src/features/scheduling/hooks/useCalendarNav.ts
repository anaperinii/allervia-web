import { useMemo, useState } from 'react'
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addWeeks,
  subWeeks,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'

export type CalendarViewMode = 'week' | 'month'

export function useCalendarNav() {
  const [viewMode, setViewMode] = useState<CalendarViewMode>('week')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())

  const weekDays = useMemo(() => {
    if (viewMode !== 'week') return []
    const start = startOfWeek(currentDate, { locale: ptBR })
    const end = endOfWeek(currentDate, { locale: ptBR })
    return eachDayOfInterval({ start, end })
  }, [currentDate, viewMode])

  const monthDays = useMemo(() => {
    if (viewMode !== 'month') return []
    const start = startOfWeek(startOfMonth(currentDate), { locale: ptBR })
    const end = endOfWeek(endOfMonth(currentDate), { locale: ptBR })
    return eachDayOfInterval({ start, end })
  }, [currentDate, viewMode])

  const monthLabel = useMemo(() => {
    const m = format(currentDate, 'MMMM yyyy', { locale: ptBR })
    return m.charAt(0).toUpperCase() + m.slice(1)
  }, [currentDate])

  const goToPrev = () =>
    setCurrentDate(viewMode === 'week' ? subWeeks(currentDate, 1) : subMonths(currentDate, 1))
  const goToNext = () =>
    setCurrentDate(viewMode === 'week' ? addWeeks(currentDate, 1) : addMonths(currentDate, 1))
  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }

  return {
    viewMode,
    setViewMode,
    currentDate,
    selectedDate,
    setSelectedDate,
    weekDays,
    monthDays,
    monthLabel,
    goToPrev,
    goToNext,
    goToToday,
  }
}
