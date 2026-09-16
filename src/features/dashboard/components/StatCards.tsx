import { DottedSpot } from '@/features/patient/components/DottedSpot'

import { faArrowTrendUp, faShieldHalved, faUser, faUserXmark } from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'

interface StatCardsProps {
  totalActive: number
  inactiveCount: number
  inductionCount: number
  maintenanceCount: number
}

interface StatDefinition {
  key: 'active' | 'inactive' | 'induction' | 'maintenance'
  icon: IconDefinition
  label: string
  rgb: string
  accent: string
}

const STATS: StatDefinition[] = [
  { key: 'active', icon: faUser, label: 'Pacientes Ativos', rgb: '155,193,196', accent: '#257E8C' },
  { key: 'inactive', icon: faUserXmark, label: 'Pacientes Inativos', rgb: '108,158,165', accent: '#1d6772' },
  { key: 'induction', icon: faArrowTrendUp, label: 'Em Indução', rgb: '77,126,133', accent: '#12333a' },
  { key: 'maintenance', icon: faShieldHalved, label: 'Em Manutenção', rgb: '29,103,114', accent: '#0e2e34' },
]

export function StatCards({ totalActive, inactiveCount, inductionCount, maintenanceCount }: StatCardsProps) {
  const values: Record<StatDefinition['key'], number> = {
    active: totalActive,
    inactive: inactiveCount,
    induction: inductionCount,
    maintenance: maintenanceCount,
  }

  return (
    <div className="grid grid-cols-4 gap-3">
      {STATS.map((stat) => {
        return (
          <div
            key={stat.key}
            className="relative flex items-center overflow-hidden rounded-xl px-6 py-5 border backdrop-blur-xl"
            style={{
              background: `linear-gradient(150deg, rgba(${stat.rgb},0.34), rgba(8,25,29,0.72) 72%), linear-gradient(160deg, #0e353d, #08191d)`,
              borderColor: 'rgba(220,225,229,0.16)',
              boxShadow: `0 12px 30px -14px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08), 0 0 24px -10px rgba(${stat.rgb},0.55)`,
            }}
          >
            <DottedSpot className="pointer-events-none absolute bottom-0 right-0" />
            <div className="relative flex flex-1 items-baseline gap-2 min-w-0">
              <span className="text-3xl font-semibold leading-none" style={{ color: '#F2F6F7' }}>{values[stat.key]}</span>
              <span className="text-[0.82rem] font-medium leading-tight" style={{ color: '#9FBEC2' }}>{stat.label}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
