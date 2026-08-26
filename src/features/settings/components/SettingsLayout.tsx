import type { ReactNode } from 'react'
import { PageHeader } from '@/shared/components/showcase'

interface SettingsLayoutProps {
  subtitle?: string
  headerActions?: ReactNode
  children: ReactNode
}

export function SettingsLayout({ subtitle, headerActions, children }: SettingsLayoutProps) {
  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden pt-0 pb-5">
      <PageHeader
        breadcrumb={subtitle ? ['Allervia', 'Configurações'] : ['Allervia']}
        title={subtitle ?? 'Configurações'}
        actions={headerActions}
      />

      {subtitle ? (
        <div className="flex-1 min-h-0 overflow-y-auto">{children}</div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto p-2">{children}</div>
      )}
    </div>
  )
}
