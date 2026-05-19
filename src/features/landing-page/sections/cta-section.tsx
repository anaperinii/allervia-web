import { MarketingCTA, Reveal } from '@/shared/components'

export function CtaSection() {
  return (
    <section className="py-24 px-[5%] text-center relative overflow-hidden">
      {/* Top seam (from TabsSection bottom) */}
      <div className="pointer-events-none absolute -top-32 -left-16 w-100 h-100 rounded-full bg-linear-to-br from-teal-200/25 to-cyan-200/20 blur-3xl" />
      <div className="pointer-events-none absolute -top-28 -right-20 w-95 h-95 rounded-full bg-teal-100/15 blur-3xl" />
      {/* Bottom corners */}
      <div className="pointer-events-none absolute -bottom-20 -left-32 w-100 h-100 rounded-full bg-cyan-200/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-32 w-100 h-100 rounded-full bg-teal-300/10 blur-3xl" />
      <Reveal className="relative">
        <h2 className="text-[clamp(1.5rem,3vw,2.3rem)] font-extrabold tracking-[-0.5px] leading-[1.15] max-w-160 mx-auto mb-5 bg-[linear-gradient(135deg,var(--text),var(--color-teal-700))] bg-clip-text [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
          Gestão imunoterápica com controle e precisão
        </h2>
        <p className="text-base text-(--text-muted) max-w-110 mx-auto mb-10 leading-[1.7]">
          Comece gratuitamente. Sem cartão de crédito. Cancele quando quiser.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <MarketingCTA to="/trial" variant="filled">
            Começar agora
          </MarketingCTA>
          <MarketingCTA
            href="https://wa.me/5562995571423?text=Ol%C3%A1%21%20Gostaria%20de%20falar%20com%20um%20especialista%20do%20ImuneCare."
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
