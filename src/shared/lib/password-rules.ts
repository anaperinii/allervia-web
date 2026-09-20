
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
