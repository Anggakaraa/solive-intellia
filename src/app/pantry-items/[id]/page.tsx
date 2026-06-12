import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { BackLink } from '@/components/ui/back-link'
import { PageHeader } from '@/components/ui/page-header'
import { PantryItemForm } from '../pantry-item-form'

export default async function EditPantryItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: item }, { data: flavors }, { data: categories }] = await Promise.all([
    supabase.from('pantry_items').select('*').eq('id', id).single(),
    supabase.from('flavor_identities').select('name').order('name'),
    supabase.from('pantry_categories').select('name').order('name'),
  ])

  if (!item) notFound()

  return (
    <div>
      <BackLink href="/pantry-items" label="Pantry Items" />
      <PageHeader eyebrow="Pantry Items" title={item.name} />
      <PantryItemForm
        item={item}
        flavorOptions={flavors?.map((f) => f.name) ?? []}
        categoryOptions={categories?.map((c) => c.name) ?? []}
      />
    </div>
  )
}
