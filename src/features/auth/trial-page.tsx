import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from '@tanstack/react-router'
import { ArrowRight, Shield, Check, Clock, Mail } from 'lucide-react'
import { Modal, TextInput, Select } from '@/shared/components'
import imunecareLogo from '@/assets/imunecare-logo.png'
import imunecareWhiteLogo from '@/assets/imunecare-white-logo.png'
import { trialSchema, type TrialForm } from '@/features/auth/schemas/trial'
import { formatPhone } from '@/shared/lib/formatters'

export function TrialPage() {
  const [showModal, setShowModal] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TrialForm>({
    resolver: zodResolver(trialSchema),
    mode: 'onBlur',
    defaultValues: {
      name: '', lastName: '', email: '', phone: '',
      role: '', solution: '', specialty: '', professionals: '',
    },
  })

  const onSubmit = handleSubmit(() => setShowModal(true))

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex flex-col justify-center w-[52%] bg-linear-to-br from-[#0d8e6e] via-brand to-teal-400 relative overflow-hidden p-10 xl:p-14">
        <div className="absolute -top-30 -right-35 w-130 h-130 rounded-full border-2 border-white/20 pointer-events-none" />
        <div className="absolute top-50 right-5 w-80 h-80 rounded-full border-2 border-white/15 pointer-events-none" />
        <div className="absolute -bottom-20 -left-30 w-95 h-95 rounded-full border-2 border-white/15 pointer-events-none" />
        <div className="absolute bottom-[35%] left-[35%] w-50 h-50 rounded-full border-2 border-white/12 pointer-events-none" />
        <Link to="/" className="flex items-center gap-2.5 no-underline mb-8 relative z-10">
          <img src={imunecareWhiteLogo} alt="ImuneCare" className="w-9 h-9 rounded-lg" />
          <span className="text-xl font-bold text-white">ImuneCare</span>
        </Link>
        <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 backdrop-blur-md text-white text-xs font-semibold px-3.5 py-1.5 rounded-full mb-5 w-fit relative z-10">
          <span className="w-1.5 h-1.5 bg-[#7FFFD4] rounded-full animate-pulse" />
          Solicite acesso · 14 dias grátis
        </div>
        <h1 className="text-[clamp(1.75rem,3vw,2.6rem)] font-extrabold text-white leading-[1.15] tracking-tight mb-4 max-w-120 relative z-10">
          A plataforma <span className="text-[#7FFFD4]">100% dedicada</span> à gestão de imunoterapias
        </h1>
        <p className="text-[0.95rem] text-white/75 leading-[1.65] max-w-105 mb-8 relative z-10">
          Cálculos automáticos. Histórico unificado. Rastreabilidade total.
          Transforme complexidade em clareza e recupere o tempo que você merece dedicar aos seus pacientes.
        </p>
        <div className="flex gap-3 relative z-10">
          {[
            { value: '+94%', label: 'Adesão ao tratamento' },
            { value: '3x', label: 'Mais eficiência clínica' },
            { value: '100%', label: 'Rastreabilidade' },
          ].map((s) => (
            <div key={s.label} className="flex-1 bg-white/12 border border-white/18 backdrop-blur-md rounded-xl px-4 py-3">
              <div className="text-lg font-extrabold text-white tracking-tight">{s.value}</div>
              <div className="text-[0.65rem] text-white/65 font-medium mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-gray-50/80 px-6 py-8 overflow-y-auto">
        <form onSubmit={onSubmit} noValidate className="bg-white rounded-2xl border border-(--border-custom) shadow-[0_2px_40px_rgba(24,193,203,0.07)] p-6 xl:p-8 w-full max-w-110">
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <img src={imunecareLogo} alt="ImuneCare" className="w-7 h-7 rounded-md" />
            <span className="text-base font-bold gradient-text">ImuneCare</span>
          </div>

          <p className="text-[0.65rem] font-bold uppercase tracking-[1.2px] text-brand mb-1.5">Sem cartão de crédito · 14 dias grátis</p>
          <h2 className="text-lg font-extrabold text-(--text) tracking-tight mb-1">Solicite seu acesso gratuito</h2>
          <p className="text-[0.7rem] text-(--text-muted) mb-5 leading-relaxed">Preencha os dados abaixo e nossa equipe libera seu acesso em até 1 dia útil.</p>

          <div className="grid grid-cols-2 gap-2.5 mb-2.5">
            <div>
              <label htmlFor="tr-nome" className="text-[0.7rem] font-semibold text-(--text-muted) mb-1 block">Nome <span className="text-red-400">*</span></label>
              <TextInput id="tr-nome" placeholder="Insira aqui" invalid={!!errors.name} className="h-8" maxLength={60} {...register('name')} />
              {errors.name && <span className="text-[0.55rem] text-red-500 mt-0.5 block">{errors.name.message}</span>}
            </div>
            <div>
              <label htmlFor="tr-sobrenome" className="text-[0.7rem] font-semibold text-(--text-muted) mb-1 block">Sobrenome <span className="text-red-400">*</span></label>
              <TextInput id="tr-sobrenome" placeholder="Insira aqui" invalid={!!errors.lastName} className="h-8" maxLength={80} {...register('lastName')} />
              {errors.lastName && <span className="text-[0.55rem] text-red-500 mt-0.5 block">{errors.lastName.message}</span>}
            </div>
          </div>

          <div className="mb-2.5">
            <label htmlFor="tr-email" className="text-[0.7rem] font-semibold text-(--text-muted) mb-1 block">E-mail profissional <span className="text-red-400">*</span></label>
            <TextInput id="tr-email" type="email" placeholder="voce@clinica.com.br" invalid={!!errors.email} className="h-8" maxLength={254} autoComplete="email" {...register('email')} />
            {errors.email && <span className="text-[0.55rem] text-red-500 mt-0.5 block">{errors.email.message}</span>}
          </div>

          <div className="mb-2.5">
            <label htmlFor="tr-telefone" className="text-[0.7rem] font-semibold text-(--text-muted) mb-1 block">Telefone / WhatsApp <span className="text-red-400">*</span></label>
            <Controller
              control={control}
              name="phone"
              render={({ field }) => (
                <TextInput
                  id="tr-telefone"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  invalid={!!errors.phone}
                  className="h-8"
                  maxLength={16}
                  value={field.value}
                  onBlur={field.onBlur}
                  onChange={(e) => field.onChange(formatPhone(e.target.value))}
                />
              )}
            />
            {errors.phone && <span className="text-[0.55rem] text-red-500 mt-0.5 block">{errors.phone.message}</span>}
          </div>

          <div className="grid grid-cols-2 gap-2.5 mb-2.5">
            <div>
              <label htmlFor="tr-atuacao" className="text-[0.7rem] font-semibold text-(--text-muted) mb-1 block">Qual é a sua atuação? <span className="text-red-400">*</span></label>
              <Select id="tr-atuacao" invalid={!!errors.role} className="h-8" {...register('role')}>
                <option value="" disabled>Selecionar</option>
                <option>Médico(a)</option>
                <option>Gestor(a) de clínica</option>
                <option>Farmacêutico(a)</option>
                <option>Enfermeiro(a)</option>
                <option>Outro</option>
              </Select>
              {errors.role && <span className="text-[0.55rem] text-red-500 mt-0.5 block">{errors.role.message}</span>}
            </div>
            <div>
              <label htmlFor="tr-solucao" className="text-[0.7rem] font-semibold text-(--text-muted) mb-1 block">Solução digital para quem? <span className="text-red-400">*</span></label>
              <Select id="tr-solucao" invalid={!!errors.solution} className="h-8" {...register('solution')}>
                <option value="" disabled>Selecionar</option>
                <option>Para mim (uso próprio)</option>
                <option>Para minha clínica</option>
                <option>Para uma rede de clínicas</option>
              </Select>
              {errors.solution && <span className="text-[0.55rem] text-red-500 mt-0.5 block">{errors.solution.message}</span>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 mb-4">
            <div>
              <label htmlFor="tr-especialidade" className="text-[0.7rem] font-semibold text-(--text-muted) mb-1 block">Especialidade da clínica <span className="text-red-400">*</span></label>
              <TextInput id="tr-especialidade" placeholder="Ex.: Alergia e Imunologia" invalid={!!errors.specialty} className="h-8" maxLength={80} {...register('specialty')} />
              {errors.specialty && <span className="text-[0.55rem] text-red-500 mt-0.5 block">{errors.specialty.message}</span>}
            </div>
            <div>
              <label htmlFor="tr-profissionais" className="text-[0.7rem] font-semibold text-(--text-muted) mb-1 block">Nº de profissionais <span className="text-red-400">*</span></label>
              <TextInput
                id="tr-profissionais"
                type="number"
                min="1"
                max="9999"
                placeholder="Ex.: 5"
                invalid={!!errors.professionals}
                className="h-8"
                {...register('professionals')}
              />
              {errors.professionals && <span className="text-[0.55rem] text-red-500 mt-0.5 block">{errors.professionals.message}</span>}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-9 rounded-lg bg-linear-to-br from-brand to-teal-400 text-white text-xs font-bold flex items-center justify-center gap-2 hover:-translate-y-px hover:shadow-[0_4px_20px_rgba(24,193,203,0.35)] transition-all cursor-pointer disabled:opacity-50"
          >
            Quero testar gratuitamente
            <ArrowRight size={16} />
          </button>

          <p className="text-[0.6rem] text-(--text-muted) text-center mt-3 leading-relaxed">
            Ao enviar, você concorda com os{' '}
            <a href="#" className="text-brand no-underline hover:underline">Termos de Uso</a> e a{' '}
            <a href="#" className="text-brand no-underline hover:underline">Política de Privacidade</a>.
          </p>

          <hr className="border-t border-(--border-custom) my-4" />

          <div className="flex items-center justify-center gap-5">
            {[
              { icon: Shield, label: 'Dados seguros' },
              { icon: Check, label: 'Sem compromisso' },
              { icon: Clock, label: 'Ativação imediata' },
            ].map((t) => {
              const Icon = t.icon
              return (
                <span key={t.label} className="flex items-center gap-1.5 text-[0.65rem] text-(--text-muted) font-medium">
                  <Icon size={13} className="text-brand" />
                  {t.label}
                </span>
              )
            })}
          </div>
        </form>
      </div>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        size="md"
        headerSlot={<div />}
      >
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center">
              <Mail size={24} className="text-emerald-600" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-(--text)">Solicitação enviada com sucesso!</h3>
          <p className="text-xs text-(--text-muted) leading-relaxed">
            Recebemos sua solicitação de acesso e nossa equipe já está analisando seus dados.
            Você receberá uma confirmação com as instruções de ativação diretamente no e-mail informado.
          </p>
          <div className="bg-gray-50 border border-(--border-custom) rounded-lg px-4 py-3">
            <p className="text-[0.65rem] text-(--text-muted) font-medium mb-1">Fique atento à sua caixa de entrada</p>
            <p className="text-sm font-semibold text-brand">contato@imunecare.com.br</p>
            <p className="text-[0.6rem] text-(--text-muted) mt-1">Prazo de retorno: até 1 dia útil</p>
          </div>
          <Link to="/" className="inline-flex items-center justify-center w-full h-9 rounded-lg bg-linear-to-br from-brand to-teal-400 text-white text-xs font-bold hover:-translate-y-px hover:shadow-[0_4px_20px_rgba(24,193,203,0.35)] transition-all no-underline">
            Voltar para a página inicial
          </Link>
        </div>
      </Modal>
    </div>
  )
}
