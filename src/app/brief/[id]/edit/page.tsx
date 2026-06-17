import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { BackLink } from '@/components/ui/back-link'
import { PageHeader } from '@/components/ui/page-header'
import { BriefForm } from '../../brief-form'

export default async function EditBriefPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: brief }, { data: categories }, { data: roles }, { data: pantryItems }] = await Promise.all([
    supabase.from('rd_briefs').select('*').eq('id', id).single(),
    supabase.from('menu_categories').select('name').order('name'),
    supabase.from('strategic_roles').select('name').order('name'),
    supabase.from('pantry_items').select('name').eq('status', 'active').order('name'),
  ])

  if (!brief) notFound()

  return (
    <div>
      <BackLink href={`/brief/${id}`} label="Brief" />

      <PageHeader
        eyebrow="Edit Brief"
        title={
          brief.brief_type === 'menu_collection'
            ? (brief.menu_theme ?? 'Menu Collection')
            : (brief.category ?? 'Untitled Brief')
        }
      />

      <BriefForm
        briefId={id}
        initialValues={{
          brief_type: brief.brief_type ?? 'dish',
          category: brief.category ?? '',
          menu_theme: brief.menu_theme ?? '',
          menu_composition: (brief.menu_composition as Record<string, number>) ?? {},
          ai_recommend_composition: brief.ai_recommend_composition ?? false,
          collection_format: (brief.collection_format as 'a_la_carte' | 'set_menu') ?? 'a_la_carte',
          strategic_roles: brief.strategic_roles ?? [],
          format_familiarity: brief.format_familiarity ?? null,
          flavor_discovery: brief.flavor_discovery ?? null,
          pantry_assets: brief.pantry_assets ?? [],
          opportunity: brief.opportunity ?? '',
          creative_references: brief.creative_references ?? '',
          desired_feeling: brief.desired_feeling ?? '',
          constraints: brief.constraints ?? '',
          exploration_mode: (brief.exploration_mode as 'safe' | 'balanced' | 'exploratory') ?? 'balanced',
          generation_mode: (brief.generation_mode as 'full' | 'fast') ?? 'full',
        }}
        categoryOptions={categories?.map((c) => c.name) ?? []}
        roleOptions={roles?.map((r) => r.name) ?? []}
        pantryOptions={pantryItems?.map((p) => p.name) ?? []}
      />
    </div>
  )
}
