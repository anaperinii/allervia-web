import { createFileRoute } from '@tanstack/react-router'
import { ToastLabPage } from '@/features/dev/toast-lab-page'

export const Route = createFileRoute('/toast-lab')({
  component: ToastLabPage,
})
