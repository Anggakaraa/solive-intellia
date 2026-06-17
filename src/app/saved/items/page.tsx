import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Pill } from '@/components/ui/pill'
import { StatusBadge } from '@/components/ui/status-badge'
import { ghostBtnCls } from '@/lib/styles'
import { createClient } from '@/lib/supabase/server'

export default async function SavedItemsPage() {
  const supabase = await createClient()

  // Fetch real saved concepts once the save flow is wired
  const { data: realItems } = await supabase
    .from('rd_concepts')
    .select('id, concept_name, one_line, status, brief_id, experiment_focus, created_at, feasibility')
    .eq('status', 'saved')
    .order('created_at', { ascending: false })

  const hasMockBanner = !realItems || realItems.length === 0

  const MOCK_ITEMS = [
    {
      id: 'mock-saved-1',
      concept_name: 'Hot Honey Sundae Tower',
      one_line: 'Towering diner-style sundae on a labneh cream base, finished tableside with a hot honey pour.',
      category: 'Dessert',
      pantry_assets: ['Hot Honey', 'Labneh', 'Dukkah'],
      strategic_roles: ['Signature', 'Social-Proof'],
      status: 'saved',
      brief_id: null,
    },
    {
      id: 'mock-saved-2',
      concept_name: 'Charred Cauliflower with Whipped Labneh',
      one_line: 'Whole-roasted cauliflower over whipped house labneh, finished with dukkah, pine nuts, and a crisp herb salad.',
      category: 'Mains · Vegetarian',
      pantry_assets: ['Labneh', 'Dukkah'],
      strategic_roles: ['Gateway'],
      status: 'saved',
      brief_id: null,
    },
    {
      id: 'mock-saved-3',
      concept_name: 'Labneh Parfait with Hot Honey Lava',
      one_line: 'Layered parfait in a tall glass: labneh cream, granola, seasonal fruit, and a hot honey lava pour.',
      category: 'Dessert',
      pantry_assets: ['Hot Honey', 'Labneh'],
      strategic_roles: ['Everyday'],
      status: 'saved',
      brief_id: null,
    },
  ]

  type DisplayItem = {
    id: string
    concept_name: string
    one_line: string | null
    category?: string | null
    pantry_assets?: string[]
    strategic_roles?: string[]
    status: string
    brief_id: string | null
  }

  const items: DisplayItem[] = realItems && realItems.length > 0
    ? realItems.map((c) => ({
        id: c.id,
        concept_name: c.concept_name,
        one_line: c.one_line,
        status: c.status,
        brief_id: c.brief_id,
      }))
    : MOCK_ITEMS

  return (
    <div className="max-w-2xl">
      <PageHeader
        eyebrow="Intelligence"
        title="Saved Items"
        subtitle="Individual dish concepts saved from R&D output for further development."
      />

      {hasMockBanner && (
        <div className="bg-cream-dark border border-olive/15 rounded-md px-4 py-2.5 mb-6 flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-[1.5px] text-ink-muted">Mock</span>
          <span className="text-[12px] text-ink-muted font-light">
            Showing placeholder items — Save to menu items on concept output will populate this list.
          </span>
        </div>
      )}

      <div className="space-y-2">
        {items.map((item) => {
          const inner = (
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-serif text-[15px] text-ink">{item.concept_name}</p>
                  <StatusBadge status={item.status} />
                </div>
                {item.one_line && (
                  <p className="text-[12px] text-ink-muted font-light leading-relaxed mb-2.5">
                    {item.one_line}
                  </p>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {item.category && <Pill variant="olive">{item.category}</Pill>}
                  {item.strategic_roles?.map((r) => (
                    <Pill key={r} variant="default">{r}</Pill>
                  ))}
                  {item.pantry_assets?.map((p) => (
                    <Pill key={p} variant="cream">{p}</Pill>
                  ))}
                </div>
              </div>
              {!item.id.startsWith('mock-') && (
                <ChevronRight size={15} className="text-ink-muted shrink-0 mt-1 group-hover:text-olive transition-colors" />
              )}
            </div>
          )

          const isMock = item.id.startsWith('mock-')

          return !isMock ? (
            <Link
              key={item.id}
              href={`/concepts/${item.id}`}
              className="group block bg-white border border-olive/15 rounded-lg px-5 py-4 hover:border-olive/40 transition-colors"
            >
              {inner}
            </Link>
          ) : (
            <div
              key={item.id}
              className="bg-white border border-olive/15 rounded-lg px-5 py-4 opacity-70"
            >
              {inner}
            </div>
          )
        })}
      </div>

      <div className="mt-8 pt-6 border-t border-olive/10">
        <p className="text-[12px] text-ink-muted font-light mb-3">
          Concepts ready to move forward? Submit a new brief to test them.
        </p>
        <Link href="/brief" className={ghostBtnCls}>
          New R&D Brief →
        </Link>
      </div>
    </div>
  )
}
