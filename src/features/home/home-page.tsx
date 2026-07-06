import { useEffect, useId, useMemo, useRef } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useUserStore } from '@/shared/stores/useUserStore'
import { usePatientStore } from '@/features/patient/stores/usePatientStore'

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'Bom dia'
  if (hour >= 12 && hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

function firstName(fullName: string): string {
  const parts = fullName.split(' ').filter((p) => !['Dr.', 'Dra.', 'Dr', 'Dra'].includes(p))
  return parts[0] ?? fullName
}

const heroRiseStyle = (delay: number): CSSProperties => ({
  opacity: 0,
  filter: 'blur(18px)',
  transform: 'translateY(28px)',
  animation: `hero-rise 1s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s forwards`,
})

const slideUpStyle = (delay: number): CSSProperties => ({
  opacity: 0,
  transform: 'translateY(24px)',
  animation: `slide-up-fade 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s forwards`,
})

const ICON_BOX_SHADOW = '0 2px 6px rgba(20,184,166,0.18), inset 0 1px 0 rgba(255,255,255,0.9)'

const GLASS_CARD_SHADOW = [
  '0 10px 32px rgba(15,23,42,0.08)',
  '0 2px 8px rgba(15,23,42,0.04)',
  'inset 0 1.5px 0 rgba(255,255,255,0.95)',
  'inset 0 -1.5px 3px rgba(15,23,42,0.04)',
  'inset 0 0 0 1px rgba(255,255,255,0.55)',
].join(', ')

function CalendarBadge({ size = 56 }: { size?: number }) {
  const day = new Date().getDate()
  const gradId = useId()
  const ringStyle: CSSProperties = {
    width: size * 0.055,
    height: size * 0.055,
    borderRadius: '50%',
    border: `${Math.max(1, size * 0.011)}px solid #c9cace`,
    background: 'linear-gradient(180deg, #fff, #eef0f3)',
  }
  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Calendário, dia ${day}`}
    >
      <div
        aria-hidden="true"
        className="absolute"
        style={{
          top: size * 0.1,
          left: size * 0.16,
          width: size * 0.74,
          height: size * 0.74,
          borderRadius: size * 0.2,
          background: 'linear-gradient(150deg, #cbd5e1 0%, #94a3b8 55%, #64748b 100%)',
          transform: 'rotate(12deg)',
          boxShadow: `0 ${size * 0.08}px ${size * 0.14}px rgba(71,85,105,0.30)`,
          zIndex: -1,
        }}
      />
      <div
        className="absolute"
        style={{
          top: size * 0.045,
          left: size * 0.085,
          width: size * 0.83,
          height: size * 0.85,
          borderRadius: size * 0.2,
          background: 'linear-gradient(180deg, #ffffff 0%, #fbfcfd 100%)',
          boxShadow: `0 ${size * 0.05}px ${size * 0.1}px rgba(60,64,80,0.10)`,
          zIndex: 0,
        }}
      />
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          zIndex: 1,
          filter: `drop-shadow(0 ${size * 0.05}px ${size * 0.12}px rgba(60,64,80,0.16)) drop-shadow(0 ${size * 0.01}px ${size * 0.02}px rgba(60,64,80,0.06))`,
        }}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f0f1f3" />
            <stop offset="1" stopColor="#f6f7f8" />
          </linearGradient>
        </defs>
        <path
          fill="#ffffff"
          d="M 7 55 L 93 55 L 93 80 C 93 88, 88 92, 80 92 L 20 92 C 12 92, 7 88, 7 80 Z"
        />
        <path
          fill={`url(#${gradId})`}
          d="M 7 55 L 6 36 C 5 25, 8 19, 17 16.5 C 28 14, 39 13.5, 50 13.5 C 61 13.5, 72 14, 83 16.5 C 92 19, 95 25, 94 36 L 93 55 Z"
        />
        <line x1="7" y1="55" x2="93" y2="55" stroke="rgba(0,0,0,0.05)" strokeWidth="0.6" />
      </svg>
      <div
        className="absolute flex justify-center"
        style={{ top: size * 0.085, left: 0, right: 0, gap: size * 0.34, zIndex: 3 }}
      >
        <span style={ringStyle} />
        <span style={ringStyle} />
      </div>
      <div
        className="absolute grid place-items-center"
        style={{
          top: '16%',
          bottom: '6%',
          left: 0,
          right: 0,
          fontSize: size * 0.46,
          fontWeight: 400,
          letterSpacing: '-0.02em',
          lineHeight: 1,
          background: 'linear-gradient(180deg, #a4a6ac, #8c8e95)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
          zIndex: 2,
        }}
      >
        {day}
      </div>
    </div>
  )
}

function LineSphere({ size = 280 }: { size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = size * dpr
    canvas.height = size * dpr
    ctx.scale(dpr, dpr)

    const cx = size / 2
    const cy = size / 2
    const outerR = size * 0.42
    const innerR = size * 0.17
    const RINGS = 100
    const POINTS = 180

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const grad = ctx.createLinearGradient(cx - outerR, 0, cx + outerR, 0)
    grad.addColorStop(0, '#0891B2')
    grad.addColorStop(0.3, '#06B6D4')
    grad.addColorStop(0.65, '#6C9EA5')
    grad.addColorStop(1, '#0D9488')

    let raf = 0
    let time = 0

    ctx.fillStyle = '#f1f5f9'
    ctx.fillRect(0, 0, size, size)

    const draw = () => {
      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = 'rgba(241, 245, 249, 0.18)'
      ctx.fillRect(0, 0, size, size)

      ctx.globalCompositeOperation = 'multiply'
      ctx.strokeStyle = grad

      for (let i = 0; i < RINGS; i++) {
        const t = i / (RINGS - 1)
        const baseR = innerR + (outerR - innerR) * t
        const amp = outerR * 0.2 * (1 - t) + outerR * 0.02

        const core = Math.pow(t, 1.5)
        const edgeFeather = t > 0.78 ? Math.max(0, 1 - (t - 0.78) / 0.22) : 1
        const holeFeather = t < 0.12 ? t / 0.12 : 1
        const intensity = core * edgeFeather * holeFeather
        ctx.globalAlpha = 0.03 + 0.22 * intensity
        ctx.lineWidth = 0.5 + 0.6 * core + 0.8 * (1 - edgeFeather)

        ctx.beginPath()
        for (let p = 0; p <= POINTS; p++) {
          const a = (p / POINTS) * Math.PI * 2
          const angMod = 0.65 + 0.5 * Math.sin(a * 2 + time * 0.5 + i * 0.05)
          const n =
            Math.sin(a * 2 + time + i * 0.16) * 0.5 +
            Math.sin(a * 5 - time * 1.27 + i * 0.11) * 0.32 +
            Math.sin(a * 3 + time * 0.63 + i * 0.07) * 0.45 +
            Math.sin(a * 7 + time * 0.41 + i * 0.13) * 0.18
          const r = baseR + n * amp * angMod
          const x = cx + Math.cos(a) * r
          const y = cy + Math.sin(a) * r
          if (p === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.closePath()
        ctx.stroke()
      }

      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'

      if (!reduce) time += 0.011
      raf = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(raf)
  }, [size])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size, backgroundColor: '#f1f5f9' }}
      aria-hidden="true"
    />
  )
}

function PaperIcon({ size = 48 }: { size?: number }) {
  const backId = useId()
  const frontId = useId()
  const foldId = useId()
  const shadowBackId = useId()
  const shadowFrontId = useId()
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id={backId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5eead6" />
          <stop offset="1" stopColor="#14b8a6" />
        </linearGradient>
        <linearGradient id={frontId} x1="0.15" y1="0" x2="0.85" y2="1">
          <stop offset="0" stopColor="#f0fdfa" />
          <stop offset="0.5" stopColor="#99f6e4" />
          <stop offset="1" stopColor="#5eead6" />
        </linearGradient>
        <linearGradient id={foldId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f0fdfa" />
          <stop offset="1" stopColor="#ccfbf1" />
        </linearGradient>
        <filter id={shadowBackId} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#0f766e" floodOpacity="0.30" />
        </filter>
        <filter id={shadowFrontId} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="10" stdDeviation="11" floodColor="#0d9488" floodOpacity="0.32" />
        </filter>
      </defs>
      <g filter={`url(#${shadowBackId})`}>
        <rect x="52" y="46" width="80" height="104" rx="17" fill={`url(#${backId})`} />
      </g>
      <g filter={`url(#${shadowFrontId})`}>
        <path
          d="M 87 60 L 132 60 L 158 86 L 158 151 Q 158 164 145 164 L 87 164 Q 74 164 74 151 L 74 73 Q 74 60 87 60 Z"
          fill={`url(#${frontId})`}
          fillOpacity="0.72"
        />
        <path
          d="M 131 60 L 158 86 L 138 86 Q 131 86 131 79 Z"
          fill={`url(#${foldId})`}
          fillOpacity="0.9"
        />
      </g>
      <g fill="#ffffff" opacity="0.92">
        <rect x="90" y="106" width="30" height="8" rx="4" />
        <rect x="90" y="126" width="20" height="8" rx="4" />
      </g>
    </svg>
  )
}

function TickIcon({ size = 44 }: { size?: number }) {
  const backId = useId()
  const frontId = useId()
  const shadowBackId = useId()
  const shadowFrontId = useId()
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id={backId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9BC1C4" />
          <stop offset="1" stopColor="#4d7e85" />
        </linearGradient>
        <linearGradient id={frontId} x1="0.1" y1="0.05" x2="0.9" y2="1">
          <stop offset="0" stopColor="#EAF1F1" />
          <stop offset="0.45" stopColor="#9BC1C4" />
          <stop offset="1" stopColor="#6C9EA5" />
        </linearGradient>
        <filter id={shadowBackId} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#4d7e85" floodOpacity="0.30" />
        </filter>
        <filter id={shadowFrontId} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="#6C9EA5" floodOpacity="0.32" />
        </filter>
      </defs>
      <g filter={`url(#${shadowBackId})`} transform="rotate(9 132 72)">
        <rect x="86" y="26" width="92" height="92" rx="26" fill={`url(#${backId})`} />
      </g>
      <g filter={`url(#${shadowFrontId})`}>
        <rect x="40" y="52" width="104" height="104" rx="30" fill={`url(#${frontId})`} fillOpacity="0.72" />
      </g>
      <path
        d="M 76 103 L 88 115 L 110 88"
        fill="none"
        stroke="#ffffff"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

interface ShortcutProps {
  icon?: LucideIcon
  customIcon?: ReactNode
  title: string
  description: string
  to: string
  gradient?: string
}

function GlassShortcut({ icon: Icon, customIcon, title, description, to, gradient }: ShortcutProps) {
  return (
    <Link
      to={to}
      className="group relative flex h-full flex-row items-center gap-3 overflow-hidden rounded-2xl bg-white/25 px-4 py-3.5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/40"
      style={{
        boxShadow: GLASS_CARD_SHADOW,
        backdropFilter: 'blur(20px) saturate(150%)',
        WebkitBackdropFilter: 'blur(20px) saturate(150%)',
        backgroundImage: gradient,
      }}
    >
      {customIcon ? (
        <div className="shrink-0 transition-transform duration-300 group-hover:scale-105">
          {customIcon}
        </div>
      ) : Icon ? (
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/80 text-brand transition-transform duration-300 group-hover:scale-105"
          style={{ boxShadow: ICON_BOX_SHADOW }}
        >
          <Icon size={20} strokeWidth={2.2} />
        </div>
      ) : null}
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-slate-800">{title}</div>
        <div className="mt-0.5 text-[0.8rem] text-slate-500">{description}</div>
      </div>
      <ArrowRight
        size={16}
        className="shrink-0 text-slate-300 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-brand"
      />
    </Link>
  )
}

export function HomePage() {
  const current = useUserStore((s) => s.current)
  const applications = usePatientStore((s) => s.applications)

  const todayAppsCount = useMemo(() => {
    const today = new Date()
    const dd = String(today.getDate()).padStart(2, '0')
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const yyyy = today.getFullYear()
    const todayStr = `${dd}/${mm}/${yyyy}`
    return applications.filter((app) => app.date === todayStr).length
  }, [applications])

  const appointmentsDescription =
    todayAppsCount === 0
      ? 'Nenhuma aplicação prevista'
      : `${todayAppsCount} ${todayAppsCount === 1 ? 'aplicação prevista' : 'aplicações previstas'}`

  const weekday = useMemo(
    () => new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(new Date()),
    [],
  )

  const greeting = getGreeting()
  const name = firstName(current.name)

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-10 pt-4 pb-10">
      <div className="relative flex h-65 items-end justify-center pb-2" style={heroRiseStyle(0)}>
        <LineSphere size={240} />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-1 left-1/2 h-4 w-44 -translate-x-1/2 rounded-[50%]"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(15,23,42,0.18) 0%, rgba(15,23,42,0.08) 35%, transparent 70%)',
            filter: 'blur(6px)',
          }}
        />
      </div>

      <div className="text-center" style={heroRiseStyle(0.35)}>
        <h1 className="text-[clamp(1.8rem,3.5vw,2.6rem)] font-medium leading-[1.15] tracking-tight text-slate-800">
          {greeting}, <span className="font-semibold">{name}</span>.
        </h1>
        <p className="mt-2 text-[clamp(0.95rem,1.5vw,1.15rem)] font-light leading-normal text-(--text-muted)">
          É sempre bom ter você por aqui.
        </p>
      </div>

      <div className="mt-8 grid w-full max-w-5xl gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div className="h-27.5" style={slideUpStyle(0.6)}>
            <GlassShortcut
              customIcon={<TickIcon size={68} />}
              title="Evoluir paciente"
              description="Registrar nova aplicação"
              to="/patient-evolution"
              gradient="linear-gradient(105deg, rgba(108,158,165,0.18) 0%, rgba(155,193,196,0.10) 25%, rgba(234,241,241,0.04) 55%, transparent 80%)"
            />
          </div>
          <div className="h-27.5" style={slideUpStyle(0.75)}>
            <GlassShortcut
              customIcon={<PaperIcon size={68} />}
              title="Cadastrar imunoterapia"
              description="Iniciar novo tratamento"
              to="/add-immunotherapy"
              gradient="linear-gradient(105deg, rgba(20,184,166,0.18) 0%, rgba(94,234,212,0.10) 25%, rgba(240,253,250,0.04) 55%, transparent 80%)"
            />
          </div>
        </div>

        <div style={slideUpStyle(0.9)}>
          <Link
            to="/appointments"
            className="group flex h-full flex-col justify-between rounded-2xl bg-white/25 px-5 py-5 transition-all duration-300 hover:-translate-y-1 hover:bg-white/40"
            style={{
              boxShadow: GLASS_CARD_SHADOW,
              backdropFilter: 'blur(20px) saturate(150%)',
              WebkitBackdropFilter: 'blur(20px) saturate(150%)',
            }}
          >
            <div className="flex items-center gap-4">
              <div className="transition-transform duration-300 group-hover:scale-105">
                <CalendarBadge size={56} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-slate-800">
                  Resumo de hoje <span className="font-normal text-slate-500">({weekday})</span>
                </div>
                <div className="mt-0.5 text-[0.78rem] text-slate-500">{appointmentsDescription}</div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-1.5 text-xs font-medium text-brand">
              Ver agenda
              <ArrowRight
                size={14}
                strokeWidth={2.2}
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              />
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
