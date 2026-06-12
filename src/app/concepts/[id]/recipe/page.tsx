import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { BackLink } from '@/components/ui/back-link'
import { SectionCard } from '@/components/ui/section-card'
import { DeleteButton } from '@/components/ui/delete-button'
import { mutedBtnCls } from '@/lib/styles'
import { KitchenNotesField } from './KitchenNotesField'

type Component = { name: string; quantity: string; notes: string }
type Yield = { serves: number; portion_size: string }

export default async function RecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // id here is the concept id
  const { data: recipe } = await supabase
    .from('rd_recipes')
    .select('*')
    .eq('concept_id', id)
    .order('version')
    .limit(1)
    .single()

  if (!recipe) notFound()

  const components = (recipe.components ?? []) as Component[]
  const yieldInfo = recipe.yield as Yield | null

  return (
    <div className="max-w-2xl">
      <BackLink href={`/concepts/${id}`} label="Concept" />

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <p className="text-[10px] uppercase tracking-[2px] text-ink-muted">
            Prototype Recipe · V{recipe.version}
          </p>
          <div className="flex items-center gap-4 shrink-0">
            <Link href={`/concepts/${id}/recipe/edit`} className={mutedBtnCls}>
              Edit
            </Link>
            <DeleteButton table="rd_recipes" id={recipe.id} redirectTo={`/concepts/${id}`} />
          </div>
        </div>
        {recipe.concept_intent && (
          <p className="text-sm text-ink-mid font-light leading-relaxed mt-2">{recipe.concept_intent}</p>
        )}
      </div>

      {/* Mock banner */}
      <div className="bg-cream-dark border border-olive/15 rounded-md px-4 py-2.5 mb-5 flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-[1.5px] text-ink-muted">Mock</span>
        <span className="text-[12px] text-ink-muted font-light">Placeholder content — AI not yet connected.</span>
      </div>

      <div className="space-y-3">

        {/* Yield */}
        {yieldInfo && (
          <SectionCard label="Yield">
            <div className="flex gap-8">
              <div>
                <p className="text-[10px] uppercase tracking-[1.5px] text-ink-muted mb-1">Serves</p>
                <p className="text-sm text-ink font-medium">{yieldInfo.serves}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[1.5px] text-ink-muted mb-1">Portion Size</p>
                <p className="text-sm text-ink font-medium">{yieldInfo.portion_size}</p>
              </div>
            </div>
          </SectionCard>
        )}

        {/* Components */}
        {components.length > 0 && (
          <SectionCard label="Components">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-olive/10">
                  <th className="text-left text-[10px] uppercase tracking-[1.5px] text-ink-muted font-normal pb-2 w-2/5">Ingredient</th>
                  <th className="text-left text-[10px] uppercase tracking-[1.5px] text-ink-muted font-normal pb-2 w-1/5">Quantity</th>
                  <th className="text-left text-[10px] uppercase tracking-[1.5px] text-ink-muted font-normal pb-2">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-olive/[0.06]">
                {components.map((c, i) => (
                  <tr key={i}>
                    <td className="py-2 text-ink font-medium pr-4">{c.name}</td>
                    <td className="py-2 text-ink-mid font-light pr-4">{c.quantity}</td>
                    <td className="py-2 text-ink-muted font-light">{c.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </SectionCard>
        )}

        {/* Method */}
        {recipe.method && recipe.method.length > 0 && (
          <SectionCard label="Method">
            <ol className="space-y-3">
              {recipe.method.map((step: string, i: number) => (
                <li key={i} className="flex gap-3 text-sm text-ink font-light leading-relaxed">
                  <span className="text-ink-muted shrink-0 font-medium w-5">{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ol>
          </SectionCard>
        )}

        {/* Plating Notes */}
        {recipe.plating_notes && (
          <SectionCard label="Plating Notes">
            <p className="text-sm text-ink font-light leading-relaxed">{recipe.plating_notes}</p>
          </SectionCard>
        )}

        {/* Success Criteria */}
        {recipe.success_criteria && recipe.success_criteria.length > 0 && (
          <SectionCard label="Success Criteria">
            <ul className="space-y-2">
              {recipe.success_criteria.map((c: string, i: number) => (
                <li key={i} className="flex gap-2.5 text-sm text-ink font-light leading-relaxed">
                  <span className="text-olive shrink-0 mt-0.5">·</span>
                  {c}
                </li>
              ))}
            </ul>
          </SectionCard>
        )}

        {/* Test Kitchen Notes — human-entered */}
        <SectionCard
          label="Test Kitchen Notes"
          helper="Enter after prototyping. This becomes the longitudinal record."
        >
          <KitchenNotesField recipeId={recipe.id} initialValue={recipe.test_kitchen_notes ?? ''} />
        </SectionCard>

      </div>
    </div>
  )
}
