import { Heart } from 'lucide-react'
import { AllerviaLogo } from '@/features/landing-page/components/AllerviaLogo'
import { FOOTER_COLUMNS } from '@/features/landing-page/constants/footer-columns'

export function Footer() {
  return (
    <footer
      className="border-t"
      style={{
        background: 'var(--ll-bg-foot)',
        borderColor: 'var(--ll-border)',
        color: 'var(--ll-ink)',
      }}
    >
      <div className="pt-20 pb-10 px-[5%]">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-8 sm:gap-12 mb-12">
        <div>
          <div className="mb-4">
            <AllerviaLogo size={32} color="var(--ll-accent-strong)" />
          </div>
          <div className="text-[1.3rem] font-semibold tracking-[2px] mb-4" style={{ color: 'var(--ll-ink)' }}>
            ALLERVIA
          </div>
          <p className="text-[0.875rem] leading-[1.7] max-w-72" style={{ color: 'var(--ll-ink-muted)' }}>
            Plataforma completa para gestão de protocolos de imunoterapia alérgica. Feito para clínicas, por engenheiros de software.
          </p>
        </div>

        {FOOTER_COLUMNS.map((column) => (
          <div key={column.title}>
            <h4 className="text-[0.85rem] font-semibold mb-4 tracking-wide uppercase" style={{ color: 'var(--ll-ink)' }}>
              {column.title}
            </h4>
            <ul className="list-none flex flex-col gap-2.5">
              {column.links.map((link) => (
                <li key={link.label}>
                  {link.href ? (
                    <a
                      href={link.href}
                      className="text-[0.85rem] no-underline transition-colors duration-200"
                      style={{ color: 'var(--ll-ink-muted)' }}
                    >
                      {link.label}
                    </a>
                  ) : (
                    <span
                      aria-disabled="true"
                      className="text-[0.85rem] cursor-default"
                      style={{ color: 'var(--ll-ink-tertiary)' }}
                    >
                      {link.label}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div
        className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t gap-3"
        style={{ borderColor: 'var(--ll-border)' }}
      >
        <p className="text-[0.8rem]" style={{ color: 'var(--ll-ink-muted)' }}>
          &copy; {new Date().getFullYear()} Allervia. Todos os direitos reservados.
        </p>
        <p className="text-[0.8rem] inline-flex items-center gap-1" style={{ color: 'var(--ll-ink-muted)' }}>
          Feito com <Heart size={13} className="fill-current" style={{ color: 'var(--ll-accent)' }} /> para a alergologia brasileira
        </p>
      </div>
      </div>

      <div
        aria-hidden="true"
        style={{
          position: 'relative',
          overflow: 'hidden',
          textAlign: 'center',
          lineHeight: 0,
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            bottom: 0,
            zIndex: 1,
            width: '50%',
            height: '115%',
            pointerEvents: 'none',
            backgroundImage:
              'radial-gradient(circle, var(--ll-ink) 1.4px, transparent 1.9px)',
            backgroundSize: '15px 15px',
            backgroundPosition: 'left bottom',
            opacity: 0.42,
            WebkitMaskImage:
              'radial-gradient(72% 118% at 0% 100%, #000 0%, rgba(0,0,0,0.42) 30%, transparent 62%)',
            maskImage:
              'radial-gradient(72% 118% at 0% 100%, #000 0%, rgba(0,0,0,0.42) 30%, transparent 62%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            zIndex: 1,
            width: '50%',
            height: '115%',
            pointerEvents: 'none',
            backgroundImage:
              'radial-gradient(circle, var(--ll-ink) 1.4px, transparent 1.9px)',
            backgroundSize: '15px 15px',
            backgroundPosition: 'right bottom',
            opacity: 0.42,
            WebkitMaskImage:
              'radial-gradient(72% 118% at 100% 100%, #000 0%, rgba(0,0,0,0.42) 30%, transparent 62%)',
            maskImage:
              'radial-gradient(72% 118% at 100% 100%, #000 0%, rgba(0,0,0,0.42) 30%, transparent 62%)',
          }}
        />
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            zIndex: 2,
            display: 'block',
            textAlign: 'center',
            fontSize: 'clamp(110px, 27vw, 520px)',
            fontWeight: 500,
            letterSpacing: '-0.04em',
            lineHeight: 0.8,
            whiteSpace: 'nowrap',
            paddingTop: '0.08em',
            marginBottom: '-0.16em',
            color: 'var(--ll-bg-foot-mark)',
          }}
        >
          Allervia
        </span>
        <span
          style={{
            position: 'relative',
            zIndex: 3,
            display: 'block',
            fontSize: 'clamp(110px, 27vw, 520px)',
            fontWeight: 500,
            letterSpacing: '-0.04em',
            lineHeight: 0.8,
            whiteSpace: 'nowrap',
            paddingTop: '0.08em',
            marginBottom: '-0.16em',
            color: 'var(--ll-ink)',
            opacity: 0.09,
            WebkitMaskImage:
              'linear-gradient(to bottom, #000 0%, #000 30%, rgba(0,0,0,0.12) 100%)',
            maskImage:
              'linear-gradient(to bottom, #000 0%, #000 30%, rgba(0,0,0,0.12) 100%)',
          }}
        >
          Allervia
        </span>
      </div>
    </footer>
  )
}
