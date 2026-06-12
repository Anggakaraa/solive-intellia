import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
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
      <Link
        href={`/brief/${id}`}
        className="flex items-center gap-1 text-[13px] text-ink-muted hover:text-ink mb-6 transition-colors"
      >
        <ChevronLeft size={14} /> Brief
      </Link>

      <div className="mb-9">
        <p className="text-[10px] uppercase tracking-[2px] text-ink-muted mb-1.5">Edit Brief</p>
        <h1 className="font-serif text-3xl font-normal text-ink tracking-tight leading-tight">
          {brief.category ?? 'Untitled Brief'}
        </h1>
      </div>

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
