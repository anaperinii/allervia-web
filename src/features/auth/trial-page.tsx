import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from '@tanstack/react-router'
import { ArrowRight, Shield, Check, Clock, Mail } from 'lucide-react'
import { Modal, Button, FieldLabel, TextInput, Select } from '@/shared/components'
import imunecareLogo from '@/assets/imunecare-logo.png'
import imunecareWhiteLogo from '@/assets/imunecare-white-logo.png'
import { trialSchema, type TrialForm } from '@/features/auth/schemas/trial'
import { formatPhone } from '@/shared/lib/formatters'

const ROLE_OPTIONS = [
  { value: 'doctor', label: 'Médico(a)' },
  { value: 'clinic_manager', label: 'Gestor(a) de clínica' },
  { value: 'pharmacist', label: 'Farmacêutico(a)' },
  { value: 'nurse', label: 'Enfermeiro(a)' },
  { value: 'other', label: 'Outro' },
] as const

const SOLUTION_OPTIONS = [
  { value: 'self', label: 'Para mim (uso próprio)' },
  { value: 'single_clinic', label: 'Para minha clínica' },
  { value: 'clinic_network', label: 'Para uma rede de clínicas' },
] as const

const TRUST_BADGES = [
  { icon: Shield, label: 'Dados seguros' },
  { icon: Check, label: 'Sem compromisso' },
  { icon: Clock, label: 'Ativação imediata' },
] as const

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
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-8 overflow-y-auto">
        <form onSubmit={onSubmit} noValidate className="bg-white rounded-2xl border border-(--border-custom) shadow-[0_2px_40px_rgba(24,193,203,0.07)] p-6 xl:p-8 w-full max-w-110">
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <img src={imunecareLogo} alt="ImuneCare" className="w-7 h-7 rounded-md" />
            <span className="text-base font-bold gradient-text">ImuneCare</span>
          </div>

          <h2 className="text-lg font-extrabold text-(--text) tracking-tight mb-1">Solicite seu acesso gratuito</h2>
          <p className="text-[0.7rem] text-(--text-muted) mb-5 leading-relaxed">Preencha os dados abaixo e nossa equipe libera seu acesso em até 1 dia útil. <span className="font-semibold text-(--text)">14 dias grátis</span>, sem cartão de crédito.</p>

          <div className="grid grid-cols-2 gap-2.5 mb-2.5">
            <FieldLabel label="Nome" required error={errors.name?.message}>
              <TextInput placeholder="Insira aqui" invalid={!!errors.name} maxLength={60} {...register('name')} />
            </FieldLabel>
            <FieldLabel label="Sobrenome" required error={errors.lastName?.message}>
              <TextInput placeholder="Insira aqui" invalid={!!errors.lastName} maxLength={80} {...register('lastName')} />
            </FieldLabel>
          </div>

          <div className="mb-2.5">
            <FieldLabel label="E-mail profissional" required error={errors.email?.message}>
              <TextInput
                type="email"
                placeholder="voce@clinica.com.br"
                invalid={!!errors.email}
                maxLength={254}
                autoComplete="email"
                {...register('email')}
              />
            </FieldLabel>
          </div>

          <div className="mb-2.5">
            <FieldLabel label="Telefone / WhatsApp" required error={errors.phone?.message}>
              <Controller
                control={control}
                name="phone"
                render={({ field }) => (
                  <TextInput
                    type="tel"
                    placeholder="(00) 00000-0000"
                    invalid={!!errors.phone}
                    maxLength={16}
                    value={field.value}
                    onBlur={field.onBlur}
                    onChange={(e) => field.onChange(formatPhone(e.target.value))}
                  />
                )}
              />
            </FieldLabel>
          </div>

          <div className="grid grid-cols-2 gap-2.5 mb-2.5">
            <FieldLabel label="Qual é a sua atuação?" required error={errors.role?.message}>
              <Select invalid={!!errors.role} {...register('role')} defaultValue="">
                <option value="" disabled>Selecionar</option>
                {ROLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </Select>
            </FieldLabel>
            <FieldLabel label="Solução digital para quem?" required error={errors.solution?.message}>
              <Select invalid={!!errors.solution} {...register('solution')} defaultValue="">
                <option value="" disabled>Selecionar</option>
                {SOLUTION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </Select>
            </FieldLabel>
          </div>

          <div className="grid grid-cols-2 gap-2.5 mb-4">
            <FieldLabel label="Especialidade da clínica" required error={errors.specialty?.message}>
              <TextInput placeholder="Ex.: Alergia e Imunologia" invalid={!!errors.specialty} maxLength={80} {...register('specialty')} />
            </FieldLabel>
            <FieldLabel label="Nº de profissionais" required error={errors.professionals?.message}>
              <TextInput
                type="number"
                min="1"
                max="9999"
                placeholder="Ex.: 5"
                invalid={!!errors.professionals}
                {...register('professionals')}
              />
            </FieldLabel>
          </div>

          <Button type="submit" tone="brand" variant="solid" prominent fullWidth size="lg" disabled={isSubmitting} rightIcon={<ArrowRight size={16} />}>
            Quero testar gratuitamente
          </Button>

          <p className="text-[0.6rem] text-(--text-muted) text-center mt-3 leading-relaxed">
            Ao enviar, você concorda com os{' '}
            <a href="#" className="text-brand no-underline hover:underline">Termos de Uso</a> e a{' '}
            <a href="#" className="text-brand no-underline hover:underline">Política de Privacidade</a>.
          </p>

          <hr className="border-t border-(--border-custom) my-4" />

          <div className="flex items-center justify-center gap-5">
            {TRUST_BADGES.map((badge) => {
              const Icon = badge.icon
              return (
                <span key={badge.label} className="flex items-center gap-1.5 text-[0.65rem] text-(--text-muted) font-medium">
                  <Icon size={13} className="text-brand" />
                  {badge.label}
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
          <Button tone="brand" variant="solid" prominent fullWidth size="lg" to="/">
            Voltar para a página inicial
          </Button>
        </div>
      </Modal>
    </div>
  )
}
