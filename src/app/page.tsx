import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { UtensilsCrossed, ShoppingBasket } from 'lucide-react'

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

export default async function DashboardPage() {
  const supabase = await createClient()

  const [
    { count: menuCount },
    { count: pantryCount },
    { data: recentItems },
  ] = await Promise.all([
    supabase.from('menu_items').select('*', { count: 'exact', head: true }),
    supabase.from('pantry_items').select('*', { count: 'exact', head: true }),
    supabase
      .from('menu_items')
      .select('id, name, category, status, primary_flavor_identity, format_familiarity, flavor_discovery')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const statusClass: Record<string, string> = {
    active:      'bg-[#EAF3DE] text-[#3B6D11]',
    concept:     'bg-[#FAEEDA] text-[#854F0B]',
    inspiration: 'bg-[#EAE8F5] text-[#4A3F82]',
    inactive:    'bg-[#F1EFE8] text-[#5F5E5A]',
  }

  return (
    <div className="relative">
      {/* Page header */}
      <div className="mb-9">
        <p className="text-[10px] uppercase tracking-[2px] text-ink-muted mb-1.5">Intellia</p>
        <h1 className="font-serif text-3xl font-normal text-ink tracking-tight leading-tight">
          Overview
        </h1>
        <p className="text-sm text-ink-mid font-light mt-1.5">
          R&D Intelligence for a better world
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3.5 mb-8">
        <Link href="/menu-items">
          <div className="bg-white border border-olive/15 rounded-lg p-5 hover:border-olive/30 transition-colors cursor-pointer">
            <p className="text-[11px] uppercase tracking-[1px] text-ink-muted mb-2.5">Menu Items</p>
            <p className="font-serif text-5xl font-light text-ink leading-none">{menuCount ?? 0}</p>
            <p className="text-[11px] text-ink-muted mt-1.5">Dishes in the catalogue</p>
          </div>
        </Link>
        <Link href="/pantry-items">
          <div className="bg-white border border-olive/15 rounded-lg p-5 hover:border-olive/30 transition-colors cursor-pointer">
            <p className="text-[11px] uppercase tracking-[1px] text-ink-muted mb-2.5">Pantry Items</p>
            <p className="font-serif text-5xl font-light text-ink leading-none">{pantryCount ?? 0}</p>
            <p className="text-[11px] text-ink-muted mt-1.5">Products in the pantry</p>
          </div>
        </Link>
      </div>

      {/* Quick entry */}
      <div className="mb-8">
        <div className="text-[10px] uppercase tracking-[2px] text-ink-muted mb-3.5 pb-2 border-b border-olive/15">
          Quick Entry
        </div>
        <div className="grid grid-cols-2 gap-3.5">
          <Link href="/menu-items/new">
            <div className="border border-dashed border-olive/25 rounded-lg p-4 flex items-center gap-3.5 hover:bg-olive/[0.04] hover:border-olive cursor-pointer transition-colors">
              <div className="w-9 h-9 rounded-lg bg-olive-faint flex items-center justify-center text-olive shrink-0">
                <UtensilsCrossed size={16} />
              </div>
              <div>
                <p className="text-sm font-medium text-ink">New menu item</p>
                <p className="text-[11px] text-ink-muted mt-0.5">Document a dish</p>
              </div>
            </div>
          </Link>
          <Link href="/pantry-items/new">
            <div className="border border-dashed border-olive/25 rounded-lg p-4 flex items-center gap-3.5 hover:bg-olive/[0.04] hover:border-olive cursor-pointer transition-colors">
              <div className="w-9 h-9 rounded-lg bg-olive-faint flex items-center justify-center text-olive shrink-0">
                <ShoppingBasket size={16} />
              </div>
              <div>
                <p className="text-sm font-medium text-ink">New pantry item</p>
                <p className="text-[11px] text-ink-muted mt-0.5">Capture a product</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent menu items */}
      {recentItems && recentItems.length > 0 && (
        <div>
          <div className="text-[10px] uppercase tracking-[2px] text-ink-muted mb-3.5 pb-2 border-b border-olive/15">
            Recent Menu Items
          </div>
          <div className="space-y-2">
            {recentItems.map((item) => (
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
                      <span className={`text-[10px] tracking-[0.5px] font-medium px-2.5 py-1 rounded-full ${statusClass[item.status] ?? statusClass.inactive}`}>
                        {item.status}
                      </span>
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
