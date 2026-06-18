import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { StatusBadge } from '@/components/ui/status-badge'

const STRATEGIC_ROLES = ['Revenue Driver', 'Margin Driver', 'Brand Driver', 'VIP Driver']

const MENU_CATEGORIES = [
  'Dips', 'Sides', 'Veggies', 'Large Plates', 'Dessert', 'Pockets',
]

const PIPELINE_STAGES: { key: string; label: string }[] = [
  { key: 'generated', label: 'Generated' },
  { key: 'saved', label: 'Saved' },
  { key: 'recipe', label: 'Recipe Ready' },
  { key: 'testing', label: 'In Testing' },
]

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] uppercase tracking-[2px] text-ink-muted mb-3.5 pb-2 border-b border-olive/15">
      {children}
    </div>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const [
    { data: allMenuItems },
    { data: pipelineConcepts },
    { count: recipeCount },
    { data: recentMenuItems },
    { data: recentConcepts },
    { data: recentBriefs },
  ] = await Promise.all([
    supabase
      .from('menu_items')
      .select('strategic_roles, category, primary_flavor_identity, status'),
    supabase
      .from('rd_concepts')
      .select('status'),
    supabase
      .from('rd_recipes')
      .select('*', { count: 'exact', head: true }),
    supabase
      .from('menu_items')
      .select('id, name, category, status')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('rd_concepts')
      .select('id, concept_name, status, created_at')
      .in('status', ['saved', 'testing', 'active'])
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('rd_briefs')
      .select('id, brief_type, category, menu_theme, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  // --- Compute distributions ---
  const activeItems = (allMenuItems ?? []).filter((i) => i.status === 'active')

  const roleCounts: Record<string, number> = Object.fromEntries(
    STRATEGIC_ROLES.map((r) => [r, 0])
  )
  const categoryCounts: Record<string, number> = {}
  const flavorCounts: Record<string, number> = {}

  for (const item of activeItems) {
    for (const role of (item.strategic_roles as string[] | null) ?? []) {
      if (role in roleCounts) roleCounts[role]++
    }
    if (item.category) {
      categoryCounts[item.category] = (categoryCounts[item.category] ?? 0) + 1
    }
    if (item.primary_flavor_identity) {
      flavorCounts[item.primary_flavor_identity] =
        (flavorCounts[item.primary_flavor_identity] ?? 0) + 1
    }
  }

  const pipelineCounts: Record<string, number> = {
    generated: 0,
    saved: 0,
    recipe: recipeCount ?? 0,
    testing: 0,
  }
  for (const c of pipelineConcepts ?? []) {
    if (c.status === 'generated') pipelineCounts.generated++
    if (c.status === 'saved') pipelineCounts.saved++
    if (c.status === 'testing') pipelineCounts.testing++
  }

  // --- Merge recent R&D items ---
  const savedConcepts = (recentConcepts ?? []).slice(0, 5)

  const totalActive = activeItems.length
  const maxRoleCount = Math.max(...Object.values(roleCounts), 1)
  const maxFlavorCount = Math.max(...Object.values(flavorCounts), 1)

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Intellia"
        title="Overview"
        subtitle="R&D intelligence for Salted Olive."
      />

      {/* ── Menu Intelligence ── */}
      <div>
        <SectionLabel>Menu Intelligence · {totalActive} active dishes</SectionLabel>
        <div className="grid grid-cols-3 gap-3">

          {/* Strategic Roles */}
          <div className="bg-white border border-olive/15 rounded-lg p-4">
            <p className="text-[9px] uppercase tracking-[1.5px] text-ink-muted mb-3">Strategic Roles</p>
            <div className="space-y-2">
              {STRATEGIC_ROLES.map((role) => {
                const count = roleCounts[role]
                const pct = (count / maxRoleCount) * 100
                return (
                  <div key={role}>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[10px] text-ink-mid font-light">{role}</span>
                      <span className="text-[10px] text-ink-muted tabular-nums">{count}</span>
                    </div>
                    <div className="h-[3px] bg-olive/10 rounded-full overflow-hidden">
                      <div className="h-full bg-olive/40 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Category Coverage */}
          <div className="bg-white border border-olive/15 rounded-lg p-4">
            <p className="text-[9px] uppercase tracking-[1.5px] text-ink-muted mb-3">Category Coverage</p>
            <div className="space-y-1.5">
              {MENU_CATEGORIES.map((cat) => {
                const count = categoryCounts[cat] ?? 0
                return (
                  <div key={cat} className="flex items-center justify-between">
                    <span className={`text-[10px] font-light ${count === 0 ? 'text-ink-muted/60' : 'text-ink-mid'}`}>
                      {cat}
                    </span>
                    {count === 0 ? (
                      <span className="text-[9px] text-ink-muted/50 italic">empty</span>
                    ) : (
                      <span className="text-[10px] text-ink-muted tabular-nums">{count}</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Flavor Profile */}
          <div className="bg-white border border-olive/15 rounded-lg p-4">
            <p className="text-[9px] uppercase tracking-[1.5px] text-ink-muted mb-3">Flavor Profile</p>
            {Object.keys(flavorCounts).length === 0 ? (
              <p className="text-[10px] text-ink-muted/60 italic">No data yet</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(flavorCounts)
                  .sort(([, a], [, b]) => b - a)
                  .map(([flavor, count]) => {
                    const pct = (count / maxFlavorCount) * 100
                    return (
                      <div key={flavor}>
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[10px] text-ink-mid font-light">{flavor}</span>
                          <span className="text-[10px] text-ink-muted tabular-nums">{count}</span>
                        </div>
                        <div className="h-[3px] bg-olive/10 rounded-full overflow-hidden">
                          <div className="h-full bg-olive/25 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── R&D Pipeline ── */}
      <div>
        <SectionLabel>R&D Pipeline</SectionLabel>
        <div className="grid grid-cols-4 gap-2">
          {PIPELINE_STAGES.map((stage, i) => (
            <div key={stage.key} className="relative bg-white border border-olive/15 rounded-lg p-4 text-center">
              <p className="font-serif text-3xl font-light text-ink leading-none mb-1.5">
                {pipelineCounts[stage.key]}
              </p>
              <p className="text-[10px] text-ink-muted font-light">{stage.label}</p>
              {i < PIPELINE_STAGES.length - 1 && (
                <div className="absolute -right-[7px] top-1/2 -translate-y-1/2 z-10 text-ink-muted/40 text-[10px]">›</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Recent Activity ── */}
      <div>
        <SectionLabel>Recent Activity</SectionLabel>
        <div className="grid grid-cols-3 gap-3 items-start">

          {/* Recent Menu Items */}
          <div>
            <p className="text-[9px] uppercase tracking-[1.5px] text-ink-muted mb-2">Menu Items</p>
            <div className="space-y-1.5">
              {(recentMenuItems ?? []).slice(0, 5).map((item) => (
                <Link
                  key={item.id}
                  href={`/menu-items/${item.id}`}
                  className="group flex items-center justify-between gap-2 bg-white border border-olive/15 rounded-lg px-3 py-2.5 hover:border-olive/40 transition-colors"
                >
                  <p className="text-[11px] text-ink font-light truncate">{item.name}</p>
                  <StatusBadge status={item.status} />
                </Link>
              ))}
            </div>
          </div>

          {/* Recent R&D */}
          <div>
            <p className="text-[9px] uppercase tracking-[1.5px] text-ink-muted mb-2">R&D</p>
            <div className="space-y-1.5">
              {savedConcepts.length === 0 ? (
                <p className="text-[10px] text-ink-muted/60 italic px-1">No saved concepts yet.</p>
              ) : savedConcepts.map((c) => (
                <Link
                  key={c.id}
                  href={`/concepts/${c.id}`}
                  className="group flex items-center justify-between gap-2 bg-white border border-olive/15 rounded-lg px-3 py-2.5 hover:border-olive/40 transition-colors"
                >
                  <p className="text-[11px] text-ink font-light truncate">{c.concept_name}</p>
                  <StatusBadge status={c.status} />
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Briefs */}
          <div>
            <p className="text-[9px] uppercase tracking-[1.5px] text-ink-muted mb-2">Briefs</p>
            <div className="space-y-1.5">
              {(recentBriefs ?? []).slice(0, 5).map((brief) => {
                const label =
                  brief.brief_type === 'menu_collection'
                    ? (brief.menu_theme ?? 'Menu Collection')
                    : (brief.menu_theme ?? brief.category ?? 'Untitled Brief')
                return (
                  <Link
                    key={brief.id}
                    href={`/brief/${brief.id}`}
                    className="group flex items-center justify-between gap-2 bg-white border border-olive/15 rounded-lg px-3 py-2.5 hover:border-olive/40 transition-colors"
                  >
                    <p className="text-[11px] text-ink font-light truncate">{label}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap ${brief.brief_type === 'menu_collection' ? 'bg-cream-dark text-ink-mid' : 'bg-olive-faint text-olive'}`}>
                      {brief.brief_type === 'menu_collection' ? 'Collection' : 'Dish'}
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
