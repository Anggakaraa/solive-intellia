interface SectionLabelProps {
  label: string
  icon?: React.ReactNode
  className?: string
}

export function SectionLabel({ label, icon, className = '' }: SectionLabelProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="h-px flex-1 bg-olive/15" />
      {icon && <span className="text-ink-muted shrink-0">{icon}</span>}
      <p className="text-[10px] uppercase tracking-[2px] text-ink-muted shrink-0">{label}</p>
      <div className="h-px flex-1 bg-olive/15" />
    </div>
  )
}
