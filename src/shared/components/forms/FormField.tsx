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
  'w-full border bg-white px-4 text-xs placeholder:text-(--text-muted)/60 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#257E8C]/35 focus:border-[#257E8C] transition-all'
const FIELD_INVALID = 'border-red-400 bg-red-50/40'
const FIELD_VALID = 'border-[#DDE6E6]'

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean
}

export function TextInput({ invalid, className, ...rest }: TextInputProps) {
  return (
    <input
      {...rest}
      aria-invalid={invalid || undefined}
      className={cn(FIELD_BASE, 'h-9 rounded-full', invalid ? FIELD_INVALID : FIELD_VALID, className)}
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
      className={cn(FIELD_BASE, 'rounded-2xl py-2.5 resize-none', invalid ? FIELD_INVALID : FIELD_VALID, className)}
    />
  )
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean
  children: ReactNode
}
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
