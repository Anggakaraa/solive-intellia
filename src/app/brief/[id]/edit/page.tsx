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
        title={brief.category ?? 'Untitled Brief'}
      />

      <BriefForm
        briefId={id}
        initialValues={{
          category: brief.category ?? '',
          strategic_roles: brief.strategic_roles ?? [],
          format_familiarity: brief.format_familiarity ?? null,
          flavor_discovery: brief.flavor_discovery ?? null,
          pantry_assets: brief.pantry_assets ?? [],
          opportunity: brief.opportunity ?? '',
          creative_references: brief.creative_references ?? '',
          desired_feeling: brief.desired_feeling ?? '',
          constraints: brief.constraints ?? '',
        }}
        categoryOptions={categories?.map((c) => c.name) ?? []}
        roleOptions={roles?.map((r) => r.name) ?? []}
        pantryOptions={pantryItems?.map((p) => p.name) ?? []}
      />
    </div>
  )
}
