import { cn } from '@/shared/lib/utils'

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
  light: 'text-teal-600 bg-teal-50 border border-teal-200',
  dark: 'text-white bg-white/15 border border-white/20',
}

const TITLE_TONE: Record<'light' | 'dark', string> = {
  light: '',
  dark: 'text-white',
}

const DESCRIPTION_TONE: Record<'light' | 'dark', string> = {
  light: 'text-(--text-muted)',
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
        <span className={cn('inline-block text-[0.75rem] font-bold tracking-[2px] uppercase px-4 py-1.5 rounded-full mb-4', EYEBROW_TONE[tone])}>
          {eyebrow}
        </span>
      )}
      <h2
        className={cn(
          'text-[clamp(1.4rem,2.8vw,2.1rem)] font-extrabold tracking-[-0.5px] leading-[1.15]',
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
