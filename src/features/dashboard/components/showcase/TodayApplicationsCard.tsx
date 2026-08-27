import { faArrowRight, faCheck, faClock, faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import proArt from '@/assets/pro-art.jpg'
import { CircleButton, SHOWCASE } from '@/shared/components/showcase'

export const STATUS_BADGE = {
  completed: { color: '#8FD285', icon: faCheck, label: 'Aplicada' },
  missed: { color: '#E0453C', icon: faXmark, label: 'Ausente' },
  scheduled: { color: '#8CA1A6', icon: faClock, label: 'Prevista' },
} as const

export interface TodayApplication {
  id: string
  patientId: string
  name: string
  time: string
  dose: string
  status: keyof typeof STATUS_BADGE
}

export function TodayApplicationsCard({
  applications,
  onOpen,
  onSelectPatient,
}: {
  applications: TodayApplication[]
  onOpen: () => void
  onSelectPatient: (patientId: string) => void
}) {
  return (
    <section
      className="relative flex h-full flex-col overflow-hidden rounded-3xl"
      style={{ background: SHOWCASE.card, border: `1px solid ${SHOWCASE.line}` }}
    >
      <img
        src={proArt}
        alt=""
        className="pointer-events-none absolute inset-x-0 top-0 h-[115%] w-full scale-105 object-cover blur-[3px]"
        style={{ transform: 'translateY(-13%) scale(1.05)' }}
      />

      <div className="relative z-10 flex h-full flex-col gap-2 p-4">
        <header className="flex items-start justify-between gap-2 px-1 pb-4 text-right">
          <CircleButton
            icon={faArrowRight}
            iconRotateDeg={-45}
            size={32}
            iconSize={10}
            idleBackground={SHOWCASE.ink}
            idleColor={SHOWCASE.onAccent}
            idleBorderColor="transparent"
            onClick={onOpen}
            aria-label="Ver agendamentos"
            title="Ver agendamentos"
          />
          <div>
          <p className="text-[1.05rem] font-bold leading-tight" style={{ color: SHOWCASE.ink }}>
            Aplicações de hoje
          </p>
          <p className="text-[0.7rem] font-medium leading-tight" style={{ color: SHOWCASE.inkSoft }}>
            {applications.length === 0
              ? 'Nenhuma agendada'
              : `${applications.length} paciente${applications.length > 1 ? 's' : ''}`}
          </p>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
          {applications.map((application) => (
            <button
              type="button"
              key={application.id}
              onClick={() => onSelectPatient(application.patientId)}
              className="flex w-full shrink-0 cursor-pointer items-center gap-2.5 rounded-2xl px-3 py-2 text-left backdrop-blur-md transition-transform duration-200 hover:scale-[1.02]"
              style={{ background: 'rgba(255,255,255,0.24)', border: '1px solid rgba(255,255,255,0.42)' }}
            >
              <span
                className="flex h-[1.15rem] w-[1.15rem] shrink-0 items-center justify-center rounded-full"
                title={STATUS_BADGE[application.status].label}
                style={{ background: STATUS_BADGE[application.status].color, color: '#FFFFFF' }}
              >
                <FontAwesomeIcon icon={STATUS_BADGE[application.status].icon} style={{ fontSize: 8 }} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[0.74rem] font-semibold leading-tight" style={{ color: SHOWCASE.ink }}>
                  {application.name}
                </p>
                <p className="truncate text-[0.64rem] font-medium leading-tight" style={{ color: SHOWCASE.inkSoft }}>
                  {application.dose}
                </p>
              </div>
              <span className="text-[0.68rem] font-semibold tabular-nums" style={{ color: SHOWCASE.ink }}>
                {application.time}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
