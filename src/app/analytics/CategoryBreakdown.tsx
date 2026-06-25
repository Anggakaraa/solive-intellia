import { SectionCard } from '@/components/ui/section-card'

export type CategoryData = {
  name: string
  units: number
  revenue: number
  margin: number
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}m`
  if (n >= 1_000)     return `Rp ${Math.round(n / 1_000)}k`
  return `Rp ${n}`
}

export function CategoryBreakdown({ categories }: { categories: CategoryData[] }) {
  const totalRevenue = categories.reduce((s, c) => s + c.revenue, 0)
  const totalMargin  = categories.reduce((s, c) => s + c.margin,  0)
  const totalUnits   = categories.reduce((s, c) => s + c.units,   0)

  const sorted = [...categories].sort((a, b) => b.revenue - a.revenue)

  return (
    <SectionCard label="By Category">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-olive/10 -mx-5 px-5 mb-0">
        <span className="flex-1 text-[10px] text-ink-muted uppercase tracking-wide">Category</span>
        <span className="w-20 text-right text-[10px] text-ink-muted uppercase tracking-wide">Revenue</span>
        <span className="w-10 text-right text-[10px] text-ink-muted uppercase tracking-wide">%</span>
        <span className="w-20 text-right text-[10px] text-ink-muted uppercase tracking-wide">Margin</span>
        <span className="w-10 text-right text-[10px] text-ink-muted uppercase tracking-wide">%</span>
        <span className="w-16 text-right text-[10px] text-ink-muted uppercase tracking-wide">Units</span>
        <span className="w-10 text-right text-[10px] text-ink-muted uppercase tracking-wide">%</span>
      </div>

      <div className="space-y-0 -mx-5 -mb-5">
        {sorted.map((cat) => (
          <div key={cat.name} className="flex items-baseline gap-2 px-5 py-3 border-t border-olive/10">
            <span className="flex-1 text-sm text-ink truncate">{cat.name}</span>
            <span className="w-20 text-right text-sm text-ink tabular-nums shrink-0">
              {fmt(cat.revenue)}
            </span>
            <span className="w-10 text-right text-[11px] text-ink-muted tabular-nums shrink-0">
              {totalRevenue > 0 ? Math.round((cat.revenue / totalRevenue) * 100) : 0}%
            </span>
            <span className="w-20 text-right text-sm text-ink tabular-nums shrink-0">
              {fmt(cat.margin)}
            </span>
            <span className="w-10 text-right text-[11px] text-ink-muted tabular-nums shrink-0">
              {totalMargin > 0 ? Math.round((cat.margin / totalMargin) * 100) : 0}%
            </span>
            <span className="w-16 text-right text-sm text-ink tabular-nums shrink-0">
              {cat.units.toLocaleString()}
            </span>
            <span className="w-10 text-right text-[11px] text-ink-muted tabular-nums shrink-0">
              {totalUnits > 0 ? Math.round((cat.units / totalUnits) * 100) : 0}%
            </span>
          </div>
        ))}

        {/* Totals row */}
        <div className="flex items-baseline gap-2 px-5 py-3 border-t-2 border-olive/20 bg-olive/[0.03]">
          <span className="flex-1 text-[12px] font-medium text-ink-muted uppercase tracking-wide">Total</span>
          <span className="w-20 text-right text-sm font-medium text-ink tabular-nums shrink-0">
            {fmt(totalRevenue)}
          </span>
          <span className="w-10 text-right text-[11px] text-ink-muted tabular-nums shrink-0"></span>
          <span className="w-20 text-right text-sm font-medium text-ink tabular-nums shrink-0">
            {fmt(totalMargin)}
          </span>
          <span className="w-10 text-right text-[11px] text-ink-muted tabular-nums shrink-0">
            {totalRevenue > 0 ? Math.round((totalMargin / totalRevenue) * 100) : 0}%
          </span>
          <span className="w-16 text-right text-sm font-medium text-ink tabular-nums shrink-0">
            {totalUnits.toLocaleString()}
          </span>
          <span className="w-10 text-right text-[11px] text-ink-muted tabular-nums shrink-0"></span>
        </div>
      </div>
    </SectionCard>
  )
}
