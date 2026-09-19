import markForDark from '@/assets/allervia-mark-dark.png'
import markForLight from '@/assets/allervia-mark-light.png'
import loginArtDark from '@/assets/login-art-dark.jpg'
import loginArt from '@/assets/login-art.jpg'
import type { CSSProperties } from 'react'
export const AUTH_THEMES = {
  light: {
    shell: '#e8ecee',
    card: '#ffffff',
    ink: '#12333a',
    inkSoft: '#5b7c81',
    inkFaint: '#8aa4a8',
    field: '#f4f7f8',
    fieldSolid: '#f4f7f8',
    fieldBd: 'rgba(16,113,129,0.16)',
    bd: 'rgba(16,113,129,0.12)',
    btn: '#12333a',
    btnInk: '#ffffff',
    accent: '#257E8C',
    accentAlt: '#3e5566',
    glass: 'rgba(12,45,52,0.06)',
    glassBd: 'rgba(12,45,52,0.20)',
    glassInk: '#12333a',
    ok: '#059669',
    okInk: '#047857',
    okBg: 'rgba(5,150,105,0.14)',
    err: '#c0392b',
    art: loginArt,
    scrim: 'linear-gradient(180deg, rgba(255,255,255,0) 34%, rgba(12,45,52,0.42) 100%)',
    mark: markForLight,
  },
  dark: {
    shell: '#070d0e',
    card: 'radial-gradient(120% 130% at 12% 8%, #16323a 0%, #0e2427 52%, #0a1b1e 100%)',
    ink: '#e9f2f1',
    inkSoft: '#93b0b2',
    inkFaint: '#6f8b8c',
    field: 'rgba(220,235,233,0.05)',
    fieldSolid: '#15292d',
    fieldBd: 'rgba(216,234,232,0.14)',
    bd: 'rgba(216,234,232,0.12)',
    btn: '#6C9EA5',
    btnInk: '#ffffff',
    accent: '#8fc2c6',
    accentAlt: '#b6c7d2',
    glass: 'rgba(220,235,233,0.06)',
    glassBd: 'rgba(216,234,232,0.24)',
    glassInk: '#e9f2f1',
    ok: '#34d399',
    okInk: '#a7f3d0',
    okBg: 'rgba(16,185,129,0.22)',
    err: '#ff9b9b',
    art: loginArtDark,
    scrim: 'linear-gradient(180deg, rgba(7,20,22,0.12) 30%, rgba(6,18,21,0.72) 100%)',
    mark: markForDark,
  },
}

type AuthTheme = typeof AUTH_THEMES.dark

export function authThemeVars(t: AuthTheme): CSSProperties {
  return {
    '--card': t.card,
    '--ink': t.ink,
    '--ink-soft': t.inkSoft,
    '--ink-faint': t.inkFaint,
    '--field': t.field,
    '--field-solid': t.fieldSolid,
    '--field-bd': t.fieldBd,
    '--bd': t.bd,
    '--btn': t.btn,
    '--btn-ink': t.btnInk,
    '--accent': t.accent,
    '--accent-alt': t.accentAlt,
    '--glass': t.glass,
    '--glass-bd': t.glassBd,
    '--glass-ink': t.glassInk,
    '--ok': t.ok,
    '--ok-ink': t.okInk,
    '--ok-bg': t.okBg,
    '--err': t.err,
  } as CSSProperties
}

export const AUTH_FIELD_CLASSES = `
  [&_input]:bg-[var(--field)]! [&_input]:border! [&_input]:border-[color:var(--field-bd)]! [&_input]:text-[color:var(--ink)]! [&_input]:rounded-xl!
  [&_input::placeholder]:text-[color:var(--ink-faint)]!
  [&_input:not([data-code-digit])]:h-9! [&_input:not([data-code-digit])]:text-[13.5px]!
  [&_select]:bg-[var(--field-solid)]! [&_select]:border! [&_select]:border-[color:var(--field-bd)]! [&_select]:text-[color:var(--ink)]! [&_select]:rounded-xl! [&_select]:h-9! [&_select]:text-[13.5px]!
  [&_select_option]:bg-[var(--field-solid)]! [&_select_option]:text-[color:var(--ink)]!
  [&_textarea]:bg-[var(--field)]! [&_textarea]:border! [&_textarea]:border-[color:var(--field-bd)]! [&_textarea]:text-[color:var(--ink)]! [&_textarea]:rounded-xl!
  [&_label]:text-[color:var(--ink)]! [&_label]:text-[11.5px]!
`
