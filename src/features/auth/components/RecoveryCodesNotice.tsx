interface RecoveryCodesNoticeProps {
  codes: string[]
  onContinue: () => void
}

/**
 * Códigos de recuperação são exibidos uma única vez: o servidor guarda apenas o
 * hash e não consegue mostrá-los de novo.
 */
export function RecoveryCodesNotice({ codes, onContinue }: RecoveryCodesNoticeProps) {
  return (
    <div>
      <h1
        className="text-[2.05rem] font-medium leading-[1.12] tracking-[-0.03em]"
        style={{ color: 'var(--ink)' }}
      >
        Guarde seus códigos de recuperação
      </h1>
      <p
        className="mt-2.5 text-[0.92rem] leading-relaxed"
        style={{ color: 'var(--ink-soft)' }}
      >
        Eles servem para entrar caso você perca o aplicativo autenticador. Cada
        código vale uma única vez e esta é a única vez que eles aparecem.
      </p>

      <ul
        className="mt-4 grid grid-cols-2 gap-2 rounded-xl p-3"
        style={{ background: 'var(--field)', border: '1px solid var(--field-bd)' }}
      >
        {codes.map((code) => (
          <li
            key={code}
            className="text-center text-[0.85rem] font-mono tracking-wide select-all"
            style={{ color: 'var(--ink)' }}
          >
            {code}
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onContinue}
        className="mt-5 w-full h-10 text-sm font-semibold rounded-lg cursor-pointer transition-[filter] duration-200 hover:brightness-110"
        style={{ color: 'var(--btn-ink)', background: 'var(--btn)', border: 'none' }}
      >
        Salvei meus códigos, continuar
      </button>
    </div>
  )
}
