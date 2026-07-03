export function AllerviaAuthBackground() {
  return (
    <>
      <img
        src="/allervia-auth-bg.png"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ zIndex: 0 }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          zIndex: 1,
          background:
            'radial-gradient(125% 85% at 50% -8%, var(--ll-overlay-radial-1) 0%, var(--ll-overlay-radial-2) 52%, var(--ll-overlay-radial-3) 100%)',
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          zIndex: 2,
          backgroundImage:
            'radial-gradient(rgba(220,225,229,0.06) 0.5px, transparent 0.5px)',
          backgroundSize: '3px 3px',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{
          zIndex: 2,
          top: '20%',
          left: '50%',
          width: '70vmax',
          height: '70vmax',
          background:
            'radial-gradient(circle, var(--ll-halo-accent-strong), transparent 62%)',
          transform: 'translate(-50%, -50%)',
          animation: 'av-drift-1 18s ease-in-out infinite',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{
          zIndex: 2,
          top: '60%',
          left: '20%',
          width: '50vmax',
          height: '50vmax',
          background:
            'radial-gradient(circle, var(--ll-halo-dot), transparent 60%)',
          transform: 'translate(-50%, -50%)',
          animation: 'av-drift-2 22s ease-in-out infinite',
        }}
      />
    </>
  )
}
