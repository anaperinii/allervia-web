import { createFileRoute } from '@tanstack/react-router'
import { PresentationPage } from '@/presentation/presentation-page'

export const Route = createFileRoute('/presentation')({
  component: PresentationPage,
})
