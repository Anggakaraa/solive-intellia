import { createClient } from '@/lib/supabase/server'
import { PantryItemForm } from '../pantry-item-form'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { notFound } from 'next/navigation'

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
      <Link
        href="/pantry-items"
        className="flex items-center gap-1 text-[13px] text-ink-muted hover:text-ink mb-6 transition-colors"
      >
        <ChevronLeft size={14} /> Pantry Items
      </Link>
      <div className="mb-9">
        <p className="text-[10px] uppercase tracking-[2px] text-ink-muted mb-1.5">Pantry Items</p>
        <h1 className="font-serif text-3xl font-normal text-ink tracking-tight leading-tight">
          {item.name}
        </h1>
      </div>
      <PantryItemForm
        item={item}
        flavorOptions={flavors?.map((f) => f.name) ?? []}
        categoryOptions={categories?.map((c) => c.name) ?? []}
      />
    </div>
  )
}
