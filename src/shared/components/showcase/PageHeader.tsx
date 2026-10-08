import { Fragment, type ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { cn } from '@/shared/lib/cn'
import { SHOWCASE } from './tokens'

export type BreadcrumbEntry = string | { label: string; to: string }

interface PageHeaderProps {
  breadcrumb?: BreadcrumbEntry[]
  title: ReactNode
  actions?: ReactNode
}

export function PageHeader({ breadcrumb, title, actions }: PageHeaderProps) {
  const hasBreadcrumb = Boolean(breadcrumb?.length)

  return (
    <div className={cn('flex items-end justify-between gap-6 mb-7', hasBreadcrumb ? 'pt-3' : 'pt-7')}>
      <div className="min-w-0">
        {breadcrumb && breadcrumb.length > 0 && (
          <div className="flex items-center gap-2 mb-0.5 text-[0.88rem] font-normal" style={{ color: SHOWCASE.muted }}>
            {breadcrumb.map((crumb, i) => {
              const label = typeof crumb === 'string' ? crumb : crumb.label
              return (
                <Fragment key={label}>
                  {i > 0 && <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 8 }} aria-hidden="true" />}
                  {typeof crumb === 'string' ? (
                    <span>{label}</span>
                  ) : (
                    <Link
                      to={crumb.to}
                      data-label={label}
                      className="breadcrumb-link no-underline hover:text-[color:var(--text)]"
                      style={{ color: 'inherit' }}
                    >
                      {label}
                    </Link>
                  )}
                </Fragment>
              )
            })}
          </div>
        )}
        <h1
          className="text-[1.85rem] font-medium leading-[1.15] tracking-[-0.03em] truncate pb-1"
          style={{ color: SHOWCASE.ink }}
        >
          {title}
        </h1>
      </div>

      {actions && <div className="flex items-center gap-2 shrink-0 pb-1">{actions}</div>}
    </div>
  )
}
