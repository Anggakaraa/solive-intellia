import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/ui/page-header'
import { BriefForm } from './brief-form'

export default async function BriefPage() {
  const supabase = await createClient()

  const [
    { data: categories },
    { data: roles },
    { data: pantryItems },
  ] = await Promise.all([
    supabase.from('menu_categories').select('name').order('name'),
    supabase.from('strategic_roles').select('name').order('name'),
    supabase.from('pantry_items').select('name').eq('status', 'active').order('name'),
  ])

  return (
    <div>
      <PageHeader
        eyebrow="Intelligence"
        title="R&D Brief"
        subtitle="Articulate a concept direction. The intelligence layer will do the rest."
      />

      <BriefForm
        categoryOptions={categories?.map((c) => c.name) ?? []}
        roleOptions={roles?.map((r) => r.name) ?? []}
        pantryOptions={pantryItems?.map((p) => p.name) ?? []}
      />
    </div>
  )
}
