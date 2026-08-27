import { Fragment, type ReactNode } from 'react'
import { faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { cn } from '@/shared/lib/cn'
import { SHOWCASE } from './tokens'

interface PageHeaderProps {
  breadcrumb?: string[]
  title: string
  actions?: ReactNode
}

export function PageHeader({ breadcrumb, title, actions }: PageHeaderProps) {
  const hasBreadcrumb = Boolean(breadcrumb?.length)

  return (
    <div className={cn('flex items-end justify-between gap-6 mb-7', !hasBreadcrumb && 'pt-7')}>
      <div className="min-w-0">
        {breadcrumb && breadcrumb.length > 0 && (
          <div className="flex items-center gap-2 mb-2 text-[0.8rem] font-medium" style={{ color: SHOWCASE.muted }}>
            {breadcrumb.map((crumb, i) => (
              <Fragment key={crumb}>
                {i > 0 && <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 8 }} aria-hidden="true" />}
                <span>{crumb}</span>
              </Fragment>
            ))}
          </div>
        )}
        <h1
          className="text-[2.15rem] font-semibold leading-[1.15] tracking-[-0.03em] truncate pb-1"
          style={{ color: SHOWCASE.ink }}
        >
          {title}
        </h1>
      </div>

      {actions && <div className="flex items-center gap-2 shrink-0 pb-1">{actions}</div>}
    </div>
  )
}
