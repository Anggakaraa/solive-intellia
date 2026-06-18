import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { PageHeader } from '@/components/ui/page-header'
import { ghostBtnCls } from '@/lib/styles'

type Brief = {
  id: string
  created_at: string
  brief_type: string
  category: string | null
  menu_theme: string | null
  opportunity: string | null
}

function BriefCard({ brief }: { brief: Brief }) {
  const title =
    brief.brief_type === 'menu_collection'
      ? (brief.menu_theme ?? 'Untitled Collection')
      : (brief.menu_theme ?? brief.category ?? 'Untitled Brief')

  const date = new Date(brief.created_at).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <Link
      href={`/brief/${brief.id}`}
      className="group block bg-white border border-olive/15 rounded-lg px-4 py-3.5 hover:border-olive/40 transition-colors"
    >
      <p className="font-serif text-[16px] font-normal text-ink leading-snug group-hover:text-olive transition-colors">
        {title}
      </p>
      <p className="text-[10px] text-ink-muted mt-0.5 mb-2">{date}</p>
      {brief.opportunity && (
        <p className="text-[11px] text-ink-muted font-light leading-relaxed line-clamp-2">
          {brief.opportunity}
        </p>
      )}
    </Link>
  )
}

export default async function BriefHistoryPage() {
  const supabase = await createClient()

  const { data: briefs } = await supabase
    .from('rd_briefs')
    .select('id, created_at, brief_type, category, menu_theme, opportunity')
    .order('created_at', { ascending: false })

  const collections = (briefs ?? []).filter((b) => b.brief_type === 'menu_collection')
  const dishes = (briefs ?? []).filter((b) => b.brief_type !== 'menu_collection')

  const isEmpty = !briefs || briefs.length === 0

  return (
    <div>
      <PageHeader
        eyebrow="Intelligence"
        title="Brief History"
        subtitle="All R&D briefs submitted through the intelligence layer."
      />

      {isEmpty ? (
        <div className="text-center py-16 text-ink-muted">
          <p className="text-sm font-light">No briefs submitted yet.</p>
          <Link href="/brief" className={`mt-3 inline-block ${ghostBtnCls}`}>
            Submit your first brief →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6 items-start">

          {/* Menu Collections */}
          <div>
            <p className="text-[9px] uppercase tracking-[1.5px] text-ink-muted mb-2.5">
              Menu Collections · {collections.length}
            </p>
            {collections.length === 0 ? (
              <p className="text-[11px] text-ink-muted/60 italic px-1">No collections yet.</p>
            ) : (
              <div className="space-y-2">
                {collections.map((brief) => (
                  <BriefCard key={brief.id} brief={brief} />
                ))}
              </div>
            )}
          </div>

          {/* Single Dishes */}
          <div>
            <p className="text-[9px] uppercase tracking-[1.5px] text-ink-muted mb-2.5">
              Single Dishes · {dishes.length}
            </p>
            {dishes.length === 0 ? (
              <p className="text-[11px] text-ink-muted/60 italic px-1">No dish briefs yet.</p>
            ) : (
              <div className="space-y-2">
                {dishes.map((brief) => (
                  <BriefCard key={brief.id} brief={brief} />
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  )
}
