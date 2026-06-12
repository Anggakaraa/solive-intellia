import { createClient } from '@/lib/supabase/server'
import { MenuItemForm } from '../menu-item-form'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { notFound } from 'next/navigation'

export default async function EditMenuItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [
    { data: item },
    { data: categories },
    { data: flavors },
    { data: roles },
    { data: pantryItems },
    { data: pantryLinks },
  ] = await Promise.all([
    supabase.from('menu_items').select('*').eq('id', id).single(),
    supabase.from('menu_categories').select('name').order('name'),
    supabase.from('flavor_identities').select('name').order('name'),
    supabase.from('strategic_roles').select('name').order('name'),
    supabase.from('pantry_items').select('id, name').order('name'),
    supabase.from('menu_item_pantry_links').select('pantry_item_id').eq('menu_item_id', id),
  ])

  if (!item) notFound()

  const selectedPantryIds = pantryLinks?.map((l) => l.pantry_item_id) ?? []
  const initialPantryItems = pantryItems
    ?.filter((p) => selectedPantryIds.includes(p.id))
    .map((p) => p.name) ?? []

  return (
    <div>
      <Link
        href="/menu-items"
        className="flex items-center gap-1 text-[13px] text-ink-muted hover:text-ink mb-6 transition-colors"
      >
        <ChevronLeft size={14} /> Menu Items
      </Link>
      <div className="mb-9">
        <p className="text-[10px] uppercase tracking-[2px] text-ink-muted mb-1.5">Menu Items</p>
        <h1 className="font-serif text-3xl font-normal text-ink tracking-tight leading-tight">
          {item.name}
        </h1>
      </div>
      <MenuItemForm
        item={item}
        initialPantryItems={initialPantryItems}
        categoryOptions={categories?.map((c) => c.name) ?? []}
        flavorOptions={flavors?.map((f) => f.name) ?? []}
        strategicRoleOptions={roles?.map((r) => r.name) ?? []}
        pantryItemOptions={pantryItems ?? []}
      />
    </div>
  )
}
