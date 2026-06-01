import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { INDUCTION_SEQUENCE, META_DOSE, META_STEP } from '@/features/immunotherapy/constants/scit-protocol'
import { MONTHS_PT_UPPER } from '@/shared/constants/months-pt'
import { comparePtDateAsc, isApplicationPast } from '@/shared/lib/dates'
import { useNotificationsStore } from '@/features/notification/stores/notifications-store'
import { useImmunotherapiesStore } from '@/features/immunotherapy/stores/immunotherapies-store'

export type ProtocolAdjustmentType =
  | 'dose_reduction'
  | 'interval_increase'
  | 'concentration_change'
  | 'suspension'
  | 'other'

export type InactivationCategory =
  | 'treatment_completion'
  | 'mild_adverse_reaction'
  | 'severe_adverse_reaction'
  | 'acute_infection'
  | 'pregnancy'
  | 'scheduled_surgery'
  | 'recent_vaccination'
  | 'clinical_contraindication'
  | 'protocol_change'
  | 'lack_of_adherence'
  | 'patient_request'
  | 'other'

export interface Inactivation {
  id: string
  category: InactivationCategory
  detail: string
  startDate: string
  expectedReturnDate: string | null
  responsibleDoctor: string
  snapshotConcentration: string
  snapshotInterval: number
  reactivatedAt?: string
  reactivateNote?: string
  reactivatedBy?: string
  reactivateConcentration?: string
  reactivateInterval?: number
  reactivateJustification?: string
}

export interface ProtocolAdjustment {
  id: string
  date: string
  type: ProtocolAdjustmentType
  previousConcentration: string
  previousInterval: number
  newConcentration: string
  newInterval: number
  justification: string
  responsibleDoctor: string
}

export interface Patient {
  id: string
  name: string
  birthDate: string
  age: number
  phone: string
  weight: string
  cpf: string
  responsibleDoctor: string
  status: 'active' | 'inactive'
  immunotherapyType: string
  inductionStart: string
  maintenanceStart: string | null
  administrationRoute: string
  extract: string
  targetConcentrationVolume: string
  targetReached: boolean
  currentInterval: number
  nextApplicationDate: string
  currentDoseConcentration: string
  protocolAdjustments?: ProtocolAdjustment[]
  inactivations?: Inactivation[]
}

export interface Application {
  id: string
  patientId: string
  date: string
  startTime: string
  endTime: string
  status: 'scheduled' | 'completed' | 'canceled' | 'missed'
  dose: string
  cycle: { number: number; days: number }
  month: string
  year: number
  appliedVolume?: string
  extractConcentration?: string
  sideEffect?: string
  reportedEffects?: string
  medicationNeeded?: string
  medications?: string
  administrator?: string
  administratorNote?: string
  modality?: 'subcutaneous' | 'sublingual'
  delayedDays?: number
}

interface PatientState {
  selectedPatient: Patient | null
  applications: Application[]
  setSelectedPatient: (patient: Patient | null) => void
  addProtocolAdjustment: (adjustment: ProtocolAdjustment) => void
  inactivateImmunotherapy: (inactivation: Inactivation) => void
  reactivateImmunotherapy: (payload: {
    note: string
    reactivatedBy: string
    reactivateConcentration: string
    reactivateInterval: number
    justification: string
  }) => void
  /** Agenda uma aplicação inicial (RNE-026 — geração automática no cadastro de imunoterapia). */
  scheduleApplication: (app: Application) => void
  /** Registra uma aplicação realizada e agenda a próxima automaticamente. */
  recordEvolution: (payload: { completed: Application; next: Application }) => void
  /** Marca um agendamento como ausente (missed) e persiste no store. */
  markApplicationMissed: (applicationId: string) => void
  /** Altera status entre completed ↔ missed. Calcula delayedDays se missed. */
  setApplicationStatus: (applicationId: string, status: 'completed' | 'missed') => void
}

const INACTIVATION_SEEDS: Record<string, Omit<Inactivation, 'id' | 'snapshotConcentration' | 'snapshotInterval'>> = {
  '10': { category: 'patient_request', detail: 'Paciente optou por interromper o tratamento por motivos pessoais. Retorno será reavaliado após estabilização da rotina.', startDate: '15/02/2026 às 09:15', expectedReturnDate: '15/05/2026', responsibleDoctor: 'Dra. Karina Martins' },
  '11': { category: 'pregnancy', detail: 'Paciente comunicou gestação; tratamento pausado conforme protocolo para reavaliação no pós-parto.', startDate: '22/01/2026 às 11:30', expectedReturnDate: '01/10/2026', responsibleDoctor: 'Dra. Karina Martins' },
  '12': { category: 'severe_adverse_reaction', detail: 'Reação moderada durante aplicação 1:1.000 - 0,2ml com necessidade de anti-histamínico. Conduta revista com alergologista responsável.', startDate: '10/01/2026 às 15:45', expectedReturnDate: null, responsibleDoctor: 'Dr. André Lima' },
}

export function seedInactivationsFor(patientId: string, snapshotConcentration: string, snapshotInterval: number): Inactivation[] | undefined {
  const seed = INACTIVATION_SEEDS[patientId]
  if (!seed) return undefined
  return [{ id: `inact-seed-${patientId}`, ...seed, snapshotConcentration, snapshotInterval }]
}

// ════════════════════════════════════════════════════════════════════
// Geração programática das aplicações seguindo protocolo SCIT (RNE-010)
// ════════════════════════════════════════════════════════════════════

function fmtDate(d: Date) {
  const day = String(d.getDate()).padStart(2, '0')
  const mo = String(d.getMonth() + 1).padStart(2, '0')
  return { date: `${day}/${mo}/${d.getFullYear()}`, month: MONTHS_PT_UPPER[d.getMonth()], year: d.getFullYear() }
}

function daysOffset(base: Date, n: number): Date {
  const r = new Date(base)
  r.setDate(r.getDate() + n)
  return r
}

function inductionFlow(patientId: string, prefix: string, stepIndex: number, lastRealizedDate: Date, nextScheduledDate: Date | null, startTime: string, endTime: string, administrator: string): Application[] {
  const apps: Application[] = []
  for (let i = 0; i <= stepIndex; i++) {
    const dateBase = daysOffset(lastRealizedDate, -7 * (stepIndex - i))
    const step = INDUCTION_SEQUENCE[i]
    const { date, month, year } = fmtDate(dateBase)
    apps.push({
      id: `${prefix}${i + 1}`, patientId, date, month, year,
      startTime, endTime, status: 'completed',
      dose: `${step.conc} - ${step.vol}`,
      cycle: { number: 1, days: 7 },
      appliedVolume: step.vol, extractConcentration: step.conc,
      sideEffect: 'no', medicationNeeded: 'no', administrator,
      administratorNote: i === 0 ? 'Primeira aplicação' : (i % 4 === 0 ? `Avançou para ${step.conc}` : '-'),
    })
  }
  if (nextScheduledDate && stepIndex < INDUCTION_SEQUENCE.length - 1) {
    const nextStep = INDUCTION_SEQUENCE[stepIndex + 1]
    const { date, month, year } = fmtDate(nextScheduledDate)
    apps.push({
      id: `${prefix}next`, patientId, date, month, year,
      startTime, endTime, status: 'scheduled',
      dose: `${nextStep.conc} - ${nextStep.vol}`,
      cycle: { number: 1, days: 7 },
    })
  }
  return apps
}

function maintenanceFlow(patientId: string, prefix: string, finalInterval: 14 | 21 | 28, lastRealizedDate: Date, nextScheduledDate: Date | null, startTime: string, endTime: string, administrator: string): Application[] {
  type H = { dose: string; conc: string; vol: string; interval: number; cycle: number; note?: string }
  const hist: H[] = []
  for (let i = 0; i < INDUCTION_SEQUENCE.length; i++) {
    const s = INDUCTION_SEQUENCE[i]
    hist.push({
      dose: `${s.conc} - ${s.vol}`, conc: s.conc, vol: s.vol, interval: 7, cycle: 1,
      note: i === 0 ? 'Primeira aplicação' : i === INDUCTION_SEQUENCE.length - 1 ? 'Meta atingida! Transição para manutenção' : (i % 4 === 0 ? `Avançou para ${s.conc}` : '-'),
    })
  }
  const pushMeta = (interval: 14 | 21 | 28, cycle: number, note?: string) =>
    hist.push({ dose: META_DOSE, conc: META_STEP.conc, vol: META_STEP.vol, interval, cycle, note: note || '-' })

  if (finalInterval >= 14) {
    pushMeta(14, 1, 'Início manutenção 14 dias')
    pushMeta(14, 1)
  }
  if (finalInterval >= 21) {
    pushMeta(21, 2, 'Progrediu para 21 dias')
    pushMeta(21, 2)
  }
  if (finalInterval >= 28) {
    pushMeta(28, 3, 'Progrediu para 28 dias')
    pushMeta(28, 3)
  }

  const dates: Date[] = new Array(hist.length)
  dates[hist.length - 1] = lastRealizedDate
  for (let i = hist.length - 2; i >= 0; i--) {
    dates[i] = daysOffset(dates[i + 1], -hist[i + 1].interval)
  }

  const apps: Application[] = []
  for (let i = 0; i < hist.length; i++) {
    const h = hist[i]
    const { date, month, year } = fmtDate(dates[i])
    apps.push({
      id: `${prefix}${i + 1}`, patientId, date, month, year,
      startTime, endTime, status: 'completed',
      dose: h.dose, cycle: { number: h.cycle, days: h.interval },
      appliedVolume: h.vol, extractConcentration: h.conc,
      sideEffect: 'no', medicationNeeded: 'no', administrator,
      administratorNote: h.note,
    })
  }
  if (nextScheduledDate) {
    const cycle = finalInterval === 14 ? 1 : finalInterval === 21 ? 2 : 3
    const { date, month, year } = fmtDate(nextScheduledDate)
    apps.push({
      id: `${prefix}next`, patientId, date, month, year,
      startTime, endTime, status: 'scheduled',
      dose: META_DOSE, cycle: { number: cycle, days: finalInterval },
    })
  }
  return apps
}

const REACTION_SEEDS: Record<string, { reportedEffects: string; medications: string; note: string }> = {
  'a4': {
    reportedEffects: 'Prurido local leve e eritema no ponto da aplicação',
    medications: 'Anti-histamínico tópico (Polaramine creme)',
    note: 'Reação local leve. Conduta: manter protocolo com monitoramento.',
  },
  'pt4': {
    reportedEffects: 'Eritema leve no local da aplicação (< 2cm)',
    medications: 'Compressas frias locais',
    note: 'Paciente tolerou; segue protocolo.',
  },
  'l11': {
    reportedEffects: 'Placa urticariforme peri-aplicação (~5cm) com prurido intenso',
    medications: 'Loratadina 10mg VO + Dexclorfeniramina creme',
    note: 'Reação moderada motivou solicitação de interrupção pelo paciente.',
  },
  'r6': {
    reportedEffects: 'Urticária generalizada + prurido difuso 20min pós-aplicação',
    medications: 'Anti-histamínico VO + corticoide (Prednisona 20mg)',
    note: 'Reação moderada. Tratamento suspenso a pedido médico.',
  },
}

function applyReactions(apps: Application[]): Application[] {
  return apps.map((a) => {
    const seed = REACTION_SEEDS[a.id]
    if (!seed) return a
    return {
      ...a,
      sideEffect: 'yes',
      reportedEffects: seed.reportedEffects,
      medicationNeeded: 'yes',
      medications: seed.medications,
      administratorNote: seed.note,
    }
  })
}

function buildSeedApplications(): Application[] {
  const r = 'Jaqueline'
  const out: Application[] = []
  out.push(...inductionFlow('1', 'b', 0, new Date(2026, 3, 11), new Date(2026, 3, 18), '09:00', '09:30', r))
  out.push(...inductionFlow('2', 'c', 5, new Date(2026, 3, 11), new Date(2026, 3, 18), '10:00', '10:30', r))
  out.push(...inductionFlow('3', 'a', 10, new Date(2026, 3, 11), new Date(2026, 3, 18), '10:30', '11:00', r))
  out.push(...inductionFlow('4', 'v', 14, new Date(2026, 3, 11), new Date(2026, 3, 18), '11:00', '11:30', r))
  out.push(...maintenanceFlow('5', 'h', 14, new Date(2026, 3, 4), new Date(2026, 3, 18), '14:00', '14:30', r))
  out.push(...maintenanceFlow('6', 'cr', 21, new Date(2026, 2, 28), new Date(2026, 3, 18), '15:30', '16:00', r))
  out.push(...maintenanceFlow('7', 'm', 28, new Date(2026, 2, 21), new Date(2026, 3, 18), '08:00', '08:30', r))
  out.push(...inductionFlow('8', 'pt', 4, new Date(2026, 3, 11), new Date(2026, 3, 18), '09:00', '09:30', r))
  out.push(...inductionFlow('9', 'pe', 9, new Date(2026, 3, 11), new Date(2026, 3, 18), '10:30', '11:00', r))

  out.push(...inductionFlow('10', 'l', 10, new Date(2026, 1, 15), null, '09:00', '09:30', r))
  out.push(...maintenanceFlow('11', 'j', 14, new Date(2026, 0, 20), null, '11:00', '11:30', r))
  out.push(...inductionFlow('12', 'r', 5, new Date(2026, 0, 10), null, '15:00', '15:30', r))

  return autoCompletePastApplications(applyReactions(out))
}

// ════════════════════════════════════════════════════════════════════
// Auto-complete dinâmico: usa isApplicationPast() para determinar em
// tempo real se um agendamento já passou (dia anterior ou horário passado).
// Auto-schedule: quando concluído, gera próximo conforme intervalo do ciclo.
// ════════════════════════════════════════════════════════════════════

/**
 * Calcula próxima dose e intervalo a partir da dose/intervalo atual.
 * Exportado para reutilização no setApplicationStatus.
 */
export function calcNextDose(currentDose: string, intervalDays: number): { dose: string; interval: number } {
  const idx = INDUCTION_SEQUENCE.findIndex((s) => `${s.conc} - ${s.vol}` === currentDose)
  if (idx >= 0 && idx < INDUCTION_SEQUENCE.length - 1) {
    const ns = INDUCTION_SEQUENCE[idx + 1]
    return { dose: `${ns.conc} - ${ns.vol}`, interval: 7 }
  }
  // Já está na dose META ou além — progride intervalos de manutenção
  if (intervalDays < 14) return { dose: META_DOSE, interval: 14 }
  if (intervalDays < 21) return { dose: META_DOSE, interval: 21 }
  if (intervalDays < 28) return { dose: META_DOSE, interval: 28 }
  return { dose: currentDose, interval: intervalDays }
}

function autoCompletePastApplications(apps: Application[]): Application[] {
  const result: Application[] = [...apps]
  const toAdd: Application[] = []

  // Ordena por data crescente para processar em ordem cronológica
  const scheduled = result
    .filter((a) => a.status === 'scheduled')
    .sort((a, b) => {
      const [ad, am, ay] = a.date.split('/').map(Number)
      const [bd, bm, by] = b.date.split('/').map(Number)
      return new Date(ay, am - 1, ad).getTime() - new Date(by, bm - 1, bd).getTime()
    })

  for (const app of scheduled) {
    // Usa isApplicationPast — dinâmico, baseado em now()
    if (!isApplicationPast(app.date, app.endTime)) continue

    // Marca como concluído
    const idx = result.findIndex((a) => a.id === app.id)
    if (idx < 0) continue
    result[idx] = {
      ...app,
      status: 'completed',
      appliedVolume: app.dose.split(' - ')[1] ?? app.dose,
      extractConcentration: app.dose.split(' - ')[0] ?? '',
      sideEffect: 'no',
      medicationNeeded: 'no',
      administrator: app.administrator ?? 'Jaqueline',
      administratorNote: 'Concluída automaticamente',
    }

    // Gera próxima aplicação seguindo o protocolo de dias e doses progressivas
    const intervalDays = app.cycle.days
    const [d, m, y] = app.date.split("/").map(Number);
    const appDate = new Date(y, m - 1, d);
    const nextDate = new Date(appDate)
    nextDate.setDate(nextDate.getDate() + intervalDays)
    const { date: nextDateStr, month: nextMonth, year: nextYear } = fmtDate(nextDate)

    // Verifica se já existe agendamento futuro para esse paciente nesta data
    const alreadyExists = result.some(
      (a) => a.patientId === app.patientId && a.date === nextDateStr && a.status === 'scheduled',
    )
    if (!alreadyExists) {
      // Calcula próxima dose do protocolo (usa constantes já importadas no topo do arquivo)
      const currentDose = app.dose
      const nextDoseCalc = (() => {
        const idx2 = INDUCTION_SEQUENCE.findIndex(
          (s) => `${s.conc} - ${s.vol}` === currentDose,
        )
        if (idx2 >= 0 && idx2 < INDUCTION_SEQUENCE.length - 1) {
          const ns = INDUCTION_SEQUENCE[idx2 + 1]
          return { dose: `${ns.conc} - ${ns.vol}`, interval: 7 }
        }
        if (intervalDays < 14) return { dose: META_DOSE, interval: 14 }
        if (intervalDays < 21) return { dose: META_DOSE, interval: 21 }
        if (intervalDays < 28) return { dose: META_DOSE, interval: 28 }
        return { dose: currentDose, interval: intervalDays }
      })()

      toAdd.push({
        id: `${app.id}-auto-next-${nextDateStr.replace(/\//g, '')}`,
        patientId: app.patientId,
        date: nextDateStr,
        month: nextMonth,
        year: nextYear,
        startTime: app.startTime,
        endTime: app.endTime,
        status: 'scheduled',
        dose: nextDoseCalc.dose,
        cycle: { number: app.cycle.number, days: nextDoseCalc.interval },
        modality: app.modality,
      })
    }
  }

  return [...result, ...toAdd]
}

export const usePatientStore = create<PatientState>()(
  persist(
    (set) => ({
      selectedPatient: null,
      applications: buildSeedApplications(),
      setSelectedPatient: (patient) => set({ selectedPatient: patient }),
      scheduleApplication: (app) => set((s) => ({ applications: [...s.applications, app] })),
      recordEvolution: ({ completed, next }) => set((s) => {
        const patientScheduled = s.applications
          .filter((a) => a.patientId === completed.patientId && a.status === 'scheduled')
          .sort((a, b) => comparePtDateAsc(a.date, b.date))
        const nextToReplace = patientScheduled[0]?.id
        const filtered = nextToReplace
          ? s.applications.filter((a) => a.id !== nextToReplace)
          : s.applications
        return {
          applications: [...filtered, completed, next],
          selectedPatient: s.selectedPatient && s.selectedPatient.id === completed.patientId ? {
            ...s.selectedPatient,
            currentDoseConcentration: completed.dose,
            currentInterval: next.cycle.days,
            nextApplicationDate: next.date,
          } : s.selectedPatient,
        }
      }),
      addProtocolAdjustment: (adjustment) => set((s) => {
        if (!s.selectedPatient) return s
        return {
          selectedPatient: {
            ...s.selectedPatient,
            currentDoseConcentration: adjustment.newConcentration,
            currentInterval: adjustment.newInterval,
            protocolAdjustments: [...(s.selectedPatient.protocolAdjustments || []), adjustment],
          },
        }
      }),
      inactivateImmunotherapy: (inactivation) => set((s) => {
        if (!s.selectedPatient) return s
        return {
          selectedPatient: {
            ...s.selectedPatient,
            status: 'inactive',
            inactivations: [...(s.selectedPatient.inactivations || []), inactivation],
          },
        }
      }),
      reactivateImmunotherapy: ({ note, reactivatedBy, reactivateConcentration, reactivateInterval, justification }) => set((s) => {
        if (!s.selectedPatient) return s
        const list = s.selectedPatient.inactivations || []
        if (list.length === 0) return s
        const updated = [...list]
        const lastIdx = updated.length - 1
        const reactivatedAt = new Date().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(',', ' às')
        updated[lastIdx] = {
          ...updated[lastIdx],
          reactivatedAt,
          reactivateNote: note,
          reactivatedBy,
          reactivateConcentration,
          reactivateInterval,
          reactivateJustification: justification,
        }
        return {
          selectedPatient: {
            ...s.selectedPatient,
            status: 'active',
            currentDoseConcentration: reactivateConcentration,
            currentInterval: reactivateInterval,
            inactivations: updated,
          },
        }
      }),
      markApplicationMissed: (applicationId) => set((s) => ({
        applications: s.applications.map((a) =>
          a.id === applicationId && (a.status === 'scheduled' || a.status === 'missed')
            ? { ...a, status: 'missed' as const }
            : a,
        ),
      })),
      setApplicationStatus: (applicationId, status) => set((s) => {
        const app = s.applications.find((a) => a.id === applicationId)
        if (!app) return s

        const updatedApp: Application = {
          ...app,
          status,
          delayedDays: status === 'missed' ? (() => {
            // Calcula dias de atraso desde a data agendada
            const [d, m, y] = app.date.split('/').map(Number)
            const scheduled = new Date(y, m - 1, d)
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            return Math.max(0, Math.floor((today.getTime() - scheduled.getTime()) / 86400000))
          })() : undefined,
        }

        // Se revertendo para 'completed': verifica se já há um próximo agendamento
        // Se não houver, agenda automaticamente o próximo
        const newApplications = s.applications.map((a) => a.id === applicationId ? updatedApp : a)
        if (status === 'completed') {
          const { dose, cycle } = app
          const next = calcNextDose(dose, cycle.days)
          const [d, m, y] = app.date.split('/').map(Number)
          const appDate = new Date(y, m - 1, d)
          const nextDate = new Date(appDate)
          nextDate.setDate(nextDate.getDate() + cycle.days)
          const nd = String(nextDate.getDate()).padStart(2, '0')
          const nm = String(nextDate.getMonth() + 1).padStart(2, '0')
          const ny = nextDate.getFullYear()
          const nextDateStr = `${nd}/${nm}/${ny}`
          const alreadyExists = newApplications.some(
            (a) => a.patientId === app.patientId && a.date === nextDateStr && a.status === 'scheduled',
          )
          if (!alreadyExists) {
            const monthNames = ['JANEIRO','FEVEREIRO','MARÇO','ABRIL','MAIO','JUNHO','JULHO','AGOSTO','SETEMBRO','OUTUBRO','NOVEMBRO','DEZEMBRO']
            newApplications.push({
              id: `${app.id}-next-${nextDateStr.replace(/\//g, '')}`,
              patientId: app.patientId,
              date: nextDateStr,
              month: monthNames[nextDate.getMonth()],
              year: ny,
              startTime: app.startTime,
              endTime: app.endTime,
              status: 'scheduled',
              dose: next.dose,
              cycle: { number: app.cycle.number, days: next.interval },
              modality: app.modality,
            })
          }
        }

        // Dispara notificação automática ao marcar como perdida
        if (status === 'missed') {
          const patientFullName = useImmunotherapiesStore.getState().immunotherapies.find(
            (i) => i.id === app.patientId,
          )?.name ?? `Paciente #${app.patientId}`

          const [d, m, y] = app.date.split('/').map(Number)
          const scheduledDate = new Date(y, m - 1, d)
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          const delayDays = Math.max(0, Math.floor((today.getTime() - scheduledDate.getTime()) / 86400000))
          const delayLabel = delayDays === 0
            ? 'hoje'
            : delayDays === 1
              ? 'ontem'
              : `há ${delayDays} dias`

          useNotificationsStore.getState().addNotification({
            type: 'missed_appointment',
            priority: delayDays >= 3 ? 'high' : 'medium',
            title: 'Aplicação não realizada',
            message: `${patientFullName} não compareceu à aplicação de ${app.dose} agendada para ${app.date} (${delayLabel}).`,
            details: `A aplicação de ${app.dose} agendada para ${app.date} às ${app.startTime} foi marcada como perdida. Considere remarcar ou entrar em contato com o paciente.`,
            timestamp: new Date(),
            read: false,
            patientId: app.patientId,
            actionUrl: `/patient/${app.patientId}`,
            actionLabel: 'Ver prontuário',
          })
        }

        return { applications: newApplications }
      }),

    }),
    {
      name: 'imunecare:patients',
      storage: createJSONStorage(() => localStorage),
      // selectedPatient não precisa persistir — é sempre rederivado da navegação
      partialize: (state) => ({ applications: state.applications }),
      // Se já há aplicações salvas, usa as persistidas; do contrário usa o seed
      merge: (persisted, current) => {
        const p = persisted as Partial<PatientState>
        if (!p?.applications?.length) return current
        return { ...current, applications: p.applications }
      },
    },
  ),
)
