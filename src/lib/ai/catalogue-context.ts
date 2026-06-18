import type { SupabaseClient } from '@supabase/supabase-js'

type PantryItem = {
  id: string
  name: string
  flavor_contributions: string[]
  best_pairings: string[]
  cautions: string | null
}

type MenuItem = {
  id: string
  name: string
  category: string | null
  primary_flavor_identity: string | null
  secondary_flavor_identities: string[]
  format_familiarity: number | null
  flavor_discovery: number | null
  strategic_roles: string[]
}

type PantryLink = {
  menu_item_id: string
  pantry_items: { name: string } | null
}

export type CatalogueContext = {
  pantrySection: string
  menuSection: string
  baseRecipesLine: string
}

const CATEGORY_ORDER = ['Dips', 'Sides', 'Veggies', 'Large Plates', 'Dessert', 'Pockets']

export async function buildCatalogueContext(supabase: SupabaseClient): Promise<CatalogueContext> {
  const [
    { data: pantryItems },
    { data: menuItems },
    { data: pantryLinks },
  ] = await Promise.all([
    supabase
      .from('pantry_items')
      .select('id, name, flavor_contributions, best_pairings, cautions')
      .eq('status', 'active')
      .order('name'),
    supabase
      .from('menu_items')
      .select('id, name, category, primary_flavor_identity, secondary_flavor_identities, format_familiarity, flavor_discovery, strategic_roles')
      .eq('status', 'active')
      .order('name'),
    supabase
      .from('menu_item_pantry_links')
      .select('menu_item_id, pantry_items(name)'),
  ])

  console.log('[catalogue-context] Fetched from Supabase:', {
    pantryItems: (pantryItems ?? []).length,
    menuItems: (menuItems ?? []).filter(m => m.category !== 'Base Recipes').length,
    baseRecipes: (menuItems ?? []).filter(m => m.category === 'Base Recipes').length,
  })

  // ── Pantry section ──────────────────────────────────────────────
  const pantryLines = (pantryItems ?? [] as PantryItem[]).map((p) => {
    const flavors = (p.flavor_contributions ?? []).join(', ')
    const pairings = (p.best_pairings ?? []).join(', ')
    const caution = p.cautions ? ` ${p.cautions}` : ''
    return `**${p.name}** | ${flavors} — Best with: ${pairings}.${caution}`
  })

  // ── Pantry link map ─────────────────────────────────────────────
  const linkMap: Record<string, string[]> = {}
  for (const link of (pantryLinks ?? []) as unknown as PantryLink[]) {
    if (!link.pantry_items) continue
    if (!linkMap[link.menu_item_id]) linkMap[link.menu_item_id] = []
    linkMap[link.menu_item_id].push(link.pantry_items.name)
  }

  // ── Menu section ────────────────────────────────────────────────
  const all = menuItems ?? [] as MenuItem[]
  const baseRecipes = all.filter((m) => m.category === 'Base Recipes')
  const dishes = all.filter((m) => m.category !== 'Base Recipes')

  const byCategory: Record<string, MenuItem[]> = {}
  for (const item of dishes) {
    const cat = item.category ?? 'Other'
    if (!byCategory[cat]) byCategory[cat] = []
    byCategory[cat].push(item)
  }

  const orderedCats = [
    ...CATEGORY_ORDER,
    ...Object.keys(byCategory).filter((c) => !CATEGORY_ORDER.includes(c)).sort(),
  ]

  const menuLines: string[] = [
    '**Format:** Name | Primary Flavor, Secondary Flavors | FF, FD | Strategic Role(s) | Pantry Used\n',
  ]

  for (const cat of orderedCats) {
    menuLines.push(`### ${cat}`)
    const items = byCategory[cat]
    if (!items || items.length === 0) {
      menuLines.push('*(empty — no active dishes in this category)*')
    } else {
      for (const item of items) {
        const secondary = (item.secondary_flavor_identities ?? []).join('/')
        const flavors = secondary
          ? `${item.primary_flavor_identity}, ${secondary}`
          : (item.primary_flavor_identity ?? '')
        const ff = item.format_familiarity ?? '?'
        const fd = item.flavor_discovery ?? '?'
        const roles = (item.strategic_roles ?? []).join(', ')
        const pantry = (linkMap[item.id] ?? []).join(', ')
        const pantryPart = pantry ? ` | ${pantry}` : ''
        menuLines.push(`- ${item.name} | ${flavors} | FF${ff}, FD${fd} | ${roles}${pantryPart}`)
      }
    }
    menuLines.push('')
  }

  // ── Base recipes line ───────────────────────────────────────────
  const baseRecipesLine = baseRecipes.map((r) => r.name).join(', ')

  return {
    pantrySection: pantryLines.join('\n\n'),
    menuSection: menuLines.join('\n'),
    baseRecipesLine,
  }
}
