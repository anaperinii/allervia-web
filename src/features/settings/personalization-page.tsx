import { Contrast, Eye, Layout, MousePointer, Type } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { Switch } from '@/shared/components'
import { SettingsLayout } from '@/features/settings/components/SettingsLayout'
import { useSettingsStore, type Density, type Theme } from '@/features/settings/stores/useSettingsStore'

const THEME_OPTIONS: { id: Theme; label: string; preview: string }[] = [
  { id: 'light', label: 'Claro', preview: 'bg-white border-2' },
  { id: 'dark', label: 'Escuro', preview: 'bg-gray-900 border-2' },
  { id: 'auto', label: 'Automático', preview: 'bg-linear-to-r from-white to-gray-900 border-2' },
]

const DENSITY_OPTIONS: { id: Density; label: string; desc: string }[] = [
  { id: 'compact', label: 'Compacta', desc: 'Mais informação por tela' },
  { id: 'comfortable', label: 'Confortável', desc: 'Equilíbrio padrão' },
  { id: 'spacious', label: 'Espaçosa', desc: 'Mais espaço de respiro' },
]

export function PersonalizationPage() {
  const theme = useSettingsStore((s) => s.theme)
  const setTheme = useSettingsStore((s) => s.setTheme)
  const density = useSettingsStore((s) => s.density)
  const setDensity = useSettingsStore((s) => s.setDensity)
  const fontSize = useSettingsStore((s) => s.fontSize)
  const setFontSize = useSettingsStore((s) => s.setFontSize)
  const highContrast = useSettingsStore((s) => s.highContrast)
  const setHighContrast = useSettingsStore((s) => s.setHighContrast)
  const reducedMotion = useSettingsStore((s) => s.reducedMotion)
  const setReducedMotion = useSettingsStore((s) => s.setReducedMotion)
  const largeText = useSettingsStore((s) => s.largeText)
  const setLargeText = useSettingsStore((s) => s.setLargeText)
  const focusIndicators = useSettingsStore((s) => s.focusIndicators)
  const setFocusIndicators = useSettingsStore((s) => s.setFocusIndicators)

  const visualToggles = [
    { label: 'Alto contraste', desc: 'Aumenta o contraste entre texto e fundo', icon: Contrast, value: highContrast, set: setHighContrast },
    { label: 'Texto ampliado', desc: 'Aumenta o tamanho base da fonte em 20%', icon: Eye, value: largeText, set: setLargeText },
  ] as const

  const motionToggles = [
    { label: 'Reduzir animações', desc: 'Minimiza transições e efeitos de movimento', icon: MousePointer, value: reducedMotion, set: setReducedMotion },
    { label: 'Indicadores de foco visíveis', desc: 'Destaca o elemento selecionado ao navegar por teclado', icon: Eye, value: focusIndicators, set: setFocusIndicators },
  ] as const

  return (
    <SettingsLayout subtitle="Personalização e Acessibilidade">
      <div className="max-w-2xl mx-auto space-y-5">
            <section className="border border-(--border-custom) rounded-xl overflow-hidden bg-white/55 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
              <div className="px-4 py-3 border-b border-(--border-custom) bg-gray-50/50">
                <h2 className="text-xs font-bold text-(--text)">Tema</h2>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-3 gap-3" role="radiogroup" aria-label="Tema">
                  {THEME_OPTIONS.map((option) => {
                    const selected = theme === option.id
                    return (
                      <button
                        key={option.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => setTheme(option.id)}
                        className={cn(
                          'rounded-lg border p-3 text-center transition-all cursor-pointer',
                          selected ? 'border-brand shadow-[0_0_0_1px_var(--brand)]' : 'border-(--border-custom) hover:border-gray-300',
                        )}
                      >
                        <div className={cn('h-12 rounded-md mb-2 mx-auto w-full', option.preview, selected ? 'border-brand' : 'border-(--border-custom)')} />
                        <span className="text-xs font-medium text-(--text)">{option.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </section>

            <section className="border border-(--border-custom) rounded-xl overflow-hidden bg-white/55 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
              <div className="px-4 py-3 border-b border-(--border-custom) bg-gray-50/50 flex items-center gap-2">
                <Layout size={14} className="text-(--text-muted)" />
                <h2 className="text-xs font-bold text-(--text)">Densidade da interface</h2>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-3 gap-3" role="radiogroup" aria-label="Densidade da interface">
                  {DENSITY_OPTIONS.map((option) => {
                    const selected = density === option.id
                    return (
                      <button
                        key={option.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => setDensity(option.id)}
                        className={cn(
                          'rounded-lg border p-3 text-left transition-all cursor-pointer',
                          selected ? 'border-brand bg-brand-50/30' : 'border-(--border-custom) hover:border-gray-300',
                        )}
                      >
                        <div className="text-xs font-semibold text-(--text)">{option.label}</div>
                        <div className="text-[0.6rem] text-(--text-muted) mt-0.5">{option.desc}</div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </section>

            <section className="border border-(--border-custom) rounded-xl overflow-hidden bg-white/55 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
              <div className="px-4 py-3 border-b border-(--border-custom) bg-gray-50/50 flex items-center gap-2">
                <Type size={14} className="text-(--text-muted)" />
                <h2 className="text-xs font-bold text-(--text)">Tamanho da fonte</h2>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-4">
                  <span className="text-[0.7rem] text-(--text-muted)">A</span>
                  <input
                    type="range"
                    min={12}
                    max={18}
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    aria-label="Tamanho da fonte"
                    aria-valuemin={12}
                    aria-valuemax={18}
                    aria-valuenow={fontSize}
                    className="flex-1 accent-brand cursor-pointer"
                  />
                  <span className="text-base text-(--text-muted)">A</span>
                  <span className="text-xs font-medium text-(--text) w-8 text-right tabular-nums">{fontSize}px</span>
                </div>
              </div>
            </section>

            <section className="border border-(--border-custom) rounded-xl overflow-hidden bg-white/55 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
              <div className="px-4 py-3 border-b border-(--border-custom) bg-gray-50/50">
                <h2 className="text-xs font-bold text-(--text)">Acessibilidade visual</h2>
              </div>
              <div className="p-4 space-y-3">
                {visualToggles.map((item, i) => (
                  <div key={item.label}>
                    {i > 0 && <div className="border-t border-(--border-custom) mb-3" />}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 shrink-0">
                          <item.icon size={14} className="text-brand" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-(--text)">{item.label}</div>
                          <div className="text-[0.65rem] text-(--text-muted)">{item.desc}</div>
                        </div>
                      </div>
                      <Switch checked={item.value} onChange={item.set} aria-label={item.label} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="border border-(--border-custom) rounded-xl overflow-hidden bg-white/55 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
              <div className="px-4 py-3 border-b border-(--border-custom) bg-gray-50/50">
                <h2 className="text-xs font-bold text-(--text)">Movimento e navegação</h2>
              </div>
              <div className="p-4 space-y-3">
                {motionToggles.map((item, i) => (
                  <div key={item.label}>
                    {i > 0 && <div className="border-t border-(--border-custom) mb-3" />}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 shrink-0">
                          <item.icon size={14} className="text-brand" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-(--text)">{item.label}</div>
                          <div className="text-[0.65rem] text-(--text-muted)">{item.desc}</div>
                        </div>
                      </div>
                      <Switch checked={item.value} onChange={item.set} aria-label={item.label} />
                    </div>
                  </div>
                ))}
              </div>
      </section>
      </div>
    </SettingsLayout>
  )
}
