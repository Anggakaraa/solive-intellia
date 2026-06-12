import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

const statusClass: Record<string, string> = {
  active:      'bg-[#EAF3DE] text-[#3B6D11]',
  concept:     'bg-[#FAEEDA] text-[#854F0B]',
  inspiration: 'bg-[#EAE8F5] text-[#4A3F82]',
  inactive:    'bg-[#F1EFE8] text-[#5F5E5A]',
}

export default async function PantryItemsPage() {
  const supabase = await createClient()
  const { data: items } = await supabase
    .from('pantry_items')
    .select('id, name, category, status, flavor_contributions')
    .order('name')

  return (
    <div className="relative">
      <div className="mb-9">
        <p className="text-[10px] uppercase tracking-[2px] text-ink-muted mb-1.5">Catalogue</p>
        <h1 className="font-serif text-3xl font-normal text-ink tracking-tight leading-tight">
          Pantry items
        </h1>
        <p className="text-sm text-ink-mid font-light mt-1.5">{items?.length ?? 0} items</p>
      </div>

      <Link
        href="/pantry-items/new"
        className="absolute top-0 right-0 bg-olive text-cream text-sm font-medium px-4 py-2 rounded-md hover:bg-olive-light transition-colors"
      >
        Add item
      </Link>

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
                      <span className={`text-[10px] tracking-[0.5px] font-medium px-2.5 py-1 rounded-full ${statusClass[item.status] ?? statusClass.inactive}`}>
                        {item.status}
                      </span>
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
