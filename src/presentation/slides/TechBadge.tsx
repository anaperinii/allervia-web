import type { TechBadge as TechBadgeData } from '@/presentation/constants/tech-stack'

export function TechBadge({ name, version, color, logo }: TechBadgeData) {
  return (
    <div
      className="group/card flex items-center gap-3.5 rounded-2xl border border-white/70 bg-white/70 px-5 py-3.5 backdrop-blur-md transition-all duration-300 opacity-100 group-hover/stack:opacity-40 hover:!opacity-100 hover:-translate-y-1.5 hover:scale-[1.04] hover:border-white"
      style={{
        boxShadow: '0 4px 24px rgba(13, 148, 136, 0.08), inset 0 1px 0 rgba(255,255,255,0.6)',
      }}
    >
      <span className="relative flex h-9 w-9 shrink-0 items-center justify-center">
        <span
          className="absolute inset-0 rounded-full opacity-10 transition-opacity duration-300 group-hover/card:opacity-25"
          style={{ background: color, filter: 'blur(8px)' }}
        />
        <img src={logo} alt={`${name} logo`} className="relative h-7 w-7 object-contain" />
      </span>

      <div className="flex flex-col gap-0.5">
        <span className="text-[0.9rem] font-bold tracking-tight text-slate-800 whitespace-nowrap">
          {name}
        </span>
        <span
          className="w-fit rounded-md px-1.5 py-px text-[0.6rem] font-semibold tabular-nums"
          style={{ color, background: `${color}1a` }}
        >
          v{version}
        </span>
      </div>
    </div>
  )
}
