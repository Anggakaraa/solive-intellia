import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Suspense } from 'react'
import { PageHeader } from '@/components/ui/page-header'
import { StatusBadge } from '@/components/ui/status-badge'
import { Pill } from '@/components/ui/pill'
import { primaryBtnCls } from '@/lib/styles'
import { MenuItemFilters } from './MenuItemFilters'

function ScoreDots({ value, max = 5 }: { value: number | null; max?: number }) {
  if (value == null) return null
  return (
    <div className="flex gap-[3px]">
      {Array.from({ length: max }, (_, i) => (
        <div
          key={i}
          className={`w-[7px] h-[7px] rounded-full ${i < value ? 'bg-olive' : 'bg-olive/20'}`}
        />
      ))}
    </div>
  )
}

export default async function MenuItemsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; category?: string }>
}) {
  const { status, category } = await searchParams
  const supabase = await createClient()

  const statusValues = status ? status.split(',').filter(Boolean) : []
  const categoryValues = category ? category.split(',').filter(Boolean) : []

  // Fetch all items for category list, filtered items for display
  const [{ data: allItems }, { data: items }] = await Promise.all([
    supabase.from('menu_items').select('category').order('category'),
    (() => {
      let q = supabase
        .from('menu_items')
        .select('id, name, category, status, primary_flavor_identity, format_familiarity, flavor_discovery')
      if (statusValues.length > 0) q = q.in('status', statusValues)
      if (categoryValues.length > 0) q = q.in('category', categoryValues)
      return q.order('name')
    })(),
  ])

  // Distinct categories from all items
  const categories = Array.from(
    new Set((allItems ?? []).map((i) => i.category).filter(Boolean))
  ).sort() as string[]

  const isFiltered = statusValues.length > 0 || categoryValues.length > 0

  return (
    <div>
      <PageHeader
        eyebrow="Catalogue"
        title="Menu Items"
        subtitle={`${items?.length ?? 0} item${items?.length === 1 ? '' : 's'}${isFiltered ? ' · filtered' : ''}`}
        actions={
          <Link href="/menu-items/new" className={primaryBtnCls}>
            Add item
          </Link>
        }
      />

      <Suspense fallback={null}>
        <MenuItemFilters categories={categories} />
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
              href={`/menu-items/${item.id}`}
              className={`group block bg-white border border-olive/15 rounded-lg px-4 py-3 hover:border-olive/25 transition-colors ${item.status === 'inactive' ? 'opacity-50' : ''}`}
            >
              <div className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-serif text-[15px] font-normal text-ink mb-1.5">{item.name}</p>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {item.category && <Pill variant="olive">{item.category}</Pill>}
                    {item.primary_flavor_identity && (
                      <Pill variant="default">{item.primary_flavor_identity}</Pill>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {item.status && <StatusBadge status={item.status} />}
                  <div className="flex flex-col gap-1">
                    {item.format_familiarity != null && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-ink-muted">FF</span>
                        <ScoreDots value={item.format_familiarity} />
                      </div>
                    )}
                    {item.flavor_discovery != null && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-ink-muted">FD</span>
                        <ScoreDots value={item.flavor_discovery} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
