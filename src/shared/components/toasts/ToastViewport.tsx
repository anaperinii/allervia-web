import { Toast, type ToastPosition } from './Toast'
import { useToastStore, type ToastItem } from './useToastStore'


const MAX_VISIBLE = 3

const POSITION_CLASS: Record<ToastPosition, string> = {
  'top-right': 'top-3 right-4 items-end',
  'top-center': 'top-3 left-1/2 -translate-x-1/2 items-center',
}

function byPosition(toasts: ToastItem[], position: ToastPosition): ToastItem[] {
  return toasts.filter((toast) => (toast.position ?? 'top-right') === position)
}

function Stack({
  position,
  toasts,
  onDismiss,
}: {
  position: ToastPosition
  toasts: ToastItem[]
  onDismiss: (id: string) => void
}) {
  if (toasts.length === 0) return null

  const visible = toasts.slice(-MAX_VISIBLE)
  const hidden = toasts.length - visible.length

  return (
    <div className={`fixed z-50 flex flex-col gap-2 ${POSITION_CLASS[position]}`}>
      {visible.map((toast) => (
        <Toast
          key={toast.id}
          open
          stacked
          onClose={() => onDismiss(toast.id)}
          variant={toast.variant}
          icon={toast.icon}
          title={toast.title}
          description={toast.description}
          autoDismissMs={toast.autoDismissMs}
          position={position}
          compact={toast.compact}
          repeats={toast.repeats}
        />
      ))}
      {hidden > 0 && (
        <p
          role="status"
          aria-live="polite"
          className="rounded-full border border-(--border-custom) bg-white px-3 py-1 text-[0.65rem] font-semibold text-(--text-muted) shadow-sm"
        >
          +{hidden} {hidden === 1 ? 'aviso anterior' : 'avisos anteriores'}
        </p>
      )}
    </div>
  )
}

export function ToastViewport() {
  const toasts = useToastStore((s) => s.toasts)
  const dismiss = useToastStore((s) => s.dismiss)

  if (toasts.length === 0) return null
  return (
    <>
      <Stack
        position="top-right"
        toasts={byPosition(toasts, 'top-right')}
        onDismiss={dismiss}
      />
      <Stack
        position="top-center"
        toasts={byPosition(toasts, 'top-center')}
        onDismiss={dismiss}
      />
    </>
  )
}
