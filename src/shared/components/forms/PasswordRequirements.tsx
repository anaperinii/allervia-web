import { cn } from '@/shared/lib/cn'
import { PASSWORD_RULES } from '@/shared/lib/password-rules'

import { faCircleCheck } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'





interface PasswordRequirementsProps {
  password: string
  className?: string
}

export function PasswordRequirements({ password, className }: PasswordRequirementsProps) {
  return (
    <div
      className={cn('rounded-lg px-3 py-2.5 bg-gray-50 border border-gray-200', className)}
    >
      <div className="grid grid-flow-col grid-rows-3 gap-x-4 gap-y-1">
        {PASSWORD_RULES.map((rule) => {
          const met = rule.test(password)
          return (
            <div key={rule.label} className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-full flex items-center justify-center shrink-0 transition-all duration-300"
                style={
                  met
                    ? {
                        background: 'rgba(16,185,129,0.18)',
                        boxShadow: '0 0 10px rgba(16,185,129,0.4), 0 0 3px rgba(16,185,129,0.3)',
                      }
                    : { background: 'rgba(0,0,0,0.06)' }
                }
              >
                <FontAwesomeIcon
                  icon={faCircleCheck}
                  style={{ fontSize: 8, color: met ? '#059669' : 'rgba(0,0,0,0.22)' }}
                />
              </div>
              <span
                className="text-[0.6rem] transition-colors duration-300"
                style={met ? { color: '#047857', fontWeight: 500 } : { color: 'var(--text-muted)' }}
              >
                {rule.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
