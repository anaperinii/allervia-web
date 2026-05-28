import { cn } from '@/shared/lib/utils'
import { ChevronDown } from 'lucide-react'
import {
  useId,
  cloneElement,
  isValidElement,
  Children,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
  type ReactNode,
  type ReactElement,
} from 'react'

// ─── FieldLabel ──────────────────────────────────────────────────────────────
interface FieldLabelProps {
  label: string
  required?: boolean
  hint?: string
  children: ReactNode
  error?: string | null
  helperText?: string
}

export function FieldLabel({ label, required, hint, children, error, helperText }: FieldLabelProps) {
  const errorId = useId()
  const hintId = useId()

  const describedBy = [error ? errorId : null, helperText ? hintId : null]
    .filter(Boolean)
    .join(' ') || undefined

  return (
    <div>
      <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">
        {label}
        {/* aria-hidden: o asterisco é visual — o atributo aria-required no input comunica a obrigatoriedade */}
        {required && <span className="text-red-400" aria-hidden="true"> *</span>}
        {hint && <span className="text-(--text-muted) font-normal"> {hint}</span>}
      </label>

      {/* Injeta aria-required e aria-describedby no único filho de input */}
      <FieldInputWrapper required={required} describedBy={describedBy}>
        {children}
      </FieldInputWrapper>

      {/* aria-live="polite" faz leitores de tela anunciarem o erro sem interromper */}
      {error && (
        <span
          id={errorId}
          role="alert"
          aria-live="polite"
          className="text-[0.6rem] text-red-500 mt-0.5 block"
        >
          {error}
        </span>
      )}
      {!error && helperText && (
        <span id={hintId} className="text-[0.55rem] text-(--text-muted) mt-0.5 block">
          {helperText}
        </span>
      )}
    </div>
  )
}

// ─── FieldInputWrapper ────────────────────────────────────────────────────────
// Clona o filho único e injeta aria-required + aria-describedby sem alterar o visual.
interface FieldInputWrapperProps {
  required?: boolean
  describedBy?: string
  children: ReactNode
}

function FieldInputWrapper({ required, describedBy, children }: FieldInputWrapperProps) {
  let child: ReactNode
  try {
    child = Children.only(children)
  } catch {
    // Mais de um filho (ex: Select wrapper com div) — retorna sem modificar
    return <>{children}</>
  }
  if (!isValidElement(child)) return <>{children}</>

  const extraProps: Record<string, unknown> = {}
  if (required) extraProps['aria-required'] = 'true'
  if (describedBy) {
    const existing = (child.props as Record<string, unknown>)['aria-describedby']
    extraProps['aria-describedby'] = existing
      ? `${String(existing)} ${describedBy}`
      : describedBy
  }

  if (Object.keys(extraProps).length === 0) return <>{children}</>
  return <>{cloneElement(child as ReactElement<Record<string, unknown>>, extraProps)}</>
}

// ─── Field primitives ─────────────────────────────────────────────────────────
// placeholder usa text-(--text-muted) sem redução de opacidade para garantir
// contraste ≥ 3:1 WCAG AA para texto placeholder (#64748b sobre branco ≈ 4.5:1)
const FIELD_BASE =
  'w-full rounded-lg border bg-gray-50/60 px-3 text-xs placeholder:text-(--text-muted) focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all'
const FIELD_INVALID = 'border-red-400 bg-red-50/30'
const FIELD_VALID = 'border-(--border-custom)'

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean
}
export function TextInput({ invalid, className, ...rest }: TextInputProps) {
  return (
    <input
      {...rest}
      aria-invalid={invalid || undefined}
      className={cn(FIELD_BASE, 'h-9', invalid ? FIELD_INVALID : FIELD_VALID, className)}
    />
  )
}

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean
}
export function TextArea({ invalid, className, rows = 3, ...rest }: TextAreaProps) {
  return (
    <textarea
      {...rest}
      rows={rows}
      aria-invalid={invalid || undefined}
      className={cn(FIELD_BASE, 'py-2 resize-none', invalid ? FIELD_INVALID : FIELD_VALID, className)}
    />
  )
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean
  children: ReactNode
}
export function Select({ invalid, className, children, ...rest }: SelectProps) {
  return (
    <div className="relative">
      <select
        {...rest}
        aria-invalid={invalid || undefined}
        className={cn(FIELD_BASE, 'h-9 appearance-none cursor-pointer pr-8', invalid ? FIELD_INVALID : FIELD_VALID, className)}
      >
        {children}
      </select>
      <ChevronDown
        size={12}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none"
        aria-hidden="true"
      />
    </div>
  )
}
