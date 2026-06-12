import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { PageHeader } from '@/components/ui/page-header'
import { StatusBadge } from '@/components/ui/status-badge'
import { primaryBtnCls } from '@/lib/styles'

export default async function PantryItemsPage() {
  const supabase = await createClient()
  const { data: items } = await supabase
    .from('pantry_items')
    .select('id, name, category, status, flavor_contributions')
    .order('name')

  return (
    <div>
      <PageHeader
        eyebrow="Catalogue"
        title="Pantry items"
        subtitle={`${items?.length ?? 0} items`}
        actions={
          <Link
            href="/pantry-items/new"
            className={primaryBtnCls}
          >
            Add item
          </Link>
        }
      />

      {items?.length === 0 ? (
        <div className="text-center py-16 text-ink-muted">
          <p className="text-base">No pantry items yet.</p>
        </div>
      ) : (
        <div>
          <div className="text-[10px] uppercase tracking-[2px] text-ink-muted mb-3.5 pb-2 border-b border-olive/15">
            All items
          </div>
          <div>
            {items?.map((item) => (
              <Link key={item.id} href={`/pantry-items/${item.id}`} className={item.status !== 'active' ? 'opacity-50' : ''}>
                <div className="bg-white border border-olive/15 rounded-lg px-4 py-3 flex items-center gap-4 mb-2 hover:border-olive/25 transition-colors cursor-pointer">
                  <div className="flex-1 min-w-0">
                    <p className="font-serif text-[15px] font-normal text-ink mb-1.5">{item.name}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {item.category && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-olive-faint text-olive">
                          {item.category}
                        </span>
                      )}
                      {item.flavor_contributions?.map((f: string) => (
                        <span
                          key={f}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-cream-dark text-ink-mid"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="shrink-0">
                    {item.status && item.status !== 'active' && (
                      <StatusBadge status={item.status} />
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
