interface SectionCardProps {
  label?: string
  helper?: string
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'muted'
}

export function SectionCard({ label, helper, children, className = '', variant = 'default' }: SectionCardProps) {
  const bg = variant === 'muted' ? 'bg-cream-dark' : 'bg-white'
  return (
    <div className={`${bg} border border-olive/15 rounded-lg p-5 ${className}`}>
      {label && (
        <p className="text-[10px] uppercase tracking-[1.5px] text-ink-muted mb-3">{label}</p>
      )}
      {helper && (
        <p className="text-[11px] text-ink-muted font-light mb-3">{helper}</p>
      )}
      {children}
    </div>
  )
}
