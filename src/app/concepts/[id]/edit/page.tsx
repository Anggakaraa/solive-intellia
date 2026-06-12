import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { ConceptEditForm } from './ConceptEditForm'

export default async function EditConceptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: concept } = await supabase.from('rd_concepts').select('*').eq('id', id).single()
  if (!concept) notFound()

  return (
    <div>
      <Link
        href={`/concepts/${id}`}
        className="flex items-center gap-1 text-[13px] text-ink-muted hover:text-ink mb-6 transition-colors"
      >
        <ChevronLeft size={14} /> Concept
      </Link>

      <div className="mb-9">
        <p className="text-[10px] uppercase tracking-[2px] text-ink-muted mb-1.5">Edit Concept</p>
        <h1 className="font-serif text-3xl font-normal text-ink tracking-tight leading-tight">
          {concept.concept_name}
        </h1>
      </div>

      <ConceptEditForm conceptId={id} initial={concept} />
    </div>
  )
}
