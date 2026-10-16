interface PasswordRule {
  label: string
  test: (password: string) => boolean
}

export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 20
export const PASSWORD_MAX_BYTES = 72

const VARIATION_SELECTOR_PATTERN = new RegExp('[\\uFE0E\\uFE0F]', 'g')
export const passwordCharacterLength = (password: string) => Array.from(password.replace(VARIATION_SELECTOR_PATTERN, '')).length
export const passwordByteLength = (password: string) => new TextEncoder().encode(password).length

const UPPERCASE_PATTERN = /[A-Z]/
const LOWERCASE_PATTERN = /[a-z]/
const DIGIT_PATTERN = /\d/
const SPECIAL_CHAR_PATTERN = /[^A-Za-z0-9]/

export const PASSWORD_RULES: PasswordRule[] = [
  { label: 'Entre 8 e 20 caracteres', test: password => passwordCharacterLength(password) >= PASSWORD_MIN_LENGTH && passwordCharacterLength(password) <= PASSWORD_MAX_LENGTH },
  { label: 'Uma letra maiúscula', test: password => UPPERCASE_PATTERN.test(password) },
  { label: 'Uma letra minúscula', test: password => LOWERCASE_PATTERN.test(password) },
  { label: 'Um número', test: password => DIGIT_PATTERN.test(password) },
  { label: 'Um caractere especial', test: password => SPECIAL_CHAR_PATTERN.test(password) },
]

export const isPasswordValid = (password: string) =>
  PASSWORD_RULES.every(rule => rule.test(password)) &&
  passwordByteLength(password) <= PASSWORD_MAX_BYTES
