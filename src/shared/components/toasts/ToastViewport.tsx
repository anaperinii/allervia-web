import { Toast } from './Toast'
import { useToastStore } from './useToastStore'

export function ToastViewport() {
  const toasts = useToastStore((s) => s.toasts)
  const dismiss = useToastStore((s) => s.dismiss)

  if (toasts.length === 0) return null
  const top = toasts[toasts.length - 1]
  return (
    <Toast
      key={top.id}
      open
      onClose={() => dismiss(top.id)}
      variant={top.variant}
      icon={top.icon}
      title={top.title}
      description={top.description}
      autoDismissMs={top.autoDismissMs}
      position={top.position}
      compact={top.compact}
    />
  )
}
