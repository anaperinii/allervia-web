import { useMemo } from 'react'
import { Reveal } from './Reveal'
import { SectionHeader } from '@/features/landing-page/components/SectionHeader'
import { TESTIMONIALS, type Testimonial } from '@/features/landing-page/constants/testimonials'

function TestimonialCard({ quote, name, handle, initials }: Testimonial) {
  return (
    <div
      className="w-80 shrink-0 rounded-2xl p-6"
      style={{
        background: 'var(--ll-surface-grad-strong)',
        border: '1px solid var(--ll-border)',
        boxShadow: 'var(--ll-shadow-card-soft)',
      }}
    >
      <blockquote className="text-[0.875rem] leading-[1.7] mb-5" style={{ color: 'var(--ll-ink)' }}>
        &ldquo;{quote}&rdquo;
      </blockquote>
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-[0.75rem] font-bold"
          style={{
            background:
              'linear-gradient(150deg, #9BC1C4, #6C9EA5 50%, #4d7e85)',
            color: '#ffffff',
          }}
        >
          {initials}
        </div>
        <div>
          <div className="text-[0.85rem] font-semibold" style={{ color: 'var(--ll-ink)' }}>
            {name}
          </div>
          <div className="text-[0.75rem]" style={{ color: 'var(--ll-ink-muted)' }}>
            {handle}
          </div>
        </div>
      </div>
    </div>
  )
}

export function TestimonialsSection() {
  const marqueeItems = useMemo(() => [...TESTIMONIALS, ...TESTIMONIALS], [])

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
        className="flex gap-6 hover:paused relative"
        style={{
          animation: 'scroll-left 30s linear infinite',
          width: 'max-content',
        }}
      >
        {marqueeItems.map((testimonial, index) => (
          <TestimonialCard key={`${testimonial.initials}-${index}`} {...testimonial} />
        ))}
      </div>
    </section>
  )
}
