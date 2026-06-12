import { createClient } from '@/lib/supabase/server'
import { BackLink } from '@/components/ui/back-link'
import { PageHeader } from '@/components/ui/page-header'
import { PantryItemForm } from '../pantry-item-form'

export default async function NewPantryItemPage() {
  const supabase = await createClient()
  const [{ data: flavors }, { data: categories }] = await Promise.all([
    supabase.from('flavor_identities').select('name').order('name'),
    supabase.from('pantry_categories').select('name').order('name'),
  ])

  return (
    <div>
      <BackLink href="/pantry-items" label="Pantry Items" />
      <PageHeader eyebrow="Pantry Items" title="New pantry item" />
      <PantryItemForm
        flavorOptions={flavors?.map((f) => f.name) ?? []}
        categoryOptions={categories?.map((c) => c.name) ?? []}
      />
    </div>
  )
}
