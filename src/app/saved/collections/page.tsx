import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/ui/page-header'
import { ghostBtnCls } from '@/lib/styles'
import { CollectionCard } from './CollectionCard'

export default async function SavedCollectionsPage() {
  const supabase = await createClient()

  const { data: collections } = await supabase
    .from('saved_collections')
    .select('*')
    .order('created_at', { ascending: false })

  const collectionsWithConcepts = await Promise.all(
    (collections ?? []).map(async (col) => {
      if (!col.brief_id) return { ...col, concepts: [] }
      const { data: concepts } = await supabase
        .from('rd_concepts')
        .select('concept_name, status')
        .eq('brief_id', col.brief_id)
        .order('created_at')
      return { ...col, concepts: concepts ?? [] }
    })
  )

  return (
    <div className="max-w-2xl">
      <PageHeader
        eyebrow="Intelligence"
        title="Saved Collections"
        subtitle="Menu collections saved from R&D output. Dish concepts update live as you develop them."
      />

      {collectionsWithConcepts.length === 0 ? (
        <div className="text-center py-16 text-ink-muted border border-dashed border-olive/25 rounded-lg">
          <p className="text-sm font-light mb-4">No collections saved yet.</p>
          <Link href="/brief" className={ghostBtnCls}>
            Submit a menu collection brief →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {collectionsWithConcepts.map((col) => (
            <CollectionCard key={col.id} col={col} />
          ))}
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-olive/10">
        <p className="text-[12px] text-ink-muted font-light mb-3">
          Want to develop a new menu collection?
        </p>
        <Link href="/brief" className={ghostBtnCls}>
          New R&D Brief →
        </Link>
      </div>
    </div>
  )
}
