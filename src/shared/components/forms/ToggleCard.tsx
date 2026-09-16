import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons'

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
      className="flex w-full items-center gap-2.5 rounded-lg border p-2.5 text-left transition-all cursor-pointer"
      style={{
        background: selected ? 'rgba(18,51,58,0.06)' : '#F6F8F8',
        borderColor: selected ? '#12333a' : '#DDE6E6',
      }}
    >
      <div
        className="flex h-4.5 w-4.5 items-center justify-center rounded border transition-all shrink-0"
        style={{
          background: selected ? '#12333a' : '#EDF1F1',
          borderColor: selected ? '#12333a' : '#DDE6E6',
        }}
      >
        {selected && <FontAwesomeIcon icon={faCheck} className="text-white" style={{ fontSize: 10 }} />}
      </div>
      <div className="min-w-0">
        <span className="text-[0.7rem] font-medium text-(--text) block">{label}</span>
        {description && <span className="text-[0.55rem] text-(--text-muted) block">{description}</span>}
      </div>
    </button>
  )
}
