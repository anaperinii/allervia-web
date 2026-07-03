import { CheckCircle } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

interface PasswordRule {
  label: string
  test: (password: string) => boolean
}

export const PASSWORD_RULES: PasswordRule[] = [
  { label: 'Mínimo de 8 caracteres', test: (p) => p.length >= 8 },
  { label: 'Pelo menos uma letra maiúscula', test: (p) => /[A-Z]/.test(p) },
  { label: 'Pelo menos uma letra minúscula', test: (p) => /[a-z]/.test(p) },
  { label: 'Pelo menos um número', test: (p) => /\d/.test(p) },
  { label: 'Pelo menos um caractere especial', test: (p) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(p) },
]

interface PasswordRequirementsProps {
  password: string
  className?: string
}

export function PasswordRequirements({ password, className }: PasswordRequirementsProps) {
  return (
    <div
      className={cn('rounded-lg px-3 py-2.5', className)}
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.10)',
      }}
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
                        background: 'rgba(16,185,129,0.22)',
                        boxShadow: '0 0 10px rgba(16,185,129,0.55), 0 0 3px rgba(16,185,129,0.35)',
                      }
                    : {
                        background: 'rgba(255,255,255,0.08)',
                      }
                }
              >
                <CheckCircle
                  size={8}
                  style={met ? { color: '#34d399' } : { color: 'rgba(255,255,255,0.30)' }}
                />
              </div>
              <span
                className="text-[0.6rem] transition-colors duration-300"
                style={
                  met
                    ? { color: '#a7f3d0', fontWeight: 500 }
                    : { color: 'rgba(255,255,255,0.55)' }
                }
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
