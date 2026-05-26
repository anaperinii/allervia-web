import { Users, Syringe, Activity } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import type { LucideIcon } from 'lucide-react'

interface StatCardsProps {
  totalActive: number
  inductionCount: number
  maintenanceCount: number
}

interface StatDefinition {
  key: 'active' | 'induction' | 'maintenance'
  icon: LucideIcon
  label: string
  color: string
  iconBg: string
  accentColor: string
}

const STAT_DEFINITIONS: StatDefinition[] = [
  { key: 'active', icon: Users, label: 'Pacientes Ativos', color: 'text-[#E8768E]', iconBg: 'bg-[#FDECF0]/80', accentColor: '#E8768E' },
  { key: 'induction', icon: Syringe, label: 'Em Indução', color: 'text-[#18C1CB]', iconBg: 'bg-[#B6F2EC]/70', accentColor: '#18C1CB' },
  { key: 'maintenance', icon: Activity, label: 'Em Manutenção', color: 'text-[#A78BFA]', iconBg: 'bg-[#E8DFFE]/80', accentColor: '#A78BFA' },
]

export function StatCards({ totalActive, inductionCount, maintenanceCount }: StatCardsProps) {
  const values: Record<StatDefinition['key'], number> = {
    active: totalActive,
    induction: inductionCount,
    maintenance: maintenanceCount,
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {STAT_DEFINITIONS.map((stat) => {
        const Icon = stat.icon
        return (
          <div
            key={stat.key}
            className="border border-(--border-custom) rounded-xl p-4 flex items-center gap-3.5 relative overflow-hidden bg-white"
          >
            <div
              className="absolute top-0 left-0 right-0 h-1"
              style={{ background: `linear-gradient(to right, ${stat.accentColor}, ${stat.accentColor}40)` }}
            />
            <div
              className="absolute inset-0"
              style={{ background: `linear-gradient(to right, ${stat.accentColor}18, transparent 50%)` }}
            />
            <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl shrink-0 relative z-10', stat.iconBg)}>
              <Icon size={18} className={stat.color} />
            </div>
            <div className="flex-1 relative z-10">
              <div className="text-[0.65rem] text-(--text-muted) font-medium">{stat.label}</div>
              <span className="text-xl font-extrabold text-(--text)">{values[stat.key]}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
