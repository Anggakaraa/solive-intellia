import { createClient } from '@/lib/supabase/server'
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
      <div className="mb-9">
        <p className="text-[10px] uppercase tracking-[2px] text-ink-muted mb-1.5">Intelligence</p>
        <h1 className="font-serif text-3xl font-normal text-ink tracking-tight leading-tight">
          R&D Brief
        </h1>
        <p className="text-sm text-ink-mid font-light mt-1.5">
          Articulate a concept direction. The intelligence layer will do the rest.
        </p>
      </div>

      <BriefForm
        categoryOptions={categories?.map((c) => c.name) ?? []}
        roleOptions={roles?.map((r) => r.name) ?? []}
        pantryOptions={pantryItems?.map((p) => p.name) ?? []}
      />
    </div>
  )
}
