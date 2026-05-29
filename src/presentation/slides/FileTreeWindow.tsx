import { Folder, FolderOpen, FileCode } from 'lucide-react'

interface TreeLine {
  text: string
  comment?: string
  depth: number
  kind: 'root' | 'folder' | 'file'
}

const COL_FEATURES_A: TreeLine[] = [
  { text: 'features/', comment: 'um domínio por pasta', depth: 0, kind: 'root' },
  { text: 'auth/', comment: 'login & cadastro', depth: 1, kind: 'folder' },
  { text: 'components/', depth: 2, kind: 'folder' },
  { text: 'schemas/', depth: 2, kind: 'folder' },
  { text: 'dashboard/', comment: 'métricas', depth: 1, kind: 'folder' },
  { text: 'components/', depth: 2, kind: 'folder' },
  { text: 'constants/', depth: 2, kind: 'folder' },
  { text: 'hooks/', depth: 2, kind: 'folder' },
  { text: 'immunotherapy/', comment: 'protocolo SCIT', depth: 1, kind: 'folder' },
  { text: 'components/', depth: 2, kind: 'folder' },
  { text: 'constants/', depth: 2, kind: 'folder' },
  { text: 'schemas/', depth: 2, kind: 'folder' },
  { text: 'stores/', depth: 2, kind: 'folder' },
  { text: 'landing-page/', comment: 'site público', depth: 1, kind: 'folder' },
  { text: 'components/', depth: 2, kind: 'folder' },
  { text: 'constants/', depth: 2, kind: 'folder' },
]

const COL_FEATURES_B: TreeLine[] = [
  { text: 'features/', comment: '(continuação)', depth: 0, kind: 'root' },
  { text: 'notification/', comment: 'alertas', depth: 1, kind: 'folder' },
  { text: 'components/', depth: 2, kind: 'folder' },
  { text: 'constants/', depth: 2, kind: 'folder' },
  { text: 'stores/', depth: 2, kind: 'folder' },
  { text: 'patient/', comment: 'prontuário', depth: 1, kind: 'folder' },
  { text: 'components/', depth: 2, kind: 'folder' },
  { text: 'constants/', depth: 2, kind: 'folder' },
  { text: 'exporters/', depth: 2, kind: 'folder' },
  { text: 'schemas/', depth: 2, kind: 'folder' },
  { text: 'stores/', depth: 2, kind: 'folder' },
  { text: 'scheduling/', comment: 'agenda', depth: 1, kind: 'folder' },
  { text: 'components/', depth: 2, kind: 'folder' },
  { text: 'constants/', depth: 2, kind: 'folder' },
  { text: 'hooks/', depth: 2, kind: 'folder' },
  { text: 'schemas/', depth: 2, kind: 'folder' },
  { text: 'settings/', comment: 'config & equipe', depth: 1, kind: 'folder' },
  { text: 'components/', depth: 2, kind: 'folder' },
  { text: 'constants/', depth: 2, kind: 'folder' },
  { text: 'schemas/', depth: 2, kind: 'folder' },
  { text: 'stores/', depth: 2, kind: 'folder' },
]

const COL_SHARED: TreeLine[] = [
  { text: 'shared/', comment: 'usado por 2+ features', depth: 0, kind: 'root' },
  { text: 'components/', depth: 1, kind: 'folder' },
  { text: 'constants/', depth: 1, kind: 'folder' },
  { text: 'hooks/', depth: 1, kind: 'folder' },
  { text: 'layout/', depth: 1, kind: 'folder' },
  { text: 'lib/', depth: 1, kind: 'folder' },
  { text: 'stores/', depth: 1, kind: 'folder' },
  { text: 'routes/', comment: 'TanStack Router', depth: 0, kind: 'root' },
  { text: 'assets/', comment: 'imagens', depth: 0, kind: 'root' },
  { text: 'main.tsx', comment: 'bootstrap', depth: 0, kind: 'file' },
  { text: 'index.css', comment: 'Tailwind v4', depth: 0, kind: 'file' },
]

const DEPTH_COLOR: Record<number, string> = {
  0: '#0F766E',
  1: '#14B8A6',
  2: '#2DD4BF',
}

const NAME_CLASS: Record<TreeLine['kind'], string> = {
  root: 'font-bold text-slate-700',
  folder: 'font-medium text-slate-600',
  file: 'text-slate-500',
}

function TreeRow({ line }: { line: TreeLine }) {
  const color = DEPTH_COLOR[line.depth] ?? DEPTH_COLOR[2]
  const Icon = line.kind === 'file' ? FileCode : line.depth === 0 ? FolderOpen : Folder
  return (
    <div className="flex items-center gap-2 leading-[2]" style={{ paddingLeft: line.depth * 20 }}>
      <Icon size={15} style={{ color }} className="shrink-0" />
      <span className={NAME_CLASS[line.kind]}>{line.text}</span>
      {line.comment && <span className="text-[0.66rem] text-slate-400">{`// ${line.comment}`}</span>}
    </div>
  )
}

function TreeColumn({ lines }: { lines: TreeLine[] }) {
  return (
    <div>
      {lines.map((line, i) => (
        <TreeRow key={i} line={line} />
      ))}
    </div>
  )
}

export function FileTreeWindow() {
  return (
    <div className="overflow-hidden rounded-(--radius) border-[1.5px] border-(--border-custom) bg-white shadow-(--shadow)">
      <div className="flex items-center gap-2 border-b border-(--border-custom) bg-(--bg2) px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-red-400" />
        <span className="h-3 w-3 rounded-full bg-amber-400" />
        <span className="h-3 w-3 rounded-full bg-green-400" />
        <span className="ml-2 text-[0.7rem] font-medium text-slate-400">imunecare-web/src</span>

        <div className="ml-auto flex items-center gap-3.5 text-[0.62rem] text-slate-400">
          <span className="font-semibold uppercase tracking-wider">Profundidade</span>
          <span className="flex items-center gap-1"><Folder size={12} style={{ color: DEPTH_COLOR[0] }} /> nível 1</span>
          <span className="flex items-center gap-1"><Folder size={12} style={{ color: DEPTH_COLOR[1] }} /> nível 2</span>
          <span className="flex items-center gap-1"><Folder size={12} style={{ color: DEPTH_COLOR[2] }} /> nível 3</span>
        </div>
      </div>
      <div className="grid items-start gap-x-8 gap-y-1 p-7 font-mono text-[0.78rem] sm:grid-cols-2 lg:grid-cols-3">
        <TreeColumn lines={COL_FEATURES_A} />
        <TreeColumn lines={COL_FEATURES_B} />
        <TreeColumn lines={COL_SHARED} />
      </div>
    </div>
  )
}
