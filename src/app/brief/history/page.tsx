import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ChevronRight, Sparkles } from 'lucide-react'

export default async function BriefHistoryPage() {
  const supabase = await createClient()

  const { data: briefs } = await supabase
    .from('rd_briefs')
    .select('id, created_at, category, strategic_roles, opportunity')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="mb-9">
        <p className="text-[10px] uppercase tracking-[2px] text-ink-muted mb-1.5">Intelligence</p>
        <h1 className="font-serif text-3xl font-normal text-ink tracking-tight leading-tight">
          Brief History
        </h1>
        <p className="text-sm text-ink-mid font-light mt-1.5">
          All R&D briefs submitted through the intelligence layer.
        </p>
      </div>

      {!briefs || briefs.length === 0 ? (
        <div className="text-center py-16 text-ink-muted">
          <p className="text-sm font-light">No briefs submitted yet.</p>
          <Link
            href="/brief"
            className="mt-3 inline-block text-sm text-olive hover:underline"
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
                <div className="flex items-center gap-2 mb-1.5">
                  {brief.category && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-olive text-cream">
                      {brief.category}
                    </span>
                  )}
                  {brief.strategic_roles?.map((r: string) => (
                    <span key={r} className="text-[11px] px-2 py-0.5 rounded-full border border-olive/20 text-ink-mid">
                      {r}
                    </span>
                  ))}
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
                <div className="flex items-center gap-1 mt-2 text-[11px] text-ink-muted">
                  <Sparkles size={10} />
                  <span>Mock result available</span>
                </div>
              </div>
              <ChevronRight size={15} className="text-ink-muted shrink-0 mt-1 group-hover:text-olive transition-colors" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
