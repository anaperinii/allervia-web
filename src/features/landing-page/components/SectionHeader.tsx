import { cn } from '@/shared/lib/cn'

interface SectionHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  tone?: 'light' | 'dark'
  align?: 'left' | 'center'
  titleMaxWidth?: string
  descriptionMaxWidth?: string
}

const EYEBROW_TONE: Record<'light' | 'dark', string> = {
  light: 'text-[color:var(--ll-accent-strong)]',
  dark: 'text-white',
}

const TITLE_TONE: Record<'light' | 'dark', string> = {
  light: 'text-[color:var(--ll-ink)]',
  dark: 'text-white',
}

const DESCRIPTION_TONE: Record<'light' | 'dark', string> = {
  light: 'text-[color:var(--ll-ink-muted)]',
  dark: 'text-white/70',
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  tone = 'light',
  align = 'left',
  titleMaxWidth = 'max-w-160',
  descriptionMaxWidth = 'max-w-130',
}: SectionHeaderProps) {
  const centered = align === 'center'
  return (
    <div className={cn(centered && 'text-center mx-auto', centered && titleMaxWidth)}>
      {eyebrow && (
        <span className={cn('inline-flex items-center gap-2.5 text-[0.75rem] font-bold tracking-[2px] uppercase mb-4', EYEBROW_TONE[tone])}>
          <span className="opacity-45">[</span>
          {eyebrow}
          <span className="opacity-45">]</span>
        </span>
      )}
      <h2
        className={cn(
          'text-[clamp(1.4rem,2.8vw,2.4rem)] font-medium tracking-tight leading-[1.15]',
          TITLE_TONE[tone],
          !centered && titleMaxWidth,
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            'text-base leading-[1.7] mt-3',
            DESCRIPTION_TONE[tone],
            !centered && descriptionMaxWidth,
            centered && `${descriptionMaxWidth} mx-auto`,
          )}
        >
          {description}
        </p>
      )}
    </div>
  )
}
