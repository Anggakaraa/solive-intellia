import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { BackLink } from '@/components/ui/back-link'
import { PageHeader } from '@/components/ui/page-header'
import { SectionCard } from '@/components/ui/section-card'
import { ConceptTabs } from '@/components/ui/concept-tabs'
import { ConceptCard } from '@/components/ui/concept-card'
import type { ConceptCardData } from '@/components/ui/concept-card'
import { SaveCollectionButton } from './SaveCollectionButton'

function toConceptCardData(row: Record<string, unknown>): ConceptCardData {
  return {
    id: row.id as string,
    concept_name: row.concept_name as string,
    one_line: row.one_line as string | null,
    breakdown: row.breakdown as ConceptCardData['breakdown'],
    presentation: row.presentation as string | null,
    why_it_could_win: row.why_it_could_win as ConceptCardData['why_it_could_win'],
    feasibility: row.feasibility as ConceptCardData['feasibility'],
    experiment_focus: (row.experiment_focus as string[]) ?? [],
    status: row.status as string,
  }
}

export default async function BriefOutputPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: brief }, { data: rawConcepts }] = await Promise.all([
    supabase.from('rd_briefs').select('*').eq('id', id).single(),
    supabase.from('rd_concepts').select('*').eq('brief_id', id).order('created_at'),
  ])

  if (!brief) notFound()

  const concepts: ConceptCardData[] = (rawConcepts ?? []).map(toConceptCardData)

  const isCollection = brief.brief_type === 'menu_collection'

  const title = isCollection
    ? (brief.menu_theme ?? 'Menu Collection')
    : (brief.category ?? 'Untitled Brief')

  const eyebrow = isCollection
    ? 'R&D Output · Menu Collection'
    : 'R&D Output · Single Dish'

  const outputData = brief.output_data as {
    narrative?: string
    recommendation?: string
    collection_name?: string
  } | null

  const narrative = outputData?.narrative ?? null
  const recommendation = outputData?.recommendation ?? null
  const collectionName = outputData?.collection_name ?? null

  return (
    <div className="max-w-3xl">
      <BackLink href={`/brief/${id}`} label="Back to Brief" />

      <PageHeader
        eyebrow={eyebrow}
        title={isCollection ? (collectionName ?? title) : title}
        subtitle={isCollection ? title : ((brief.strategic_roles as string[] | null)?.join(', ') ?? '')}
        actions={isCollection && concepts.length > 0 ? (
          <SaveCollectionButton
            briefId={id}
            collectionName={collectionName ?? title}
            menuTheme={brief.menu_theme ?? null}
            conceptIds={concepts.map((c) => c.id)}
          />
        ) : undefined}
      />

      {/* Narrative card */}
      {narrative && (
        <SectionCard variant="muted" label={isCollection ? 'Collection Logic' : 'Brief Tensions'} className="mb-6">
          <p className="text-sm text-ink-mid font-light leading-relaxed whitespace-pre-line">
            {narrative}
          </p>
        </SectionCard>
      )}

      {concepts.length === 0 ? (
        <div className="text-center py-16 text-ink-muted border border-dashed border-olive/25 rounded-lg">
          <p className="text-sm font-light">No concepts found for this brief.</p>
        </div>
      ) : isCollection ? (
        /* Menu collection — stacked cards */
        <div className="space-y-5">
          <p className="text-[10px] uppercase tracking-[2px] text-ink-muted">
            {concepts.length} dishes
          </p>
          {concepts.map((concept) => (
            <ConceptCard
              key={concept.id}
              concept={concept}
              ff={brief.format_familiarity as number | null}
              fd={brief.flavor_discovery as number | null}
              strategicRoles={(brief.strategic_roles as string[] | null) ?? []}
              isSaved={concept.status === 'saved'}
            />
          ))}
        </div>
      ) : (
        /* Single dish — tabbed alternatives */
        <ConceptTabs
          concepts={concepts}
          ff={brief.format_familiarity as number | null}
          fd={brief.flavor_discovery as number | null}
          strategicRoles={(brief.strategic_roles as string[] | null) ?? []}
          recommendation={recommendation ?? undefined}
          savedIds={concepts.filter(c => c.status === 'saved').map(c => c.id)}
        />
      )}
    </div>
  )
}
