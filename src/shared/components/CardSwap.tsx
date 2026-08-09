import React, {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  type ReactElement,
  type ReactNode,
  type RefObject,
  useEffect,
  useMemo,
  useRef,
} from 'react'
import gsap from 'gsap'
import { cn } from '@/shared/lib/cn'

export interface CardSwapProps {
  width?: number | string
  height?: number | string
  cardDistance?: number
  verticalDistance?: number
  onCardClick?: (idx: number) => void
  skewAmount?: number
  active: number
  className?: string
  children: ReactNode
}

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  customClass?: string
}

export const Card = forwardRef<HTMLDivElement, CardProps>(({ customClass, className, ...rest }, ref) => (
  <div
    ref={ref}
    {...rest}
    className={cn(
      'absolute top-1/2 left-1/2 overflow-hidden rounded-xl transform-3d will-change-transform backface-hidden',
      customClass,
      className,
    )}
  />
))
Card.displayName = 'Card'

type CardRef = RefObject<HTMLDivElement | null>
interface Slot {
  x: number
  y: number
  z: number
  zIndex: number
}

const makeSlot = (i: number, distX: number, distY: number, total: number): Slot => ({
  x: i * distX,
  y: -i * distY,
  z: -i * distX * 1.5,
  zIndex: total - i,
})

const placeNow = (el: HTMLElement, slot: Slot, skew: number) =>
  gsap.set(el, {
    x: slot.x,
    y: slot.y,
    z: slot.z,
    xPercent: -50,
    yPercent: -50,
    skewY: skew,
    transformOrigin: 'center center',
    zIndex: slot.zIndex,
    force3D: true,
  })

export const CardSwap: React.FC<CardSwapProps> = ({
  width = 500,
  height = 400,
  cardDistance = 60,
  verticalDistance = 70,
  onCardClick,
  skewAmount = 6,
  active,
  className,
  children,
}) => {
  const childArr = useMemo(() => Children.toArray(children) as ReactElement<CardProps>[], [children])
  const refs = useMemo<CardRef[]>(
    () => childArr.map(() => React.createRef<HTMLDivElement>()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [childArr.length],
  )

  const order = useRef<number[]>(Array.from({ length: childArr.length }, (_, i) => i))
  const tlRef = useRef<gsap.core.Timeline | null>(null)
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const total = refs.length
    if (!total) return
    refs.forEach((r, i) =>
      placeNow(r.current!, makeSlot(i, cardDistance, verticalDistance, total), skewAmount),
    )
  }, [cardDistance, verticalDistance, skewAmount, refs])

  useEffect(() => {
    const total = refs.length
    if (!total || order.current[0] === active) return

    tlRef.current?.kill()

    const from = order.current.indexOf(active)
    if (from === -1) return
    order.current = [...order.current.slice(from), ...order.current.slice(0, from)]

    const demoted = order.current.slice(-from)
    const tl = gsap.timeline()
    tlRef.current = tl

    demoted.forEach((cardIdx, i) => {
      const el = refs[cardIdx].current
      if (!el) return
      tl.to(el, { y: '+=500', duration: 0.45, ease: 'power2.in' }, i * 0.06)
    })

    order.current.forEach((cardIdx, position) => {
      const el = refs[cardIdx].current
      if (!el) return
      const slot = makeSlot(position, cardDistance, verticalDistance, total)
      const isDemoted = demoted.includes(cardIdx)
      const at = isDemoted ? 0.34 : 0.18
      tl.set(el, { zIndex: slot.zIndex }, at)
      tl.to(el, { x: slot.x, y: slot.y, z: slot.z, duration: 0.6, ease: 'power3.out' }, at)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, refs, cardDistance, verticalDistance])

  const rendered = childArr.map((child, i) =>
    isValidElement<CardProps>(child)
      ? cloneElement(child, {
          key: i,
          ref: refs[i],
          style: { width, height, ...(child.props.style ?? {}) },
          onClick: (e: React.MouseEvent<HTMLDivElement>) => {
            child.props.onClick?.(e)
            onCardClick?.(i)
          },
        } as CardProps & React.RefAttributes<HTMLDivElement>)
      : child,
  )

  return (
    <div
      ref={container}
      className={cn('relative perspective-[900px] overflow-visible', className)}
      style={{ width, height }}
    >
      {rendered}
    </div>
  )
}

export default CardSwap
