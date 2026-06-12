type PillVariant = 'olive' | 'cream' | 'default' | 'faint'

const variantCls: Record<PillVariant, string> = {
  olive:   'bg-olive text-cream border-olive',
  cream:   'bg-cream-dark text-ink-mid border-transparent',
  default: 'bg-white text-ink-mid border-olive/20',
  faint:   'bg-olive-faint text-olive border-olive/20',
}

interface PillProps {
  children: React.ReactNode
  variant?: PillVariant
  className?: string
}

export function Pill({ children, variant = 'default', className = '' }: PillProps) {
  return (
    <span
      className={`text-[11px] px-2.5 py-1 rounded-full border inline-block ${variantCls[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
