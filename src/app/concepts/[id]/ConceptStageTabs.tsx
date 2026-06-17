'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SectionCard } from '@/components/ui/section-card'
import { Pill } from '@/components/ui/pill'
import { GenerateRecipeButton } from './GenerateRecipeButton'

type Breakdown = {
  hero?: string
  flavor_drivers?: string[]
  textures?: string[]
  key_contrast?: string
} | null

type Feasibility = {
  assets_leveraged?: string[]
  watchouts?: string[]
} | null

type RecipeComponent = { name: string; quantity: string; notes: string }
type RecipeYield = { serves: number; portion_size: string }

type ConceptData = {
  id: string
  brief_id: string | null
  status: string
  one_line: string | null
  breakdown: Breakdown
  presentation: string | null
  why_it_could_win: Record<string, string> | string | null
  feasibility: Feasibility
  experiment_focus: string[]
}

type RecipeData = {
  id: string
  version: number
  concept_intent: string | null
  components: RecipeComponent[]
  method: string[]
  plating_notes: string | null
  yield: RecipeYield | null
  success_criteria: string[]
  status: string
} | null

type Tab = 'concept' | 'recipe'

export function ConceptStageTabs({
  concept,
  recipe: initialRecipe,
}: {
  concept: ConceptData
  recipe: RecipeData
}) {
  const router = useRouter()
  const [active, setActive] = useState<Tab>('concept')
  const [recipe, setRecipe] = useState<RecipeData>(initialRecipe)
  const [pendingTab, setPendingTab] = useState(false)

  // When recipe arrives after generation, switch to recipe tab
  useEffect(() => {
    if (recipe && pendingTab) {
      setActive('recipe')
      setPendingTab(false)
    }
  }, [recipe, pendingTab])

  // Keep recipe in sync with server re-renders
  useEffect(() => {
    setRecipe(initialRecipe)
  }, [initialRecipe])

  const handleGenerateSuccess = () => {
    setPendingTab(true)
    router.refresh()
  }

  const breakdown = concept.breakdown
  const feasibility = concept.feasibility

  const tabs: { id: Tab; label: string }[] = [
    { id: 'concept', label: 'Concept' },
    ...(recipe ? [{ id: 'recipe' as Tab, label: `Recipe · V${recipe.version}` }] : []),
  ]

  return (
    <>
      {/* Tab strip */}
      <div className="flex gap-6 border-b border-olive/15 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={[
              'pb-3 text-sm font-light transition-colors border-b-2 -mb-px',
              active === tab.id
                ? 'text-ink border-olive'
                : 'text-ink-muted border-transparent hover:text-ink',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Concept Tab ── */}
      {active === 'concept' && (
        <div className="space-y-3">
          {breakdown && (
            <SectionCard label="Concept Breakdown">
              <div className="grid grid-cols-2 gap-4">
                {breakdown.hero && (
                  <div>
                    <p className="text-[10px] uppercase tracking-[1.5px] text-ink-muted mb-1.5">Hero</p>
                    <p className="text-sm text-ink font-light">{breakdown.hero}</p>
                  </div>
                )}
                {breakdown.key_contrast && (
                  <div>
                    <p className="text-[10px] uppercase tracking-[1.5px] text-ink-muted mb-1.5">Key Contrast</p>
                    <p className="text-sm text-ink font-light">{breakdown.key_contrast}</p>
                  </div>
                )}
                {breakdown.flavor_drivers && breakdown.flavor_drivers.length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase tracking-[1.5px] text-ink-muted mb-1.5">Flavor Drivers</p>
                    <div className="flex flex-wrap gap-1.5">
                      {breakdown.flavor_drivers.map((f) => (
                        <Pill key={f} variant="default">{f}</Pill>
                      ))}
                    </div>
                  </div>
                )}
                {breakdown.textures && breakdown.textures.length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase tracking-[1.5px] text-ink-muted mb-1.5">Textures</p>
                    <div className="flex flex-wrap gap-1.5">
                      {breakdown.textures.map((t) => (
                        <Pill key={t} variant="cream">{t}</Pill>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </SectionCard>
          )}

          {concept.presentation && (
            <SectionCard label="Presentation & Service Moment">
              <p className="text-sm text-ink font-light leading-relaxed">{concept.presentation}</p>
            </SectionCard>
          )}

          {concept.why_it_could_win && (
            <SectionCard label="Why It Could Win">
              {typeof concept.why_it_could_win === 'object' ? (
                <div className="space-y-3">
                  {(['menu_gap', 'emotional_trigger', 'salted_olive'] as const).map((key) => {
                    const win = concept.why_it_could_win as Record<string, string>
                    return win[key] ? (
                      <div key={key}>
                        <p className="text-[10px] uppercase tracking-[1.5px] text-ink-muted mb-1">
                          {key === 'menu_gap' ? 'Menu Gap' : key === 'emotional_trigger' ? 'Emotional Trigger' : 'Salted Olive'}
                        </p>
                        <p className="text-sm text-ink font-light leading-relaxed">{win[key]}</p>
                      </div>
                    ) : null
                  })}
                </div>
              ) : (
                <p className="text-sm text-ink font-light leading-relaxed">{concept.why_it_could_win as string}</p>
              )}
            </SectionCard>
          )}

          {feasibility && (
            <SectionCard label="Feasibility Notes">
              <div className="grid grid-cols-2 gap-4">
                {feasibility.assets_leveraged && feasibility.assets_leveraged.length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase tracking-[1.5px] text-ink-muted mb-2">Assets Leveraged</p>
                    <ul className="space-y-1">
                      {feasibility.assets_leveraged.map((a) => (
                        <li key={a} className="text-sm text-ink font-light flex gap-1.5">
                          <span className="text-olive">·</span> {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {feasibility.watchouts && feasibility.watchouts.length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase tracking-[1.5px] text-ink-muted mb-2">Watchouts</p>
                    <ul className="space-y-1">
                      {feasibility.watchouts.map((w) => (
                        <li key={w} className="text-sm text-ink font-light flex gap-1.5">
                          <span className="text-ink-muted">·</span> {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </SectionCard>
          )}

          {concept.experiment_focus && concept.experiment_focus.length > 0 && (
            <SectionCard label="Experiment Focus">
              <ol className="space-y-2.5">
                {concept.experiment_focus.map((q: string, i: number) => (
                  <li key={i} className="flex gap-3 text-sm text-ink font-light leading-relaxed">
                    <span className="text-ink-muted shrink-0 font-medium">{i + 1}.</span>
                    {q}
                  </li>
                ))}
              </ol>
            </SectionCard>
          )}

          {/* Generate Recipe CTA */}
          {!recipe && (
            <div className="border-t border-olive/15 pt-6 mt-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ink">Prototype Recipe</p>
                <p className="text-[12px] text-ink-muted font-light">Not generated yet</p>
              </div>
              <GenerateRecipeButton conceptId={concept.id} onSuccess={handleGenerateSuccess} />
            </div>
          )}
        </div>
      )}

      {/* ── Recipe Tab ── */}
      {active === 'recipe' && recipe && (
        <div className="space-y-3">
          {recipe.concept_intent && (
            <div className="bg-cream-dark rounded-md px-5 py-4 border border-olive/10">
              <p className="text-[10px] uppercase tracking-[1.5px] text-ink-muted mb-1.5">Concept Intent</p>
              <p className="text-sm text-ink font-light leading-relaxed italic">{recipe.concept_intent}</p>
            </div>
          )}

          {recipe.yield && (
            <div className="flex items-center gap-3">
              <span className="text-[10px] uppercase tracking-[1.5px] text-ink-muted">Yield</span>
              <span className="text-sm text-ink font-light">
                {recipe.yield.serves} portion{recipe.yield.serves !== 1 ? 's' : ''} · {recipe.yield.portion_size}
              </span>
            </div>
          )}

          {recipe.components && recipe.components.length > 0 && (
            <SectionCard label="Components">
              <div className="space-y-0 divide-y divide-olive/8">
                {recipe.components.map((c, i) => (
                  <div key={i} className="grid grid-cols-[1fr_auto] gap-3 py-2.5 first:pt-0 last:pb-0">
                    <div>
                      <span className="text-sm text-ink font-light">{c.name}</span>
                      {c.notes && (
                        <span className="text-[12px] text-ink-muted font-light ml-2">— {c.notes}</span>
                      )}
                    </div>
                    <span className="text-sm text-ink-muted font-light text-right whitespace-nowrap">{c.quantity}</span>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {recipe.method && recipe.method.length > 0 && (
            <SectionCard label="Method">
              <ol className="space-y-3">
                {recipe.method.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm text-ink font-light leading-relaxed">
                    <span className="text-ink-muted shrink-0 font-medium tabular-nums">{i + 1}.</span>
                    {step}
                  </li>
                ))}
              </ol>
            </SectionCard>
          )}

          {recipe.plating_notes && (
            <SectionCard label="Plating & Presentation">
              <p className="text-sm text-ink font-light leading-relaxed">{recipe.plating_notes}</p>
            </SectionCard>
          )}

          {recipe.success_criteria && recipe.success_criteria.length > 0 && (
            <SectionCard label="Success Criteria">
              <ol className="space-y-2.5">
                {recipe.success_criteria.map((c, i) => (
                  <li key={i} className="flex gap-3 text-sm text-ink font-light leading-relaxed">
                    <span className="text-ink-muted shrink-0 font-medium">{i + 1}.</span>
                    {c}
                  </li>
                ))}
              </ol>
            </SectionCard>
          )}
        </div>
      )}
    </>
  )
}
