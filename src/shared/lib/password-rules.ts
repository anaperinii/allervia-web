interface PasswordRule {
  label: string
  test: (password: string) => boolean
}

export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_BYTES = 72
export const passwordCharacterLength = (password: string) => Array.from(password.replace(/[\uFE0E\uFE0F]/g, '')).length
export const passwordByteLength = (password: string) => new TextEncoder().encode(password).length
export const PASSWORD_RULES: PasswordRule[] = [
  { label: 'Mínimo de 8 caracteres', test: password => passwordCharacterLength(password) >= PASSWORD_MIN_LENGTH },
  { label: 'Máximo de 72 bytes UTF-8 (acentos e emoji ocupam mais bytes)', test: password => passwordByteLength(password) <= PASSWORD_MAX_BYTES },
]
