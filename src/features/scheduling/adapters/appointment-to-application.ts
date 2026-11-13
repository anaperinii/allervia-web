import { appointmentStatusToApplicationStatus } from '@/features/scheduling/constants/application-display'
import { dayInZone, timeInZone } from '@/shared/lib/dates'
import { formatPhone } from '@/shared/lib/formatters'
import type { Appointment } from '@/shared/api/contracts/clinical'
import type { Application } from '@/features/patient/stores/usePatientStore'

const MONTHS_UPPER = ['JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO', 'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO']

function localTime(iso: string, timeZone: string): string {
  return timeInZone(new Date(iso), timeZone)
}

export function appointmentToApplication(item: Appointment, timeZone: string): Application {
  const starts = new Date(item.startsAt)
  const day = dayInZone(starts, timeZone)
  return {
    id: item.id,
    patientId: item.patientId,
    date: `${day.slice(8, 10)}/${day.slice(5, 7)}/${day.slice(0, 4)}`,
    startTime: localTime(item.startsAt, timeZone),
    endTime: localTime(item.endsAt, timeZone),
    status: appointmentStatusToApplicationStatus(item.status),
    dose: item.title ?? (item.dose ? 'Aplicação prevista' : 'Compromisso'),
    cycle: { number: 1, days: 0 },
    month: MONTHS_UPPER[Number(day.slice(5, 7)) - 1],
    year: Number(day.slice(0, 4)),
    patientName: item.patient.fullName,
    patientPhone: formatPhone(item.patient.phoneNumber),
    modality: 'subcutaneous',
    isAppointment: true,
  }
}
