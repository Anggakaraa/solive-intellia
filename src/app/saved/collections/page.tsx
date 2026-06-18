import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/ui/page-header'
import { ghostBtnCls } from '@/lib/styles'
import { CollectionCard } from './CollectionCard'
import type { CollectionOutputData } from '@/lib/supabase/types'

export default async function SavedCollectionsPage() {
  const supabase = await createClient()

  const { data: collections } = await supabase
    .from('saved_collections')
    .select('*')
    .order('created_at', { ascending: false })

  const collectionsWithDishes = await Promise.all(
    (collections ?? []).map(async (col) => {
      if (!col.brief_id) return { ...col, dishes: [], liveTitle: null }
      const { data: brief } = await supabase
        .from('rd_briefs')
        .select('output_data, menu_theme')
        .eq('id', col.brief_id)
        .single()
      const outputData = brief?.output_data as CollectionOutputData | null
      const dishes = outputData?.type === 'collection' ? outputData.dishes : []
      const liveTitle = outputData?.collection_name ?? brief?.menu_theme ?? null
      return { ...col, dishes, liveTitle }
    })
  )

  return (
    <div className="max-w-2xl">
      <PageHeader
        eyebrow="Intelligence"
        title="Saved Collections"
        subtitle="Menu collections saved from R&D output."
      />

      {collectionsWithDishes.length === 0 ? (
        <div className="text-center py-16 text-ink-muted border border-dashed border-olive/25 rounded-lg">
          <p className="text-sm font-light mb-4">No collections saved yet.</p>
          <Link href="/brief" className={ghostBtnCls}>
            Submit a menu collection brief →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {collectionsWithDishes.map((col) => (
            <CollectionCard key={col.id} col={col} />
          ))}
        </div>
      )}

    </div>
  )
}
