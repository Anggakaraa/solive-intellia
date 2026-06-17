import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Pill } from '@/components/ui/pill'
import { ghostBtnCls } from '@/lib/styles'

export default async function BriefHistoryPage() {
  const supabase = await createClient()

  const { data: briefs } = await supabase
    .from('rd_briefs')
    .select('id, created_at, brief_type, category, menu_theme, strategic_roles, opportunity, exploration_mode, generation_mode, collection_format')
    .order('created_at', { ascending: false })

  return (
    <div>
      <PageHeader
        eyebrow="Intelligence"
        title="Brief History"
        subtitle="All R&D briefs submitted through the intelligence layer."
      />

      {!briefs || briefs.length === 0 ? (
        <div className="text-center py-16 text-ink-muted">
          <p className="text-sm font-light">No briefs submitted yet.</p>
          <Link
            href="/brief"
            className={`mt-3 inline-block ${ghostBtnCls}`}
          >
            Submit your first brief →
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {briefs.map((brief) => (
            <Link
              key={brief.id}
              href={`/brief/${brief.id}`}
              className="group flex items-start justify-between gap-4 bg-white border border-olive/15 rounded-lg px-5 py-4 hover:border-olive/40 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  {brief.brief_type === 'menu_collection' ? (
                    <Pill variant="olive">{brief.menu_theme ?? 'Menu Collection'}</Pill>
                  ) : (brief.menu_theme || brief.category) ? (
                    <Pill variant="olive">{brief.menu_theme ?? brief.category}</Pill>
                  ) : null}
                  {brief.strategic_roles?.map((r: string) => (
                    <Pill key={r} variant="default">{r}</Pill>
                  ))}
                  {brief.brief_type === 'menu_collection' && brief.collection_format && (
                    <Pill variant="cream">{brief.collection_format === 'set_menu' ? 'Set Menu' : 'À la carte'}</Pill>
                  )}
                  {brief.exploration_mode && brief.exploration_mode !== 'balanced' && (
                    <Pill variant="cream">{brief.exploration_mode.charAt(0).toUpperCase() + brief.exploration_mode.slice(1)}</Pill>
                  )}
                  {brief.generation_mode === 'fast' && (
                    <Pill variant="faint">Fast</Pill>
                  )}
                  <span className="text-[11px] text-ink-muted ml-auto">
                    {new Date(brief.created_at).toLocaleDateString('en-AU', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                {brief.opportunity && (
                  <p className="text-sm text-ink-mid font-light truncate">
                    {brief.opportunity}
                  </p>
                )}
              </div>
              <ChevronRight size={15} className="text-ink-muted shrink-0 mt-1 group-hover:text-olive transition-colors" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
