import { ChevronDown } from 'lucide-react'
import { TechStackSlide } from '@/presentation/slides/TechStackSlide'
import { FolderArchitectureSlide } from '@/presentation/slides/FolderArchitectureSlide'
import { SystemArchitectureSlide } from '@/presentation/slides/SystemArchitectureSlide'
import { ContainerArchitectureSlide } from '@/presentation/slides/ContainerArchitectureSlide'

export function PresentationPage() {
  return (
    <div className="w-full bg-white">
      <div className="relative">
        <TechStackSlide />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-8 left-1/2 z-20 -translate-x-1/2 text-slate-400"
          style={{ animation: 'float 2.5s ease-in-out infinite' }}
        >
          <ChevronDown size={26} />
        </div>
      </div>

      <FolderArchitectureSlide />
      <SystemArchitectureSlide />
      <ContainerArchitectureSlide />
    </div>
  )
}
