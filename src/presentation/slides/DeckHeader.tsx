interface DeckHeaderProps {
  eyebrow: string
  title: string
  description?: string
  tone?: 'light' | 'dark'
}

const TONE = {
  light: {
    eyebrow: 'text-teal-600',
    divider: 'linear-gradient(to right, transparent 0%, rgba(100, 116, 139, 0.5) 50%, transparent 100%)',
    title: 'text-slate-800',
    description: 'text-(--text-muted)',
  },
  dark: {
    eyebrow: 'text-brand-light',
    divider: 'linear-gradient(to right, transparent 0%, rgba(226, 232, 240, 0.35) 50%, transparent 100%)',
    title: 'text-white',
    description: 'text-white/60',
  },
} as const

export function DeckHeader({ eyebrow, title, description, tone = 'light' }: DeckHeaderProps) {
  const t = TONE[tone]
  return (
    <div className="text-center">
      <div className={`text-[0.78rem] font-bold uppercase tracking-[2.5px] ${t.eyebrow}`}>{eyebrow}</div>

      <div aria-hidden="true" className="mx-auto my-5 h-px w-40" style={{ background: t.divider }} />

      <h2 className={`mx-auto text-[clamp(1.4rem,2.8vw,2.1rem)] font-extrabold leading-[1.15] tracking-[-0.5px] ${t.title}`}>
        {title}
      </h2>

      {description && (
        <p className={`mx-auto mt-3 whitespace-nowrap text-base leading-[1.7] ${t.description}`}>
          {description}
        </p>
      )}
    </div>
  )
}
