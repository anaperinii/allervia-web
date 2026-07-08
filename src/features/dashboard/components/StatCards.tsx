import { ShieldCheck, TrendingUp, UserRound, UserX } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { DottedSpot } from '@/features/patient/components/DottedSpot'

interface StatCardsProps {
  totalActive: number
  inactiveCount: number
  inductionCount: number
  maintenanceCount: number
}

interface StatDefinition {
  key: 'active' | 'inactive' | 'induction' | 'maintenance'
  icon: LucideIcon
  label: string
}

const STATS: StatDefinition[] = [
  { key: 'active', icon: UserRound, label: 'Pacientes Ativos' },
  { key: 'inactive', icon: UserX, label: 'Pacientes Inativos' },
  { key: 'induction', icon: TrendingUp, label: 'Em Indução' },
  { key: 'maintenance', icon: ShieldCheck, label: 'Em Manutenção' },
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
        const Icon = stat.icon
        return (
          <div
            key={stat.key}
            className="relative flex items-center overflow-hidden rounded-xl px-6 py-5 border backdrop-blur-xl"
            style={{
              backgroundImage:
                'linear-gradient(160deg, rgba(220,225,229,0.14), rgba(220,225,229,0.04)), linear-gradient(160deg, #0e353d 0%, #08191d 100%)',
              borderColor: 'rgba(220,225,229,0.14)',
              boxShadow:
                '0 12px 30px -14px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.1), 0 0 22px -8px rgba(108,158,165,0.3)',
            }}
          >
            <Icon
              size={96}
              strokeWidth={1.75}
              className="pointer-events-none absolute -bottom-6 -left-10"
              style={{ color: '#9BC1C4', opacity: 0.16 }}
            />
            <DottedSpot className="pointer-events-none absolute bottom-0 right-0" />
            <div className="relative flex flex-1 items-baseline gap-2 min-w-0">
              <span className="text-3xl font-semibold leading-none" style={{ color: '#F2F6F7' }}>{values[stat.key]}</span>
              <span className="text-[0.72rem] font-medium leading-tight" style={{ color: '#8FB4BA' }}>{stat.label}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
