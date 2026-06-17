import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { BackLink } from '@/components/ui/back-link'
import { PageHeader } from '@/components/ui/page-header'
import { DeleteButton } from '@/components/ui/delete-button'
import { mutedBtnCls } from '@/lib/styles'
import { ConceptStageTabs } from './ConceptStageTabs'

export default async function ConceptDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: concept }, { data: recipe }] = await Promise.all([
    supabase.from('rd_concepts').select('*').eq('id', id).single(),
    supabase
      .from('rd_recipes')
      .select('id, version, concept_intent, components, method, plating_notes, yield, success_criteria, status')
      .eq('concept_id', id)
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  if (!concept) notFound()

  return (
    <div className="max-w-2xl">
      <BackLink href={`/brief/${concept.brief_id}`} label="Brief" />

      <PageHeader
        eyebrow="Concept"
        title={concept.concept_name}
        subtitle={concept.one_line ?? undefined}
        actions={
          <>
            <Link href={`/concepts/${id}/edit`} className={mutedBtnCls}>
              Edit
            </Link>
            <DeleteButton table="rd_concepts" id={id} redirectTo={`/brief/${concept.brief_id}`} />
          </>
        }
      />

      <ConceptStageTabs
        concept={{
          id: concept.id,
          brief_id: concept.brief_id,
          status: concept.status,
          one_line: concept.one_line,
          breakdown: concept.breakdown as {
            hero?: string
            flavor_drivers?: string[]
            textures?: string[]
            key_contrast?: string
          } | null,
          presentation: concept.presentation,
          why_it_could_win: concept.why_it_could_win as Record<string, string> | string | null,
          feasibility: concept.feasibility as {
            assets_leveraged?: string[]
            watchouts?: string[]
          } | null,
          experiment_focus: concept.experiment_focus ?? [],
        }}
        recipe={recipe ?? null}
      />
    </div>
  )
}
