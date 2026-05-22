import { CheckCircle } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

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
    <div className={cn('bg-gray-50 border border-(--border-custom) rounded-lg px-3 py-2.5', className)}>
      <div className="grid grid-flow-col grid-rows-3 gap-x-4 gap-y-1">
        {PASSWORD_RULES.map((rule) => {
          const met = rule.test(password)
          return (
            <div key={rule.label} className="flex items-center gap-1.5">
              <div className={cn('w-3 h-3 rounded-full flex items-center justify-center shrink-0', met ? 'bg-emerald-100' : 'bg-gray-200')}>
                <CheckCircle size={8} className={met ? 'text-emerald-600' : 'text-gray-400'} />
              </div>
              <span className={cn('text-[0.6rem]', met ? 'text-emerald-700 font-medium' : 'text-(--text-muted)')}>
                {rule.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
