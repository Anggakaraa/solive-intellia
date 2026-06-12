import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { PageHeader } from '@/components/ui/page-header'
import { StatusBadge } from '@/components/ui/status-badge'
import { primaryBtnCls } from '@/lib/styles'

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

export default async function MenuItemsPage() {
  const supabase = await createClient()
  const { data: items } = await supabase
    .from('menu_items')
    .select('id, name, category, status, primary_flavor_identity, format_familiarity, flavor_discovery')
    .order('name')

  return (
    <div>
      <PageHeader
        eyebrow="Catalogue"
        title="Menu items"
        subtitle={`${items?.length ?? 0} items`}
        actions={
          <Link
            href="/menu-items/new"
            className={primaryBtnCls}
          >
            Add item
          </Link>
        }
      />

      {items?.length === 0 ? (
        <div className="text-center py-16 text-ink-muted">
          <p className="text-base">No menu items yet.</p>
          <p className="text-sm mt-1">Start by adding your first dish.</p>
        </div>
      ) : (
        <div>
          <div className="text-[10px] uppercase tracking-[2px] text-ink-muted mb-3.5 pb-2 border-b border-olive/15">
            All items
          </div>
          <div>
            {items?.map((item) => (
              <Link key={item.id} href={`/menu-items/${item.id}`} className={item.status !== 'active' ? 'opacity-50' : ''}>
                <div className="bg-white border border-olive/15 rounded-lg px-4 py-3 flex items-center gap-4 mb-2 hover:border-olive/25 transition-colors cursor-pointer">
                  <div className="flex-1 min-w-0">
                    <p className="font-serif text-[15px] font-normal text-ink mb-1.5">{item.name}</p>
                    <div className="flex items-center gap-1.5">
                      {item.category && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-olive-faint text-olive">
                          {item.category}
                        </span>
                      )}
                      {item.primary_flavor_identity && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-cream-dark text-ink-mid">
                          {item.primary_flavor_identity}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {item.status && (
                      <StatusBadge status={item.status} />
                    )}
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
        </div>
      )}
    </div>
  )
}
