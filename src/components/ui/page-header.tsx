interface PageHeaderProps {
  eyebrow: string
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export function PageHeader({ eyebrow, title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="mb-9">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-[2px] text-ink-muted mb-1.5">{eyebrow}</p>
          <h1 className="font-serif text-3xl font-normal text-ink tracking-tight leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-ink-mid font-light mt-1.5 leading-relaxed">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-4 mt-1 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}
