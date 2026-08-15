import { Check } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

interface ToggleCardProps {
  label: string
  description?: string
  selected: boolean
  onToggle: () => void
}

export function ToggleCard({ label, description, selected, onToggle }: ToggleCardProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={selected}
      onClick={onToggle}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-lg border p-2.5 text-left transition-all cursor-pointer',
        selected ? 'border-brand bg-brand/5' : 'border-gray-400 hover:border-gray-500',
      )}
    >
      <div
        className={cn(
          'flex h-4.5 w-4.5 items-center justify-center rounded border transition-all shrink-0',
          selected ? 'bg-brand border-brand' : 'border-gray-400',
        )}
      >
        {selected && <Check size={10} className="text-white" />}
      </div>
      <div className="min-w-0">
        <span className="text-[0.7rem] font-medium text-(--text) block">{label}</span>
        {description && <span className="text-[0.55rem] text-(--text-muted) block">{description}</span>}
      </div>
    </button>
  )
}
