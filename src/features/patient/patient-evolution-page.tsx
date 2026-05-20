import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { usePatientStore } from '@/features/patient/stores/patient-store'
import { useImmunotherapiesStore } from '@/features/immunotherapy/stores/immunotherapies-store'
import { useHasPermission, useUserStore } from '@/shared/identity/user-store'
import { useAuditStore } from '@/shared/audit/audit-store'
import { Search, ArrowLeft, ClipboardList, Syringe, CalendarDays, Info } from 'lucide-react'
import { addDays, format, differenceInDays, parse } from 'date-fns'
import { cn } from '@/shared/lib/utils'
import { formatVolume, formatConcentration } from '@/shared/lib/formatters'
import { calculateNextDose, parseDose, PROTOCOL_INTERVAL_PRESET_STRINGS } from '@/features/immunotherapy/constants/scit-protocol'
import { Modal, Button, IconButton, TextInput, TextArea, Select } from '@/shared/components'
import {
  evolutionSchema,
  type EvolutionForm,
  STEP_1_FIELDS,
  STEP_2_FIELDS,
  EVOLUTION_DEFAULTS,
} from '@/features/patient/schemas/evolution'

const stepLabels = ['Paciente', 'Pré-Aplicação', 'Pós-Aplicação', 'Revisão dos Dados']

const RESPONSAVEIS_APLICACAO = [
  { name: 'Jaqueline Oliveira', role: 'Enfermeira' },
  { name: 'Carlos Eduardo Silva', role: 'Enfermeiro' },
  { name: 'Rafael Mendes', role: 'Técnico em Enfermagem' },
  { name: 'Mariana Costa', role: 'Técnica em Enfermagem' },
]

function addMinutesToTime(time: string, minutes: number): string {
  const parts = time.split(':')
  if (parts.length !== 2) return ''
  const h = parseInt(parts[0], 10)
  const m = parseInt(parts[1], 10)
  if (isNaN(h) || isNaN(m)) return ''
  const total = h * 60 + m + minutes
  const newH = Math.floor(total / 60) % 24
  const newM = total % 60
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`
}

export function PatientEvolutionPage() {
  const navigate = useNavigate()
  const { patientId: preselectedId } = useSearch({ from: '/patient-evolution' })
  const { setSelectedPatient: setStorePatient, recordEvolution, applications } = usePatientStore()
  const currentUser = useUserStore((s) => s.current)
  const logAccess = useAuditStore((s) => s.logAccess)
  const { immunotherapies } = useImmunotherapiesStore()
  const canEvolve = useHasPermission('evolve_patient')
  useEffect(() => { if (!canEvolve) navigate({ to: '/immunotherapies' }) }, [canEvolve, navigate])

  const [step, setStep] = useState<0 | 1 | 2 | 3>(0)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [search, setSearch] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedPatient, setSelected] = useState<typeof immunotherapies[0] | null>(null)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  const {
    control,
    register,
    handleSubmit,
    trigger,
    watch,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<EvolutionForm>({
    resolver: zodResolver(evolutionSchema),
    mode: 'onBlur',
    defaultValues: EVOLUTION_DEFAULTS,
  })

  const form = watch()

  useEffect(() => {
    if (preselectedId && !selectedPatient) {
      const found = immunotherapies.find((i) => i.id === preselectedId)
      if (found) handleSelect(found)
    }
  }, [preselectedId])

  const handleSelect = (item: typeof immunotherapies[0]) => {
    setSelected(item)
    setSearch(item.name)
    setShowSuggestions(false)
    setStorePatient({
      id: item.id, name: item.name, birthDate: '02/07/2000', age: 25,
      phone: '(62) 99557-1423', weight: '89.7 kg', cpf: '711.905.744-89',
      responsibleDoctor: 'Dra. Karina Martins', status: 'active',
      immunotherapyType: item.type, inductionStart: '01/01/2020', maintenanceStart: null,
      administrationRoute: 'Subcutânea', extract: 'Der p 60 + der f 10% + blt 30%',
      targetConcentrationVolume: '1:10 - 0,5ml', targetReached: false,
      currentInterval: item.cycleInterval.days, nextApplicationDate: '21/05/2025',
      currentDoseConcentration: item.doseConcentration,
    })
  }

  const lastApp = useMemo(() => {
    if (!selectedPatient) return null
    const realized = applications.filter((a) => a.status === 'completed' && a.patientId === selectedPatient.id)
    if (!realized.length) return null
    return [...realized].sort((a, b) => {
      const da = a.date.split('/'), db = b.date.split('/')
      return new Date(+db[2], +db[1] - 1, +db[0]).getTime() - new Date(+da[2], +da[1] - 1, +da[0]).getTime()
    })[0]
  }, [selectedPatient, applications])

  const doseNumber = useMemo(() => {
    if (!selectedPatient) return 0
    return applications.filter((a) => a.status === 'completed' && a.patientId === selectedPatient.id).length
  }, [selectedPatient, applications])

  const nextDose = useMemo(() => {
    if (!lastApp || !selectedPatient) return null
    const [d, m, y] = lastApp.date.split('/')
    const currentDose = `${lastApp.extractConcentration || lastApp.dose.split(' - ')[0]} - ${lastApp.appliedVolume || lastApp.dose.split(' - ')[1]}`
    const currentInterval = lastApp.cycle.days
    const calc = calculateNextDose(currentDose, currentInterval)
    const nextDate = addDays(new Date(+y, +m - 1, +d), calc.interval)
    const next = parseDose(calc.dose)
    return {
      date: format(nextDate, 'dd/MM/yyyy'),
      conc: next?.conc ?? calc.dose,
      vol: next?.vol ?? '',
      dose: doseNumber + 1,
      interval: calc.interval,
      phase: calc.phase,
    }
  }, [lastApp, selectedPatient, doseNumber])

  const plannedNext = useMemo(() => {
    if (!form.applicationDate || !form.nextInterval || !form.nextInterval.trim()) return null
    const [y, m, d] = form.applicationDate.split('-')
    if (!y || !m || !d) return null
    const applicationDate = new Date(+y, +m - 1, +d)
    if (isNaN(applicationDate.getTime())) return null
    const intervalDays = parseInt(form.nextInterval.trim(), 10)
    if (isNaN(intervalDays) || intervalDays <= 0) return null
    const nextDate = addDays(applicationDate, intervalDays)
    return { date: format(nextDate, 'dd/MM/yyyy'), interval: intervalDays, applicationDate }
  }, [form.applicationDate, form.nextInterval])

  const treatmentTime = useMemo(() => {
    if (!selectedPatient) return null
    try {
      const start = parse('01/01/2020', 'dd/MM/yyyy', new Date())
      const days = differenceInDays(new Date(), start)
      const years = Math.floor(days / 365)
      if (years > 0) return `${years} ${years === 1 ? 'ano' : 'anos'}`
      const months = Math.floor(days / 30)
      if (months > 0) return `${months} meses`
      return `${days} dias`
    } catch { return null }
  }, [selectedPatient])

  const errMsg = (field: keyof EvolutionForm) =>
    errors[field] ? <span className="text-[0.6rem] text-red-500 mt-0.5 block">{errors[field]?.message}</span> : null

  const filtered = useMemo(() => {
    if (!search) return immunotherapies.slice(0, 8)
    return immunotherapies.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()))
  }, [search, immunotherapies])

  useEffect(() => { setHighlightedIndex(-1) }, [filtered.length, showSuggestions])

  useEffect(() => {
    if (highlightedIndex >= 0 && suggestionsRef.current) {
      const items = suggestionsRef.current.querySelectorAll('[data-suggestion-item]')
      items[highlightedIndex]?.scrollIntoView({ block: 'nearest' })
    }
  }, [highlightedIndex])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || filtered.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (highlightedIndex >= 0 && filtered[highlightedIndex]) handleSelect(filtered[highlightedIndex])
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
      setHighlightedIndex(-1)
    }
  }

  const handleContinue = async () => {
    if (step === 0 && (!selectedPatient || selectedPatient.status === 'inactive')) return
    if (step === 1) {
      const ok = await trigger([...STEP_1_FIELDS])
      if (!ok) return
      if (nextDose) {
        const p = getValues()
        if (!p.applicationDate) setValue('applicationDate', nextDose.date.split('/').reverse().join('-'))
        if (!p.appliedVolume) setValue('appliedVolume', nextDose.vol.replace('ml', '').replace(',', '.'))
        if (!p.concentration) setValue('concentration', nextDose.conc)
        if (!p.nextInterval) setValue('nextInterval', String(nextDose.interval))
      }
    }
    if (step === 2) {
      const ok = await trigger([...STEP_2_FIELDS])
      if (!ok) return
    }
    setStep((s) => (s + 1) as 0 | 1 | 2 | 3)
  }

  const onSaveEvolution = handleSubmit((data) => {
    if (!selectedPatient || !plannedNext) return
    const [y, m, d] = data.applicationDate.split('-')
    const pt = ['JANEIRO','FEVEREIRO','MARÇO','ABRIL','MAIO','JUNHO','JULHO','AGOSTO','SETEMBRO','OUTUBRO','NOVEMBRO','DEZEMBRO']
    const dataRealizada = `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`
    const mesRealizada = pt[parseInt(m, 10) - 1]
    const volStr = data.appliedVolume.replace('.', ',') + 'ml'
    const doseStr = `${data.concentration} - ${volStr}`
    const interval = plannedNext.interval
    const ciclo = interval === 7 ? 1 : interval === 14 ? 1 : interval === 21 ? 2 : interval === 28 ? 3 : 1
    const nextDateParts = plannedNext.date.split('/')
    const nextMonth = pt[parseInt(nextDateParts[1], 10) - 1]

    const completed = {
      id: `evo-${Date.now()}-r`,
      patientId: selectedPatient.id,
      date: dataRealizada,
      startTime: data.startTime,
      endTime: data.endTime,
      status: 'completed' as const,
      dose: doseStr,
      cycle: { number: ciclo, days: interval },
      month: mesRealizada,
      year: parseInt(y, 10),
      appliedVolume: volStr,
      extractConcentration: data.concentration,
      sideEffect: data.sideEffectPost,
      reportedEffects: data.sideEffectPost === 'yes' ? data.reportedEffectsPost : undefined,
      medicationNeeded: data.medicationNeededPost,
      medications: data.medicationNeededPost === 'yes' ? data.medicationsPost : undefined,
      administrator: data.administrator,
      administratorNote: data.notesPost || '-',
    }

    const nextCalc = calculateNextDose(doseStr, interval)
    const next = {
      id: `evo-${Date.now()}-n`,
      patientId: selectedPatient.id,
      date: plannedNext.date,
      startTime: data.startTime,
      endTime: data.endTime,
      status: 'scheduled' as const,
      dose: nextCalc.dose,
      cycle: { number: ciclo, days: nextCalc.interval },
      month: nextMonth,
      year: parseInt(nextDateParts[2], 10),
    }

    recordEvolution({ completed, next })

    logAccess({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      userRegistration: currentUser.registration,
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      action: 'apply_dose',
      description: `Aplicou ${doseStr} em ${dataRealizada} (ciclo ${ciclo} · intervalo ${interval} dias) · responsável: ${data.administrator}`,
    })

    navigate({ to: '/immunotherapies', search: { success: true, patientName: selectedPatient.name } })
  })

  const handleEnterKey = (e: React.KeyboardEvent) => {
    if (e.key !== 'Enter' || (e.target as HTMLElement).tagName === 'TEXTAREA') return
    e.preventDefault()
    if (step < 3) handleContinue()
    else onSaveEvolution()
  }

  return (
    <div className="flex flex-1 flex-col bg-gray-50/80 p-4 min-h-0 overflow-hidden" onKeyDown={handleEnterKey}>
      <div className="flex flex-1 min-h-0 flex-col rounded-xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="border-b border-(--border-custom) px-5 py-4 flex items-center gap-3">
          <IconButton aria-label="Voltar" onClick={() => setShowCancelModal(true)}>
            <ArrowLeft size={16} />
          </IconButton>
          <h1 className="text-2xl font-bold text-(--text)">Evolução do Paciente</h1>
        </div>

        <div className="px-5 py-7 flex items-center justify-center gap-4">
          {stepLabels.map((label, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="flex items-center gap-2.5">
                <div className={cn("flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all", step === i ? "bg-linear-to-br from-brand to-teal-400 text-white" : step > i ? "bg-teal-100 text-teal-600 opacity-50" : "bg-gray-200 text-gray-500")}>
                  {i + 1}
                </div>
                <span className={cn("text-[0.8rem] font-medium", step === i ? "text-teal-600" : step > i ? "text-teal-600 opacity-50" : "text-gray-400")}>{label}</span>
              </div>
              {i < 3 && <div className={cn("h-px w-14 border-t-[1.5px]", step > i ? "border-teal-400 border-solid" : "border-gray-200 border-dashed")} />}
            </div>
          ))}
        </div>

        <form onSubmit={onSaveEvolution} noValidate className="flex flex-1 min-h-0 flex-col">
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {step === 0 && (
              <div className="space-y-5">
                <h2 className="text-sm font-bold text-(--text)">Selecionar Paciente</h2>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-muted)" />
                  <TextInput
                    placeholder="Buscar paciente por nome"
                    value={search}
                    disabled={!!preselectedId && !!selectedPatient}
                    onChange={(e) => { setSearch(e.target.value); setShowSuggestions(true) }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    onKeyDown={handleKeyDown}
                    className={cn("pl-8", preselectedId && selectedPatient && "opacity-60 cursor-not-allowed")}
                  />
                  {showSuggestions && filtered.length > 0 && (
                    <div ref={suggestionsRef} className="absolute z-10 w-full mt-1 bg-white border border-(--border-custom) rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filtered.map((p, idx) => (
                        <button
                          key={p.id}
                          type="button"
                          data-suggestion-item
                          onClick={() => handleSelect(p)}
                          onMouseEnter={() => setHighlightedIndex(idx)}
                          className={cn("w-full text-left px-4 py-2.5 transition-colors flex items-center justify-between", highlightedIndex === idx ? "bg-teal-50" : "hover:bg-teal-50")}
                        >
                          <span className="text-xs font-medium text-(--text)">{p.name}</span>
                          <span className="text-[0.65rem] text-(--text-muted)">{p.type}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {selectedPatient && (
                  <div className="border border-(--border-custom) rounded-xl mt-4 overflow-hidden">
                    <div className="px-4 py-3.5 border-b border-(--border-custom) flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-brand to-teal-400 text-sm font-bold text-white shrink-0">
                        {selectedPatient.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold text-(--text)">{selectedPatient.name}</div>
                        <div className="text-[0.7rem] text-(--text-muted)">
                          25 anos · 89.7 kg · Dra. Karina Martins
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-600 text-[0.6rem] font-semibold border border-teal-200">{selectedPatient.type}</span>
                        {treatmentTime && <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[0.6rem] font-medium border border-amber-200">{treatmentTime}</span>}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-0">
                      <div className="p-4 bg-stone-50 border-r border-(--border-custom)">
                        <div className="text-[0.65rem] font-bold text-stone-500 uppercase tracking-wider mb-3">Última aplicação</div>
                        <div className="grid grid-cols-2 gap-y-2.5 gap-x-4">
                          <div>
                            <div className="text-[0.6rem] text-(--text-muted) font-medium">Dose</div>
                            <div className="text-xs font-bold text-(--text)">Dose {doseNumber || '-'}</div>
                          </div>
                          <div>
                            <div className="text-[0.6rem] text-(--text-muted) font-medium">Volume</div>
                            <div className="text-xs font-bold text-(--text)">{lastApp?.appliedVolume || lastApp?.dose.split(' - ')[1] || '-'}</div>
                          </div>
                          <div>
                            <div className="text-[0.6rem] text-(--text-muted) font-medium">Concentração</div>
                            <div className="text-xs font-bold text-(--text)">{lastApp?.extractConcentration || lastApp?.dose.split(' - ')[0] || '-'}</div>
                          </div>
                          <div>
                            <div className="text-[0.6rem] text-(--text-muted) font-medium">Data</div>
                            <div className="text-xs font-bold text-(--text)">{lastApp?.date || '-'}</div>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-teal-50/50">
                        <div className="text-[0.65rem] font-bold text-teal-600 uppercase tracking-wider mb-3">Dose prevista</div>
                        <div className="grid grid-cols-2 gap-y-2.5 gap-x-4">
                          <div>
                            <div className="text-[0.6rem] text-(--text-muted) font-medium">Dose</div>
                            <div className="text-xs font-bold text-(--text)">Dose {nextDose?.dose || '-'}</div>
                          </div>
                          <div>
                            <div className="text-[0.6rem] text-(--text-muted) font-medium">Volume</div>
                            <div className="text-xs font-bold text-(--text)">{nextDose?.vol || '-'}</div>
                          </div>
                          <div>
                            <div className="text-[0.6rem] text-(--text-muted) font-medium">Concentração</div>
                            <div className="text-xs font-bold text-(--text)">{nextDose?.conc || '-'}</div>
                          </div>
                          <div>
                            <div className="text-[0.6rem] text-(--text-muted) font-medium">Data</div>
                            <div className="text-xs font-bold text-(--text)">{nextDose?.date || '-'}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {selectedPatient && selectedPatient.status === 'inactive' && (
                  <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-lg px-3.5 py-3 mt-3">
                    <Info size={14} className="text-red-500 shrink-0" />
                    <p className="text-xs text-red-700">Este paciente está <span className="font-semibold">inativo</span>. Não é possível registrar uma evolução para pacientes inativos.</p>
                  </div>
                )}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <h2 className="text-sm font-bold text-(--text)">Pré-Aplicação</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Como o paciente passou durante o intervalo? <span className="text-red-400">*</span></label>
                    <TextArea rows={3} placeholder="Descreva aqui" invalid={!!errors.intervalReport} {...register('intervalReport')} />
                    {errMsg('intervalReport')}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Efeito colateral</label>
                    <Select {...register('sideEffect')}>
                      <option value="no">Não</option>
                      <option value="yes">Sim</option>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Necessidade de medicação</label>
                    <Select {...register('medicationNeeded')}>
                      <option value="no">Não</option>
                      <option value="yes">Sim</option>
                    </Select>
                  </div>
                  <div>
                    <label className={cn("text-xs font-semibold mb-1.5 block", form.sideEffect === 'yes' ? "text-(--text-muted)" : "text-(--text-muted)/40")}>Efeitos colaterais relatados {form.sideEffect === 'yes' && <span className="text-red-400">*</span>}</label>
                    <TextInput
                      placeholder="Insira aqui"
                      disabled={form.sideEffect !== 'yes'}
                      invalid={form.sideEffect === 'yes' && !!errors.reportedEffects}
                      className={cn(form.sideEffect !== 'yes' && "opacity-40 cursor-not-allowed")}
                      {...register('reportedEffects')}
                    />
                    {form.sideEffect === 'yes' && errMsg('reportedEffects')}
                  </div>
                  <div>
                    <label className={cn("text-xs font-semibold mb-1.5 block", form.medicationNeeded === 'yes' ? "text-(--text-muted)" : "text-(--text-muted)/40")}>Medicações administradas {form.medicationNeeded === 'yes' && <span className="text-red-400">*</span>}</label>
                    <TextInput
                      placeholder="Insira aqui"
                      disabled={form.medicationNeeded !== 'yes'}
                      invalid={form.medicationNeeded === 'yes' && !!errors.medications}
                      className={cn(form.medicationNeeded !== 'yes' && "opacity-40 cursor-not-allowed")}
                      {...register('medications')}
                    />
                    {form.medicationNeeded === 'yes' && errMsg('medications')}
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Notas do responsável</label>
                    <TextArea rows={2} placeholder="Insira aqui" {...register('notesPre')} />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <h2 className="text-sm font-bold text-(--text)">Pós-Aplicação</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Data da aplicação</label>
                    <TextInput type="date" invalid={!!errors.applicationDate} {...register('applicationDate')} />
                    {errMsg('applicationDate')}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Hora início</label>
                      <Controller
                        control={control}
                        name="startTime"
                        render={({ field }) => (
                          <TextInput
                            type="time"
                            value={field.value}
                            onBlur={field.onBlur}
                            onChange={(e) => {
                              const v = e.target.value
                              field.onChange(v)
                              if (v && !getValues('endTime')) setValue('endTime', addMinutesToTime(v, 30))
                            }}
                            invalid={!!errors.startTime}
                          />
                        )}
                      />
                      {errMsg('startTime')}
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Hora fim</label>
                      <TextInput type="time" invalid={!!errors.endTime} {...register('endTime')} />
                      {errMsg('endTime')}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Volume aplicado</label>
                    <div className="relative">
                      <Controller
                        control={control}
                        name="appliedVolume"
                        render={({ field }) => (
                          <TextInput placeholder="Ex: 0.5" invalid={!!errors.appliedVolume} className="pr-10" value={field.value} onBlur={field.onBlur} onChange={(e) => field.onChange(formatVolume(e.target.value))} />
                        )}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[0.65rem] font-semibold text-(--text-muted)">ml</span>
                    </div>
                    {errMsg('appliedVolume')}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Concentração do extrato</label>
                    <Controller
                      control={control}
                      name="concentration"
                      render={({ field }) => (
                        <TextInput placeholder="1:10" invalid={!!errors.concentration} value={field.value} onBlur={field.onBlur} onChange={(e) => field.onChange(formatConcentration(e.target.value))} />
                      )}
                    />
                    {errMsg('concentration')}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Intervalo próxima aplicação</label>
                    <Controller
                      control={control}
                      name="nextInterval"
                      render={({ field }) => {
                        const isCustom = field.value && !PROTOCOL_INTERVAL_PRESET_STRINGS.includes(field.value)
                        const selectValue = isCustom ? 'outro' : field.value
                        return (
                          <Select
                            value={selectValue}
                            onChange={(e) => field.onChange(e.target.value === 'outro' ? ' ' : e.target.value)}
                            onBlur={field.onBlur}
                            invalid={!!errors.nextInterval}
                          >
                            <option value="" disabled>Selecione</option>
                            <option value="7">7 dias</option>
                            <option value="14">14 dias</option>
                            <option value="21">21 dias</option>
                            <option value="28">28 dias</option>
                            <option value="outro">Outro</option>
                          </Select>
                        )
                      }}
                    />
                    {(form.nextInterval === ' ' || (form.nextInterval && !['7','14','21','28'].includes(form.nextInterval))) && (
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center gap-2">
                          <Controller
                            control={control}
                            name="nextInterval"
                            render={({ field }) => (
                              <TextInput
                                type="number"
                                min="1"
                                placeholder="Ex: 35"
                                value={field.value.trim()}
                                onChange={(e) => field.onChange(e.target.value.replace(/[^0-9]/g, ''))}
                                invalid={!!errors.nextInterval}
                                className="flex-1"
                              />
                            )}
                          />
                          <span className="text-[0.65rem] text-(--text-muted) shrink-0">dias</span>
                        </div>
                        {(() => {
                          const n = parseInt(form.nextInterval.trim(), 10)
                          if (isNaN(n) || n <= 0) return null
                          if (n < 4) return <div className="text-[0.65rem] text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">⚠ Intervalo muito curto desrespeita o tempo mínimo de segurança entre doses. Reavalie o protocolo.</div>
                          if (n > 15) return <div className="text-[0.65rem] text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">⚠ Intervalo muito longo na indução pode comprometer a progressão. Confirme a conduta clínica.</div>
                          return null
                        })()}
                        <div>
                          <label className="text-[0.65rem] font-semibold text-(--text-muted) mb-1 block">Justificativa do intervalo personalizado <span className="text-red-400">*</span></label>
                          <TextArea
                            rows={2}
                            placeholder="Descreva o motivo clínico para um intervalo fora do protocolo padrão"
                            invalid={!!errors.intervalJustification}
                            className="focus:ring-amber-400"
                            {...register('intervalJustification')}
                          />
                          {errMsg('intervalJustification')}
                        </div>
                      </div>
                    )}
                    {errMsg('nextInterval')}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Responsável</label>
                    <Select invalid={!!errors.administrator} {...register('administrator')}>
                      <option value="" disabled>Selecione o responsável pela aplicação</option>
                      {RESPONSAVEIS_APLICACAO.map((r) => (
                        <option key={r.name} value={r.name}>{r.name} — {r.role}</option>
                      ))}
                    </Select>
                    {errMsg('administrator')}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Efeito colateral</label>
                    <Select {...register('sideEffectPost')}>
                      <option value="no">Não</option>
                      <option value="yes">Sim</option>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Necessidade de medicação</label>
                    <Select {...register('medicationNeededPost')}>
                      <option value="no">Não</option>
                      <option value="yes">Sim</option>
                    </Select>
                  </div>
                  <div className={cn("transition-all duration-300 overflow-hidden", form.sideEffectPost === 'yes' ? "max-h-24 opacity-100" : "max-h-0 opacity-0")}>
                    <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Efeitos colaterais relatados</label>
                    <TextInput placeholder="Insira aqui" invalid={!!errors.reportedEffectsPost} {...register('reportedEffectsPost')} />
                    {errMsg('reportedEffectsPost')}
                  </div>
                  <div className={cn("transition-all duration-300 overflow-hidden", form.medicationNeededPost === 'yes' ? "max-h-24 opacity-100" : "max-h-0 opacity-0")}>
                    <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Medicações administradas</label>
                    <TextInput placeholder="Insira aqui" invalid={!!errors.medicationsPost} {...register('medicationsPost')} />
                    {errMsg('medicationsPost')}
                  </div>
                  <div className={cn("col-span-2 transition-all duration-300 overflow-hidden", form.sideEffectPost === 'yes' && form.medicationNeededPost === 'yes' ? "max-h-96 opacity-100" : "max-h-0 opacity-0")}>
                    <div className="bg-amber-50/60 border border-amber-200 rounded-lg p-3 space-y-2.5">
                      <div className="flex items-start gap-2">
                        <Info size={14} className="text-amber-700 shrink-0 mt-0.5" />
                        <div className="text-[0.65rem] text-amber-800 leading-relaxed">
                          <span className="font-bold">Reação adversa com uso de medicação registrada.</span> Selecione a conduta a ser aplicada no protocolo antes de concluir a evolução. A escolha fica vinculada a esta aplicação no histórico clínico.
                        </div>
                      </div>
                      <Controller
                        control={control}
                        name="reactionAdjustment"
                        render={({ field }) => (
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { v: 'reduce_dose', label: 'Reduzir dose', desc: 'Retornar ao volume anterior' },
                              { v: 'increase_interval', label: 'Aumentar intervalo', desc: 'Ampliar espaçamento entre doses' },
                              { v: 'suspend', label: 'Suspender temporariamente', desc: 'Pausar até avaliação médica' },
                              { v: 'maintain', label: 'Manter protocolo', desc: 'Mantém dose e intervalo' },
                            ].map((opt) => {
                              const selected = field.value === opt.v
                              return (
                                <button
                                  key={opt.v}
                                  type="button"
                                  onClick={() => field.onChange(opt.v as EvolutionForm['reactionAdjustment'])}
                                  className={cn("text-left px-2.5 py-2 rounded-lg border-[1.5px] transition-all cursor-pointer", selected ? "border-amber-500 bg-amber-100/50" : "border-amber-200 bg-white hover:border-amber-400")}
                                >
                                  <div className="text-[0.65rem] font-bold text-(--text)">{opt.label}</div>
                                  <div className="text-[0.55rem] text-(--text-muted) mt-0.5">{opt.desc}</div>
                                </button>
                              )
                            })}
                          </div>
                        )}
                      />
                      {form.reactionAdjustment && (
                        <div>
                          <label className="text-[0.6rem] font-semibold text-(--text-muted) mb-1 block">
                            Justificativa clínica {form.reactionAdjustment === 'maintain' && <span className="text-red-400">*</span>}
                          </label>
                          <textarea
                            rows={2}
                            placeholder={form.reactionAdjustment === 'maintain' ? 'Justifique por que o protocolo será mantido mesmo com reação adversa' : 'Contexto clínico da conduta (opcional)'}
                            className="w-full rounded-lg border border-(--border-custom) bg-white px-2.5 py-1.5 text-[0.7rem] placeholder:text-(--text-muted)/60 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all resize-none"
                            {...register('reactionAdjustmentJustification')}
                          />
                          {errMsg('reactionAdjustmentJustification')}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Notas do responsável</label>
                    <TextArea rows={2} placeholder="Insira aqui" {...register('notesPost')} />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-3.5">
                <div className="mb-4">
                  <h2 className="text-sm font-bold text-(--text)">Revisão da evolução</h2>
                  <p className="text-[0.7rem] text-(--text-muted) mt-1">Confirme os dados antes de registrar a dose.</p>
                </div>

                <div className="border border-(--border-custom) rounded-xl overflow-hidden">
                  <div className="flex items-center gap-2.5 px-4 py-3 border-b border-(--border-custom) bg-white">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-100 shrink-0">
                      <ClipboardList size={13} className="text-teal-600" />
                    </div>
                    <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-(--text-muted)">Pré-Aplicação</span>
                  </div>
                  <div className="bg-gray-50/60 p-4">
                    {form.intervalReport && (
                      <div className="mb-3 bg-teal-50 border-l-2 border-teal-400 rounded-r-lg px-3 py-2.5">
                        <div className="text-[0.6rem] font-semibold uppercase tracking-wider text-teal-700 mb-1">Relato do intervalo</div>
                        <div className="text-xs text-teal-900 leading-relaxed">{form.intervalReport}</div>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-px bg-(--border-custom) rounded-lg overflow-hidden border border-(--border-custom)">
                      {[
                        { label: 'Efeito Colateral', value: form.sideEffect === 'yes' ? 'Sim' : 'Não' },
                        { label: 'Necessidade de Medicação', value: form.medicationNeeded === 'yes' ? 'Sim' : 'Não' },
                        ...(form.sideEffect === 'yes' ? [{ label: 'Efeitos Relatados', value: form.reportedEffects || '—' }] : []),
                        ...(form.medicationNeeded === 'yes' ? [{ label: 'Medicações', value: form.medications || '—' }] : []),
                        ...(form.notesPre ? [{ label: 'Notas', value: form.notesPre }] : []),
                      ].map((item) => (
                        <div key={item.label} className="bg-white px-3.5 py-2.5">
                          <div className="text-[0.6rem] font-semibold uppercase tracking-wider text-(--text-muted) mb-0.5">{item.label}</div>
                          <div className="text-xs font-medium text-(--text)">{item.value || '—'}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border border-(--border-custom) rounded-xl overflow-hidden">
                  <div className="flex items-center gap-2.5 px-4 py-3 border-b border-(--border-custom) bg-white">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-100 shrink-0">
                      <Syringe size={13} className="text-teal-600" />
                    </div>
                    <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-(--text-muted)">Pós-Aplicação</span>
                  </div>
                  <div className="bg-gray-50/60 p-4">
                    <div className="grid grid-cols-2 gap-px bg-(--border-custom) rounded-lg overflow-hidden border border-(--border-custom)">
                      {[
                        { label: 'Data', value: form.applicationDate ? format(parse(form.applicationDate, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy') : '—' },
                        { label: 'Horário', value: form.startTime && form.endTime ? `${form.startTime} – ${form.endTime}` : '—' },
                        { label: 'Volume Aplicado', value: form.appliedVolume ? `${form.appliedVolume} ml` : '—' },
                        { label: 'Concentração', value: form.concentration || '—' },
                        { label: 'Intervalo Próxima Dose', value: form.nextInterval ? `${form.nextInterval} dias` : '—' },
                        { label: 'Responsável', value: form.administrator || '—' },
                        { label: 'Efeito Colateral', value: form.sideEffectPost === 'yes' ? 'Sim' : 'Não' },
                        { label: 'Necessidade de Medicação', value: form.medicationNeededPost === 'yes' ? 'Sim' : 'Não' },
                        ...(form.notesPost ? [{ label: 'Notas', value: form.notesPost }] : []),
                      ].map((item) => (
                        <div key={item.label} className="bg-white px-3.5 py-2.5">
                          <div className="text-[0.6rem] font-semibold uppercase tracking-wider text-(--text-muted) mb-0.5">{item.label}</div>
                          <div className="text-xs font-medium text-(--text)">{item.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 bg-teal-50 border border-teal-200 rounded-lg px-3.5 py-3">
                  <CalendarDays size={15} className="text-teal-600 shrink-0" />
                  <p className="text-xs text-teal-800 leading-relaxed">
                    Próxima dose agendada para <span className="font-bold">{plannedNext?.date || '—'}</span>
                    {plannedNext && <> (intervalo de <span className="font-bold">{plannedNext.interval} dias</span> a partir da aplicação).</>}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-(--border-custom) px-5 py-3 flex justify-end gap-2">
            {step > 0 && (
              <Button type="button" tone="brand" variant="outline" onClick={() => setStep((s) => (s - 1) as 0 | 1 | 2 | 3)}>
                Voltar
              </Button>
            )}
            {step < 3 ? (
              <Button
                type="button"
                tone="brand"
                variant="solid"
                onClick={handleContinue}
                disabled={step === 0 && (!selectedPatient || selectedPatient.status === 'inactive')}
              >
                Continuar
              </Button>
            ) : (
              <Button type="submit" tone="brand" variant="solid">
                Salvar Evolução
              </Button>
            )}
          </div>
        </form>
      </div>

      <Modal
        open={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancelar evolução?"
        size="sm"
        footer={<>
          <Button variant="outline" onClick={() => setShowCancelModal(false)}>Continuar editando</Button>
          <Button variant="danger" onClick={() => navigate({ to: '/immunotherapies' })}>Cancelar</Button>
        </>}
      >
        <p className="text-xs text-(--text-muted)">Os dados preenchidos serão perdidos. Deseja realmente cancelar a evolução do paciente?</p>
      </Modal>
    </div>
  )
}
