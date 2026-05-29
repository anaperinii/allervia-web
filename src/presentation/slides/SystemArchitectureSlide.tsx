import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { Blob } from '@/features/landing-page/components/Blob'
import { Reveal } from '@/features/landing-page/components/Reveal'
import { DeckHeader } from '@/presentation/slides/DeckHeader'
import { FileTreeWindow } from '@/presentation/slides/FileTreeWindow'

interface Node {
  title: string
  desc: string
}

interface Layer {
  name: string
  tech: string
  accent: string
  nodes: Node[]
}

const ROUTING: Layer = {
  name: 'Roteamento',
  tech: 'routes/',
  accent: '#0891B2',
  nodes: [
    { title: 'routes/*.tsx', desc: 'uma rota por arquivo (file-based)' },
    { title: '__root.tsx', desc: 'layout-mestre + <Outlet>' },
    { title: 'routeTree.gen.ts', desc: 'árvore de rotas gerada' },
  ],
}
const FEATURES: Layer = {
  name: 'Features',
  tech: 'features/{domínio}/',
  accent: '#0E9AAE',
  nodes: [
    { title: 'components/', desc: 'UI agrupada por page' },
    { title: 'schemas/', desc: 'Zod + tipos de form' },
    { title: 'stores/', desc: 'Zustand + tipos de domínio' },
    { title: 'constants/', desc: 'records & label maps' },
    { title: 'exporters/', desc: 'relatórios (patient)' },
    { title: 'hooks/', desc: 'hooks da feature' },
  ],
}
const STATE: Layer = {
  name: 'Estado',
  tech: 'Zustand',
  accent: '#0D9488',
  nodes: [
    { title: 'features/*/stores/', desc: 'estado de domínio' },
    { title: 'shared/stores/', desc: 'useUserStore · useAuditStore' },
    { title: 'layout/ · toasts/', desc: 'useSidebarStore · useToastStore' },
  ],
}
const FOUNDATION: Layer = {
  name: 'Fundação',
  tech: 'shared/',
  accent: '#0F766E',
  nodes: [
    { title: 'components/', desc: 'forms, modals, toasts, wizard, tables' },
    { title: 'lib/', desc: 'dates, mask, cn, file-download' },
    { title: 'hooks/', desc: 'useCountdown, useAnimatedNumber…' },
    { title: 'constants/', desc: 'dicionários globais' },
    { title: 'layout/', desc: 'sidebar, header' },
  ],
}

const EDGE = '#64748b'

function NodeBox({ node, accent }: { node: Node; accent: string }) {
  return (
    <div
      className="flex-1 rounded-md border bg-white px-3 py-2"
      style={{ borderColor: accent, boxShadow: '0 1px 2px rgba(15,23,42,0.06)', minWidth: 150 }}
    >
      <div className="text-[0.78rem] font-semibold text-slate-800">{node.title}</div>
      <div className="mt-0.5 text-[0.64rem] leading-snug text-slate-400">{node.desc}</div>
    </div>
  )
}

function Cluster({ layer }: { layer: Layer }) {
  return (
    <div
      className="rounded-lg border-[1.5px] px-4 pb-4 pt-3"
      style={{ borderColor: `${layer.accent}59`, background: `${layer.accent}0a` }}
    >
      <div className="mb-3 text-center text-[0.78rem] font-bold" style={{ color: layer.accent }}>
        {layer.name}
        <span className="ml-1.5 font-medium text-slate-400">· {layer.tech}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {layer.nodes.map((node) => (
          <NodeBox key={node.title} node={node} accent={layer.accent} />
        ))}
      </div>
    </div>
  )
}

function EdgeHorizontal({ label, dir }: { label: string; dir: 'right' | 'left' }) {
  const flip = dir === 'left'
  return (
    <div className="relative flex items-center justify-center" style={{ width: 108 }}>
      <svg width="108" height="34" style={{ transform: flip ? 'scaleX(-1)' : undefined }}>
        <line x1="4" y1="17" x2="90" y2="17" stroke={EDGE} strokeWidth="1.5" />
        <polygon points="90,11 102,17 90,23" fill={EDGE} />
      </svg>
      <span className="absolute left-1/2 top-0 -translate-x-1/2 whitespace-nowrap bg-white px-1 text-[0.6rem] font-medium text-slate-500">
        {label}
      </span>
    </div>
  )
}

function EdgeDown({ label }: { label: string }) {
  return (
    <div className="relative flex justify-center" style={{ height: 64, marginBottom: -10 }}>
      <svg width="40" height="64">
        <line x1="20" y1="2" x2="20" y2="52" stroke={EDGE} strokeWidth="1.5" />
        <polygon points="14,52 20,64 26,52" fill={EDGE} />
      </svg>
      <span className="absolute left-1/2 top-[42%] ml-4 -translate-y-1/2 whitespace-nowrap bg-white px-1 text-[0.6rem] font-medium text-slate-500">
        {label}
      </span>
    </div>
  )
}

function LayersDiagram() {
  return (
    <>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center justify-items-stretch gap-y-2">
        <Cluster layer={ROUTING} />
        <EdgeHorizontal dir="right" label="monta a rota" />
        <Cluster layer={FEATURES} />

        <div />
        <div />
        <EdgeDown label="lê estado · dispara actions" />

        <Cluster layer={FOUNDATION} />
        <EdgeHorizontal dir="left" label="consome utilitários" />
        <Cluster layer={STATE} />
      </div>

      <p className="mt-8 text-center text-[0.8rem] text-slate-400">
        Cada caixa é uma <span className="font-medium text-slate-500">subpasta ou arquivo real</span> do projeto.
        Fluxo: Roteamento → Features → Estado → Fundação — uma <span className="font-semibold text-brand">action</span> muda
        o estado e os componentes inscritos <span className="font-semibold text-brand">re-renderizam</span>.
      </p>
    </>
  )
}

const VIEWS = [
  {
    title: 'Arquitetura em camadas: estrutura e dependências',
    description: 'Quatro camadas reais — cada uma depende apenas da seguinte, no sentido do fluxo.',
  },
  {
    title: 'A mesma arquitetura, vista como estrutura de arquivos',
    description: 'As quatro camadas materializadas em pastas e arquivos reais do projeto.',
  },
]

export function SystemArchitectureSlide() {
  const [view, setView] = useState(0)
  const toggle = () => setView((v) => (v + 1) % 2)

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-white px-[6%] py-20">
      <Blob className="-top-28 right-1/4 w-100 h-100 bg-cyan-100/30" />
      <Blob className="-bottom-32 -left-20 w-105 h-105 bg-teal-200/25" />

      <div className="relative z-10 mx-auto w-full max-w-5xl">
        <Reveal>
          <DeckHeader
            eyebrow="Arquitetura do Sistema"
            title={VIEWS[view].title}
            description={VIEWS[view].description}
          />
        </Reveal>

        <Reveal delay={120}>
          <div className="relative mt-12">
            <button
              type="button"
              aria-label="Visualização anterior"
              onClick={toggle}
              className="absolute -left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-(--border-custom) bg-white text-slate-500 shadow-(--shadow) transition-colors hover:text-brand sm:-left-5"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              aria-label="Próxima visualização"
              onClick={toggle}
              className="absolute -right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-(--border-custom) bg-white text-slate-500 shadow-(--shadow) transition-colors hover:text-brand sm:-right-5"
            >
              <ChevronRight size={20} />
            </button>

            <div key={view} style={{ animation: 'fade-in-up 0.4s ease-out' }}>
              {view === 0 ? <LayersDiagram /> : <FileTreeWindow />}
            </div>

            <div className="mt-8 flex justify-center gap-2">
              {VIEWS.map((v, i) => (
                <button
                  key={v.title}
                  type="button"
                  aria-label={`Ver ${v.title}`}
                  onClick={() => setView(i)}
                  className={cn(
                    'h-2 rounded-full transition-all duration-300',
                    i === view ? 'w-8 bg-brand' : 'w-2 bg-slate-300 hover:bg-slate-400',
                  )}
                />
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
