import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
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
      <Link
        href={`/concepts/${id}/recipe`}
        className="flex items-center gap-1 text-[13px] text-ink-muted hover:text-ink mb-6 transition-colors"
      >
        <ChevronLeft size={14} /> Recipe
      </Link>

      <div className="mb-9">
        <p className="text-[10px] uppercase tracking-[2px] text-ink-muted mb-1.5">Edit Recipe · V{recipe.version}</p>
        <h1 className="font-serif text-3xl font-normal text-ink tracking-tight leading-tight">
          Prototype Recipe
        </h1>
      </div>

      <RecipeEditForm conceptId={id} recipe={recipe} />
    </div>
  )
}
