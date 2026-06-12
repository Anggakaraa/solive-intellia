import { createClient } from '@/lib/supabase/server'
import { MenuItemForm } from '../menu-item-form'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

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
      <Link
        href="/menu-items"
        className="flex items-center gap-1 text-[13px] text-ink-muted hover:text-ink mb-6 transition-colors"
      >
        <ChevronLeft size={14} /> Menu Items
      </Link>
      <div className="mb-9">
        <p className="text-[10px] uppercase tracking-[2px] text-ink-muted mb-1.5">Menu Items</p>
        <h1 className="font-serif text-3xl font-normal text-ink tracking-tight leading-tight">
          New menu item
        </h1>
      </div>
      <MenuItemForm
        categoryOptions={categories?.map((c) => c.name) ?? []}
        flavorOptions={flavors?.map((f) => f.name) ?? []}
        strategicRoleOptions={roles?.map((r) => r.name) ?? []}
        pantryItemOptions={pantryItems ?? []}
      />
    </div>
  )
}
