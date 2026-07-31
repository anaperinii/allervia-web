import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { Reveal } from './Reveal'
import { SectionHeader } from '@/features/landing-page/components/SectionHeader'
import { useLandingTheme } from '@/features/landing-page/theme-context'
import { PRODUCT_TABS, type TabId } from '@/features/landing-page/constants/tabs'

export function TabsSection() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard')
  const [visited, setVisited] = useState<Set<TabId>>(() => new Set(['dashboard']))
  const [direction, setDirection] = useState<1 | -1>(1)

  const handleSelectTab = (id: TabId) => {
    if (id === activeTab) return
    const newIndex = PRODUCT_TABS.findIndex((t) => t.id === id)
    const currentIndex = PRODUCT_TABS.findIndex((t) => t.id === activeTab)
    setDirection(newIndex > currentIndex ? 1 : -1)
    setActiveTab(id)
    if (!visited.has(id)) {
      setVisited((prev) => new Set(prev).add(id))
    }
  }

  const activeIndex = PRODUCT_TABS.findIndex((t) => t.id === activeTab)
  const { theme } = useLandingTheme()
  const darkTheme = theme === 'dark'
  const frameBg = darkTheme ? 'rgba(224,240,238,0.045)' : 'rgba(18,51,58,0.05)'
  const frameBorder = darkTheme ? 'rgba(224,240,238,0.09)' : 'rgba(18,51,58,0.12)'
  const panelBorder = darkTheme ? 'rgba(224,240,238,0.1)' : 'rgba(18,51,58,0.16)'
  const panelBg = darkTheme ? '#101617' : '#eef2f3'
  const panelTabBorder = darkTheme ? 'rgba(224,240,238,0.07)' : 'rgba(18,51,58,0.1)'
  const tabActiveColor = darkTheme ? '#f2f6f6' : '#12333a'
  const tabIdleColor = darkTheme ? '#5e7376' : '#8299a0'

  return (
    <section
      className="py-24 px-[5%] relative overflow-hidden"
      style={{ background: 'var(--ll-bg)' }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{
          top: '40%',
          left: '20%',
          width: '60vmax',
          height: '60vmax',
          background: 'radial-gradient(circle, var(--ll-halo-soft), transparent 62%)',
          transform: 'translate(-50%, -50%)',
          animation: 'av-drift-2 30s ease-in-out infinite',
        }}
      />

      <Reveal className="mb-16 relative">
        <SectionHeader
          eyebrow="Aprofunde-se"
          title="Projetado para o fluxo clínico real"
          description="Cada funcionalidade reflete as necessidades reais de clínicas de imunoterapia alérgica."
          align="center"
          titleMaxWidth="max-w-150"
        />
      </Reveal>

      <div className="relative grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-10 lg:gap-14 items-center">
        {/* Left — numbered step list */}
        <Reveal className="relative lg:max-w-lg lg:justify-self-end">
          <div
            aria-hidden="true"
            className="absolute left-4.25 top-6 bottom-6 w-px"
            style={{ background: 'var(--ll-border)' }}
          />
          <ul className="relative flex flex-col gap-1 list-none">
            {PRODUCT_TABS.map((tab) => {
              const isActive = tab.id === activeTab
              return (
                <li key={tab.id} className="flex items-start gap-4">
                  <button
                    onClick={() => handleSelectTab(tab.id)}
                    aria-label={tab.title}
                    className="relative z-10 mt-3.5 shrink-0 flex h-9 w-9 items-center justify-center cursor-pointer"
                  >
                    <span
                      className="rounded-full transition-all duration-300"
                      style={
                        isActive
                          ? {
                              height: '20px',
                              width: '20px',
                              background:
                                'linear-gradient(to bottom right, var(--color-brand), var(--color-brand-dark))',
                              boxShadow: '0 2px 12px rgba(108,158,165,0.3)',
                            }
                          : {
                              height: '11px',
                              width: '11px',
                              background:
                                'linear-gradient(var(--ll-surface), var(--ll-surface)), var(--ll-bg)',
                              border: '1px solid var(--ll-border)',
                            }
                      }
                    />
                  </button>
                  <div className="flex-1 py-3.5">
                    <button
                      onClick={() => handleSelectTab(tab.id)}
                      className="block text-left cursor-pointer"
                    >
                      <h4
                        className="text-[1.05rem] tracking-tight transition-colors duration-300"
                        style={{
                          color: isActive ? 'var(--ll-ink)' : 'var(--ll-ink-muted)',
                          fontWeight: isActive ? 600 : 500,
                        }}
                      >
                        {tab.title}
                      </h4>
                    </button>
                    <div
                      className="grid transition-all duration-400 ease-out"
                      style={{
                        gridTemplateRows: isActive ? '1fr' : '0fr',
                        opacity: isActive ? 1 : 0,
                      }}
                    >
                      <div className="overflow-hidden">
                        <p
                          className="text-[0.9rem] leading-[1.65] mt-2"
                          style={{ color: 'var(--ll-ink-muted)' }}
                        >
                          {tab.description}
                        </p>
                        <Link
                          to="/trial"
                          tabIndex={isActive ? 0 : -1}
                          className={cn(
                            'group mt-3 inline-flex items-center gap-1.5 font-semibold text-[0.875rem] no-underline cursor-pointer transition-colors duration-200 hover:underline underline-offset-4 decoration-2',
                            !isActive && 'pointer-events-none',
                          )}
                          style={{ color: 'var(--ll-accent-strong)' }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--ll-ink)' }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--ll-accent-strong)' }}
                        >
                          {tab.linkLabel}
                          <ArrowRight
                            size={15}
                            strokeWidth={2.25}
                            className="transition-transform duration-200 group-hover:translate-x-1"
                          />
                        </Link>
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </Reveal>

        {/* Right — reference-style glass panel (bleeds to the right & bottom) */}
        <Reveal className="relative min-w-0 lg:-mr-[6vw] lg:-mb-24">
          {/* translucent glass frame */}
          <div
            className="rounded-tl-3xl pt-4 pl-4"
            style={{
              border: `1px solid ${frameBorder}`,
              borderRight: 'none',
              borderBottom: 'none',
              background: frameBg,
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
            }}
          >
            {/* dark panel */}
            <div
              className="relative overflow-hidden rounded-tl-2xl"
              style={{
                background: panelBg,
                border: `1px solid ${panelBorder}`,
                borderRight: 'none',
                borderBottom: 'none',
                boxShadow: darkTheme
                  ? '0 -20px 80px -30px rgba(0,0,0,0.9)'
                  : '0 -20px 80px -30px rgba(18,51,58,0.28)',
              }}
            >
              {/* tab header */}
              <div
                className="flex items-center gap-6 sm:gap-8 px-6 sm:px-8 h-14 overflow-x-auto"
                style={{ borderBottom: `1px solid ${panelTabBorder}` }}
              >
                {PRODUCT_TABS.map((tab) => {
                  const isActive = tab.id === activeTab
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleSelectTab(tab.id)}
                      className="whitespace-nowrap text-[0.84rem] transition-colors duration-200 cursor-pointer"
                      style={{ color: isActive ? tabActiveColor : tabIdleColor, fontWeight: isActive ? 600 : 500 }}
                    >
                      {tab.label}
                    </button>
                  )
                })}
              </div>

              {/* images */}
              <div className="relative">
                {PRODUCT_TABS.filter((tab) => visited.has(tab.id)).map((tab, stackIndex) => {
                  const tabIndex = PRODUCT_TABS.findIndex((t) => t.id === tab.id)
                  const isActive = activeTab === tab.id
                  const offset = isActive ? '0px' : tabIndex < activeIndex ? '-24px' : '24px'
                  return (
                    <img
                      key={tab.id}
                      src={tab.image}
                      alt={tab.label}
                      loading="lazy"
                      decoding="async"
                      className={cn(
                        'w-full lg:w-[128%] lg:max-w-none block',
                        stackIndex === 0 ? 'relative' : 'absolute top-0 left-0',
                        !isActive && 'pointer-events-none',
                      )}
                      style={{
                        opacity: isActive ? 1 : 0,
                        transform: `translateX(${offset})`,
                        transition:
                          'opacity 0.45s cubic-bezier(0.22, 1, 0.36, 1), transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
                      }}
                    />
                  )
                })}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
