import { cn } from '@/shared/lib/cn'
import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown } from '@fortawesome/free-solid-svg-icons'

interface FieldLabelProps {
  label: string
  required?: boolean
  hint?: string
  children: ReactNode
  error?: string | null
  helperText?: string
}

export function FieldLabel({ label, required, hint, children, error, helperText }: FieldLabelProps) {
  return (
    <div>
      <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">
        {label}
        {required && <span className="text-red-400"> *</span>}
        {hint && <span className="text-(--text-muted) font-normal"> {hint}</span>}
      </label>
      {children}
      {error && <span className="text-[0.6rem] text-red-500 mt-0.5 block">{error}</span>}
      {!error && helperText && <span className="text-[0.55rem] text-(--text-muted) mt-0.5 block">{helperText}</span>}
    </div>
  )
}

const FIELD_BASE =
  'w-full rounded-lg border bg-gray-50/60 px-3 text-xs placeholder:text-(--text-muted)/60 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all'
const FIELD_INVALID = 'border-red-400 bg-red-50/30'
const FIELD_VALID = 'border-(--border-custom)'

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean
}

export function TextInput({ invalid, className, ...rest }: TextInputProps) {
  return <input {...rest} aria-invalid={invalid || undefined} className={cn(FIELD_BASE, 'h-9', invalid ? FIELD_INVALID : FIELD_VALID, className)} />
}

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean
}
export function TextArea({ invalid, className, rows = 3, ...rest }: TextAreaProps) {
  return <textarea {...rest} rows={rows} aria-invalid={invalid || undefined} className={cn(FIELD_BASE, 'py-2 resize-none', invalid ? FIELD_INVALID : FIELD_VALID, className)} />
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean
  children: ReactNode
}
// Selects wear the toolbar pill instead of the boxed field so they match the
// SelectPill used in page headers.
const SELECT_BASE =
  'w-full h-9 appearance-none cursor-pointer rounded-full border bg-white pl-4 pr-9 text-[0.78rem] font-medium text-[#4A6469] transition-all focus:outline-none focus:border-[#12333a]/40'

export function Select({ invalid, className, children, ...rest }: SelectProps) {
  return (
    <div className="relative">
      <select
        {...rest}
        aria-invalid={invalid || undefined}
        className={cn(SELECT_BASE, invalid ? FIELD_INVALID : 'border-[#DDE6E6]', className)}
      >
        {children}
      </select>
      <FontAwesomeIcon
        icon={faChevronDown}
        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#4A6469] pointer-events-none"
        style={{ fontSize: 11 }}
      />
    </div>
  )
}
