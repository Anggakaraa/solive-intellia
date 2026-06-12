import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { BackLink } from '@/components/ui/back-link'
import { PageHeader } from '@/components/ui/page-header'
import { MenuItemForm } from '../menu-item-form'

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
      <BackLink href="/menu-items" label="Menu Items" />
      <PageHeader eyebrow="Menu Items" title={item.name} />
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
