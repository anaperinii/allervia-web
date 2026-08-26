import type { ReactNode } from 'react'
import { faFileLines } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { SHOWCASE } from './tokens'

/** A crumb is plain text, or text that navigates back when clicked. */
export type Crumb = string | { label: string; onClick: () => void }

interface PageHeaderProps {
  /** Trail shown above the title; the first entry is where this screen came from. */
  breadcrumb: Crumb[]
  title: string
  /** Toolbar slot on the right — circle buttons, pills, selects. */
  actions?: ReactNode
}

const CRUMB_CLASS = 'inline-flex items-center gap-1.5 text-[0.72rem] font-medium'

/**
 * Screen-level heading: breadcrumb, oversized title and a pill toolbar. Every
 * page inside the AppShell opens with this so the hierarchy reads the same.
 */
export function PageHeader({ breadcrumb, title, actions }: PageHeaderProps) {
  return (
    // The block is pulled up by roughly the breadcrumb's height so the title's
    // centre lines up with the rail's back arrow; the breadcrumb rides into the
    // gap left under the top bar.
    <div className="-mt-5 flex items-end justify-between gap-6 mb-7">
      <div className="min-w-0">
        <div className="flex items-center gap-4 mb-2">
          {breadcrumb.map((crumb) => {
            const label = typeof crumb === 'string' ? crumb : crumb.label
            const icon = <FontAwesomeIcon icon={faFileLines} style={{ fontSize: 11 }} />

            // Clickable crumbs keep the plain-text look — the rail already owns
            // the back button, so this must not read as another one.
            return typeof crumb === 'string' ? (
              <span key={label} className={CRUMB_CLASS} style={{ color: SHOWCASE.muted }}>
                {icon}
                {label}
              </span>
            ) : (
              <button
                key={label}
                type="button"
                onClick={crumb.onClick}
                className={`${CRUMB_CLASS} cursor-pointer transition-colors hover:text-[#12333a]`}
                style={{ color: SHOWCASE.muted }}
              >
                {icon}
                {label}
              </button>
            )
          })}
        </div>
        {/* leading needs headroom: `truncate` clips descenders (ç, g) at the line box */}
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
