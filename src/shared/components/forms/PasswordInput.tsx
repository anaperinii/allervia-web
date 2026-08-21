import { useState } from 'react'
import { TextInput } from './FormField'
import { cn } from '@/shared/lib/cn'
import type { InputHTMLAttributes } from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  invalid?: boolean
  iconSize?: number
}

export function PasswordInput({ invalid, iconSize = 16, className, ...rest }: PasswordInputProps) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="relative">
      <TextInput
        type={visible ? 'text' : 'password'}
        invalid={invalid}
        className={cn('pr-9', className)}
        {...rest}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        tabIndex={-1}
        aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-(--text-muted)/60 hover:text-(--text-muted) transition-colors"
      >
        {visible ? <FontAwesomeIcon icon={faEyeSlash} style={{ fontSize: iconSize }} /> : <FontAwesomeIcon icon={faEye} style={{ fontSize: iconSize }} />}
      </button>
    </div>
  )
}
