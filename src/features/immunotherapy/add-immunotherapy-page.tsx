import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, User, Syringe, Info } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { useHasPermission } from '@/shared/identity/user-store'
import { useImmunotherapiesStore, type Immunotherapy } from '@/features/immunotherapy/stores/immunotherapies-store'
import { useCustomTypesStore } from '@/features/immunotherapy/stores/custom-types-store'
import { Modal, Button, IconButton, TextInput, Select } from '@/shared/components'
import { PROFILES } from '@/shared/identity/user-store'
import { usePatientStore, type Application } from '@/features/patient/stores/patient-store'
import {
  addImmunotherapySchema,
  type AddImmunotherapyForm,
  STEP_1_FIELDS,
  STEP_2_FIELDS,
} from '@/features/immunotherapy/schemas/add-immunotherapy'
import { formatCPF, formatPhone, formatWeight, formatConcentration, formatVolume } from '@/shared/lib/formatters'
import { todayStr, tomorrowStr } from '@/shared/lib/dates'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const stepLabels = ['Dados do Paciente', 'Dados da Imunoterapia', 'Revisão dos Dados']

export function AddImmunotherapyPage() {
  const navigate = useNavigate()
  const canAdd = useHasPermission('add_immunotherapy')
  const addImmunotherapy = useImmunotherapiesStore((s) => s.addImmunotherapy)
  const customTypes = useCustomTypesStore((s) => s.types)
  const scheduleApplication = usePatientStore((s) => s.scheduleApplication)
  useEffect(() => { if (!canAdd) navigate({ to: '/immunotherapies' }) }, [canAdd, navigate])

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [showCancelModal, setShowCancelModal] = useState(false)

  const {
    control,
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors },
  } = useForm<AddImmunotherapyForm>({
    resolver: zodResolver(addImmunotherapySchema),
    mode: 'onBlur',
    defaultValues: {
      nome: '', cpf: '', telefone: '', dataNascimento: '', peso: '', medicoResponsavel: '',
      tipo: '', viaCutanea: '', dataInicio: tomorrowStr(), extrato: '', metaConcentracao: '', metaVolume: '',
    },
  })
  const form = watch()

  const handleContinue = async () => {
    const fields = step === 1 ? STEP_1_FIELDS : STEP_2_FIELDS
    const isValid = await trigger([...fields])
    if (isValid) setStep((s) => (s + 1) as 1 | 2 | 3)
  }

  const onFinish = handleSubmit((data) => {
    const modalidade: Immunotherapy['modalidade'] = data.viaCutanea === 'sublingual' ? 'sublingual' : 'subcutânea'
    const newId = `new-${Date.now()}`
    const newImm: Immunotherapy = {
      id: newId,
      nome: data.nome.trim(),
      telefone: data.telefone.trim(),
      tipo: data.tipo.trim(),
      doseConcentracao: '1:10.000 - 0,1ml',
      cicloIntervalo: { numero: 1, dias: 7 },
      modalidade,
      status: 'ativo',
      medicoResponsavel: data.medicoResponsavel.trim(),
    }
    addImmunotherapy(newImm)

    const [yyyy, mm, dd] = data.dataInicio.split('-')
    const dataPtBR = `${dd}/${mm}/${yyyy}`
    const meses = ['JANEIRO','FEVEREIRO','MARÇO','ABRIL','MAIO','JUNHO','JULHO','AGOSTO','SETEMBRO','OUTUBRO','NOVEMBRO','DEZEMBRO']
    const ano = Number(yyyy)
    const mesIdx = Math.max(0, Math.min(11, Number(mm) - 1))
    const firstApp: Application = {
      id: `app-${newId}-1`,
      patientId: newId,
      data: dataPtBR,
      horaInicio: '09:00',
      horaFim: '09:30',
      status: 'agendada',
      dose: '1:10.000 - 0,1ml',
      ciclo: { numero: 1, dias: 7 },
      mes: meses[mesIdx],
      ano,
      modalidade,
    }
    scheduleApplication(firstApp)

    navigate({ to: '/immunotherapies', search: { success: true, patientName: data.nome, patientId: newId } })
  })

  const errMsg = (field: keyof AddImmunotherapyForm) =>
    errors[field] ? <span className="text-[0.6rem] text-red-500 mt-0.5 block">{errors[field]?.message}</span> : null

  return (
    <div className="flex flex-1 flex-col bg-gray-50/80 p-4 min-h-0 overflow-hidden">
      <div className="flex flex-1 min-h-0 flex-col rounded-xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="border-b border-(--border-custom) px-5 py-4 flex items-center gap-3">
          <IconButton aria-label="Voltar" onClick={() => setShowCancelModal(true)}>
            <ArrowLeft size={16} />
          </IconButton>
          <h1 className="text-2xl font-bold text-(--text)">Adicionar Imunoterapia</h1>
        </div>

        <div className="px-5 py-7 flex items-center justify-center gap-4">
          {stepLabels.map((label, i) => {
            const s = i + 1
            return (
              <div key={s} className="flex items-center gap-4">
                <div className="flex items-center gap-2.5">
                  <div className={cn("flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all", step === s ? "bg-linear-to-br from-brand to-teal-400 text-white" : step > s ? "bg-teal-100 text-teal-600 opacity-50" : "bg-gray-200 text-gray-500")}>
                    {s}
                  </div>
                  <span className={cn("text-[0.8rem] font-medium", step === s ? "text-teal-600" : step > s ? "text-teal-600 opacity-50" : "text-gray-400")}>{label}</span>
                </div>
                {s < 3 && <div className={cn("h-px w-14 border-t-[1.5px]", step > s ? "border-teal-400 border-solid" : "border-gray-200 border-dashed")} />}
              </div>
            )
          })}
        </div>

        <form onSubmit={onFinish} noValidate className="flex flex-1 min-h-0 flex-col">
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {step === 1 && (
              <div className="space-y-5">
                <h2 className="text-sm font-bold text-(--text)">Dados do Paciente</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Nome do Paciente</label>
                    <TextInput placeholder="Nome completo" invalid={!!errors.nome} {...register('nome')} />
                    {errMsg('nome')}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">CPF</label>
                    <Controller
                      control={control}
                      name="cpf"
                      render={({ field }) => (
                        <TextInput placeholder="000.000.000-00" invalid={!!errors.cpf} value={field.value} onBlur={field.onBlur} onChange={(e) => field.onChange(formatCPF(e.target.value))} />
                      )}
                    />
                    {errMsg('cpf')}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Telefone</label>
                    <Controller
                      control={control}
                      name="telefone"
                      render={({ field }) => (
                        <TextInput placeholder="(00) 00000-0000" invalid={!!errors.telefone} value={field.value} onBlur={field.onBlur} onChange={(e) => field.onChange(formatPhone(e.target.value))} />
                      )}
                    />
                    {errMsg('telefone')}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Data de Nascimento</label>
                    <TextInput type="date" max={todayStr()} invalid={!!errors.dataNascimento} {...register('dataNascimento')} />
                    {errMsg('dataNascimento')}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Peso</label>
                    <div className="relative">
                      <Controller
                        control={control}
                        name="peso"
                        render={({ field }) => (
                          <TextInput placeholder="Ex: 72.5" invalid={!!errors.peso} className="pr-10" value={field.value} onBlur={field.onBlur} onChange={(e) => field.onChange(formatWeight(e.target.value))} />
                        )}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[0.65rem] font-semibold text-(--text-muted)">kg</span>
                    </div>
                    {errMsg('peso')}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Médico Responsável</label>
                    <Select invalid={!!errors.medicoResponsavel} {...register('medicoResponsavel')}>
                      <option value="" disabled>Selecione o médico</option>
                      {PROFILES.filter((p) => p.role === 'medico').map((p) => (
                        <option key={p.id} value={p.name}>{p.name} · {p.registration}</option>
                      ))}
                    </Select>
                    {errMsg('medicoResponsavel')}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <h2 className="text-sm font-bold text-(--text)">Dados da Imunoterapia</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Tipo</label>
                    <Select invalid={!!errors.tipo} {...register('tipo')}>
                      <option value="" disabled>Selecione o tipo</option>
                      {customTypes.map((t) => <option key={t.id} value={t.label}>{t.label}</option>)}
                    </Select>
                    {errMsg('tipo')}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Via Cutânea</label>
                    <Select invalid={!!errors.viaCutanea} {...register('viaCutanea')}>
                      <option value="" disabled>Selecione</option>
                      <option value="Subcutânea">Subcutânea</option>
                      <option value="Sublingual">Sublingual</option>
                    </Select>
                    {errMsg('viaCutanea')}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Data de Início</label>
                    <TextInput type="date" min={todayStr()} invalid={!!errors.dataInicio} {...register('dataInicio')} />
                    {errMsg('dataInicio')}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Extrato</label>
                    <TextInput placeholder="Ex: Der p 60 + Der f 10% + Blt 30%" invalid={!!errors.extrato} {...register('extrato')} />
                    {errMsg('extrato')}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Meta de Concentração</label>
                    <Controller
                      control={control}
                      name="metaConcentracao"
                      render={({ field }) => (
                        <TextInput placeholder="1:10" invalid={!!errors.metaConcentracao} value={field.value} onBlur={field.onBlur} onChange={(e) => field.onChange(formatConcentration(e.target.value))} />
                      )}
                    />
                    {errMsg('metaConcentracao')}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Meta de Volume</label>
                    <div className="relative">
                      <Controller
                        control={control}
                        name="metaVolume"
                        render={({ field }) => (
                          <TextInput placeholder="Ex: 0.5" invalid={!!errors.metaVolume} className="pr-10" value={field.value} onBlur={field.onBlur} onChange={(e) => field.onChange(formatVolume(e.target.value))} />
                        )}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[0.65rem] font-semibold text-(--text-muted)">ml</span>
                    </div>
                    {errMsg('metaVolume')}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-3.5">
                <div className="mb-4">
                  <h2 className="text-sm font-bold text-(--text)">Revisão dos dados</h2>
                  <p className="text-[0.7rem] text-(--text-muted) mt-1">Confirme os dados antes de salvar a prescrição.</p>
                </div>

                <div className="border border-(--border-custom) rounded-xl overflow-hidden">
                  <div className="flex items-center gap-2.5 px-4 py-3 border-b border-(--border-custom) bg-white">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-100 shrink-0">
                      <User size={13} className="text-teal-600" />
                    </div>
                    <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-(--text-muted)">Dados do Paciente</span>
                  </div>
                  <div className="bg-gray-50/60 p-4">
                    <div className="grid grid-cols-2 gap-px bg-(--border-custom) rounded-lg overflow-hidden border border-(--border-custom)">
                      {[
                        { label: 'Nome', value: form.nome || '—' },
                        { label: 'CPF', value: form.cpf || '—' },
                        { label: 'Telefone', value: form.telefone || '—' },
                        { label: 'Data de Nascimento', value: form.dataNascimento ? format(new Date(form.dataNascimento + 'T12:00'), 'dd/MM/yyyy', { locale: ptBR }) : '—' },
                        { label: 'Peso', value: form.peso ? `${form.peso} kg` : '—' },
                        { label: 'Médico Responsável', value: form.medicoResponsavel || '—' },
                      ].map((item) => (
                        <div key={item.label} className="bg-white px-3.5 py-2.5">
                          <div className="text-[0.6rem] font-semibold uppercase tracking-wider text-(--text-muted) mb-0.5">{item.label}</div>
                          <div className="text-xs font-medium text-(--text)">{item.value}</div>
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
                    <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-(--text-muted)">Dados da Imunoterapia</span>
                  </div>
                  <div className="bg-gray-50/60 p-4">
                    <div className="grid grid-cols-2 gap-px bg-(--border-custom) rounded-lg overflow-hidden border border-(--border-custom)">
                      {[
                        { label: 'Tipo', value: form.tipo || '—' },
                        { label: 'Via Cutânea', value: form.viaCutanea || '—' },
                        { label: 'Data de Início', value: form.dataInicio ? format(new Date(form.dataInicio + 'T12:00'), 'dd/MM/yyyy', { locale: ptBR }) : '—' },
                        { label: 'Extrato', value: form.extrato || '—' },
                        { label: 'Meta de Concentração', value: form.metaConcentracao || '—' },
                        { label: 'Meta de Volume', value: form.metaVolume ? `${form.metaVolume} ml` : '—' },
                      ].map((item) => (
                        <div key={item.label} className="bg-white px-3.5 py-2.5">
                          <div className="text-[0.6rem] font-semibold uppercase tracking-wider text-(--text-muted) mb-0.5">{item.label}</div>
                          <div className="text-xs font-medium text-(--text)">{item.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg p-3.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 shrink-0">
                    <Info size={14} className="text-amber-600" />
                  </div>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    Após confirmar, o protocolo será iniciado e a primeira dose será agendada para <span className="font-bold">{form.dataInicio ? format(new Date(form.dataInicio + 'T12:00'), 'dd/MM/yyyy', { locale: ptBR }) : 'a data de início definida'}</span>.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-(--border-custom) px-5 py-3 flex justify-end gap-2">
            {step > 1 && (
              <Button type="button" tone="brand" variant="outline" onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}>
                Voltar
              </Button>
            )}
            {step < 3 ? (
              <Button type="button" tone="brand" variant="solid" onClick={handleContinue}>
                Continuar
              </Button>
            ) : (
              <Button type="submit" tone="brand" variant="solid">
                Salvar Imunoterapia
              </Button>
            )}
          </div>
        </form>
      </div>

      <Modal
        open={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancelar cadastro?"
        size="sm"
        footer={<>
          <Button variant="outline" onClick={() => setShowCancelModal(false)}>Continuar editando</Button>
          <Button variant="danger" onClick={() => navigate({ to: '/immunotherapies' })}>Cancelar</Button>
        </>}
      >
        <p className="text-xs text-(--text-muted)">Os dados preenchidos serão perdidos. Deseja realmente cancelar a prescrição da imunoterapia?</p>
      </Modal>
    </div>
  )
}
