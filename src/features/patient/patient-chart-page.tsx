import { useMemo, useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { usePatientStore, seedInactivationsFor, type Application, type ProtocolAdjustmentType, type InactivationCategory } from '@/features/patient/stores/patient-store'
import { useImmunotherapiesStore } from '@/features/immunotherapy/stores/immunotherapies-store'
import { useHasPermission, useDoctorFilter, useUserStore } from '@/shared/identity/user-store'
import { useAuditStore } from '@/shared/audit/audit-store'
import { META_DOSE, calculateNextDose } from '@/features/immunotherapy/constants/scit-protocol'
import { addDays, format, differenceInDays, parse } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/shared/lib/utils'
import { Toast, Modal, Button, FieldLabel, TextInput, TextArea, Select, SegmentedControl } from '@/shared/components'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  adjustProtocolSchema,
  type AdjustProtocolForm,
  ADJUST_PROTOCOL_DEFAULTS,
} from '@/features/patient/schemas/adjust-protocol'
import {
  inactivateSchema,
  type InactivateForm,
  INACTIVATE_DEFAULTS,
} from '@/features/patient/schemas/inactivate'
import {
  createReactivateSchema,
  type ReactivateForm,
  REACTIVATE_DEFAULTS,
} from '@/features/patient/schemas/reactivate'
import {
  Clock,
  CalendarDays,
  Droplet,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Pencil,
  X,
  Save,
  List,
  SlidersHorizontal,
  AlertTriangle,
  History,
  Power,
  PowerOff,
  Info,
} from 'lucide-react'
import { getIntervalColor } from '@/features/immunotherapy/constants/interval-colors'

export function PatientChartPage() {
  const navigate = useNavigate()
  const { patientId } = useParams({ from: '/patient/$patientId' })
  const { selectedPatient, applications, setSelectedPatient, inactivateImmunotherapy, reactivateImmunotherapy } = usePatientStore()
  const canAdjustProtocol = useHasPermission('adjust_protocol')
  const canInactivate = useHasPermission('inactivate_immunotherapy')
  const canReactivate = useHasPermission('reactivate_patient')
  const canEditPatient = useHasPermission('edit_patient_data')
  const canEvolve = useHasPermission('evolve_patient')
  const canEmitReport = useHasPermission('emit_report')
  const doctorFilter = useDoctorFilter()

  useEffect(() => {
    if (doctorFilter && selectedPatient && selectedPatient.responsibleDoctor !== doctorFilter) {
      navigate({ to: '/immunotherapies' })
    }
  }, [doctorFilter, selectedPatient, navigate])
  const [showPersonal, setShowPersonal] = useState(true)
  const [showImmuno, setShowImmuno] = useState(true)
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [modalTab, setModalTab] = useState<'pre' | 'pos'>('pre')
  const [monthFilter, setMonthFilter] = useState('all')
  const [showProgress, setShowProgress] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showEditConfirm, setShowEditConfirm] = useState(false)
  const [viewMode, setViewMode] = useState<'timeline' | 'calendar'>('timeline')
  const [calMonth, setCalMonth] = useState(new Date().getMonth())
  const [calYear, setCalYear] = useState(new Date().getFullYear())
  const [showAdjustModal, setShowAdjustModal] = useState(false)
  const [showAdjustHistory, setShowAdjustHistory] = useState(false)
  const adjustForm = useForm<AdjustProtocolForm>({
    resolver: zodResolver(adjustProtocolSchema),
    mode: 'onBlur',
    defaultValues: ADJUST_PROTOCOL_DEFAULTS,
  })
  const adjustValues = adjustForm.watch()
  const adjustErrors = adjustForm.formState.errors
  const [showAdjustToast, setShowAdjustToast] = useState(false)
  const [showInactivateModal, setShowInactivateModal] = useState(false)
  const [showInactivateToast, setShowInactivateToast] = useState(false)
  const inactivateForm = useForm<InactivateForm>({
    resolver: zodResolver(inactivateSchema),
    mode: 'onBlur',
    defaultValues: INACTIVATE_DEFAULTS,
  })
  const inactivateValues = inactivateForm.watch()
  const inactivateErrors = inactivateForm.formState.errors
  const [showReactivateModal, setShowReactivateModal] = useState(false)
  const [showReactivateToast, setShowReactivateToast] = useState(false)
  const reactivateForm = useForm<ReactivateForm>({
    mode: 'onBlur',
    defaultValues: REACTIVATE_DEFAULTS,
  })
  const reactivateValues = reactivateForm.watch()
  const reactivateErrors = reactivateForm.formState.errors
  const [showInactivationHistory, setShowInactivationHistory] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '', phone: '', weight: '', responsibleDoctor: '',
  })
  const monthsScrollRef = useRef<HTMLDivElement | null>(null)
  const [monthsCanScrollLeft, setMonthsCanScrollLeft] = useState(false)
  const [monthsCanScrollRight, setMonthsCanScrollRight] = useState(false)

  const scrollMonths = (direction: 'left' | 'right') => {
    const el = monthsScrollRef.current
    if (!el) return
    el.scrollBy({ left: direction === 'left' ? -el.clientWidth * 0.6 : el.clientWidth * 0.6, behavior: 'smooth' })
  }

  const INACTIVATION_CATEGORY_LABELS: Record<InactivationCategory, string> = {
    treatment_completion: 'Conclusão do tratamento',
    mild_adverse_reaction: 'Reação adversa leve',
    severe_adverse_reaction: 'Reação adversa grave',
    acute_infection: 'Infecção aguda',
    pregnancy: 'Gestação',
    scheduled_surgery: 'Cirurgia programada',
    recent_vaccination: 'Vacinação recente',
    clinical_contraindication: 'Contraindicação clínica',
    protocol_change: 'Mudança de conduta clínica',
    lack_of_adherence: 'Falta de adesão',
    patient_request: 'Solicitação do paciente',
    other: 'Outro',
  }

  useEffect(() => {
    if (!selectedPatient && patientId) {
      const { immunotherapies } = useImmunotherapiesStore.getState()
      const imm = immunotherapies.find((i) => i.id === patientId)
      if (imm) {
        setSelectedPatient({
          id: imm.id, name: imm.name, birthDate: '02/07/2000', age: 25,
          phone: '(62) 99557-1423', weight: '89.7 kg', cpf: '711.905.744-89',
          responsibleDoctor: imm.responsibleDoctor, status: imm.status === 'active' ? 'active' as const : 'inactive' as const,
          immunotherapyType: imm.type, inductionStart: '01/01/2020', maintenanceStart: null,
          administrationRoute: 'Subcutânea', extract: 'Der p 60 + der f 10% + blt 30%',
          targetConcentrationVolume: '1:10 - 0,5ml', targetReached: false,
          currentInterval: imm.cycleInterval.days, nextApplicationDate: '21/05/2025',
          currentDoseConcentration: imm.doseConcentration,
          inactivations: imm.status === 'inactive' ? seedInactivationsFor(imm.id, imm.doseConcentration, imm.cycleInterval.days) : undefined,
        })
      } else {
        navigate({ to: '/immunotherapies' })
      }
    }
  }, [patientId, selectedPatient, navigate, setSelectedPatient])

  const currentUser = useUserStore((s) => s.current)
  const logAccess = useAuditStore((s) => s.logAccess)
  const loggedAccessRef = useRef<string | null>(null)
  useEffect(() => {
    if (!selectedPatient) return
    const key = `${currentUser.id}::${selectedPatient.id}`
    if (loggedAccessRef.current === key) return
    loggedAccessRef.current = key
    logAccess({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      userRegistration: currentUser.registration,
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      action: 'view_chart',
      description: 'Consultou o prontuário',
    })
  }, [selectedPatient, currentUser, logAccess])

  const patientApps = useMemo(() => {
    if (!selectedPatient) return []
    return applications.filter((a) => a.patientId === selectedPatient.id)
  }, [applications, selectedPatient])

  const lastRealized = useMemo(() => {
    const realized = patientApps.filter((a) => a.status === 'completed')
    if (!realized.length) return null
    return [...realized].sort((a, b) => {
      const da = a.date.split('/'), db = b.date.split('/')
      return new Date(+db[2], +db[1] - 1, +db[0]).getTime() - new Date(+da[2], +da[1] - 1, +da[0]).getTime()
    })[0]
  }, [patientApps])

  const inicioInducaoCalc = useMemo(() => {
    const realized = patientApps.filter((a) => a.status === 'completed')
    if (!realized.length) return null
    const firstApp = [...realized].sort((a, b) => {
      const da = a.date.split('/'), db = b.date.split('/')
      return new Date(+da[2], +da[1] - 1, +da[0]).getTime() - new Date(+db[2], +db[1] - 1, +db[0]).getTime()
    })[0]
    return firstApp.date
  }, [patientApps])

  const inicioManutencaoCalc = useMemo(() => {
    const meta = patientApps.filter((a) => a.status === 'completed' && a.dose === META_DOSE)
    if (!meta.length) return null
    const firstMeta = [...meta].sort((a, b) => {
      const da = a.date.split('/'), db = b.date.split('/')
      return new Date(+da[2], +da[1] - 1, +da[0]).getTime() - new Date(+db[2], +db[1] - 1, +db[0]).getTime()
    })[0]
    return firstMeta.date
  }, [patientApps])

  const currentInterval = lastRealized?.cycle.days ?? selectedPatient?.currentInterval ?? 7
  const currentDose = lastRealized
    ? `${lastRealized.extractConcentration || lastRealized.dose.split(' - ')[0]} - ${lastRealized.appliedVolume || lastRealized.dose.split(' - ')[1]}`
    : selectedPatient?.currentDoseConcentration ?? '-'

  const nextCalc = useMemo(() => calculateNextDose(currentDose, currentInterval), [currentDose, currentInterval])

  const nextDate = useMemo(() => {
    if (!lastRealized) return selectedPatient?.nextApplicationDate ?? '-'
    try {
      const [d, m, y] = lastRealized.date.split('/')
      return format(addDays(new Date(+y, +m - 1, +d), nextCalc.interval), 'dd/MM/yyyy')
    } catch { return '-' }
  }, [lastRealized, nextCalc.interval, selectedPatient])

  const treatmentTime = useMemo(() => {
    const inicio = inicioInducaoCalc || selectedPatient?.inductionStart
    if (!inicio) return null
    try {
      const start = parse(inicio, 'dd/MM/yyyy', new Date())
      const days = differenceInDays(new Date(), start)
      const months = Math.floor(days / 30)
      const years = Math.floor(months / 12)
      if (years > 0) return `${years} ${years === 1 ? 'ano' : 'anos'}`
      if (months > 0) return `${months} ${months === 1 ? 'mês' : 'meses'}`
      return `${days} ${days === 1 ? 'dia' : 'dias'}`
    } catch { return null }
  }, [inicioInducaoCalc, selectedPatient])

  const sortedApps = useMemo(() => {
    return [...patientApps].sort((a, b) => {
      const da = a.date.split('/'), db = b.date.split('/')
      return new Date(+db[2], +db[1] - 1, +db[0]).getTime() - new Date(+da[2], +da[1] - 1, +da[0]).getTime()
    })
  }, [patientApps])

  const availableMonths = useMemo(() => {
    const set = new Map<string, string>()
    sortedApps.forEach((a) => {
      const key = `${a.year}-${a.month}`
      if (!set.has(key)) set.set(key, `${a.month} ${a.year}`)
    })
    return Array.from(set.entries()).map(([key, label]) => ({ key, label }))
  }, [sortedApps])

  useEffect(() => {
    const el = monthsScrollRef.current
    if (!el) return
    const update = () => {
      setMonthsCanScrollLeft(el.scrollLeft > 2)
      setMonthsCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2)
    }
    const raf = requestAnimationFrame(update)
    el.addEventListener('scroll', update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(el)
    Array.from(el.children).forEach((c) => ro.observe(c))
    window.addEventListener('resize', update)
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      ro.disconnect()
    }
  }, [availableMonths.length, viewMode])

  const filteredApps = useMemo(() => {
    if (monthFilter === 'all') return sortedApps
    return sortedApps.filter((a) => `${a.year}-${a.month}` === monthFilter)
  }, [sortedApps, monthFilter])

  const grouped = useMemo(() => {
    const g: Record<string, Application[]> = {}
    filteredApps.forEach((a) => {
      const key = `${a.month} ${a.year}`
      if (!g[key]) g[key] = []
      g[key].push(a)
    })
    return g
  }, [filteredApps])

  const appsByDate = useMemo(() => {
    const m: Record<string, Application[]> = {}
    patientApps.forEach((a) => {
      if (!m[a.date]) m[a.date] = []
      m[a.date].push(a)
    })
    return m
  }, [patientApps])

  const calDays = useMemo(() => {
    const firstDay = new Date(calYear, calMonth, 1).getDay()
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
    const days: (number | null)[] = []
    for (let i = 0; i < firstDay; i++) days.push(null)
    for (let i = 1; i <= daysInMonth; i++) days.push(i)
    return days
  }, [calMonth, calYear])

  const calMonthLabel = (() => {
    const raw = format(new Date(calYear, calMonth, 1), "MMMM 'de' yyyy", { locale: ptBR })
    return raw.charAt(0).toUpperCase() + raw.slice(1)
  })()

  const inductionSteps = [
    { conc: '1:10.000', vols: ['0,1ml', '0,2ml', '0,4ml', '0,8ml'] },
    { conc: '1:1.000', vols: ['0,1ml', '0,2ml', '0,4ml', '0,8ml'] },
    { conc: '1:100', vols: ['0,1ml', '0,2ml', '0,4ml', '0,8ml'] },
    { conc: '1:10', vols: ['0,1ml', '0,2ml', '0,4ml', '0,5ml'] },
  ]
  const allSteps = inductionSteps.flatMap((s) => s.vols.map((v) => `${s.conc} - ${v}`))
  const currentDoseStr = lastRealized?.dose || selectedPatient?.currentDoseConcentration || '1:10.000 - 0,1ml'
  const currentStepIndex = useMemo(() => {
    const parts = currentDoseStr.split(' - ')
    const conc = parts[0]?.trim() || ''
    const vol = parts[1]?.trim() || ''
    return allSteps.findIndex((s) => {
      const sc = s.split(' - ')[0].trim()
      const sv = s.split(' - ')[1].trim()
      return conc === sc && vol === sv
    })
  }, [currentDoseStr, allSteps])
  const isMaintenance = currentInterval > 7
  const progressPct = isMaintenance ? 100 : Math.round(((currentStepIndex >= 0 ? currentStepIndex : 0) + 1) / allSteps.length * 100)

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()

  const activeInactivation = useMemo(() => {
    if (!selectedPatient?.inactivations?.length) return null
    const last = selectedPatient.inactivations[selectedPatient.inactivations.length - 1]
    return last && !last.reactivatedAt ? last : null
  }, [selectedPatient])

  const inactivationCount = selectedPatient?.inactivations?.length ?? 0

  const suggestedNextDose = useMemo(() => {
    if (isMaintenance) return selectedPatient?.currentDoseConcentration ?? '1:10 - 0,5ml'
    if (currentStepIndex < 0) return selectedPatient?.currentDoseConcentration ?? ''
    const nextIdx = Math.min(currentStepIndex + 1, allSteps.length - 1)
    return allSteps[nextIdx]
  }, [isMaintenance, currentStepIndex, allSteps, selectedPatient])

  const pauseDays = useMemo(() => {
    if (!activeInactivation) return 0
    try {
      const startStr = activeInactivation.startDate.split(' às ')[0]
      const start = parse(startStr, 'dd/MM/yyyy', new Date())
      return Math.max(0, differenceInDays(new Date(), start))
    } catch { return 0 }
  }, [activeInactivation])

  if (!selectedPatient) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-xs text-(--text-muted)">Carregando...</span>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col bg-gray-50/80 min-h-0 overflow-hidden">
      <div className="mx-4 my-4 flex flex-1 gap-4 min-h-0 min-w-0">
        {/* Left — Patient info */}
        <div className="flex w-[320px] shrink-0 flex-col rounded-xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden">
          {/* Header */}
          <div className="border-b border-(--border-custom) px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-brand to-teal-400 text-base font-bold text-white shrink-0">
                {getInitials(selectedPatient.name)}
              </div>
              <div className="min-w-0">
                <h1 className="text-base font-extrabold text-(--text) leading-tight">{selectedPatient.name}</h1>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  {selectedPatient.status === 'active' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[0.6rem] font-semibold border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Tratamento Ativo
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700 text-[0.6rem] font-semibold border border-yellow-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                      Tratamento Inativo
                    </span>
                  )}
                  {treatmentTime && (
                    <span className="inline-block px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[0.6rem] font-medium border border-gray-200">
                      {treatmentTime}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {selectedPatient.status === 'inactive' && activeInactivation && (
              <div className="mt-2.5 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
                <div className="flex items-center justify-between mb-0.5">
                  <div className="text-[0.6rem] font-semibold text-yellow-700 flex items-center gap-1">
                    <Info size={9} />
                    Motivo da inativação
                  </div>
                  <span className="text-[0.55rem] text-yellow-700/80">{activeInactivation.startDate}</span>
                </div>
                <div className="text-[0.6rem] font-bold text-yellow-800 mb-0.5">{INACTIVATION_CATEGORY_LABELS[activeInactivation.category]}</div>
                <div className="text-[0.6rem] text-yellow-700 leading-relaxed">{activeInactivation.detail}</div>
                {activeInactivation.expectedReturnDate && (
                  <div className="text-[0.55rem] text-yellow-700/80 mt-1">Retorno previsto: <span className="font-semibold">{activeInactivation.expectedReturnDate}</span></div>
                )}
                <div className="text-[0.55rem] text-yellow-700/80 mt-0.5">Responsável: <span className="font-semibold">{activeInactivation.responsibleDoctor}</span></div>
              </div>
            )}
            <div className="mt-3 flex gap-1.5">
              {selectedPatient.status === 'inactive' ? (
                canReactivate && (
                  <button
                    onClick={() => {
                      const snapshotInterval = activeInactivation?.snapshotInterval ?? selectedPatient.currentInterval
                      reactivateForm.reset({
                        concentracao: suggestedNextDose,
                        intervalo: String(snapshotInterval),
                        justificativa: '',
                        note: '',
                      })
                      setShowReactivateModal(true)
                    }}
                    className="flex-1 h-8 rounded-lg text-xs font-semibold transition-all bg-linear-to-br from-emerald-400 to-emerald-500 text-white cursor-pointer hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(52,211,153,0.3)]"
                  >
                    Reativar paciente
                  </button>
                )
              ) : (
                canEvolve && (
                  <Button
                    tone="brand"
                    variant="solid"
                    fullWidth
                    to="/patient-evolution"
                    search={{ patientId: selectedPatient.id }}
                  >
                    Evoluir Paciente
                  </Button>
                )
              )}
              {canEmitReport && (
                <Button
                  tone="brand"
                  variant="outline"
                  fullWidth
                  to="/patient-report"
                  search={{ patientId: selectedPatient.id }}
                >
                  Emitir Relatório
                </Button>
              )}
            </div>
          </div>

          {/* Collapsible sections */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {/* Dados Pessoais */}
            <div className="border border-(--border-custom) rounded-lg overflow-hidden">
              <button
                onClick={() => setShowPersonal(!showPersonal)}
                className="flex w-full items-center justify-between px-3.5 py-2.5 text-xs font-bold text-(--text) hover:bg-gray-50 transition-colors"
              >
                Dados Pessoais
                {showPersonal ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              <div className={cn("overflow-hidden transition-all duration-300", showPersonal ? "max-h-80 opacity-100" : "max-h-0 opacity-0")}>
                <div className="px-3.5 pb-3 space-y-2">
                  {[
                    ['Data de Nascimento', selectedPatient.birthDate],
                    ['Idade', `${selectedPatient.age} anos`],
                    ['CPF', selectedPatient.cpf],
                    ['Telefone', selectedPatient.phone],
                    ['Peso', selectedPatient.weight],
                    ['Médico Responsável', selectedPatient.responsibleDoctor],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between text-[0.7rem]">
                      <span className="text-(--text-muted)">{label}:</span>
                      <span className="font-medium text-(--text)">{value}</span>
                    </div>
                  ))}
                  {canEditPatient && (
                    <div className="pt-2 mt-1 border-t border-(--border-custom)">
                      <button
                        onClick={() => {
                          setEditForm({
                            name: selectedPatient.name,
                            phone: selectedPatient.phone,
                            weight: selectedPatient.weight,
                            responsibleDoctor: selectedPatient.responsibleDoctor,
                          })
                          setShowEditModal(true)
                        }}
                        className="w-full h-7 rounded-lg text-[0.65rem] font-semibold transition-all flex items-center justify-center gap-1.5 border-[1.5px] border-brand text-brand hover:bg-teal-50 cursor-pointer"
                      >
                        <Pencil size={11} />
                        Editar dados pessoais
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Dados da Imunoterapia */}
            <div className="border border-(--border-custom) rounded-lg overflow-hidden">
              <button
                onClick={() => setShowImmuno(!showImmuno)}
                className="flex w-full items-center justify-between px-3.5 py-2.5 text-xs font-bold text-(--text) hover:bg-gray-50 transition-colors"
              >
                <span className="flex items-center gap-2">
                  Dados da Imunoterapia
                  {selectedPatient.protocolAdjustments && selectedPatient.protocolAdjustments.length > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" title="Protocolo ajustado" />
                  )}
                </span>
                {showImmuno ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              <div className={cn("overflow-hidden transition-all duration-300", showImmuno ? "max-h-80 opacity-100" : "max-h-0 opacity-0")}>
                <div className="px-3.5 pb-3 space-y-2">
                  {selectedPatient.protocolAdjustments && selectedPatient.protocolAdjustments.length > 0 && (
                    <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-md px-2 py-1 text-[0.6rem] text-amber-700 font-semibold">
                      <AlertTriangle size={10} />
                      Protocolo ajustado · {selectedPatient.protocolAdjustments.length} {selectedPatient.protocolAdjustments.length === 1 ? 'alteração' : 'alterações'}
                    </div>
                  )}
                  {[
                    ['Tipo', selectedPatient.immunotherapyType],
                    ['Via de Administração', selectedPatient.administrationRoute],
                    ['Início Indução', inicioInducaoCalc || selectedPatient.inductionStart],
                    ['Início Manutenção', inicioManutencaoCalc || selectedPatient.maintenanceStart || '-'],
                    ['Meta Concentração e Volume', selectedPatient.targetConcentrationVolume],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between text-[0.7rem]">
                      <span className="text-(--text-muted)">{label}:</span>
                      <span className="font-medium text-(--text) text-right max-w-[55%] truncate">{value}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-[0.7rem]">
                    <span className="text-(--text-muted) shrink-0">Extrato:</span>
                    <span className="font-medium text-(--text) text-right max-w-[55%] wrap-break-word leading-relaxed">{selectedPatient.extract}</span>
                  </div>
                  {/* Action buttons */}
                  {(canAdjustProtocol || canInactivate || (selectedPatient.protocolAdjustments && selectedPatient.protocolAdjustments.length > 0) || (inactivationCount > 0)) && (
                  <div className="pt-2 mt-1 border-t border-(--border-custom) space-y-1.5">
                    {(canAdjustProtocol || (selectedPatient.protocolAdjustments && selectedPatient.protocolAdjustments.length > 0)) && (
                    <div className="flex gap-2">
                      {canAdjustProtocol && (
                        <button
                          onClick={() => {
                            adjustForm.reset({
                              type: '',
                              outroMotivo: '',
                              newConcentracao: selectedPatient.currentDoseConcentration,
                              newIntervalo: String(selectedPatient.currentInterval),
                              newTipo: selectedPatient.immunotherapyType,
                              newVia: selectedPatient.administrationRoute,
                              newExtrato: selectedPatient.extract,
                              justificativa: '',
                            })
                            setShowAdjustModal(true)
                          }}
                          disabled={selectedPatient.status === 'inactive'}
                          className={cn("flex-1 h-7 rounded-lg text-[0.65rem] font-semibold transition-all flex items-center justify-center gap-1.5 border-[1.5px]", selectedPatient.status === 'inactive' ? "border-gray-200 text-gray-300 cursor-not-allowed" : "border-brand text-brand hover:bg-teal-50 cursor-pointer")}
                        >
                          <SlidersHorizontal size={11} />
                          Ajustar protocolo
                        </button>
                      )}
                      {selectedPatient.protocolAdjustments && selectedPatient.protocolAdjustments.length > 0 && (
                        <button
                          onClick={() => setShowAdjustHistory(true)}
                          className={cn("h-7 px-2.5 rounded-lg text-[0.65rem] font-semibold transition-all flex items-center gap-1.5 border border-(--border-custom) text-(--text-muted) hover:border-brand hover:text-brand cursor-pointer", !canAdjustProtocol && "flex-1 justify-center")}
                        >
                          <History size={11} />
                          {canAdjustProtocol ? selectedPatient.protocolAdjustments.length : `Histórico de ajustes (${selectedPatient.protocolAdjustments.length})`}
                        </button>
                      )}
                    </div>
                    )}
                    {canInactivate && selectedPatient.status === 'active' && (
                      <Button
                        tone="warning"
                        variant="outline"
                        size="sm"
                        fullWidth
                        leftIcon={<PowerOff size={11} />}
                        onClick={() => {
                          inactivateForm.reset()
                          setShowInactivateModal(true)
                        }}
                      >
                        Inativar imunoterapia
                      </Button>
                    )}
                    {inactivationCount > 0 && (
                      <button
                        onClick={() => setShowInactivationHistory(true)}
                        className="w-full h-6.5 rounded-lg text-[0.6rem] font-semibold transition-all flex items-center justify-center gap-1.5 border border-(--border-custom) text-(--text-muted) hover:border-brand hover:text-brand cursor-pointer"
                      >
                        <History size={10} />
                        Histórico de inativações ({inactivationCount})
                      </button>
                    )}
                  </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right — Summary cards + Progress + Applications */}
        <div className="flex flex-1 flex-col gap-3 min-w-0">
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Clock, label: 'Intervalo Atual', value: `${currentInterval} dias`, sub: null as string | null },
              { icon: CalendarDays, label: 'Próxima Aplicação', value: nextDate, sub: null },
              { icon: Droplet, label: 'Última Concentração - Volume', value: currentDose, sub: null },
            ].map((card) => {
              const Icon = card.icon
              return (
                <div
                  key={card.label}
                  className="border border-(--border-custom) rounded-xl p-4 flex items-center gap-3.5 relative overflow-hidden bg-white"
                >
                  <div className="absolute top-0 left-0 right-0 h-1" style={{ background: 'linear-gradient(to right, #18C1CB, #18C1CB40)' }} />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, #18C1CB18, transparent 50%)' }} />
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0 relative z-10 bg-[#B6F2EC]/70">
                    <Icon size={18} className="text-brand" />
                  </div>
                  <div className="flex-1 relative z-10 min-w-0">
                    <div className="text-xs font-medium text-(--text-muted)">{card.label}</div>
                    <div className="text-sm font-extrabold text-(--text) truncate">{card.value}</div>
                    {card.sub && <div className="text-[0.65rem] font-semibold text-brand truncate mt-0.5">{card.sub}</div>}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Applications card */}
          <div className="flex-1 flex flex-col rounded-xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden min-h-0 min-w-0">
            {/* Header + Filters */}
            <div className="px-5 py-3 border-b border-(--border-custom) min-w-0">
              <div className="flex items-center justify-between mb-2.5">
                <h2 className="text-sm font-bold text-(--text)">Aplicações</h2>
                <button
                  onClick={() => setShowProgress(!showProgress)}
                  className="text-[0.6rem] font-semibold text-brand hover:underline cursor-pointer flex items-center gap-1"
                >
                  {showProgress ? 'Ocultar' : 'Ver'} progressão
                  <ChevronDown size={10} className={cn("transition-transform", showProgress && "rotate-180")} />
                </button>
              </div>

              {/* Collapsible progress */}
              <div className={cn("overflow-hidden transition-all duration-300", showProgress ? "max-h-80 opacity-100 mb-3" : "max-h-0 opacity-0")}>
                <div className="bg-gray-50 rounded-lg px-4 py-3">
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-[0.6rem] font-bold uppercase tracking-wider text-(--text-muted)">Progressão da indução</span>
                    <span className="text-[0.7rem] font-bold text-brand">{progressPct}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-3">
                    <div className="h-full bg-linear-to-r from-brand to-teal-400 rounded-full transition-all duration-1000 ease-out" style={{ width: `${progressPct}%` }} />
                  </div>
                  {/* 4 concentration blocks */}
                  <div className="flex gap-0">
                    {inductionSteps.map((group, gi) => {
                      const startIdx = inductionSteps.slice(0, gi).reduce((acc, s) => acc + s.vols.length, 0)
                      const safeIdx = currentStepIndex >= 0 ? currentStepIndex : 0
                      const blockActive = safeIdx >= startIdx && safeIdx < startIdx + group.vols.length
                      const blockFuture = safeIdx < startIdx
                      return (
                        <div key={group.conc} className="flex items-center flex-1 min-w-0">
                          <div className={cn("flex-1 rounded-md px-2 py-1.5 transition-all", blockFuture && "opacity-30")}>
                            <div className={cn("text-[0.5rem] font-bold mb-1 truncate", blockActive ? "text-brand" : "text-(--text-muted)")}>{group.conc}</div>
                            <div className="flex gap-0.5 flex-wrap">
                              {group.vols.map((vol, vi) => {
                                const stepIdx = startIdx + vi
                                const isCurrent = stepIdx === safeIdx
                                const isDone = stepIdx < safeIdx
                                const isLast = gi === inductionSteps.length - 1 && vi === group.vols.length - 1
                                return (
                                  <span
                                    key={vi}
                                    className={cn(
                                      "text-[0.45rem] px-1 py-px rounded font-semibold",
                                      stepIdx > safeIdx && "opacity-40",
                                    )}
                                    style={{
                                      backgroundColor: isCurrent ? '#18C1CB' : isDone ? '#E2E8F0' : '#F1F5F9',
                                      color: isCurrent ? 'white' : isDone ? '#64748B' : '#94A3B8',
                                      outlineColor: isCurrent ? '#18C1CB' : undefined,
                                      outlineWidth: isCurrent ? 1 : 0,
                                      outlineOffset: 1,
                                    }}
                                  >
                                    {vol}{isLast ? ' ★' : ''}
                                  </span>
                                )
                              })}
                            </div>
                          </div>
                          {gi < inductionSteps.length - 1 && <div className="w-px h-8 bg-gray-300 mx-1 shrink-0" />}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Manutenção progress — timeline */}
                <div className="bg-gray-50 rounded-lg px-4 py-3 mt-2">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[0.6rem] font-bold uppercase tracking-wider text-(--text-muted)">Progressão da manutenção</span>
                    <span className="text-[0.55rem] text-(--text-muted)">Meta · 28 dias (estável)</span>
                  </div>

                  {/* Timeline horizontal */}
                  <div className="flex items-start justify-between relative px-2">
                    {/* Connecting line */}
                    <div className="absolute top-2.25 left-6 right-6 h-px bg-gray-300" />
                    <div className="absolute top-2.25 left-6 h-px bg-[#A78BFA] transition-all duration-700" style={{ width: isMaintenance ? (currentInterval >= 28 ? 'calc(100% - 48px)' : currentInterval >= 21 ? 'calc(50%)' : 'calc(0%)') : '0%' }} />

                    {(() => {
                      const maintenanceApps = patientApps.filter((a) => a.status === 'completed' && a.cycle.days >= 14)
                      const intervals = [
                        { dias: 14, label: '14 dias' },
                        { dias: 21, label: '21 dias' },
                        { dias: 28, label: '28 dias ★' },
                      ]
                      return intervals.map((step) => {
                        const isActive = isMaintenance && currentInterval >= step.dias
                        const firstApp = maintenanceApps.find((a) => a.cycle.days === step.dias)
                        return (
                          <div key={step.dias} className="flex flex-col items-center z-10">
                            <div className={cn(
                              "w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center transition-all",
                              isActive
                                ? "bg-[#A78BFA] border-[#A78BFA]"
                                : "bg-white border-gray-300"
                            )}>
                              {isActive && <div className="w-2 h-2 rounded-full bg-white" />}
                            </div>
                            <div className="w-px h-3 bg-gray-300 mt-0.5" />
                            <div className={cn("text-center mt-1", !isActive && "opacity-40")}>
                              <div className={cn("text-[0.55rem] font-bold", isActive ? "text-[#7C3AED]" : "text-(--text-muted)")}>
                                {step.label}
                              </div>
                              <div className="text-[0.45rem] text-(--text-muted)">
                                {firstApp ? firstApp.date : '—'}
                              </div>
                            </div>
                          </div>
                        )
                      })
                    })()}
                  </div>
                </div>
              </div>
              {(viewMode === 'timeline' || viewMode === 'calendar') && (
                <div className="flex items-center gap-2 min-w-0">
                <div className="flex items-center gap-1 flex-1 min-w-0">
                  {monthsCanScrollLeft && (
                    <button
                      type="button"
                      aria-label="Rolar meses para a esquerda"
                      onClick={() => scrollMonths('left')}
                      className="shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-white border border-(--border-custom) text-(--text-muted) hover:border-brand hover:text-brand shadow-sm cursor-pointer transition-all"
                    >
                      <ChevronLeft size={12} />
                    </button>
                  )}
                  <div ref={monthsScrollRef} className="flex gap-1.5 overflow-x-auto pb-0.5 scroll-smooth flex-1 min-w-0" style={{ scrollbarWidth: 'none' }}>
                    <button
                      onClick={() => setMonthFilter('all')}
                      className={cn(
                        "shrink-0 px-3 py-1 rounded-full text-[0.65rem] font-semibold border transition-all",
                        monthFilter === 'all'
                          ? "bg-linear-to-br from-brand to-teal-400 text-white border-transparent"
                          : "bg-white text-(--text-muted) border-(--border-custom) hover:border-teal-300 hover:text-teal-600"
                      )}
                    >
                      Todas
                    </button>
                    {availableMonths.map((m) => (
                      <button
                        key={m.key}
                        onClick={() => {
                          setMonthFilter(m.key)
                          const [yr, monthName] = m.key.split('-')
                          const meses = ['JANEIRO','FEVEREIRO','MARÇO','ABRIL','MAIO','JUNHO','JULHO','AGOSTO','SETEMBRO','OUTUBRO','NOVEMBRO','DEZEMBRO']
                          const mi = meses.indexOf(monthName.toUpperCase())
                          if (mi >= 0) { setCalMonth(mi); setCalYear(Number(yr)) }
                        }}
                        className={cn(
                          "shrink-0 px-3 py-1 rounded-full text-[0.65rem] font-semibold border transition-all",
                          monthFilter === m.key
                            ? "bg-linear-to-br from-brand to-teal-400 text-white border-transparent"
                            : "bg-white text-(--text-muted) border-(--border-custom) hover:border-teal-300 hover:text-teal-600"
                        )}
                      >
                        {m.label.charAt(0) + m.label.slice(1).toLowerCase()}
                      </button>
                    ))}
                  </div>
                  {monthsCanScrollRight && (
                    <button
                      type="button"
                      aria-label="Rolar meses para a direita"
                      onClick={() => scrollMonths('right')}
                      className="shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-white border border-(--border-custom) text-(--text-muted) hover:border-brand hover:text-brand shadow-sm cursor-pointer transition-all"
                    >
                      <ChevronRight size={12} />
                    </button>
                  )}
                </div>
                <SegmentedControl
                  value={viewMode}
                  onChange={setViewMode}
                  size="xs"
                  options={[
                    { value: 'timeline', label: 'Lista', icon: <List size={10} /> },
                    { value: 'calendar', label: 'Calendário', icon: <CalendarDays size={10} /> },
                  ]}
                  aria-label="Modo de visualização das aplicações"
                />
                </div>
              )}
            </div>

            {viewMode === 'timeline' ? (
              /* Timeline */
              <div className="flex-1 overflow-y-auto px-5 py-4">
                {filteredApps.length === 0 ? (
                  <div className="text-center text-xs text-(--text-muted) py-10">Nenhuma aplicação encontrada neste período.</div>
                ) : (
                  <div className="relative pl-7">
                    {Object.entries(grouped).map(([monthYear, apps]) => {
                      return (
                        <div key={monthYear} className="mb-7 last:mb-0">
                          <div className="flex items-center gap-1.5 mb-2 -ml-7">
                            <span className="text-[0.65rem] font-extrabold uppercase tracking-[0.5px] text-(--text-muted)">{monthYear}</span>
                            <span className="text-[0.55rem] bg-gray-100 text-(--text-muted) border border-(--border-custom) px-1.5 py-px rounded-full">
                              {apps.length} aplicaç{apps.length === 1 ? 'ão' : 'ões'}
                            </span>
                          </div>

                          <div className="relative">
                          <div className="absolute -left-3.75 top-0 bottom-0 w-px bg-gray-200 rounded-full" />

                          {apps.map((app, idx) => {
                            const color = getIntervalColor(app.cycle.days)
                            const isRealized = app.status === 'completed'
                            const isNext = app.status === 'scheduled'
                            const hasReaction = app.sideEffect === 'yes'
                            const nodeColor = hasReaction ? '#EA580C' : isNext ? '#0d9488' : '#2dd4bf'
                            return (
                              <div
                                key={app.id}
                                className="relative mb-2.5 last:mb-0"
                                style={{ animationDelay: `${idx * 0.06}s` }}
                              >
                                <div className="absolute -left-6.25 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center z-10">
                                  <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: nodeColor }} />
                                  </div>
                                </div>

                                <div
                                  onClick={() => isRealized && setSelectedApp(app)}
                                  className={cn(
                                    "rounded-lg border p-3 ml-1 transition-all",
                                    hasReaction
                                      ? "border-orange-300 bg-orange-50/40 hover:border-orange-400"
                                      : isNext
                                      ? "border-teal-400 bg-teal-50/60"
                                      : "border-(--border-custom) bg-white hover:translate-x-0.5 hover:shadow-[0_2px_8px_rgba(20,184,166,0.1)]",
                                    isRealized && "cursor-pointer"
                                  )}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <div>
                                        <div className="text-xs font-bold text-(--text) flex items-center gap-1.5">
                                          {app.dose}
                                          {hasReaction && <span className="text-[0.55rem] font-bold text-orange-700 bg-orange-100 border border-orange-200 px-1.5 py-px rounded-full">REAÇÃO</span>}
                                        </div>
                                        <div className="text-[0.65rem] text-(--text-muted) mt-0.5">
                                          {app.date} · {app.startTime}–{app.endTime}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                      {isNext && <span className="text-[0.6rem] font-bold text-teal-700">PRÓXIMA</span>}
                                      <span
                                        className="inline-flex items-center gap-1.5 px-2 py-px rounded-full text-[0.65rem] font-semibold border"
                                        style={{ backgroundColor: color.bg, color: color.text, borderColor: color.dot + '30' }}
                                      >
                                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color.dot }} />
                                        {app.cycle.days} dias
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ) : (
              /* Calendar view */
              <div className="flex-1 overflow-y-auto px-5 py-4">
                {/* Month navigation */}
                <div className="flex items-center justify-between mb-4">
                  <button onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1) } else setCalMonth(calMonth - 1) }} className="h-7 w-7 flex items-center justify-center rounded-lg border border-(--border-custom) text-(--text-muted) hover:border-brand hover:text-brand transition-all cursor-pointer">
                    <ChevronLeft size={14} />
                  </button>
                  <span className="text-xs font-bold text-(--text)">{calMonthLabel}</span>
                  <button onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1) } else setCalMonth(calMonth + 1) }} className="h-7 w-7 flex items-center justify-center rounded-lg border border-(--border-custom) text-(--text-muted) hover:border-brand hover:text-brand transition-all cursor-pointer">
                    <ChevronRight size={14} />
                  </button>
                </div>

                {/* Weekday headers */}
                <div className="grid grid-cols-7 mb-1">
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d) => (
                    <div key={d} className="text-center text-[0.55rem] font-semibold text-(--text-muted) uppercase tracking-wider py-1">{d}</div>
                  ))}
                </div>

                {/* Days grid */}
                <div className="grid grid-cols-7 gap-px bg-(--border-custom) rounded-lg overflow-hidden border border-(--border-custom)">
                  {calDays.map((day, i) => {
                    if (day === null) return <div key={`empty-${i}`} className="bg-gray-50/50 h-18" />
                    const dateStr = `${String(day).padStart(2, '0')}/${String(calMonth + 1).padStart(2, '0')}/${calYear}`
                    const dayApps = appsByDate[dateStr] || []
                    const isToday = day === new Date().getDate() && calMonth === new Date().getMonth() && calYear === new Date().getFullYear()
                    return (
                      <div key={day} className={cn("bg-white h-18 p-1.5 relative", isToday && "bg-teal-50/40")}>
                        <div className={cn("text-[0.6rem] font-semibold mb-1", isToday ? "text-brand" : "text-(--text-muted)")}>
                          {day}
                        </div>
                        {dayApps.length > 0 && (
                          <div className="space-y-0.5">
                            {dayApps.slice(0, 2).map((app) => {
                              const isRealized = app.status === 'completed'
                              const isNext = app.status === 'scheduled'
                              const hasReaction = app.sideEffect === 'yes'
                              const intColor = getIntervalColor(app.cycle.days)
                              const style = hasReaction
                                ? { backgroundColor: '#FFEDD5', color: '#9A3412', borderColor: '#EA580C' }
                                : { backgroundColor: intColor.bg, color: intColor.text, borderColor: intColor.dot }
                              return (
                                <div
                                  key={app.id}
                                  onClick={() => isRealized && setSelectedApp(app)}
                                  className={cn(
                                    "rounded px-1 py-0.5 text-[0.45rem] font-semibold truncate flex items-center gap-0.5",
                                    isNext ? "cursor-default border-dashed border" :
                                    isRealized ? "cursor-pointer border" :
                                    "bg-gray-100 text-(--text-muted) border border-gray-200"
                                  )}
                                  style={style}
                                  title={hasReaction ? 'Reação adversa registrada' : undefined}
                                >
                                  <span className="truncate">{app.dose}</span>
                                </div>
                              )
                            })}
                            {dayApps.length > 2 && (
                              <div className="text-[0.45rem] text-(--text-muted) font-medium text-center">+{dayApps.length - 2}</div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Editar dados do paciente"
        size="lg"
        footer={<>
          <Button variant="outline" onClick={() => setShowEditModal(false)}>Cancelar</Button>
          <Button variant="primary" leftIcon={<Save size={13} />} onClick={() => setShowEditConfirm(true)}>Salvar alterações</Button>
        </>}
      >
        <div>
          <h4 className="text-xs font-bold text-(--text) mb-3 flex items-center gap-2">
            <div className="w-1 h-4 rounded-full bg-brand" />
            Dados Pessoais
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <FieldLabel label="Nome completo">
              <TextInput value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
            </FieldLabel>
            <FieldLabel label="Telefone">
              <TextInput value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
            </FieldLabel>
            <FieldLabel label="Peso">
              <TextInput value={editForm.weight} onChange={(e) => setEditForm({ ...editForm, weight: e.target.value })} />
            </FieldLabel>
            <FieldLabel label="Médico responsável">
              <TextInput value={editForm.responsibleDoctor} onChange={(e) => setEditForm({ ...editForm, responsibleDoctor: e.target.value })} />
            </FieldLabel>
            <FieldLabel label="CPF">
              <TextInput value={selectedPatient.cpf} disabled className="bg-gray-100/80 text-(--text-muted) cursor-not-allowed" />
            </FieldLabel>
            <FieldLabel label="Data de nascimento">
              <TextInput value={selectedPatient.birthDate} disabled className="bg-gray-100/80 text-(--text-muted) cursor-not-allowed" />
            </FieldLabel>
          </div>
        </div>
      </Modal>

      <Modal
        open={showAdjustModal}
        onClose={() => setShowAdjustModal(false)}
        title="Ajustar protocolo"
        footer={<>
          <Button variant="outline" onClick={() => setShowAdjustModal(false)}>Cancelar</Button>
          <Button
            variant="primary"
            leftIcon={<Save size={13} />}
            onClick={adjustForm.handleSubmit((v) => {
              const justificativaFinal = v.type === 'other' && v.outroMotivo.trim()
                ? `[${v.outroMotivo.trim()}] ${v.justificativa.trim()}`
                : v.justificativa.trim()
              const adjustment = {
                id: `adj-${Date.now()}`,
                date: format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }),
                type: v.type as ProtocolAdjustmentType,
                previousConcentration: selectedPatient.currentDoseConcentration,
                previousInterval: selectedPatient.currentInterval,
                newConcentration: v.newConcentracao,
                newInterval: Number(v.newIntervalo.trim()),
                justification: justificativaFinal,
                responsibleDoctor: selectedPatient.responsibleDoctor,
              }
              setSelectedPatient({
                ...selectedPatient,
                immunotherapyType: v.newTipo,
                administrationRoute: v.newVia,
                extract: v.newExtrato,
                currentDoseConcentration: v.newConcentracao,
                currentInterval: Number(v.newIntervalo.trim()),
                protocolAdjustments: [...(selectedPatient.protocolAdjustments || []), adjustment],
              })
              setShowAdjustModal(false)
              setShowAdjustToast(true)
              setTimeout(() => setShowAdjustToast(false), 6000)
            })}
          >Confirmar ajuste</Button>
        </>}
      >
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
          <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[0.65rem] text-amber-800 leading-relaxed">
            Alterações no protocolo são <span className="font-bold">irreversíveis</span>. A progressão continuará a partir dos novos valores e o desvio será destacado no prontuário e nos relatórios clínicos.
          </p>
        </div>

        <FieldLabel label="Tipo de ajuste" required error={adjustErrors.type?.message}>
          <Select
            value={adjustValues.type}
            onChange={(e) => adjustForm.setValue('type', e.target.value as ProtocolAdjustmentType)}
            invalid={!!adjustErrors.type}
          >
            <option value="" disabled>Selecione o motivo do ajuste</option>
            <option value="reducao_dose">Redução de dose</option>
            <option value="aumento_intervalo">Aumento de intervalo</option>
            <option value="alteracao_concentracao">Alteração de concentração</option>
            <option value="suspensao">Suspensão temporária</option>
            <option value="outro">Outro</option>
          </Select>
        </FieldLabel>
        {adjustValues.type === 'other' && (
          <div>
            <TextInput
              placeholder="Especifique o motivo do ajuste"
              value={adjustValues.outroMotivo}
              onChange={(e) => adjustForm.setValue('outroMotivo', e.target.value)}
              invalid={!!adjustErrors.outroMotivo}
            />
            {adjustErrors.outroMotivo?.message && <span className="text-[0.6rem] text-red-500 mt-0.5 block">{adjustErrors.outroMotivo?.message}</span>}
          </div>
        )}

        <div className="bg-gray-50 border border-(--border-custom) rounded-lg p-3 space-y-2.5">
          <div className="text-[0.6rem] font-bold text-(--text-muted) uppercase tracking-wider">Dados da imunoterapia</div>
          <div className="grid grid-cols-2 gap-2">
            <FieldLabel label="Tipo">
              <Select value={adjustValues.newTipo} onChange={(e) => adjustForm.setValue('newTipo', e.target.value)}>
                <option value="Ácaros">Ácaros</option>
                <option value="Gramíneas">Gramíneas</option>
                <option value="Cão e Gato">Cão e Gato</option>
                <option value="Cândida">Cândida</option>
                <option value="Herpes">Herpes</option>
                <option value="Fungos">Fungos</option>
                <option value="Insetos">Insetos</option>
              </Select>
            </FieldLabel>
            <FieldLabel label="Via">
              <Select value={adjustValues.newVia} onChange={(e) => adjustForm.setValue('newVia', e.target.value)}>
                <option value="Subcutânea">Subcutânea</option>
                <option value="Sublingual">Sublingual</option>
              </Select>
            </FieldLabel>
          </div>
          <FieldLabel label="Extrato">
            <TextInput
              placeholder="Ex: Der p 60 + Der f 10%"
              value={adjustValues.newExtrato}
              onChange={(e) => adjustForm.setValue('newExtrato', e.target.value)}
            />
          </FieldLabel>
        </div>

        <div className="bg-gray-50 border border-(--border-custom) rounded-lg p-3 space-y-2.5">
          <div className="text-[0.6rem] font-bold text-(--text-muted) uppercase tracking-wider">Parâmetros do protocolo</div>

          <FieldLabel label="Concentração e volume" error={adjustErrors.newConcentracao?.message}>
            <div className="flex items-center gap-2">
              <span className="text-[0.65rem] text-(--text-muted) line-through shrink-0">{selectedPatient.currentDoseConcentration}</span>
              <span className="text-(--text-muted) text-xs">→</span>
              <TextInput
                placeholder="Ex: 1:1.000 — 0,2ml"
                value={adjustValues.newConcentracao}
                onChange={(e) => adjustForm.setValue('newConcentracao', e.target.value)}
                invalid={!!adjustErrors.newConcentracao}
                className="flex-1"
              />
            </div>
          </FieldLabel>

          <FieldLabel label="Intervalo entre doses" error={adjustErrors.newIntervalo?.message}>
            <div className="flex items-center gap-2">
              <span className="text-[0.65rem] text-(--text-muted) line-through shrink-0">{selectedPatient.currentInterval} dias</span>
              <span className="text-(--text-muted) text-xs">→</span>
              <div className="flex-1">
                {(() => {
                  const isCustom = adjustValues.newIntervalo && !['7', '14', '21', '28'].includes(adjustValues.newIntervalo)
                  const selectValue = isCustom ? 'outro' : adjustValues.newIntervalo
                  return (
                    <Select
                      value={selectValue}
                      onChange={(e) => {
                        const v = e.target.value
                        adjustForm.setValue('newIntervalo', v === 'outro' ? ' ' : v)
                      }}
                      invalid={!!adjustErrors.newIntervalo}
                    >
                      <option value="" disabled>Selecione</option>
                      <option value="7">7 dias</option>
                      <option value="14">14 dias</option>
                      <option value="21">21 dias</option>
                      <option value="28">28 dias</option>
                      <option value="outro">Outro</option>
                    </Select>
                  )
                })()}
              </div>
            </div>
            {(adjustValues.newIntervalo === ' ' || (adjustValues.newIntervalo && !['7','14','21','28'].includes(adjustValues.newIntervalo))) && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[0.6rem] text-(--text-muted) shrink-0">Especifique:</span>
                <TextInput
                  type="number"
                  min="1"
                  placeholder="Ex: 35"
                  value={adjustValues.newIntervalo.trim()}
                  onChange={(e) => adjustForm.setValue('newIntervalo', e.target.value.replace(/[^0-9]/g, ''))}
                  className="flex-1"
                />
                <span className="text-[0.6rem] text-(--text-muted) shrink-0">dias</span>
              </div>
            )}
          </FieldLabel>
        </div>

        <FieldLabel label="Justificativa clínica" required error={adjustErrors.justificativa?.message}>
          <TextArea
            rows={3}
            placeholder="Descreva o motivo clínico do ajuste (obrigatório conforme protocolo)"
            value={adjustValues.justificativa}
            onChange={(e) => adjustForm.setValue('justificativa', e.target.value)}
            invalid={!!adjustErrors.justificativa}
          />
        </FieldLabel>
      </Modal>

      <Modal
        open={showAdjustHistory && !!selectedPatient.protocolAdjustments && selectedPatient.protocolAdjustments.length > 0}
        onClose={() => setShowAdjustHistory(false)}
        title="Histórico de ajustes"
      >
        {selectedPatient.protocolAdjustments && [...selectedPatient.protocolAdjustments].reverse().map((adj) => {
          const typeLabels: Record<ProtocolAdjustmentType, string> = {
            dose_reduction: 'Redução de dose',
            interval_increase: 'Aumento de intervalo',
            concentration_change: 'Alteração de concentração',
            suspension: 'Suspensão temporária',
            other: 'Outro',
          }
          return (
            <div key={adj.id} className="border border-(--border-custom) rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[0.6rem] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">{typeLabels[adj.type]}</span>
                <span className="text-[0.55rem] text-(--text-muted)">{adj.date}</span>
              </div>
              <div className="space-y-1 mb-2">
                <div className="flex items-center justify-between text-[0.65rem]">
                  <span className="text-(--text-muted)">Concentração:</span>
                  <span className="font-medium"><span className="text-(--text-muted) line-through">{adj.previousConcentration}</span> → <span className="text-brand font-bold">{adj.newConcentration}</span></span>
                </div>
                <div className="flex items-center justify-between text-[0.65rem]">
                  <span className="text-(--text-muted)">Intervalo:</span>
                  <span className="font-medium"><span className="text-(--text-muted) line-through">{adj.previousInterval}d</span> → <span className="text-brand font-bold">{adj.newInterval}d</span></span>
                </div>
              </div>
              <div className="bg-gray-50 rounded px-2.5 py-1.5 border-l-2 border-amber-400">
                <div className="text-[0.55rem] font-semibold text-(--text-muted) uppercase tracking-wider mb-0.5">Justificativa</div>
                <div className="text-[0.65rem] text-(--text) leading-relaxed">{adj.justification}</div>
              </div>
              <div className="text-[0.55rem] text-(--text-muted) mt-1.5">Responsável: <span className="font-semibold text-(--text)">{adj.responsibleDoctor}</span></div>
            </div>
          )
        })}
      </Modal>

      {/* Adjust success toast */}
      {showAdjustToast && (
        <div className="fixed top-6 right-6 z-50" style={{ animation: 'slide-up-fade 0.3s ease-out' }}>
          <div className="flex items-start gap-3 bg-white border border-emerald-200 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] p-4 w-95">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 shrink-0 mt-0.5">
              <Save size={16} className="text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-(--text)">Protocolo ajustado com sucesso!</p>
              <p className="text-xs text-(--text-muted) mt-1">A alteração foi registrada no histórico clínico e marcará as próximas aplicações como desvio de protocolo.</p>
            </div>
            <button onClick={() => setShowAdjustToast(false)} className="h-6 w-6 flex items-center justify-center rounded-md text-(--text-muted) hover:bg-gray-100 transition-all shrink-0">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      <Modal
        open={showInactivateModal}
        onClose={() => setShowInactivateModal(false)}
        title="Inativar imunoterapia"
        footer={<>
          <Button variant="outline" onClick={() => setShowInactivateModal(false)}>Voltar</Button>
          <Button
            variant="warning"
            onClick={inactivateForm.handleSubmit((v) => {
              const expectedReturn = v.expectedReturnDate
                ? format(new Date(v.expectedReturnDate + 'T00:00:00'), 'dd/MM/yyyy')
                : null
              const detailFinal = v.category === 'other' && v.outroMotivo.trim()
                ? `[${v.outroMotivo.trim()}] ${v.detail.trim()}`
                : v.detail.trim()
              inactivateImmunotherapy({
                id: `inact-${Date.now()}`,
                category: v.category as InactivationCategory,
                detail: detailFinal,
                startDate: format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }),
                expectedReturnDate: expectedReturn,
                responsibleDoctor: selectedPatient.responsibleDoctor,
                snapshotConcentration: selectedPatient.currentDoseConcentration,
                snapshotInterval: selectedPatient.currentInterval,
              })
              setShowInactivateModal(false)
              setShowInactivateToast(true)
              setTimeout(() => setShowInactivateToast(false), 6000)
            })}
          >Inativar imunoterapia</Button>
        </>}
      >
        <div className="flex items-start gap-2 bg-teal-50 border border-teal-200 rounded-lg px-3 py-2.5">
          <Info size={14} className="text-brand shrink-0 mt-0.5" />
          <p className="text-[0.65rem] text-teal-800 leading-relaxed">
            A inativação <span className="font-bold">pausa as aplicações</span> e registra o motivo no histórico clínico. O paciente poderá ser reativado a qualquer momento, com o médico definindo o ponto de retomada do protocolo.
          </p>
        </div>

        <FieldLabel label="Motivo da inativação" required error={inactivateErrors.category?.message}>
          <Select
            value={inactivateValues.category}
            onChange={(e) => inactivateForm.setValue('category', e.target.value as InactivationCategory)}
            invalid={!!inactivateErrors.category}
          >
            <option value="" disabled>Selecione a categoria</option>
            {(Object.keys(INACTIVATION_CATEGORY_LABELS) as InactivationCategory[]).map((k) => (
              <option key={k} value={k}>{INACTIVATION_CATEGORY_LABELS[k]}</option>
            ))}
          </Select>
        </FieldLabel>
        {inactivateValues.category === 'other' && (
          <div>
            <TextInput
              placeholder="Especifique o motivo da inativação"
              value={inactivateValues.outroMotivo}
              onChange={(e) => inactivateForm.setValue('outroMotivo', e.target.value)}
              invalid={!!inactivateErrors.outroMotivo}
            />
            {inactivateErrors.outroMotivo?.message && <span className="text-[0.6rem] text-red-500 mt-0.5 block">{inactivateErrors.outroMotivo?.message}</span>}
          </div>
        )}

        <FieldLabel
          label="Detalhamento clínico"
          required
          error={inactivateErrors.detail?.message}
          helperText={`Mínimo 10 caracteres · ${inactivateValues.detail.trim().length} digitados`}
        >
          <TextArea
            rows={3}
            placeholder="Descreva o contexto clínico da inativação (obrigatório para rastreabilidade)"
            value={inactivateValues.detail}
            onChange={(e) => inactivateForm.setValue('detail', e.target.value)}
            invalid={!!inactivateErrors.detail}
          />
        </FieldLabel>

        <FieldLabel
          label="Previsão de retorno"
          hint="(opcional)"
          helperText="Use para lembrar a equipe de avaliar a reativação. Deixe em branco se não houver previsão."
        >
          <TextInput
            type="date"
            value={inactivateValues.expectedReturnDate}
            onChange={(e) => inactivateForm.setValue('expectedReturnDate', e.target.value)}
          />
        </FieldLabel>

        <div className="bg-gray-50 border border-(--border-custom) rounded-lg px-3 py-2 flex items-center justify-between">
          <span className="text-[0.65rem] text-(--text-muted)">Responsável pela inativação</span>
          <span className="text-[0.7rem] font-semibold text-(--text)">{selectedPatient.responsibleDoctor}</span>
        </div>
      </Modal>

      <Modal
        open={showReactivateModal && !!activeInactivation}
        onClose={() => setShowReactivateModal(false)}
        title="Reativar paciente"
        size="lg"
        footer={activeInactivation ? <>
          <Button variant="outline" onClick={() => setShowReactivateModal(false)}>Voltar</Button>
          <Button
            variant="primary"
            onClick={() => {
              if (!activeInactivation) return
              const schema = createReactivateSchema({
                suggestedConcentracao: suggestedNextDose,
                snapshotIntervalo: activeInactivation.snapshotInterval,
              })
              const parsed = schema.safeParse(reactivateForm.getValues())
              if (!parsed.success) {
                reactivateForm.clearErrors()
                for (const issue of parsed.error.issues) {
                  const path = issue.path[0] as keyof ReactivateForm
                  reactivateForm.setError(path, { message: issue.message })
                }
                return
              }
              const v = parsed.data
              reactivateImmunotherapy({
                note: v.note.trim(),
                reactivatedBy: selectedPatient.responsibleDoctor,
                reactivateConcentration: v.concentracao.trim(),
                reactivateInterval: Number(v.intervalo.trim()),
                justification: v.justificativa.trim(),
              })
              setShowReactivateModal(false)
              setShowReactivateToast(true)
              setTimeout(() => setShowReactivateToast(false), 6000)
            }}
          >Reativar paciente</Button>
        </> : null}
      >
        {activeInactivation && <>
          <div className="flex items-start gap-2 bg-teal-50 border border-teal-200 rounded-lg px-3 py-2.5">
            <Info size={14} className="text-brand shrink-0 mt-0.5" />
            <p className="text-[0.65rem] text-teal-800 leading-relaxed">
              A sugestão abaixo respeita a progressão do protocolo. O médico pode <span className="font-bold">ajustar o ponto de retomada</span> conforme o tempo de pausa e a avaliação clínica.
            </p>
          </div>

          {/* Inativação atual */}
          <div className="bg-yellow-50/50 border border-yellow-200 rounded-lg p-3 space-y-1.5">
            <div className="flex items-center gap-1.5 text-[0.55rem] font-bold text-yellow-700 uppercase tracking-wider mb-2">
              <PowerOff size={10} />
              Inativação atual
            </div>
            <div className="flex items-center justify-between text-[0.65rem]">
              <span className="text-(--text-muted)">Motivo</span>
              <span className="font-semibold text-(--text)">{INACTIVATION_CATEGORY_LABELS[activeInactivation.category]}</span>
            </div>
            <div className="flex items-center justify-between text-[0.65rem]">
              <span className="text-(--text-muted)">Início</span>
              <span className="font-medium text-(--text)">{activeInactivation.startDate}</span>
            </div>
            <div className="flex items-center justify-between text-[0.65rem]">
              <span className="text-(--text-muted)">Tempo pausado</span>
              <span className={cn("font-semibold", pauseDays > 30 ? "text-red-600" : pauseDays > 14 ? "text-amber-600" : "text-(--text)")}>
                {pauseDays} {pauseDays === 1 ? 'dia' : 'dias'}
              </span>
            </div>
            {activeInactivation.expectedReturnDate && (
              <div className="flex items-center justify-between text-[0.65rem]">
                <span className="text-(--text-muted)">Retorno previsto</span>
                <span className="font-medium text-(--text)">{activeInactivation.expectedReturnDate}</span>
              </div>
            )}
          </div>

          {/* Progresso antes da inativação */}
          <div className="bg-gray-50 border border-(--border-custom) rounded-lg p-3 space-y-1.5">
            <div className="text-[0.55rem] font-bold text-(--text-muted) uppercase tracking-wider mb-2">Progresso até a inativação</div>
            {lastRealized && (
              <div className="flex items-center justify-between text-[0.65rem]">
                <span className="text-(--text-muted)">Última aplicação</span>
                <span className="font-medium text-(--text)">{lastRealized.date} · {lastRealized.dose}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-[0.65rem]">
              <span className="text-(--text-muted)">Concentração/volume atual</span>
              <span className="font-medium text-(--text)">{activeInactivation.snapshotConcentration}</span>
            </div>
            <div className="flex items-center justify-between text-[0.65rem]">
              <span className="text-(--text-muted)">Intervalo</span>
              <span className="font-medium text-(--text)">{activeInactivation.snapshotInterval} dias</span>
            </div>
            <div className="flex items-center justify-between text-[0.65rem]">
              <span className="text-(--text-muted)">Etapa</span>
              <span className="font-medium text-(--text)">{isMaintenance ? 'Manutenção' : `Indução · ${progressPct}%`}</span>
            </div>
          </div>

          {/* Ponto de retomada */}
          <div className="bg-teal-50/40 border border-teal-200 rounded-lg p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="text-[0.55rem] font-bold text-brand uppercase tracking-wider">Ponto de retomada</div>
              <button
                type="button"
                onClick={() => {
                  reactivateForm.setValue('concentracao', suggestedNextDose)
                  reactivateForm.setValue('intervalo', String(activeInactivation.snapshotInterval))
                }}
                className="text-[0.55rem] font-semibold text-brand hover:underline cursor-pointer"
              >
                Usar sugestão do protocolo
              </button>
            </div>

            <FieldLabel label="Próxima concentração e volume" required error={reactivateErrors.concentracao?.message}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[0.6rem] text-(--text-muted) shrink-0">Sugestão:</span>
                <span className="text-[0.65rem] font-semibold text-brand shrink-0">{suggestedNextDose}</span>
              </div>
              <TextInput
                placeholder="Ex: 1:1.000 — 0,4ml"
                value={reactivateValues.concentracao}
                onChange={(e) => reactivateForm.setValue('concentracao', e.target.value)}
                invalid={!!reactivateErrors.concentracao}
              />
            </FieldLabel>

            <FieldLabel label="Intervalo entre doses" required error={reactivateErrors.intervalo?.message}>
              {(() => {
                const isCustom = reactivateValues.intervalo && !['7', '14', '21', '28'].includes(reactivateValues.intervalo)
                const selectValue = isCustom ? 'outro' : reactivateValues.intervalo
                return (
                  <Select
                    value={selectValue}
                    onChange={(e) => {
                      const v = e.target.value
                      reactivateForm.setValue('intervalo', v === 'outro' ? ' ' : v)
                    }}
                    invalid={!!reactivateErrors.intervalo}
                  >
                    <option value="" disabled>Selecione</option>
                    <option value="7">7 dias</option>
                    <option value="14">14 dias</option>
                    <option value="21">21 dias</option>
                    <option value="28">28 dias</option>
                    <option value="outro">Outro</option>
                  </Select>
                )
              })()}
              {(reactivateValues.intervalo === ' ' || (reactivateValues.intervalo && !['7','14','21','28'].includes(reactivateValues.intervalo))) && (
                <div className="flex items-center gap-2 mt-2">
                  <TextInput
                    type="number"
                    min="1"
                    placeholder="Ex: 35"
                    value={reactivateValues.intervalo.trim()}
                    onChange={(e) => reactivateForm.setValue('intervalo', e.target.value.replace(/[^0-9]/g, ''))}
                    className="flex-1"
                  />
                  <span className="text-[0.6rem] text-(--text-muted) shrink-0">dias</span>
                </div>
              )}
            </FieldLabel>
          </div>

          {(() => {
            const diverges = reactivateValues.concentracao.trim() !== suggestedNextDose.trim() || reactivateValues.intervalo.trim() !== String(activeInactivation.snapshotInterval)
            return (
              <FieldLabel
                label="Justificativa do ponto de retomada"
                required={diverges}
                hint={!diverges ? '(opcional)' : undefined}
                error={reactivateErrors.justificativa?.message}
              >
                <TextArea
                  rows={2}
                  placeholder={diverges ? "Justifique por que o ponto de retomada difere da sugestão do protocolo." : "Ex: paciente apto, seguir protocolo."}
                  value={reactivateValues.justificativa}
                  onChange={(e) => reactivateForm.setValue('justificativa', e.target.value)}
                  invalid={!!reactivateErrors.justificativa}
                />
              </FieldLabel>
            )
          })()}

          <FieldLabel label="Observação clínica" hint="(opcional)">
            <TextArea
              rows={2}
              placeholder="Ex: sem sintomas residuais, pré-medicação não necessária."
              value={reactivateValues.note}
              onChange={(e) => reactivateForm.setValue('note', e.target.value)}
            />
          </FieldLabel>

          <div className="bg-gray-50 border border-(--border-custom) rounded-lg px-3 py-2 flex items-center justify-between">
            <span className="text-[0.65rem] text-(--text-muted)">Responsável pela retomada</span>
            <span className="text-[0.7rem] font-semibold text-(--text)">{selectedPatient.responsibleDoctor}</span>
          </div>
        </>}
      </Modal>

      <Modal
        open={showInactivationHistory && !!selectedPatient.inactivations && selectedPatient.inactivations.length > 0}
        onClose={() => setShowInactivationHistory(false)}
        title="Histórico de inativações"
      >
        {selectedPatient.inactivations && [...selectedPatient.inactivations].reverse().map((s) => {
                const isActive = !s.reactivatedAt
                return (
                  <div key={s.id} className={cn("border rounded-lg p-3", isActive ? "border-teal-200 bg-teal-50/40" : "border-(--border-custom)")}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={cn("text-[0.6rem] font-bold px-2 py-0.5 rounded-full border", isActive ? "text-brand bg-teal-50 border-teal-200" : "text-emerald-700 bg-emerald-50 border-emerald-200")}>
                        {isActive ? 'Inativada' : 'Reativada'}
                      </span>
                      <span className="text-[0.55rem] text-(--text-muted)">{s.startDate}</span>
                    </div>
                    <div className="text-[0.65rem] font-bold text-(--text) mb-1">{INACTIVATION_CATEGORY_LABELS[s.category]}</div>
                    <div className="bg-gray-50 rounded px-2.5 py-1.5 border-l-2 border-teal-400 mb-2">
                      <div className="text-[0.55rem] font-semibold text-(--text-muted) uppercase tracking-wider mb-0.5">Motivo</div>
                      <div className="text-[0.65rem] text-(--text) leading-relaxed">{s.detail}</div>
                    </div>
                    {s.expectedReturnDate && (
                      <div className="text-[0.6rem] text-(--text-muted) mb-1">Retorno previsto: <span className="font-semibold text-(--text)">{s.expectedReturnDate}</span></div>
                    )}
                    <div className="text-[0.55rem] text-(--text-muted)">Responsável: <span className="font-semibold text-(--text)">{s.responsibleDoctor}</span></div>
                    {s.reactivatedAt && (
                      <div className="mt-2 pt-2 border-t border-(--border-custom) space-y-1.5">
                        <div className="text-[0.6rem] text-emerald-700 font-semibold">
                          Reativado em {s.reactivatedAt}
                        </div>
                        {s.reactivateConcentration && s.reactivateInterval !== undefined && (
                          <div className="grid grid-cols-2 gap-1.5">
                            <div className="bg-gray-50 rounded px-2 py-1">
                              <div className="text-[0.5rem] text-(--text-muted) font-semibold uppercase tracking-wider">Ponto de retorno</div>
                              <div className="text-[0.6rem] font-medium text-(--text)">{s.reactivateConcentration}</div>
                            </div>
                            <div className="bg-gray-50 rounded px-2 py-1">
                              <div className="text-[0.5rem] text-(--text-muted) font-semibold uppercase tracking-wider">Intervalo</div>
                              <div className="text-[0.6rem] font-medium text-(--text)">{s.reactivateInterval} dias</div>
                            </div>
                          </div>
                        )}
                        {s.reactivateJustification && (
                          <div className="bg-emerald-50/50 border-l-2 border-emerald-300 rounded px-2.5 py-1.5">
                            <div className="text-[0.5rem] font-semibold text-emerald-700 uppercase tracking-wider mb-0.5">Justificativa</div>
                            <div className="text-[0.6rem] text-(--text) leading-relaxed">{s.reactivateJustification}</div>
                          </div>
                        )}
                        {s.reactivateNote && (
                          <div className="bg-gray-50 border-l-2 border-gray-300 rounded px-2.5 py-1.5">
                            <div className="text-[0.5rem] font-semibold text-(--text-muted) uppercase tracking-wider mb-0.5">Observação</div>
                            <div className="text-[0.6rem] text-(--text) leading-relaxed">{s.reactivateNote}</div>
                          </div>
                        )}
                        {s.reactivatedBy && <div className="text-[0.55rem] text-(--text-muted)">Por: <span className="font-semibold text-(--text)">{s.reactivatedBy}</span></div>}
                      </div>
                    )}
                  </div>
                )
              })}
      </Modal>

      <Toast
        open={showInactivateToast}
        onClose={() => setShowInactivateToast(false)}
        variant="warning"
        icon={<PowerOff size={16} />}
        title="Imunoterapia inativada"
        description='As aplicações foram pausadas. Use "Reativar paciente" quando ele estiver apto a continuar o protocolo.'
      />
      <Toast
        open={showReactivateToast}
        onClose={() => setShowReactivateToast(false)}
        variant="success"
        icon={<Power size={16} />}
        title="Paciente reativado"
        description="O paciente está ativo novamente e pode continuar o protocolo a partir do ponto definido."
      />

      <Modal
        open={showEditConfirm}
        onClose={() => setShowEditConfirm(false)}
        title="Confirmar alterações?"
        size="sm"
        footer={<>
          <Button variant="outline" onClick={() => setShowEditConfirm(false)} fullWidth>Voltar</Button>
          <Button
            variant="primary"
            fullWidth
            onClick={() => {
              setSelectedPatient({
                ...selectedPatient,
                name: editForm.name,
                phone: editForm.phone,
                weight: editForm.weight,
                responsibleDoctor: editForm.responsibleDoctor,
              })
              setShowEditConfirm(false)
              setShowEditModal(false)
            }}
          >Confirmar e salvar</Button>
        </>}
      >
        <p className="text-xs text-(--text-muted) leading-relaxed">
          Os dados do paciente serão atualizados. Esta ação será registrada no histórico de alterações do prontuário.
        </p>

        <div className="bg-gray-50 border border-(--border-custom) rounded-lg px-3.5 py-2.5 space-y-1.5">
          {[
            { label: 'Nome', prev: selectedPatient.name, next: editForm.name },
            { label: 'Telefone', prev: selectedPatient.phone, next: editForm.phone },
            { label: 'Peso', prev: selectedPatient.weight, next: editForm.weight },
            { label: 'Médico', prev: selectedPatient.responsibleDoctor, next: editForm.responsibleDoctor },
          ].filter((f) => f.prev !== f.next).map((f) => (
            <div key={f.label} className="flex items-center justify-between gap-2">
              <span className="text-[0.6rem] text-(--text-muted) shrink-0">{f.label}</span>
              <div className="flex items-center gap-1.5 text-[0.6rem] min-w-0">
                <span className="text-(--text-muted) line-through truncate max-w-24">{f.prev}</span>
                <span className="text-(--text-muted)">→</span>
                <span className="font-semibold text-brand truncate max-w-24">{f.next}</span>
              </div>
            </div>
          ))}
          {[
            { prev: selectedPatient.name, next: editForm.name },
            { prev: selectedPatient.phone, next: editForm.phone },
            { prev: selectedPatient.weight, next: editForm.weight },
            { prev: selectedPatient.responsibleDoctor, next: editForm.responsibleDoctor },
          ].every((f) => f.prev === f.next) && (
            <span className="text-[0.6rem] text-(--text-muted)">Nenhuma alteração detectada.</span>
          )}
        </div>
      </Modal>

      <Modal
        open={!!selectedApp}
        onClose={() => { setSelectedApp(null); setModalTab('pre') }}
        title="Dados da aplicação"
        size="lg"
      >
        {selectedApp && <>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setModalTab('pre')}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200",
                modalTab === 'pre' ? "bg-linear-to-br from-brand to-teal-400 text-white shadow-sm" : "bg-teal-50 text-teal-600 hover:bg-teal-100"
              )}
            >
              Pré-Aplicação
            </button>
            <button
              onClick={() => setModalTab('pos')}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200",
                modalTab === 'pos' ? "bg-linear-to-br from-brand to-teal-400 text-white shadow-sm" : "bg-teal-50 text-teal-600 hover:bg-teal-100"
              )}
            >
              Pós-Aplicação
            </button>
          </div>

          {/* Content */}
              {modalTab === 'pre' ? (
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <div className="col-span-2">
                    <div className="text-[0.65rem] font-semibold text-(--text-muted) mb-1">Como o paciente passou durante o intervalo da última aplicação?</div>
                    <div className="text-xs text-(--text) leading-relaxed">{selectedApp.administratorNote || 'Sem intercorrências relatadas durante o intervalo.'}</div>
                  </div>
                  <div>
                    <div className="text-[0.65rem] font-semibold text-(--text-muted) mb-0.5">Presença de efeito colateral</div>
                    <div className="text-xs text-(--text)">{selectedApp.sideEffect || 'Não'}</div>
                  </div>
                  <div>
                    <div className="text-[0.65rem] font-semibold text-(--text-muted) mb-0.5">Necessidade de medicação</div>
                    <div className="text-xs text-(--text)">{selectedApp.medicationNeeded || 'Não'}</div>
                  </div>
                  {selectedApp.sideEffect === 'yes' && (
                    <div className="col-span-2">
                      <div className="text-[0.65rem] font-semibold text-(--text-muted) mb-0.5">Efeitos colaterais relatados</div>
                      <div className="text-xs text-(--text) leading-relaxed">{selectedApp.reportedEffects || '—'}</div>
                    </div>
                  )}
                  {selectedApp.medicationNeeded === 'yes' && (
                    <div className="col-span-2">
                      <div className="text-[0.65rem] font-semibold text-(--text-muted) mb-0.5">Medicações administradas</div>
                      <div className="text-xs text-(--text) leading-relaxed">{selectedApp.medications || '—'}</div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <div>
                    <div className="text-[0.65rem] font-semibold text-(--text-muted) mb-0.5">Horário</div>
                    <div className="text-xs text-(--text)">{selectedApp.startTime} – {selectedApp.endTime}</div>
                  </div>
                  <div>
                    <div className="text-[0.65rem] font-semibold text-(--text-muted) mb-0.5">Data</div>
                    <div className="text-xs text-(--text)">{selectedApp.date}</div>
                  </div>
                  <div>
                    <div className="text-[0.65rem] font-semibold text-(--text-muted) mb-0.5">Volume aplicado</div>
                    <div className="text-xs text-(--text)">{selectedApp.appliedVolume || '-'}</div>
                  </div>
                  <div>
                    <div className="text-[0.65rem] font-semibold text-(--text-muted) mb-0.5">Concentração aplicada</div>
                    <div className="text-xs text-(--text)">{selectedApp.extractConcentration || '-'}</div>
                  </div>
                  <div>
                    <div className="text-[0.65rem] font-semibold text-(--text-muted) mb-0.5">Intervalo associado da dose</div>
                    <div className="text-xs text-(--text)">{selectedApp.cycle.days} dias</div>
                  </div>
                  <div>
                    <div className="text-[0.65rem] font-semibold text-(--text-muted) mb-0.5">Responsável</div>
                    <div className="text-xs text-(--text)">{selectedApp.administrator || '-'}</div>
                  </div>
                  <div>
                    <div className="text-[0.65rem] font-semibold text-(--text-muted) mb-0.5">Presença de efeito colateral</div>
                    <div className="text-xs text-(--text)">{selectedApp.sideEffect || 'Não'}</div>
                  </div>
                  <div>
                    <div className="text-[0.65rem] font-semibold text-(--text-muted) mb-0.5">Necessidade de medicação</div>
                    <div className="text-xs text-(--text)">{selectedApp.medicationNeeded || 'Não'}</div>
                  </div>
                  {selectedApp.sideEffect === 'yes' && (
                    <div className="col-span-2">
                      <div className="text-[0.65rem] font-semibold text-(--text-muted) mb-0.5">Efeitos colaterais relatados</div>
                      <div className="text-xs text-(--text) leading-relaxed">{selectedApp.reportedEffects || '—'}</div>
                    </div>
                  )}
                  {selectedApp.medicationNeeded === 'yes' && (
                    <div className="col-span-2">
                      <div className="text-[0.65rem] font-semibold text-(--text-muted) mb-0.5">Medicações administradas</div>
                      <div className="text-xs text-(--text) leading-relaxed">{selectedApp.medications || '—'}</div>
                    </div>
                  )}
                  <div className="col-span-2">
                    <div className="text-[0.65rem] font-semibold text-(--text-muted) mb-0.5">Notas do responsável</div>
                    <div className="text-xs text-(--text)">{selectedApp.administratorNote || '-'}</div>
                  </div>
                </div>
              )}
        </>}
      </Modal>
    </div>
  )
}
