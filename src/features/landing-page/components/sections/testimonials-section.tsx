import { useMemo } from 'react'
import { Blob, Reveal } from '@/shared/components'
import { SectionHeader } from '@/features/landing-page/components/section-header'
import { TESTIMONIALS, type Testimonial } from '@/features/landing-page/constants/testimonials'

function TestimonialCard({ quote, name, handle, initials }: Testimonial) {
  return (
    <div className="w-75 shrink-0 bg-(--card) border-[1.5px] border-(--border-custom) rounded-(--radius) p-6">
      <blockquote className="text-[0.875rem] text-(--text-muted) leading-[1.6] mb-4">
        &ldquo;{quote}&rdquo;
      </blockquote>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-linear-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-[0.75rem] font-bold text-white">
          {initials}
        </div>
        <div>
          <div className="text-[0.85rem] font-bold">{name}</div>
          <div className="text-[0.75rem] text-(--text-muted)">{handle}</div>
        </div>
      </div>
    </div>
  )
}

export function TestimonialsSection() {

  const marqueeItems = useMemo(() => [...TESTIMONIALS, ...TESTIMONIALS], [])

  return (
    <section id="testimonials" className="overflow-hidden py-20 relative">
      <Blob className="-top-32 -left-16 w-95 h-95 bg-cyan-100/25" />
      <Blob className="-top-28 -right-24 w-105 h-105 bg-teal-200/20" />
      <Blob className="top-1/2 right-1/4 w-75 h-75 bg-teal-200/20" />
      <Blob className="-bottom-28 -left-20 w-95 h-95 bg-teal-200/20" />
      <Blob className="-bottom-32 -right-20 w-100 h-100 bg-cyan-100/25" />

      <Reveal className="px-[5%] pb-12 relative">
        <SectionHeader eyebrow="Depoimentos" title="Quem usa, recomenda" />
      </Reveal>

      <div
        className="flex gap-6 hover:paused"
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
