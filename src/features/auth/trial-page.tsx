import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Shield, Check, Clock, Mail } from 'lucide-react'
import { Modal, Button, FieldLabel, TextInput, Select } from '@/shared/components'
import { AllerviaAuthBackground } from '@/features/landing-page/components/AllerviaAuthBackground'
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
  { icon: Clock, label: 'Retorno em 1 dia útil' },
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
    <>
      <section
        className="relative w-full min-h-screen"
        style={{
          background: 'var(--ll-bg)',
          padding: 'var(--ll-hero-frame-pad)',
          transition: 'padding 0.55s cubic-bezier(0.22, 1, 0.36, 1), background-color 0.55s ease',
        }}
      >
        <div
          className="relative overflow-hidden text-white"
          style={{
            background: '#08191d',
            borderRadius: 'var(--ll-hero-frame-radius)',
            minHeight: 'calc(100vh - 2 * var(--ll-hero-frame-pad))',
            transition:
              'border-radius 0.55s cubic-bezier(0.22, 1, 0.36, 1), min-height 0.55s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          <AllerviaAuthBackground />

          <div className="relative z-10 flex min-h-full items-center justify-center px-6 pt-32 pb-16">
            <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] items-center gap-10 xl:gap-16 w-full max-w-6xl">
              <div className="text-center lg:text-left text-white">
                <h1 className="mb-6 text-[clamp(1.9rem,3.6vw,3.4rem)] font-light leading-[1.1] tracking-tight text-balance text-white">
                  A plataforma <span className="font-semibold">100% dedicada</span>{' '}
                  <span className="whitespace-nowrap">à gestão</span> de imunoterapias.
                </h1>
                <p className="max-w-xl mx-auto lg:mx-0 text-[clamp(0.95rem,1.4vw,1.15rem)] font-light leading-relaxed text-white/70">
                  Cálculos automáticos. Histórico unificado. Rastreabilidade total.
                  Transforme complexidade em clareza e recupere o tempo que você merece dedicar
                  aos seus pacientes.
                </p>
              </div>

              <form
                onSubmit={onSubmit}
                noValidate
                className="allervia-dark-form rounded-2xl p-6 xl:p-8 w-full max-w-lg lg:mx-0 mx-auto [&_label]:text-white/80! [&_input]:bg-white/6! [&_input]:border-white/15! [&_input]:text-white! [&_input::placeholder]:text-white/40! [&_select]:bg-white/6! [&_select]:border-white/15! [&_select]:text-white! [&_select_option]:text-[#0f2027]! [&_select+svg]:text-white/50!"
              style={{
                background: 'rgba(8,25,29,0.40)',
                backdropFilter: 'blur(28px) saturate(160%)',
                WebkitBackdropFilter: 'blur(28px) saturate(160%)',
                border: '1px solid rgba(255,255,255,0.14)',
                boxShadow:
                  '0 40px 100px -30px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.10)',
                color: '#DCE1E5',
              }}
            >
              <h2 className="text-lg font-semibold tracking-tight mb-1 text-white">
                Solicite uma demonstração
              </h2>
              <p
                className="text-[0.7rem] mb-5 leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.65)' }}
              >
                Preencha os dados abaixo e nossa equipe entrará em contato em até 1 dia útil para
                agendar uma demonstração personalizada da plataforma.{' '}
                <span className="font-semibold text-white">Sem compromisso</span>.
              </p>

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

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center rounded-xl py-3 text-sm font-semibold transition-all hover:brightness-95 hover:shadow-[0_14px_40px_rgba(108,158,165,0.45),inset_0_1px_0_rgba(255,255,255,0.55)]! disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(255,255,255,0.45), rgba(255,255,255,0.08) 44%, rgba(255,255,255,0) 56%), #6C9EA5',
                  color: '#06232a',
                  boxShadow:
                    '0 12px 28px rgba(108,158,165,0.30), inset 0 1px 0 rgba(255,255,255,0.4)',
                }}
              >
                Solicitar demonstração
              </button>

              <p
                className="text-[0.6rem] text-center mt-3 leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.55)' }}
              >
                Ao enviar, você concorda com os{' '}
                <a
                  href="#"
                  className="no-underline hover:underline"
                  style={{ color: '#9BC1C4' }}
                >
                  Termos de Uso
                </a>{' '}
                e a{' '}
                <a
                  href="#"
                  className="no-underline hover:underline"
                  style={{ color: '#9BC1C4' }}
                >
                  Política de Privacidade
                </a>
                .
              </p>

              <hr className="my-4" style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.10)' }} />

              <div className="flex items-center justify-center gap-5">
                {TRUST_BADGES.map((badge) => {
                  const Icon = badge.icon
                  return (
                    <span
                      key={badge.label}
                      className="flex items-center gap-1.5 text-[0.65rem] font-medium"
                      style={{ color: 'rgba(255,255,255,0.65)' }}
                    >
                      <Icon size={13} style={{ color: '#9BC1C4' }} />
                      {badge.label}
                    </span>
                  )
                })}
              </div>
              </form>
            </div>
          </div>
        </div>
      </section>

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
            Recebemos sua solicitação de demonstração e nossa equipe entrará em contato em breve
            para agendar um horário. Você receberá a confirmação diretamente no e-mail informado.
          </p>
          <div className="bg-gray-50 border border-(--border-custom) rounded-lg px-4 py-3">
            <p className="text-[0.65rem] text-(--text-muted) font-medium mb-1">Fique atento à sua caixa de entrada</p>
            <p className="text-sm font-semibold text-brand">contato@allervia.com.br</p>
            <p className="text-[0.6rem] text-(--text-muted) mt-1">Prazo de retorno: até 1 dia útil</p>
          </div>
          <Button tone="brand" variant="solid" prominent fullWidth size="lg" to="/">
            Voltar para a página inicial
          </Button>
        </div>
      </Modal>
    </>
  )
}
