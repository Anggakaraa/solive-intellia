import { createClient } from '@/lib/supabase/server'
import { BackLink } from '@/components/ui/back-link'
import { PageHeader } from '@/components/ui/page-header'
import { MenuItemForm } from '../menu-item-form'

export default async function NewMenuItemPage() {
  const supabase = await createClient()

  const [
    { data: categories },
    { data: flavors },
    { data: roles },
    { data: pantryItems },
  ] = await Promise.all([
    supabase.from('menu_categories').select('name').order('name'),
    supabase.from('flavor_identities').select('name').order('name'),
    supabase.from('strategic_roles').select('name').order('name'),
    supabase.from('pantry_items').select('id, name').order('name'),
  ])

  return (
    <div>
      <BackLink href="/menu-items" label="Menu Items" />
      <PageHeader eyebrow="Menu Items" title="New menu item" />
      <MenuItemForm
        categoryOptions={categories?.map((c) => c.name) ?? []}
        flavorOptions={flavors?.map((f) => f.name) ?? []}
        strategicRoleOptions={roles?.map((r) => r.name) ?? []}
        pantryItemOptions={pantryItems ?? []}
      />
    </div>
  )
}
