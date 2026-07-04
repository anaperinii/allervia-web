import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { Reveal } from './Reveal'
import { SectionHeader } from '@/features/landing-page/components/SectionHeader'
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
  const active = PRODUCT_TABS[activeIndex] ?? PRODUCT_TABS[0]
  const slideFrom = direction === 1 ? '24px' : '-24px'

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

      <Reveal className="mb-14 relative">
        <SectionHeader
          eyebrow="Aprofunde-se"
          title="Projetado para o fluxo clínico real"
          description="Cada funcionalidade reflete as necessidades reais de clínicas de imunoterapia alérgica."
          align="center"
          titleMaxWidth="max-w-150"
        />
      </Reveal>

      <div className="relative flex gap-2 justify-center flex-wrap mb-14">
        {PRODUCT_TABS.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => handleSelectTab(tab.id)}
              className={cn(
                'px-5 py-2 rounded-full font-semibold text-[0.875rem] cursor-pointer transition-all duration-200 hover:-translate-y-px',
              )}
              style={
                isActive
                  ? {
                      background:
                        'linear-gradient(180deg, rgba(255,255,255,0.45), rgba(255,255,255,0.08) 44%, rgba(255,255,255,0) 56%), var(--ll-accent-fill)',
                      color: 'var(--ll-accent-ink)',
                      boxShadow:
                        '0 4px 16px var(--ll-halo-accent-strong), inset 0 1px 0 rgba(255,255,255,0.4)',
                      border: 'none',
                    }
                  : {
                      background: 'var(--ll-surface)',
                      color: 'var(--ll-ink-muted)',
                      border: '1px solid var(--ll-border)',
                    }
              }
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-[4%] items-center">
        <Reveal>
          <div
            key={active.id}
            style={{
              ['--tab-slide-from' as string]: slideFrom,
              animation: 'tab-slide-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) both',
            }}
          >
            <h3 className="text-[1.6rem] font-light tracking-tight mb-4" style={{ color: 'var(--ll-ink)' }}>
              {active.title}
            </h3>
            <p className="text-[0.95rem] leading-[1.7] mb-6" style={{ color: 'var(--ll-ink-muted)' }}>
              {active.description}
            </p>
            <span
              className="inline-flex items-center gap-1.5 font-semibold text-[0.9rem] cursor-default"
              style={{ color: 'var(--ll-accent-strong)' }}
            >
              {active.linkLabel}
              <ArrowRight size={15} strokeWidth={2.25} />
            </span>
          </div>
        </Reveal>
        <Reveal
          className="rounded-2xl p-3 relative overflow-hidden"
          style={{
            background: 'var(--ll-surface-grad)',
            border: '1px solid var(--ll-border)',
            boxShadow: 'var(--ll-shadow-card)',
          }}
        >
          <div className="flex items-center gap-1.5 mb-2 px-1">
            <div className="w-2 h-2 rounded-full bg-red-400/80" />
            <div className="w-2 h-2 rounded-full bg-amber-400/80" />
            <div className="w-2 h-2 rounded-full bg-emerald-400/80" />
            <div
              className="ml-2 flex-1 rounded-md h-4 flex items-center px-2"
              style={{
                background: 'var(--ll-surface)',
                border: '1px solid var(--ll-border)',
              }}
            >
              <span className="text-[0.5rem] font-medium" style={{ color: 'var(--ll-ink-muted)' }}>
                allervia.com.br/{active.urlSlug}
              </span>
            </div>
          </div>
          <div
            className="rounded-xl overflow-hidden relative"
            style={{
              background: 'var(--ll-surface)',
              border: '1px solid var(--ll-border)',
            }}
          >
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
                    'w-full block',
                    stackIndex === 0 ? 'relative' : 'absolute inset-0',
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
        </Reveal>
      </div>
    </section>
  )
}
