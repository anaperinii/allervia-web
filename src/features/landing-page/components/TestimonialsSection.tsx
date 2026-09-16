import { useMemo } from 'react'
import { Reveal } from './Reveal'
import { SectionHeader } from '@/features/landing-page/components/SectionHeader'
import { TESTIMONIALS, type Testimonial } from '@/features/landing-page/constants/testimonials'

function TestimonialCard({ quote, name }: Testimonial) {
  return (
    <div
      className="flex w-80 shrink-0 flex-col rounded-2xl p-6"
      style={{
        background: 'var(--ll-surface-grad-strong)',
        border: '1px solid var(--ll-border)',
        boxShadow: 'var(--ll-shadow-card-soft)',
      }}
    >
      <blockquote className="text-[0.875rem] leading-[1.7] mb-5" style={{ color: 'var(--ll-ink)' }}>
        &ldquo;{quote}&rdquo;
      </blockquote>
      <div className="mt-auto text-[0.85rem] font-semibold" style={{ color: 'var(--ll-accent-strong)' }}>
        {name}
      </div>
    </div>
  )
}

export function TestimonialsSection() {
  const marqueeItems = useMemo(() => [...TESTIMONIALS, ...TESTIMONIALS], [])
  const backRowItems = useMemo(() => {
    const shifted = [...TESTIMONIALS.slice(3), ...TESTIMONIALS.slice(0, 3)]
    return [...shifted, ...shifted]
  }, [])

  return (
    <section
      id="testimonials"
      className="overflow-hidden py-24 relative"
      style={{ background: 'var(--ll-bg)' }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{
          top: '50%',
          left: '50%',
          width: '70vmax',
          height: '70vmax',
          background: 'radial-gradient(circle, var(--ll-halo-soft), transparent 62%)',
          transform: 'translate(-50%, -50%)',
          animation: 'av-drift-3 28s ease-in-out infinite',
        }}
      />

      <Reveal className="px-[5%] pb-12 relative">
        <SectionHeader eyebrow="Depoimentos" title="Quem usa, recomenda" align="center" />
      </Reveal>

      <div
        className="flex items-stretch gap-6 hover:paused relative"
        style={{
          animation: 'scroll-left 30s linear infinite',
          width: 'max-content',
        }}
      >
        {marqueeItems.map((testimonial, index) => (
          <TestimonialCard key={`${testimonial.initials}-${index}`} {...testimonial} />
        ))}
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -bottom-24"
        style={{ opacity: 0.6 }}
      >
        <div
          className="flex items-stretch gap-6"
          style={{ animation: 'scroll-left 46s linear infinite', width: 'max-content' }}
        >
          {backRowItems.map((testimonial, index) => (
            <TestimonialCard key={`back-${testimonial.initials}-${index}`} {...testimonial} />
          ))}
        </div>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-56"
        style={{
          backdropFilter: 'blur(7px)',
          WebkitBackdropFilter: 'blur(7px)',
          maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.35) 45%, #000 90%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.35) 45%, #000 90%)',
        }}
      />
    </section>
  )
}
