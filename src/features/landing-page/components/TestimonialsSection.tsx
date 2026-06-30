import { useMemo } from 'react'
import { Reveal } from './Reveal'
import { SectionHeader } from '@/features/landing-page/components/SectionHeader'
import { TESTIMONIALS, type Testimonial } from '@/features/landing-page/constants/testimonials'

function TestimonialCard({ quote, name, handle, initials }: Testimonial) {
  return (
    <div
      className="w-80 shrink-0 rounded-2xl p-6"
      style={{
        background:
          'linear-gradient(160deg, rgba(220,225,229,0.07), rgba(220,225,229,0.018))',
        border: '1px solid rgba(220,225,229,0.13)',
        boxShadow: '0 24px 60px -24px rgba(0,0,0,0.6)',
      }}
    >
      <blockquote className="text-[0.875rem] leading-[1.7] mb-5" style={{ color: '#DCE1E5' }}>
        &ldquo;{quote}&rdquo;
      </blockquote>
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-[0.75rem] font-bold"
          style={{
            background:
              'linear-gradient(150deg, #4d7e85, #6C9EA5 55%, #06232a)',
            color: '#DCE1E5',
          }}
        >
          {initials}
        </div>
        <div>
          <div className="text-[0.85rem] font-semibold" style={{ color: '#DCE1E5' }}>
            {name}
          </div>
          <div className="text-[0.75rem]" style={{ color: '#7FA6AC' }}>
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
      style={{ background: '#08191d' }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{
          top: '50%',
          left: '50%',
          width: '70vmax',
          height: '70vmax',
          background: 'radial-gradient(circle, rgba(108,158,165,0.08), transparent 62%)',
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
