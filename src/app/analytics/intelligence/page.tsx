import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/ui/page-header'
import { FFDMatrix, type FFDCell } from '../FFDMatrix'
import { PantryMatrix, type PantryPoint } from '../PantryMatrix'

export default async function IntelligencePage() {
  const supabase = await createClient()

  const { data: menuItems } = await supabase
    .from('menu_items')
    .select('id, name, format_familiarity, flavor_discovery, status, unit_price, cost_per_unit')

  const { data: pantryItems } = await supabase
    .from('pantry_items')
    .select('id, name')

  const { data: pantryLinks } = await supabase
    .from('menu_item_pantry_links')
    .select('menu_item_id, pantry_item_id')

  // All-time sales for margin + units
  const { data: allTxData } = await supabase
    .from('sales_transactions')
    .select('sales_items(quantity, menu_item_id)')

  const menuMap  = Object.fromEntries((menuItems  ?? []).map((m) => [m.id, m]))
  const pantryMap = Object.fromEntries((pantryItems ?? []).map((p) => [p.id, p]))

  // Compute all-time units and margin per dish
  const dishUnits: Record<string, number>  = {}
  const dishMargin: Record<string, number> = {}

  for (const tx of allTxData ?? []) {
    const items = tx.sales_items as { quantity: number; menu_item_id: string | null }[] | null
    for (const item of items ?? []) {
      if (!item.menu_item_id) continue
      const mi = menuMap[item.menu_item_id]
      if (!mi) continue
      dishUnits[item.menu_item_id]  = (dishUnits[item.menu_item_id]  ?? 0) + item.quantity
      dishMargin[item.menu_item_id] = (dishMargin[item.menu_item_id] ?? 0) +
        item.quantity * ((mi.unit_price ?? 0) - (mi.cost_per_unit ?? 0))
    }
  }

  // ── FF/FD cells ───────────────────────────────────────────
  const ffdAccum: Record<string, {
    margin: number; dishNames: string[]; conceptNames: string[]
  }> = {}

  for (const mi of menuItems ?? []) {
    const ff = mi.format_familiarity
    const fd = mi.flavor_discovery
    if (!ff || !fd) continue
    const key = `${ff}-${fd}`
    if (!ffdAccum[key]) ffdAccum[key] = { margin: 0, dishNames: [], conceptNames: [] }
    if (mi.status === 'active') {
      ffdAccum[key].dishNames.push(mi.name)
      ffdAccum[key].margin += dishMargin[mi.id] ?? 0
    } else if (mi.status === 'concept') {
      ffdAccum[key].conceptNames.push(mi.name)
    }
  }

  const ffdCells: FFDCell[] = Object.entries(ffdAccum).map(([key, val]) => {
    const [ff, fd] = key.split('-').map(Number)
    return {
      ff, fd,
      margin:        val.margin,
      activeDishes:  val.dishNames.length,
      conceptDishes: val.conceptNames.length,
      dishNames:     val.dishNames,
      conceptNames:  val.conceptNames,
    }
  })

  // ── Pantry points ─────────────────────────────────────────
  // Only count active dishes; a dish's units are attributed to each pantry item it uses.
  const pantryAccum: Record<string, { dishNames: string[]; totalUnits: number }> = {}

  for (const link of pantryLinks ?? []) {
    const mi = menuMap[link.menu_item_id]
    if (!mi || mi.status !== 'active') continue
    const pid = link.pantry_item_id
    if (!pantryAccum[pid]) pantryAccum[pid] = { dishNames: [], totalUnits: 0 }
    pantryAccum[pid].dishNames.push(mi.name)
    pantryAccum[pid].totalUnits += dishUnits[link.menu_item_id] ?? 0
  }

  const pantryPoints: PantryPoint[] = Object.entries(pantryAccum)
    .map(([pid, val]) => ({
      name:       pantryMap[pid]?.name ?? pid,
      dishCount:  val.dishNames.length,
      totalUnits: val.totalUnits,
      dishNames:  val.dishNames,
    }))
    .filter((p) => p.dishCount > 0)

  return (
    <div className="max-w-3xl">
      <PageHeader
        eyebrow="Analytics"
        title="Menu Intelligence"
        subtitle="All time"
      />

      <div className="space-y-4">
        <FFDMatrix cells={ffdCells} />
        <PantryMatrix points={pantryPoints} />
      </div>
    </div>
  )
}
