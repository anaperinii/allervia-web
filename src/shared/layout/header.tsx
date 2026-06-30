import { useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { AllerviaLogo } from '@/features/landing-page/components/AllerviaLogo'
import { cn } from '@/shared/lib/cn'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { label: 'Funcionalidades', href: '#features' },
  { label: 'Sobre', href: '#about' },
  { label: 'Preços', href: '#pricing' },
  { label: 'Depoimentos', href: '#testimonials' },
]

interface HeaderProps {
  isAuthPage?: boolean
  hasHero?: boolean
}

export function Header({ isAuthPage = false, hasHero = false }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false)
  const [pastHero, setPastHero] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.scrollY > window.innerHeight - 80
  })
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
      setPastHero(window.scrollY > window.innerHeight - 80)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isTransparent = (hasHero && !pastHero) || isAuthPage
  const showShadow = !isTransparent && scrolled

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileMenuOpen])

  return (
    <>
      <nav
        className={cn(
          'fixed top-0 left-0 right-0 z-100 flex items-center justify-between px-[5%] h-17 transition-all duration-500 ease-out border-b',
          isTransparent ? '' : 'backdrop-blur-xl',
          showShadow ? 'border-white/8' : 'border-transparent',
        )}
        style={{
          background: isTransparent
            ? 'transparent'
            : 'rgba(8,25,29,0.85)',
          animation: 'header-rise 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both',
        }}
      >
        <Link to="/" className="relative flex items-center gap-2.5 no-underline" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <AllerviaLogo size={28} color="#9BC1C4" />
          <span className="relative text-xl font-semibold tracking-[2px]" style={{ color: '#DCE1E5' }}>
            ALLERVIA
          </span>
        </Link>

        {!isAuthPage && (
          <ul className="hidden md:flex gap-8 list-none">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-sm font-medium no-underline transition-colors duration-200 relative after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:transition-all after:duration-300 hover:after:w-full"
                  style={{
                    color: 'rgba(220,225,229,0.65)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#DCE1E5' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(220,225,229,0.65)' }}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        )}

        <div className="hidden md:flex gap-2.5 items-center">
          <Link
            to="/login"
            className="px-5 py-1.5 rounded-full text-[0.8rem] font-medium cursor-pointer transition-all duration-200 no-underline"
            style={{
              border: '1.5px solid rgba(220,225,229,0.2)',
              color: 'rgba(220,225,229,0.85)',
              background: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(220,225,229,0.4)'
              e.currentTarget.style.color = '#DCE1E5'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(220,225,229,0.2)'
              e.currentTarget.style.color = 'rgba(220,225,229,0.85)'
            }}
          >
            Log in
          </Link>
          <Link
            to="/trial"
            className="px-5 py-1.5 rounded-full text-[0.8rem] font-semibold cursor-pointer transition-all duration-200 no-underline hover:-translate-y-px"
            style={{
              background:
                'linear-gradient(180deg, rgba(255,255,255,0.45), rgba(255,255,255,0.08) 44%, rgba(255,255,255,0) 56%), #6C9EA5',
              color: '#06232a',
              boxShadow: '0 6px 18px rgba(108,158,165,0.30), inset 0 1px 0 rgba(255,255,255,0.4)',
            }}
          >
            Começar agora
          </Link>
        </div>

        <button
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl border transition-all duration-200"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Menu"
          style={{
            border: '1px solid rgba(220,225,229,0.18)',
            background: 'rgba(8,25,29,0.6)',
            color: '#DCE1E5',
          }}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      <div
        className={cn(
          'fixed inset-0 z-99 backdrop-blur-sm transition-opacity duration-300 md:hidden',
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
        style={{ background: 'rgba(0,0,0,0.5)' }}
        onClick={() => setMobileMenuOpen(false)}
      />

      <div
        className={cn(
          'fixed top-17 left-0 right-0 z-99 backdrop-blur-xl border-b transition-all duration-300 md:hidden',
          mobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none',
        )}
        style={{
          background: 'rgba(8,25,29,0.95)',
          borderColor: 'rgba(220,225,229,0.1)',
        }}
      >
        <div className="flex flex-col p-6 gap-2">
          {!isAuthPage && navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium no-underline py-3 px-4 rounded-xl transition-all duration-200"
              style={{ color: 'rgba(220,225,229,0.85)' }}
            >
              {link.label}
            </a>
          ))}
          <div className={cn('flex flex-col gap-3', !isAuthPage && 'mt-4 pt-4 border-t border-white/10')}>
            <Link
              to="/login"
              className="text-center px-4 py-2.5 rounded-full text-sm font-semibold no-underline"
              style={{
                border: '1.5px solid rgba(220,225,229,0.2)',
                color: 'rgba(220,225,229,0.85)',
              }}
            >
              Log in
            </Link>
            <Link
              to="/trial"
              className="text-center px-4 py-2.5 rounded-full text-sm font-semibold no-underline"
              style={{
                background:
                  'linear-gradient(180deg, rgba(255,255,255,0.45), rgba(255,255,255,0.08) 44%, rgba(255,255,255,0) 56%), #6C9EA5',
                color: '#06232a',
                boxShadow: '0 6px 18px rgba(108,158,165,0.30)',
              }}
            >
              Começar agora
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
