import { Heart } from 'lucide-react'
import allerviaMarkWhite from '@/assets/allervia-mark-dark.png'
import allerviaMarkBlack from '@/assets/allervia-mark-light.png'
import { AllerviaWordmark } from '@/shared/components/AllerviaWordmark'
import { useLandingTheme } from '@/features/landing-page/theme-context'
import { FOOTER_COLUMNS } from '@/features/landing-page/constants/footer-columns'

export function Footer() {
  const { theme } = useLandingTheme()
  const isLight = theme === 'light'
  const markSrc = isLight ? allerviaMarkBlack : allerviaMarkWhite
  return (
    <footer
      className="border-t"
      style={{
        background: 'var(--ll-bg-foot)',
        borderColor: 'var(--ll-border)',
        color: 'var(--ll-ink)',
      }}
    >
      <div className="pt-14 pb-8 px-[5%]">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-8 sm:gap-12 mb-12">
        <div>
          <div className="mb-4 flex items-center gap-2.5">
            <img src={markSrc} alt="" className={isLight ? 'h-9 w-9 object-contain' : 'h-11 w-11 object-contain'} />
            <AllerviaWordmark className="text-2xl" style={{ color: 'var(--ll-ink)' }} />
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
                      className="text-[0.85rem] no-underline transition-all duration-200 hover:translate-x-0.5"
                      style={{ color: 'var(--ll-ink-muted)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--ll-ink-strong)'
                        e.currentTarget.style.textShadow = '0 0 12px var(--ll-halo-accent-strong)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--ll-ink-muted)'
                        e.currentTarget.style.textShadow = 'none'
                      }}
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
          marginTop: '1.5rem',
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
            position: 'relative',
            zIndex: 3,
            display: 'block',
            textAlign: 'center',
            fontSize: 'clamp(110px, 27vw, 520px)',
            fontWeight: 600,
            textTransform: 'lowercase',
            letterSpacing: '-0.03em',
            lineHeight: 0.8,
            whiteSpace: 'nowrap',
            color: 'var(--ll-ink)',
            opacity: isLight ? 0.08 : 0.06,
            transform: 'translateY(10%)',
            transformOrigin: 'center bottom',
            WebkitMaskImage:
              'linear-gradient(to bottom, #000 0%, #000 30%, rgba(0,0,0,0.12) 100%)',
            maskImage:
              'linear-gradient(to bottom, #000 0%, #000 30%, rgba(0,0,0,0.12) 100%)',
          }}
        >
          allervia
        </span>
      </div>
    </footer>
  )
}
