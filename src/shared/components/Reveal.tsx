import { useEffect, useRef, useState, type ReactNode, type ElementType, type CSSProperties, type HTMLAttributes } from 'react'
import { cn } from '@/shared/lib/utils'

interface RevealProps extends Omit<HTMLAttributes<HTMLElement>, 'children' | 'className' | 'style'> {
  children: ReactNode
  /** Fração do elemento que precisa estar visível para disparar (0–1). Default: `0.1`. */
  threshold?: number
  /** Margem em torno do viewport (CSS length). Default: `'0px'`. */
  rootMargin?: string
  /** Delay antes da transição começar, em milissegundos. */
  delay?: number
  /** Tag HTML a renderizar. Default: `'div'`. */
  as?: ElementType
  className?: string
  style?: CSSProperties
}

/**
 * Revela o conteúdo com fade-in + slide-up quando o elemento entra no viewport.
 * Above-the-fold dispara imediatamente no mount (já está visível); abaixo dispara
 * no scroll. Observer é desconectado após o primeiro disparo — animação é one-shot.
 *
 * A animação é definida no CSS global (`.reveal` + `.reveal.visible` em `index.css`).
 */
export function Reveal({
  children,
  threshold = 0.1,
  rootMargin = '0px',
  delay,
  as: Tag = 'div',
  className,
  style,
  ...rest
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold, rootMargin },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, rootMargin])

  const mergedStyle = delay !== undefined ? { ...style, transitionDelay: `${delay}ms` } : style

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Tag {...rest} ref={ref as any} className={cn('reveal', visible && 'visible', className)} style={mergedStyle}>
      {children}
    </Tag>
  )
}
