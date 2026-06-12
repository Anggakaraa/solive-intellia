import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { BackLink } from '@/components/ui/back-link'
import { PageHeader } from '@/components/ui/page-header'
import { RecipeEditForm } from './RecipeEditForm'

export default async function EditRecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params  // id = concept id
  const supabase = await createClient()

  const { data: recipe } = await supabase
    .from('rd_recipes')
    .select('*')
    .eq('concept_id', id)
    .order('version')
    .limit(1)
    .single()

  if (!recipe) notFound()

  return (
    <div>
      <BackLink href={`/concepts/${id}/recipe`} label="Recipe" />

      <PageHeader
        eyebrow={`Edit Recipe · V${recipe.version}`}
        title="Prototype Recipe"
      />

      <RecipeEditForm conceptId={id} recipe={recipe} />
    </div>
  )
}
