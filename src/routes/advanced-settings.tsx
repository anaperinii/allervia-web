import { createFileRoute } from '@tanstack/react-router'
import { AdvancedSettingsPage } from '@/features/settings/advanced-settings-page'
import { RequireCapability } from '@/shared/auth/RequireCapability'

export const Route = createFileRoute('/advanced-settings')({
  component: () => (
    <RequireCapability capability="advanced_settings">
      <AdvancedSettingsPage />
    </RequireCapability>
  ),
})
