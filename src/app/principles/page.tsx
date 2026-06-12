import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/ui/page-header'
import { PrinciplesClient } from './principles-client'
import type { IdentityPrinciple } from '@/lib/supabase/types'

const LEVEL_ORDER = [
  'Level 1: Dish Principles',
  'Level 2: Menu Principles',
  'Level 3: Pantry Strategy',
]

const LEVEL_SUBTITLES: Record<string, string> = {
  'Level 1: Dish Principles': 'Every dish must fulfil these principles. These are the non-negotiables.',
  'Level 2: Menu Principles': 'Not every dish needs to fulfil these. The menu collectively should.',
  'Level 3: Pantry Strategy': 'Long-term innovation direction for pantry product development.',
}

export default async function PrinciplesPage() {
  const supabase = await createClient()
  const { data: principles } = await supabase
    .from('identity_principles')
    .select('*')
    .order('created_at')

  const byCategory = (principles ?? []).reduce<Record<string, IdentityPrinciple[]>>((acc, p) => {
    const key = p.category ?? 'General'
    if (!acc[key]) acc[key] = []
    acc[key].push(p)
    return acc
  }, {})

  const ordered = LEVEL_ORDER
    .filter((l) => byCategory[l])
    .map((l) => ({ category: l, subtitle: LEVEL_SUBTITLES[l] ?? '', items: byCategory[l] }))

  return (
    <div>
      <PageHeader
        eyebrow="Knowledge"
        title="Principles"
        subtitle="The framework that guides every dish and menu decision at Salted Olive."
      />
      <PrinciplesClient levels={ordered} />
    </div>
  )
}
