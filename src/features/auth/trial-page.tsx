import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronLeft, Shield, Check, Clock, Mail } from 'lucide-react'
import { Link, useRouter } from '@tanstack/react-router'
import { Modal, Button, FieldLabel, TextInput, Select } from '@/shared/components'
import { AllerviaWordmark } from '@/shared/components/AllerviaWordmark'
import { AUTH_THEMES, AUTH_FIELD_CLASSES, authThemeVars } from '@/features/auth/components/AuthLayout'
import { useLandingTheme } from '@/features/landing-page/theme-context'
import { ThemeSwitch } from '@/features/landing-page/components/ThemeSwitch'
import { trialSchema, type TrialForm } from '@/features/auth/schemas/trial'
import { formatPhone } from '@/shared/lib/formatters'
import { Aurora, AURORA_STOPS } from '@/shared/components/Aurora'
import { HERO_PLATE } from '@/features/landing-page/components/HeroSection'
import { cn } from '@/shared/lib/cn'

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

const RAIL_SHADOW = '-30px 0 80px -40px rgba(0,0,0,0.45)'

export function TrialPage() {
  const [showModal, setShowModal] = useState(false)
  const router = useRouter()
  const { theme } = useLandingTheme()
  const darkTheme = theme === 'dark'
  const t = darkTheme ? AUTH_THEMES.dark : AUTH_THEMES.light

  const goBack = () => {
    if (router.history.canGoBack()) router.history.back()
    else router.navigate({ to: '/' })
  }

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
      <div
        data-auth-shell=""
        className="relative w-full overflow-hidden min-h-screen lg:h-screen p-3 sm:p-4"
        style={{ ...authThemeVars(t), background: 'var(--ll-bg)' }}
        >
        <div
          aria-hidden="true"
          className="absolute inset-3 sm:inset-4 rounded-3xl overflow-hidden"
        >
        <div aria-hidden="true" className="absolute inset-0" style={{ background: HERO_PLATE }} />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-[62%]"
          style={{
            zIndex: 0,
            transform: 'scaleY(-1)',
            filter: 'brightness(0.42) saturate(1.4)',
            maskImage:
              'radial-gradient(88% 155% at 50% 100%, transparent 0%, transparent 56%, rgba(0,0,0,0.6) 72%, #000 90%)',
            WebkitMaskImage:
              'radial-gradient(88% 155% at 50% 100%, transparent 0%, transparent 56%, rgba(0,0,0,0.6) 72%, #000 90%)',
          }}
        >
          <Aurora colorStops={AURORA_STOPS.dark} amplitude={1.1} blend={0.6} speed={0.7} />
        </div>

        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            zIndex: 2,
            backgroundImage: 'radial-gradient(rgba(220,225,229,0.06) 0.5px, transparent 0.5px)',
            backgroundSize: '3px 3px',
          }}
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute"
          style={{
            zIndex: 2,
            top: '78%',
            left: '30%',
            width: '60vmax',
            height: '60vmax',
            background: 'radial-gradient(circle, rgba(155,193,196,0.14), transparent 62%)',
            transform: 'translate(-50%, -50%)',
            animation: 'av-drift-2 22s ease-in-out infinite',
          }}
        />
        </div>

        <div className="relative z-10 h-full min-h-[calc(100vh-1.5rem)] lg:min-h-0 grid grid-cols-1 lg:grid-cols-[1fr_minmax(0,42rem)] items-stretch overflow-hidden rounded-3xl">
          <div className="flex flex-col px-6 py-6 sm:px-10 lg:pl-14 lg:pr-10">
            <div className="auth-brand flex items-center justify-between gap-5">
              <Link
                to="/"
                aria-label="Voltar para a página inicial"
                className="flex items-center gap-3 no-underline"
                >
                <img src={AUTH_THEMES.light.mark} alt="" className="h-7 w-auto object-contain" />
                <AllerviaWordmark className="text-xl" style={{ color: '#0E2E34' }} />
              </Link>

              <ThemeSwitch />
            </div>

            <div className="auth-art-copy flex-1 flex flex-col justify-end max-w-2xl pt-8 pb-[4vh]">
              <h2
                className="font-medium leading-[1.12] tracking-[-0.02em] text-balance"
                style={{ fontSize: 'clamp(2rem, 3vw, 3.2rem)', color: '#ffffff' }}
              >
                A plataforma{' '}
                <span
                  className="font-semibold"
                  style={{
                    backgroundImage:
                      'linear-gradient(115deg, #ffffff 0%, #ffffff 42%, #dff0f0 49%, #9BC1C4 51%, #dff0f0 53%, #ffffff 60%, #ffffff 100%)',
                    backgroundSize: '300% 100%',
                    backgroundPosition: '200% 0',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    color: 'transparent',
                    animation: 'shimmer 10s linear infinite',
                    willChange: 'background-position',
                  }}
                >
                  100% dedicada
                </span>{' '}
                <span className="whitespace-nowrap">à gestão</span> de imunoterapias.
              </h2>
              <p
                className="mt-4 font-normal leading-relaxed max-w-[46ch]"
                style={{ fontSize: 'clamp(1rem, 1.2vw, 1.2rem)', color: 'rgba(255,255,255,0.8)' }}
              >
                Cálculos automáticos. Histórico unificado. Rastreabilidade total. Transforme
                complexidade em clareza e recupere o tempo que você merece dedicar aos seus
                pacientes.
              </p>
            </div>
          </div>

            <form
              onSubmit={onSubmit}
              noValidate
              className={cn(
                'auth-body w-full p-6 sm:px-10 lg:px-12 py-8',
                'flex flex-col justify-center lg:h-full overflow-y-auto',
                AUTH_FIELD_CLASSES,
              )}
              style={{ background: 'var(--ll-bg)', boxShadow: RAIL_SHADOW }}
            >
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={goBack}
                  aria-label="Voltar para a tela anterior"
                  className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg cursor-pointer transition-all duration-200 hover:scale-110"
                  style={{ background: 'transparent', border: '1px solid var(--bd)', color: 'var(--ink-soft)' }}
                >
                  <ChevronLeft size={15} strokeWidth={2.5} />
                </button>
                <h1
                  className="text-[1.6rem] font-medium leading-[1.12] tracking-[-0.03em]"
                  style={{ color: 'var(--ink)' }}
                >
                  Solicite uma demonstração
                </h1>
              </div>
              <p className="mt-2 mb-4 text-[0.9rem] leading-snug" style={{ color: 'var(--ink-soft)' }}>
                Preencha os dados abaixo e nossa equipe entrará em contato em até 1 dia útil para
                agendar uma demonstração personalizada da plataforma.
              </p>

              <div className="grid grid-cols-2 gap-2.5 mb-2">
                <FieldLabel label="Nome" required error={errors.name?.message}>
                  <TextInput placeholder="Insira aqui" invalid={!!errors.name} maxLength={60} {...register('name')} />
                </FieldLabel>
                <FieldLabel label="Sobrenome" required error={errors.lastName?.message}>
                  <TextInput placeholder="Insira aqui" invalid={!!errors.lastName} maxLength={80} {...register('lastName')} />
                </FieldLabel>
              </div>

              <div className="mb-2">
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

              <div className="mb-2">
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

              <div className="grid grid-cols-2 gap-2.5 mb-2">
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

              <div className="grid grid-cols-2 gap-2.5 mb-3">
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

              <div className="pt-4 shrink-0">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center rounded-lg h-10 text-sm font-semibold transition-[filter] duration-200 hover:brightness-110 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                style={{ background: 'var(--btn)', color: 'var(--btn-ink)', border: 'none' }}
              >
                Solicitar demonstração
              </button>

              <p className="text-[0.62rem] text-center mt-4 leading-snug" style={{ color: 'var(--ink-soft)' }}>
                Ao enviar, você concorda com os{' '}
                <a href="#" className="no-underline hover:underline" style={{ color: 'var(--accent)' }}>
                  Termos de Uso
                </a>{' '}
                e a{' '}
                <a href="#" className="no-underline hover:underline" style={{ color: 'var(--accent)' }}>
                  Política de Privacidade
                </a>
                .
              </p>

              <hr className="my-4" style={{ border: 'none', borderTop: '1px solid var(--bd)' }} />

              <div className="flex items-center justify-center gap-5">
                {TRUST_BADGES.map((badge) => {
                  const Icon = badge.icon
                  return (
                    <span
                      key={badge.label}
                      className="flex items-center gap-1.5 text-[0.65rem] font-medium"
                      style={{ color: 'var(--ink-soft)' }}
                    >
                      <Icon size={13} style={{ color: 'var(--accent)' }} />
                      {badge.label}
                    </span>
                  )
                })}
              </div>
              </div>
            </form>
        </div>
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
