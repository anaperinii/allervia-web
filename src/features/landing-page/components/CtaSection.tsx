import { MarketingCTA } from './MarketingCta'
import { Reveal } from './Reveal'
import { CONTACT_WHATSAPP_SPECIALIST_URL } from '@/shared/constants/contact'

export function CtaSection() {
  return (
    <section
      className="py-28 px-[5%] text-center relative overflow-hidden"
      style={{ background: 'var(--ll-bg)' }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle, var(--ll-dot) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          maskImage: 'radial-gradient(ellipse at center, black, transparent 70%)',
          opacity: 0.5,
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{
          top: '50%',
          left: '50%',
          width: '60vmax',
          height: '60vmax',
          background: 'radial-gradient(circle, var(--ll-halo-accent-strong), transparent 60%)',
          transform: 'translate(-50%, -50%)',
          animation: 'av-drift-1 26s ease-in-out infinite',
        }}
      />

      <Reveal className="relative max-w-3xl mx-auto">
        <h2
          className="text-[clamp(1.6rem,3.2vw,2.6rem)] font-light tracking-tight leading-[1.15] max-w-160 mx-auto mb-5"
          style={{ color: 'var(--ll-ink)' }}
        >
          Gestão imunoterápica alérgica com controle e precisão
        </h2>
        <p
          className="text-base max-w-125 mx-auto mb-10 leading-[1.7]"
          style={{ color: 'var(--ll-ink-muted)' }}
        >
          Agende uma demonstração personalizada e veja como o Allervia se adapta ao fluxo clínico
          da sua equipe. Sem compromisso, direto com quem entende do dia a dia da imunoterapia.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <MarketingCTA to="/trial" variant="filled">
            Solicitar demonstração
          </MarketingCTA>
          <MarketingCTA
            href={CONTACT_WHATSAPP_SPECIALIST_URL}
            target="_blank"
            rel="noopener noreferrer"
            variant="outline"
          >
            Falar com especialista
          </MarketingCTA>
        </div>
      </Reveal>
    </section>
  )
}
