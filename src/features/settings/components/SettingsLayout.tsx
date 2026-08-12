import { Link } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'
import type { ReactNode } from 'react'

interface SettingsLayoutProps {
  subtitle?: string
  headerActions?: ReactNode
  children: ReactNode
}

export function SettingsLayout({ subtitle, headerActions, children }: SettingsLayoutProps) {
  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden pt-0 pb-5">
      <div className="mb-8 flex items-center justify-between gap-3">
        <div>
          {subtitle ? (
            <>
              <h1 className="text-3xl font-medium text-(--text)">{subtitle}</h1>
              <Link
                to="/settings"
                className="mt-1.5 inline-flex items-center gap-1.5 text-sm font-medium text-(--text-muted) hover:text-(--text) transition-colors cursor-pointer no-underline"
              >
                <ChevronLeft size={15} />
                Configurações
              </Link>
            </>
          ) : (
            <h1 className="text-3xl font-medium leading-none text-(--text)">Configurações</h1>
          )}
        </div>
        {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
      </div>

      {subtitle ? (
        <div className="flex-1 min-h-0 overflow-y-auto">{children}</div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto p-2">{children}</div>
      )}
    </div>
  )
}
