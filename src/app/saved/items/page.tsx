import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { StatusBadge } from '@/components/ui/status-badge'
import { ghostBtnCls } from '@/lib/styles'
import { createClient } from '@/lib/supabase/server'

export default async function SavedItemsPage() {
  const supabase = await createClient()

  const { data: concepts } = await supabase
    .from('rd_concepts')
    .select('id, concept_name, one_line, status, brief_id, created_at')
    .in('status', ['saved', 'testing', 'active'])
    .order('created_at', { ascending: false })

  const isEmpty = !concepts || concepts.length === 0

  // Fetch recipe existence for all concepts in one query
  let recipeConceptIds = new Set<string>()
  if (concepts && concepts.length > 0) {
    const ids = concepts.map((c) => c.id)
    const { data: recipes } = await supabase
      .from('rd_recipes')
      .select('concept_id')
      .in('concept_id', ids)
    recipeConceptIds = new Set((recipes ?? []).map((r) => r.concept_id))
  }

  function getDisplayStatus(status: string, id: string): string {
    if (status === 'testing') return 'testing'
    if (status === 'active') return 'active'
    if (recipeConceptIds.has(id)) return 'recipe_generated'
    return 'saved'
  }

  return (
    <div className="max-w-2xl">
      <PageHeader
        eyebrow="Intelligence"
        title="Saved Dishes"
        subtitle="Dish concepts saved from R&D output — tracked through concept, recipe, and testing."
      />

      {isEmpty ? (
        <div className="text-center py-16 text-ink-muted">
          <p className="text-sm font-light mb-4">No saved concepts yet.</p>
          <p className="text-[12px] font-light text-ink-muted mb-6">
            Save concepts from your R&D brief output to track them here.
          </p>
          <Link href="/brief" className={ghostBtnCls}>
            Start a new brief →
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {concepts.map((concept) => {
            const displayStatus = getDisplayStatus(concept.status, concept.id)
            return (
              <Link
                key={concept.id}
                href={`/concepts/${concept.id}`}
                className="group flex items-start justify-between gap-4 bg-white border border-olive/15 rounded-lg px-5 py-4 hover:border-olive/40 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-serif text-lg font-normal text-ink leading-snug">{concept.concept_name}</p>
                    <StatusBadge status={displayStatus} />
                  </div>
                  {concept.one_line && (
                    <p className="text-[12px] text-ink-muted font-light leading-relaxed">
                      {concept.one_line}
                    </p>
                  )}
                </div>
                <ChevronRight size={15} className="text-ink-muted shrink-0 mt-1 group-hover:text-olive transition-colors" />
              </Link>
            )
          })}
        </div>
      )}

    </div>
  )
}
