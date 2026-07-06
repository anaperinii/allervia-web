import { cn } from '@/shared/lib/cn'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

function ChartGlassIcon() {
  return (
    <div className="relative" style={{ width: '46px', height: '44px' }}>
      <div
        className="absolute"
        style={{
          top: '4px',
          left: '4px',
          width: '30px',
          height: '30px',
          borderRadius: '10px',
          transform: 'rotate(-6deg)',
          background:
            'radial-gradient(120% 90% at 32% 20%, rgba(255,255,255,0.3), transparent 60%), linear-gradient(150deg, #9BC1C4 0%, #6C9EA5 55%, #4d7e85 100%)',
          boxShadow: '0 3px 6px rgba(77,126,133,0.18)',
        }}
      />
      <div
        className="absolute grid place-items-center"
        style={{
          top: '12px',
          left: '12px',
          width: '30px',
          height: '30px',
          borderRadius: '10px',
          background:
            'linear-gradient(155deg, rgba(234,241,241,0.65) 0%, rgba(155,193,196,0.45) 100%)',
          backdropFilter: 'blur(9px) saturate(150%)',
          WebkitBackdropFilter: 'blur(9px) saturate(150%)',
          border: '1.2px solid rgba(255,255,255,0.55)',
          boxShadow:
            'inset 0 1px 2px rgba(255,255,255,0.65), 0 5px 10px rgba(108,158,165,0.22)',
        }}
      >
        <svg width="20" height="20" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M10 38 L22 24 L31 33 L46 16"
            stroke="#ffffff"
            strokeWidth="5.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: 'drop-shadow(0 1px 1px rgba(77,126,133,0.40))' }}
          />
        </svg>
      </div>
      <div
        className="absolute"
        style={{
          top: '3px',
          right: '4px',
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.6), transparent 60%), linear-gradient(150deg, #9BC1C4, #6C9EA5)',
          boxShadow: '0 2px 4px rgba(77,126,133,0.35)',
          zIndex: 3,
        }}
      />
    </div>
  )
}

function BookmarkGlassIcon() {
  return (
    <div className="relative" style={{ width: '46px', height: '44px' }}>
      <div
        className="absolute"
        style={{
          top: '4px',
          left: '4px',
          width: '30px',
          height: '30px',
          borderRadius: '10px',
          transform: 'rotate(-6deg)',
          background:
            'radial-gradient(120% 90% at 32% 20%, rgba(255,255,255,0.3), transparent 60%), linear-gradient(150deg, #A7F3D0 0%, #34D399 50%, #10B981 100%)',
          boxShadow: '0 3px 6px rgba(5,150,105,0.20)',
        }}
      />
      <div
        className="absolute grid place-items-center"
        style={{
          top: '12px',
          left: '12px',
          width: '30px',
          height: '30px',
          borderRadius: '10px',
          background:
            'linear-gradient(155deg, rgba(209,250,229,0.65) 0%, rgba(52,211,153,0.45) 100%)',
          backdropFilter: 'blur(9px) saturate(150%)',
          WebkitBackdropFilter: 'blur(9px) saturate(150%)',
          border: '1.2px solid rgba(255,255,255,0.5)',
          boxShadow:
            'inset 0 1px 2px rgba(255,255,255,0.6), 0 5px 10px rgba(16,185,129,0.20)',
        }}
      >
        <svg width="12" height="14" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M2,3 Q2,0 5,0 L7,0 Q10,0 10,3 L10,13.5 L6,10 L2,13.5 Z"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: 'drop-shadow(0 1px 1px rgba(5,150,105,0.35))' }}
          />
        </svg>
      </div>
      <div
        className="absolute"
        style={{
          bottom: '0px',
          left: '4px',
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.6), transparent 60%), linear-gradient(150deg, #6EE7B7, #34D399)',
          boxShadow: '0 2px 4px rgba(16,185,129,0.40)',
          zIndex: 3,
        }}
      />
    </div>
  )
}

function InactiveLockGlassIcon() {
  return (
    <div className="relative" style={{ width: '46px', height: '44px', overflow: 'visible' }}>
      <div
        className="absolute flex flex-col items-center"
        style={{
          top: '-4px',
          left: '0',
          zIndex: 1,
          transform: 'rotate(-11deg) scale(0.92)',
          transformOrigin: 'center',
        }}
      >
        <div
          style={{
            width: '17px',
            height: '13px',
            border: '3px solid #94A3B8',
            borderBottom: 'none',
            borderRadius: '8.5px 8.5px 0 0',
          }}
        />
        <div
          style={{
            width: '29px',
            height: '30px',
            borderRadius: '9px',
            marginTop: '-3px',
            background:
              'radial-gradient(120% 80% at 30% 20%, rgba(255,255,255,0.18), transparent 65%), linear-gradient(155deg, #CBD5E1 0%, #94A3B8 55%, #64748B 100%)',
            boxShadow: '0 2px 4px rgba(71,85,105,0.12)',
          }}
        />
      </div>
      <div
        className="absolute flex flex-col items-center"
        style={{
          top: '5px',
          left: '17px',
          zIndex: 2,
          transform: 'rotate(18deg)',
          transformOrigin: 'center',
        }}
      >
        <div
          style={{
            width: '18px',
            height: '14px',
            border: '3px solid rgba(148,163,184,0.85)',
            borderBottom: 'none',
            borderRadius: '9px 9px 0 0',
            boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.5)',
          }}
        />
        <div
          style={{
            position: 'relative',
            width: '31px',
            height: '32px',
            borderRadius: '9px',
            marginTop: '-3px',
            background:
              'linear-gradient(155deg, rgba(241,245,249,0.6) 0%, rgba(148,163,184,0.42) 100%)',
            backdropFilter: 'blur(10px) saturate(150%)',
            WebkitBackdropFilter: 'blur(10px) saturate(150%)',
            border: '1.5px solid rgba(255,255,255,0.55)',
            boxShadow:
              'inset 0 1px 2px rgba(255,255,255,0.6), 0 4px 8px rgba(71,85,105,0.18)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '4px',
              height: '10px',
              borderRadius: '2.5px',
              background:
                'linear-gradient(180deg, rgba(255,255,255,0.9), rgba(241,245,249,0.75))',
              boxShadow: '0 1px 2px rgba(71,85,105,0.25)',
            }}
          />
        </div>
      </div>
    </div>
  )
}

function PeopleGlassIcon() {
  return (
    <div className="relative" style={{ width: '46px', height: '40px' }}>
      <div className="absolute" style={{ top: '0', left: '13px', width: '22px', zIndex: 1 }}>
        <div
          className="mx-auto rounded-full"
          style={{
            width: '15px',
            height: '15px',
            background:
              'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.3), transparent 60%), linear-gradient(150deg, #67E8F9, #0891B2 55%, #155E75)',
            boxShadow: '0 2px 4px rgba(21,94,117,0.22)',
          }}
        />
        <div
          className="mx-auto"
          style={{
            width: '22px',
            height: '14px',
            marginTop: '2px',
            borderRadius: '11px 11px 7px 7px',
            background:
              'radial-gradient(120% 90% at 50% 15%, rgba(255,255,255,0.20), transparent 60%), linear-gradient(160deg, #67E8F9, #0891B2 55%, #155E75)',
            boxShadow: '0 3px 6px rgba(21,94,117,0.22)',
          }}
        />
      </div>
      <div className="absolute" style={{ top: '5px', left: '0', width: '28px', zIndex: 2 }}>
        <div
          className="mx-auto rounded-full"
          style={{
            width: '16px',
            height: '16px',
            background:
              'linear-gradient(160deg, rgba(165,243,252,0.65), rgba(8,145,178,0.55))',
            backdropFilter: 'blur(8px) saturate(150%)',
            WebkitBackdropFilter: 'blur(8px) saturate(150%)',
            border: '1.2px solid rgba(255,255,255,0.55)',
            boxShadow:
              'inset 0 1px 2px rgba(255,255,255,0.65), 0 4px 8px rgba(21,94,117,0.22)',
          }}
        />
        <div
          className="mx-auto"
          style={{
            width: '28px',
            height: '15px',
            marginTop: '2px',
            borderRadius: '14px 14px 8px 8px',
            background:
              'linear-gradient(160deg, rgba(165,243,252,0.65), rgba(8,145,178,0.55))',
            backdropFilter: 'blur(8px) saturate(150%)',
            WebkitBackdropFilter: 'blur(8px) saturate(150%)',
            border: '1.2px solid rgba(255,255,255,0.55)',
            boxShadow:
              'inset 0 1px 2px rgba(255,255,255,0.65), 0 4px 8px rgba(21,94,117,0.22)',
          }}
        />
      </div>
    </div>
  )
}

interface StatCardsProps {
  totalActive: number
  inactiveCount: number
  inductionCount: number
  maintenanceCount: number
}

interface StatDefinition {
  key: 'active' | 'inactive' | 'induction' | 'maintenance'
  icon?: LucideIcon
  customIcon?: ReactNode
  label: string
  color: string
  iconBg: string
  accentColor: string
  gradient: string
}

const STAT_DEFINITIONS: StatDefinition[] = [
  {
    key: 'active',
    customIcon: <PeopleGlassIcon />,
    label: 'Pacientes Ativos',
    color: 'text-[#0E7490]',
    iconBg: 'bg-[#CFFAFE]/80',
    accentColor: '#0E7490',
    gradient:
      'linear-gradient(105deg, rgba(8,145,178,0.32) 0%, rgba(165,243,252,0.18) 30%, transparent 75%)',
  },
  {
    key: 'inactive',
    customIcon: <InactiveLockGlassIcon />,
    label: 'Pacientes Inativos',
    color: 'text-[#64748B]',
    iconBg: 'bg-[#F1F5F9]/80',
    accentColor: '#64748B',
    gradient:
      'linear-gradient(105deg, rgba(100,116,139,0.20) 0%, rgba(241,245,249,0.10) 30%, transparent 70%)',
  },
  {
    key: 'induction',
    customIcon: <ChartGlassIcon />,
    label: 'Em Indução',
    color: 'text-[#6C9EA5]',
    iconBg: 'bg-[#B6F2EC]/70',
    accentColor: '#6C9EA5',
    gradient:
      'linear-gradient(105deg, rgba(108,158,165,0.20) 0%, rgba(182,242,236,0.10) 30%, transparent 70%)',
  },
  {
    key: 'maintenance',
    customIcon: <BookmarkGlassIcon />,
    label: 'Em Manutenção',
    color: 'text-[#10B981]',
    iconBg: 'bg-[#D1FAE5]/80',
    accentColor: '#10B981',
    gradient:
      'linear-gradient(105deg, rgba(16,185,129,0.20) 0%, rgba(209,250,229,0.10) 30%, transparent 70%)',
  },
]

const GLASS_CARD_SHADOW = [
  '0 10px 32px rgba(15,23,42,0.08)',
  '0 2px 8px rgba(15,23,42,0.04)',
  'inset 0 1.5px 0 rgba(255,255,255,0.95)',
  'inset 0 -1.5px 3px rgba(15,23,42,0.04)',
  'inset 0 0 0 1px rgba(255,255,255,0.55)',
].join(', ')

export function StatCards({ totalActive, inactiveCount, inductionCount, maintenanceCount }: StatCardsProps) {
  const values: Record<StatDefinition['key'], number> = {
    active: totalActive,
    inactive: inactiveCount,
    induction: inductionCount,
    maintenance: maintenanceCount,
  }

  return (
    <div className="grid grid-cols-4 gap-3">
      {STAT_DEFINITIONS.map((stat) => {
        const Icon = stat.icon
        return (
          <div
            key={stat.key}
            className="group relative flex items-center gap-3.5 overflow-hidden rounded-xl bg-white/30 px-6 py-4 backdrop-blur-xl transition-all duration-300"
            style={{
              boxShadow: GLASS_CARD_SHADOW,
              backdropFilter: 'blur(20px) saturate(150%)',
              WebkitBackdropFilter: 'blur(20px) saturate(150%)',
              backgroundImage: stat.gradient,
            }}
          >
            {stat.customIcon ? (
              <div className="relative z-10 shrink-0 flex items-center justify-center">
                {stat.customIcon}
              </div>
            ) : Icon ? (
              <div className={cn('relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', stat.iconBg)}>
                <Icon size={18} className={stat.color} />
              </div>
            ) : null}
            <div className="relative z-10 flex flex-1 items-baseline gap-2.5 min-w-0">
              <span className="text-3xl font-bold leading-none text-(--text) shrink-0">{values[stat.key]}</span>
              <div className="text-[0.72rem] font-medium leading-tight text-(--text-muted)">{stat.label}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
