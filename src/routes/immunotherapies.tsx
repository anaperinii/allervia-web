import { createFileRoute } from '@tanstack/react-router'
import { ImmunotherapiesPage } from '@/features/immunotherapy/immunotherapies-page'

export const Route = createFileRoute('/immunotherapies')({
  component: ImmunotherapiesPage,
})
