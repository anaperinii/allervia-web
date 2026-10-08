import { cn } from '@/shared/lib/cn'

interface SectionHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  align?: 'left' | 'center'
  titleMaxWidth?: string
  descriptionMaxWidth?: string
}

const EYEBROW_TONE = 'text-[color:var(--ll-accent-strong)]'
const TITLE_TONE = 'text-[color:var(--ll-ink)]'
const DESCRIPTION_TONE = 'text-[color:var(--ll-ink-muted)]'

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'left',
  titleMaxWidth = 'max-w-160',
  descriptionMaxWidth = 'max-w-130',
}: SectionHeaderProps) {
  const centered = align === 'center'
  return (
    <div className={cn(centered && 'text-center mx-auto', centered && titleMaxWidth)}>
      {eyebrow && (
        <span className={cn('inline-flex items-center gap-2.5 text-[0.75rem] font-bold tracking-[2px] uppercase mb-4', EYEBROW_TONE)}>
          <span className="opacity-45">[</span>
          {eyebrow}
          <span className="opacity-45">]</span>
        </span>
      )}
      <h2
        className={cn(
          'text-[clamp(1.6rem,3.2vw,2.6rem)] font-medium tracking-tight leading-[1.15]',
          TITLE_TONE,
          !centered && titleMaxWidth,
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            'text-base leading-[1.7] mt-3',
            DESCRIPTION_TONE,
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
