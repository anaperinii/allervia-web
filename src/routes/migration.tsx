import { createFileRoute } from '@tanstack/react-router'
import { MigrationPage } from '@/features/protocols/migration-page'

export const Route = createFileRoute('/migration')({
  component: MigrationPage,
})
