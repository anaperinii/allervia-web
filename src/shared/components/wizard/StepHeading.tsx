interface StepHeadingProps {
  description: string
}

export function StepHeading({ description }: StepHeadingProps) {
  return <p className="text-[0.78rem] leading-relaxed text-(--text-muted)">{description}</p>
}
