import { MarketingCTA } from './MarketingCta'
import { Reveal } from './Reveal'
import { CONTACT_WHATSAPP_SPECIALIST_URL } from '@/shared/constants/contact'

export function CtaSection() {
  return (
    <section
      className="py-28 px-[5%] text-center relative overflow-hidden"
      style={{ background: '#08191d' }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(155,193,196,0.10) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          maskImage: 'radial-gradient(ellipse at center, black, transparent 70%)',
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
          background: 'radial-gradient(circle, rgba(108,158,165,0.12), transparent 60%)',
          transform: 'translate(-50%, -50%)',
          animation: 'av-drift-1 26s ease-in-out infinite',
        }}
      />

      <Reveal className="relative max-w-3xl mx-auto">
        <h2
          className="text-[clamp(1.6rem,3.2vw,2.6rem)] font-light tracking-tight leading-[1.15] max-w-160 mx-auto mb-5"
          style={{ color: '#DCE1E5' }}
        >
          Gestão imunoterápica com controle e precisão
        </h2>
        <p
          className="text-base max-w-110 mx-auto mb-10 leading-[1.7]"
          style={{ color: '#7FA6AC' }}
        >
          Comece gratuitamente. Sem cartão de crédito. Cancele quando quiser.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <MarketingCTA to="/trial" variant="filled">
            Começar agora
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
