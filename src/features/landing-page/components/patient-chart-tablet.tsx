import type { CSSProperties } from 'react'
import patientImg from '@/assets/patient-hero-section.png'
import { CONCENTRATION_STAGES, HERO_PATIENT } from '@/features/landing-page/constants/hero-chart'

interface PatientChartTabletProps {
  rotation?: { y: number; x: number; translateX: number }
  shadowClass?: string
}

const DEFAULT_ROTATION = { y: -14, x: 4, translateX: 14 }
const DEFAULT_SHADOW =
  'shadow-[0_120px_280px_-40px_rgba(13,148,136,0.45),0_60px_160px_-30px_rgba(20,184,166,0.4),0_25px_80px_-15px_rgba(0,70,40,0.3)]'

export function PatientChartTablet({
  rotation = DEFAULT_ROTATION,
  shadowClass = DEFAULT_SHADOW,
}: PatientChartTabletProps) {
  const tabletStyle: CSSProperties = {
    transform: `rotateY(${rotation.y}deg) rotateX(${rotation.x}deg) translateX(${rotation.translateX}px)`,
    transformStyle: 'preserve-3d',
  }

  return (
    <div
      className="relative w-full max-w-4xl"
      style={{ perspective: '1400px', perspectiveOrigin: '50% 50%' }}
    >
      <div className={`bg-gray-900 rounded-4xl p-3 relative ${shadowClass}`} style={tabletStyle}>
        <div
          className="absolute inset-0 rounded-4xl pointer-events-none z-5"
          style={{
            background:
              'linear-gradient(to right, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.04) 40%, transparent 70%)',
          }}
        />
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1 rounded-full bg-gray-700" />
        <div className="absolute top-4.5 right-6 w-1.5 h-1.5 rounded-full bg-gray-700 ring-1 ring-gray-600" />

        <div className="bg-white rounded-[1.4rem] overflow-hidden border border-gray-800 aspect-2/1">
          <img
            src={patientImg}
            alt="Prontuário do paciente"
            className="w-full h-full object-cover object-top-left"
          />
        </div>

        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-20 h-1 rounded-full bg-gray-700" />
      </div>

      <NextAppointmentBadge />
      <ProgressionCard />
    </div>
  )
}

function NextAppointmentBadge() {
  return (
    <div className="absolute -top-4 -left-6 bg-white rounded-xl shadow-[0_8px_24px_rgba(0,70,40,0.12)] px-3 py-2 flex items-center gap-2 border border-(--border-custom) z-10">
      <div className="w-8 h-8 rounded-full bg-teal-100 text-[0.65rem] font-extrabold text-brand flex items-center justify-center shrink-0">
        {HERO_PATIENT.initials}
      </div>
      <div>
        <div className="text-[0.7rem] font-bold text-(--text) leading-tight">{HERO_PATIENT.name}</div>
        <div className="text-[0.55rem] text-(--text-muted)">{HERO_PATIENT.nextLabel}</div>
      </div>
    </div>
  )
}

function ProgressionCard() {
  return (
    <div className="absolute -bottom-5 -right-5 bg-white rounded-xl shadow-[0_8px_24px_rgba(0,70,40,0.12)] px-3.5 py-2.5 border border-(--border-custom) z-10 w-52">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[0.55rem] font-bold text-(--text-muted) uppercase tracking-wider">Progressão</span>
        <span className="text-[0.55rem] font-bold text-brand">{HERO_PATIENT.progressPct}%</span>
      </div>
      <div className="flex items-center gap-1">
        {CONCENTRATION_STAGES.map((stage) => (
          <div
            key={stage.conc}
            className="flex-1 h-1.5 rounded-full"
            style={{ backgroundColor: stage.active ? stage.color : '#E5E7EB' }}
          />
        ))}
      </div>
      <div className="text-[0.5rem] text-(--text-muted) mt-1.5 font-medium">
        Próxima dose: <span className="font-bold text-(--text)">{HERO_PATIENT.nextDose}</span>
      </div>
    </div>
  )
}
