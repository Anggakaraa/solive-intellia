interface FieldProps {
  label: string
  helper?: string
  children: React.ReactNode
  className?: string
}

export function Field({ label, helper, children, className = '' }: FieldProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-[13px] font-medium text-ink">{label}</label>
      {helper && (
        <p className="text-[11px] text-ink-muted font-light leading-snug">{helper}</p>
      )}
      {children}
    </div>
  )
}
