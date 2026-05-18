import { useCallback, useRef, useState } from 'react'

export type FormErrors<T> = Partial<Record<keyof T, string>>
export type FormTouched<T> = Partial<Record<keyof T, boolean>>

export interface UseFormOptions<T extends Record<string, unknown>> {
  initial: T
  validate?: (values: T) => FormErrors<T>
}

export interface UseFormReturn<T extends Record<string, unknown>> {
  values: T
  errors: FormErrors<T>
  touched: FormTouched<T>
  set: <K extends keyof T>(field: K, value: T[K]) => void
  patch: (partial: Partial<T>) => void
  touch: <K extends keyof T>(field: K) => void
  validate: () => boolean
  showError: <K extends keyof T>(field: K) => boolean
  errorOf: <K extends keyof T>(field: K) => string | null
  reset: () => void
  setValues: (values: T) => void
  setErrors: (errors: FormErrors<T>) => void
}


export function useForm<T extends Record<string, unknown>>({ initial, validate: validator }: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValuesState] = useState<T>(initial)
  const [errors, setErrors] = useState<FormErrors<T>>({})
  const [touched, setTouched] = useState<FormTouched<T>>({})
  const initialRef = useRef(initial)

  const set = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValuesState((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }, [])

  const patch = useCallback((partial: Partial<T>) => {
    setValuesState((prev) => ({ ...prev, ...partial }))
  }, [])

  const touch = useCallback(<K extends keyof T>(field: K) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }, [])

  const validate = useCallback((): boolean => {
    if (!validator) return true
    const newErrors = validator(values)
    setErrors(newErrors)
    setTouched((prev) => {
      const next = { ...prev }
      for (const key of Object.keys(newErrors)) {
        next[key as keyof T] = true
      }
      return next
    })
    return Object.keys(newErrors).length === 0
  }, [values, validator])

  const showError = useCallback(<K extends keyof T>(field: K): boolean => {
    return Boolean(errors[field] && touched[field])
  }, [errors, touched])

  const errorOf = useCallback(<K extends keyof T>(field: K): string | null => {
    if (!errors[field] || !touched[field]) return null
    return errors[field] as string
  }, [errors, touched])

  const reset = useCallback(() => {
    setValuesState(initialRef.current)
    setErrors({})
    setTouched({})
  }, [])

  const setValues = useCallback((v: T) => {
    setValuesState(v)
  }, [])

  const setErrorsExternal = useCallback((e: FormErrors<T>) => {
    setErrors(e)
    setTouched((prev) => {
      const next = { ...prev }
      for (const key of Object.keys(e)) {
        next[key as keyof T] = true
      }
      return next
    })
  }, [])

  return { values, errors, touched, set, patch, touch, validate, showError, errorOf, reset, setValues, setErrors: setErrorsExternal }
}
