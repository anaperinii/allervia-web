/**
 * Marca do Allervia reinterpretada como ornamento: os nós da molécula em branco
 * translúcido, no canto direito do card.
 */
const NODES = [
  { cx: 60, cy: 34, r: 21 },
  { cx: 96, cy: 74, r: 21 },
  { cx: 54, cy: 88, r: 25 },
  { cx: 22, cy: 56, r: 11 },
] as const

export function MoleculeWeb({ className }: { className?: string }) {
  return (
    <svg
      width={128}
      height={128}
      viewBox="0 0 128 128"
      className={className}
      aria-hidden="true"
    >
      {NODES.map((node, index) => (
        <circle
          key={`node-${index}`}
          cx={node.cx}
          cy={node.cy}
          r={node.r}
          fill="#FFFFFF"
          fillOpacity={0.06}
        />
      ))}
    </svg>
  )
}
