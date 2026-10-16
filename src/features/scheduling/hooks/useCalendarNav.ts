import { dayInZone } from '@/shared/lib/dates'
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

export function useCalendarNav(timeZone = 'America/Sao_Paulo') {
  const civilToday = () => new Date(dayInZone(new Date(), timeZone) + 'T12:00:00')
  const [viewMode, setViewMode] = useState<CalendarViewMode>('week')
  const [currentDate, setCurrentDate] = useState(civilToday)
  const [selectedDate, setSelectedDate] = useState(civilToday)

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
    setCurrentDate(civilToday())
    setSelectedDate(civilToday())
  }

  const setMonth = (month: number) => {
    const next = new Date(currentDate)
    const day = next.getDate()
    next.setDate(1)
    next.setMonth(month)
    next.setDate(Math.min(day, new Date(next.getFullYear(), month + 1, 0).getDate()))
    setCurrentDate(next)
  }

  const setYear = (year: number) => {
    const next = new Date(currentDate)
    const day = next.getDate()
    const month = next.getMonth()
    next.setDate(1)
    next.setFullYear(year)
    next.setDate(Math.min(day, new Date(year, month + 1, 0).getDate()))
    setCurrentDate(next)
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
    setMonth,
    setYear,
  }
}
