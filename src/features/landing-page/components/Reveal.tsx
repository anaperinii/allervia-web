import { useEffect, useRef, useState, type ReactNode, type ElementType, type CSSProperties, type HTMLAttributes } from 'react'
import { cn } from '@/shared/lib/utils'

interface RevealProps extends Omit<HTMLAttributes<HTMLElement>, 'children' | 'className' | 'style'> {
  children: ReactNode

  threshold?: number

  rootMargin?: string

  delay?: number

  as?: ElementType
  className?: string
  style?: CSSProperties
}

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

    <Tag {...rest} ref={ref as any} className={cn('reveal', visible && 'visible', className)} style={mergedStyle}>
      {children}
    </Tag>
  )
}
