import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { BackLink } from '@/components/ui/back-link'
import { PageHeader } from '@/components/ui/page-header'
import { ConceptEditForm } from './ConceptEditForm'

export default async function EditConceptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: concept } = await supabase.from('rd_concepts').select('*').eq('id', id).single()
  if (!concept) notFound()

  return (
    <div>
      <BackLink href={`/concepts/${id}`} label="Concept" />

      <PageHeader
        eyebrow="Edit Concept"
        title={concept.concept_name}
      />

      <ConceptEditForm conceptId={id} initial={concept} />
    </div>
  )
}
