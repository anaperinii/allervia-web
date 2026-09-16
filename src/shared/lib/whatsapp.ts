export function openWhatsApp(phone: string) {
  const digits = phone.replace(/\D/g, '')
  window.open(`https://wa.me/55${digits}`, '_blank')
}

export function sendReminder(phone: string, patientName: string, date: string, time: string) {
  const digits = phone.replace(/\D/g, '')
  const msg = encodeURIComponent(
    `Olá ${patientName}, este é um lembrete do seu agendamento de imunoterapia no dia ${date} às ${time}. Caso precise reagendar, entre em contato conosco. — Allervia`,
  )
  window.open(`https://wa.me/55${digits}?text=${msg}`, '_blank')
}
