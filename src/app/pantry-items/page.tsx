import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Suspense } from 'react'
import { PageHeader } from '@/components/ui/page-header'
import { StatusBadge } from '@/components/ui/status-badge'
import { Pill } from '@/components/ui/pill'
import { primaryBtnCls } from '@/lib/styles'
import { PantryItemFilters } from './PantryItemFilters'

export default async function PantryItemsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; category?: string }>
}) {
  const { status, category } = await searchParams
  const supabase = await createClient()

  const statusValues = status ? status.split(',').filter(Boolean) : []
  const categoryValues = category ? category.split(',').filter(Boolean) : []

  const [{ data: allItems }, { data: items }] = await Promise.all([
    supabase.from('pantry_items').select('category').order('category'),
    (() => {
      let q = supabase
        .from('pantry_items')
        .select('id, name, category, status, flavor_contributions')
      if (statusValues.length > 0) q = q.in('status', statusValues)
      if (categoryValues.length > 0) q = q.in('category', categoryValues)
      return q.order('name')
    })(),
  ])

  const categories = Array.from(
    new Set((allItems ?? []).map((i) => i.category).filter(Boolean))
  ).sort() as string[]

  const isFiltered = statusValues.length > 0 || categoryValues.length > 0

  return (
    <div>
      <PageHeader
        eyebrow="Catalogue"
        title="Pantry Items"
        subtitle={`${items?.length ?? 0} item${items?.length === 1 ? '' : 's'}${isFiltered ? ' · filtered' : ''}`}
        actions={
          <Link href="/pantry-items/new" className={primaryBtnCls}>
            Add item
          </Link>
        }
      />

      <Suspense fallback={null}>
        <PantryItemFilters categories={categories} />
      </Suspense>

      {items?.length === 0 ? (
        <div className="text-center py-16 text-ink-muted">
          <p className="text-sm font-light">No items match the current filters.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items?.map((item) => (
            <Link
              key={item.id}
              href={`/pantry-items/${item.id}`}
              className={`group block bg-white border border-olive/15 rounded-lg px-4 py-3 hover:border-olive/25 transition-colors ${item.status === 'inactive' ? 'opacity-50' : ''}`}
            >
              <div className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-serif text-[15px] font-normal text-ink mb-1.5">{item.name}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {item.category && <Pill variant="olive">{item.category}</Pill>}
                    {item.flavor_contributions?.map((f: string) => (
                      <Pill key={f} variant="default">{f}</Pill>
                    ))}
                  </div>
                </div>
                <div className="shrink-0">
                  {item.status && <StatusBadge status={item.status} />}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
