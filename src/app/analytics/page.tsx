import Link from 'next/link'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/ui/page-header'
import { SectionCard } from '@/components/ui/section-card'
import { mutedBtnCls } from '@/lib/styles'
import { PeriodPicker } from './PeriodPicker'
import { CategoryBreakdown, type CategoryData } from './CategoryBreakdown'
import { MarginMatrix, type MatrixDish } from './MarginMatrix'

// ── Types ─────────────────────────────────────────────────

type RollingTrend = 'trending_up' | 'trending_down' | 'stable' | 'insufficient_history'

type DishAgg = {
  id: string
  name: string
  category: string | null
  units: number
  revenue: number
  margin: number
  marginPct: number
  rollingTrend: RollingTrend
  upCount: number
  downCount: number
  windowSize: number
  severityPct: number
  avgMonthlyUnits: number
}

// ── Helpers ───────────────────────────────────────────────


function formatRevenue(n: number): string {
  if (n >= 1_000_000) return `Rp ${Math.round(n / 1_000_000)}m`
  if (n >= 1_000) return `Rp ${Math.round(n / 1_000)}k`
  return `Rp ${n}`
}

// Rolling trend: 3-of-4 months rule based on share-of-restaurant direction.
// Share normalises away restaurant-wide busy/slow months — a dish that ticks up
// in raw units but whose share fell is still counted as down.
// No threshold: any share movement (even 0.001%) counts as a direction.
// Severity = % change in raw units from window-start to window-end.
function computeRollingTrend(
  dishMonthly: Record<string, number>,
  restMonthly: Record<string, number>,
): {
  trend: RollingTrend; upCount: number; downCount: number; windowSize: number; severityPct: number
} {
  const months = Object.keys(dishMonthly)
    .filter((m) => restMonthly[m] > 0)
    .sort()
  if (months.length < 2) {
    return { trend: 'insufficient_history', upCount: 0, downCount: 0, windowSize: 0, severityPct: 0 }
  }

  const directions: number[] = []
  for (let i = 1; i < months.length; i++) {
    const shareCurr = dishMonthly[months[i]]     / restMonthly[months[i]]
    const sharePrev = dishMonthly[months[i - 1]] / restMonthly[months[i - 1]]
    const delta = shareCurr - sharePrev
    directions.push(delta > 0 ? 1 : delta < 0 ? -1 : 0)
  }

  const last4      = directions.slice(-4)
  const windowSize = last4.length
  if (windowSize < 3) {
    return { trend: 'insufficient_history', upCount: 0, downCount: 0, windowSize, severityPct: 0 }
  }

  const upCount   = last4.filter((d) => d ===  1).length
  const downCount = last4.filter((d) => d === -1).length
  const trend: RollingTrend = upCount >= 3 ? 'trending_up' : downCount >= 3 ? 'trending_down' : 'stable'

  // Severity: relative change in share from window-start to window-end.
  // Share-based so it's always coherent with the direction (a dish can lose
  // raw units but grow in share if the restaurant shrank faster).
  const windowStart  = months[months.length - windowSize - 1]
  const windowEnd    = months[months.length - 1]
  const shareStart   = dishMonthly[windowStart] / restMonthly[windowStart]
  const shareEnd     = dishMonthly[windowEnd]   / restMonthly[windowEnd]
  const severityPct  = shareStart > 0 ? ((shareEnd - shareStart) / shareStart) * 100 : 0

  return { trend, upCount, downCount, windowSize, severityPct }
}

// ── UI components ─────────────────────────────────────────

// ── Page ──────────────────────────────────────────────────

export default async function AnalyticsDashboard(props: {
  searchParams: Promise<{ from?: string; to?: string }>
}) {
  const { from = '', to = '' } = await props.searchParams

  const supabase = await createClient()

  const { data: imports } = await supabase
    .from('sales_imports')
    .select('date_from, date_to')
    .order('date_from')

  const minDate = imports?.[0]?.date_from?.slice(0, 10) ?? ''
  const maxDate = imports?.at(-1)?.date_to?.slice(0, 10)  ?? ''

  // All unique months for the MoM trend comparison (still needed for trendPrev logic)
  const availableMonths = [...new Set(
    (imports ?? []).map((i) => i.date_from.slice(0, 7))
  )].sort()

  const { data: allTxData } = await supabase
    .from('sales_transactions')
    .select('date, sales_items(quantity, menu_item_id)')
    .order('date')

  const { data: menuItemsRaw } = await supabase
    .from('menu_items')
    .select('id, name, category, unit_price, cost_per_unit')

  const menuMap = Object.fromEntries(
    (menuItemsRaw ?? []).map((m) => [m.id, m])
  )

  // ── Aggregation ───────────────────────────────────────

  type DishAccum = {
    id: string; name: string; category: string | null
    units: number; revenue: number; cost: number
    unitPrice: number; costPerUnit: number
    monthlyUnits: Record<string, number>
    monthlyMargin: Record<string, number>
  }

  const dishAgg: Record<string, DishAccum> = {}
  const restMonthlyUnits: Record<string, number> = {}

  for (const tx of allTxData ?? []) {
    const txMonth  = tx.date.substring(0, 7)
    const inPeriod = (!from || tx.date >= from) && (!to || tx.date <= to + 'T23:59:59')
    const items    = tx.sales_items as { quantity: number; menu_item_id: string | null }[] | null

    for (const item of items ?? []) {
      if (!item.menu_item_id) continue
      const mi = menuMap[item.menu_item_id]
      if (!mi) continue

      restMonthlyUnits[txMonth] = (restMonthlyUnits[txMonth] ?? 0) + item.quantity

      if (!dishAgg[item.menu_item_id]) {
        dishAgg[item.menu_item_id] = {
          id: mi.id, name: mi.name, category: mi.category,
          units: 0, revenue: 0, cost: 0,
          unitPrice: mi.unit_price ?? 0,
          costPerUnit: mi.cost_per_unit ?? 0,
          monthlyUnits: {},
          monthlyMargin: {},
        }
      }

      const d          = dishAgg[item.menu_item_id]
      const itemMargin = item.quantity * ((mi.unit_price ?? 0) - (mi.cost_per_unit ?? 0))

      d.monthlyUnits[txMonth]  = (d.monthlyUnits[txMonth]  ?? 0) + item.quantity
      d.monthlyMargin[txMonth] = (d.monthlyMargin[txMonth] ?? 0) + itemMargin

      if (inPeriod) {
        d.units   += item.quantity
        d.revenue += item.quantity * (mi.unit_price    ?? 0)
        d.cost    += item.quantity * (mi.cost_per_unit ?? 0)
      }
    }
  }

  // ── Build dish list ───────────────────────────────────

  const dishes: DishAgg[] = Object.values(dishAgg)
    .filter((d) => d.units > 0)
    .map((d) => {
      const { trend: rollingTrend, upCount, downCount, windowSize, severityPct } =
        computeRollingTrend(d.monthlyUnits, restMonthlyUnits)

      const monthValues = Object.values(d.monthlyUnits)
      const avgMonthlyUnits = monthValues.length
        ? Math.round(monthValues.reduce((s, v) => s + v, 0) / monthValues.length)
        : 0

      return {
        id: d.id, name: d.name, category: d.category,
        units: d.units,
        revenue: d.revenue,
        margin: d.revenue - d.cost,
        marginPct: d.unitPrice > 0 ? Math.round((1 - d.costPerUnit / d.unitPrice) * 100) : 0,
        rollingTrend,
        upCount,
        downCount,
        windowSize,
        severityPct,
        avgMonthlyUnits,
      }
    })

  const bestSellers     = [...dishes].sort((a, b) => b.units  - a.units).slice(0, 5)
  const topContributors = [...dishes].sort((a, b) => b.margin - a.margin).slice(0, 5)

  // 3-of-4 filter, ranked by severity, capped at 5
  const trendingUp   = [...dishes]
    .filter((d) => d.rollingTrend === 'trending_up')
    .sort((a, b) => b.severityPct - a.severityPct)
    .slice(0, 5)

  const trendingDown = [...dishes]
    .filter((d) => d.rollingTrend === 'trending_down')
    .sort((a, b) => a.severityPct - b.severityPct)
    .slice(0, 5)

  const catAgg: Record<string, CategoryData> = {}
  for (const d of dishes) {
    const cat = d.category ?? 'Other'
    if (!catAgg[cat]) catAgg[cat] = { name: cat, units: 0, margin: 0 }
    catAgg[cat].units  += d.units
    catAgg[cat].margin += d.margin
  }
  const categories = Object.values(catAgg).sort((a, b) => b.margin - a.margin)

  const totalUnits  = dishes.reduce((s, d) => s + d.units,  0)
  const totalMargin = dishes.reduce((s, d) => s + d.margin, 0)


  // Exclude dishes with no price/cost data (they'd plot at origin)
  const matrixDishes: MatrixDish[] = dishes
    .filter((d) => d.revenue > 0 && d.marginPct > 0)
    .map((d) => ({ id: d.id, name: d.name, revenue: d.revenue, marginPct: d.marginPct, units: d.units }))

  const hasData = dishes.length > 0

  function fmtDate(d: string) {
    return new Date(d + 'T00:00:00Z').toLocaleDateString('en-AU', {
      day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
    })
  }
  const periodLabel = from || to
    ? [from && fmtDate(from), to && fmtDate(to)].filter(Boolean).join(' – ')
    : 'All time'

  return (
    <div className="max-w-3xl">
      <PageHeader
        eyebrow="Analytics"
        title="Performance"
        subtitle={periodLabel}
      />

      {minDate && (
        <div className="mb-8 flex items-center gap-3">
          <span className="text-[12px] text-ink-muted font-light shrink-0">Choose period</span>
          <Suspense>
            <PeriodPicker minDate={minDate} maxDate={maxDate} />
          </Suspense>
        </div>
      )}

      {!hasData ? (
        <div className="border border-dashed border-olive/25 rounded-lg px-8 py-16 text-center">
          <p className="text-sm text-ink-muted font-light mb-4">No sales data for this period.</p>
          <Link href="/analytics/import" className="text-[12px] text-olive font-medium hover:underline">
            Import sales data →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">

          {/* Best sellers + Top contributors */}
          <div className="grid grid-cols-2 gap-4">
            <SectionCard label="Best Sellers">
              <div className="space-y-0 -mx-5 -mb-5">
                {bestSellers.map((d, i) => (
                  <div key={d.id} className="flex items-baseline gap-2 px-5 py-3 border-t border-olive/10 first:border-t-0">
                    <span className="text-[10px] text-ink-muted tabular-nums w-3 shrink-0">{i + 1}</span>
                    <span className="text-sm text-ink flex-1 truncate">{d.name}</span>
                    <span className="text-sm text-ink tabular-nums shrink-0">{d.units.toLocaleString()}</span>
                    <span className="text-[11px] text-ink-muted tabular-nums w-9 text-right shrink-0">
                      {totalUnits > 0 ? Math.round((d.units / totalUnits) * 100) : 0}%
                    </span>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard label="Top Contributors">
              <div className="space-y-0 -mx-5 -mb-5">
                {topContributors.map((d, i) => (
                  <div key={d.id} className="flex items-baseline gap-2 px-5 py-3 border-t border-olive/10 first:border-t-0">
                    <span className="text-[10px] text-ink-muted tabular-nums w-3 shrink-0">{i + 1}</span>
                    <span className="text-sm text-ink flex-1 truncate">{d.name}</span>
                    <span className="text-sm text-ink tabular-nums shrink-0">{formatRevenue(d.margin)}</span>
                    <span className="text-[11px] text-ink-muted tabular-nums w-9 text-right shrink-0">
                      {totalMargin > 0 ? Math.round((d.margin / totalMargin) * 100) : 0}%
                    </span>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          {/* Rolling trend — Gaining Ground / Watch List */}
          {(trendingUp.length > 0 || trendingDown.length > 0) && (
            <div className="grid grid-cols-2 gap-4">

              <SectionCard label="Gaining Ground">
                <div className="space-y-0 -mx-5 -mb-5">
                  {trendingUp.map((d) => (
                    <div key={d.id} className="flex justify-between items-center px-5 py-3 border-t border-olive/10 first:border-t-0">
                      <p className="text-sm text-ink truncate">{d.name}</p>
                      <p className="shrink-0 ml-4 text-sm font-medium tabular-nums text-[#3B6D11]">
                        +{Math.round(d.severityPct)}%
                      </p>
                    </div>
                  ))}
                </div>
              </SectionCard>

              <SectionCard label="Losing Ground">
                <div className="space-y-0 -mx-5 -mb-5">
                  {trendingDown.map((d) => (
                    <div key={d.id} className="flex justify-between items-center px-5 py-3 border-t border-olive/10 first:border-t-0">
                      <p className="text-sm text-ink truncate">{d.name}</p>
                      <p className="shrink-0 ml-4 text-sm font-medium tabular-nums text-[#A32D2D]">
                        {Math.round(d.severityPct)}%
                      </p>
                    </div>
                  ))}
                </div>
              </SectionCard>

            </div>
          )}

          {/* Category breakdown */}
          <CategoryBreakdown categories={categories} />

          {/* Revenue / Margin matrix */}
          <MarginMatrix dishes={matrixDishes} />


        </div>
      )}
    </div>
  )
}
