'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Sparkles, Bookmark } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { SectionCard } from '@/components/ui/section-card'
import { Pill } from '@/components/ui/pill'
import { ghostBtnCls } from '@/lib/styles'
import { cn } from '@/lib/utils'
import type { CollectionOutputData, CollectionDishSlot, RdConcept } from '@/lib/supabase/types'

interface Props {
  briefId: string
  outputData: CollectionOutputData
  existingConcepts: RdConcept[]
  ff: number | null
  fd: number | null
}

type DishState = {
  slot: CollectionDishSlot
  concept: RdConcept | null
  loading: boolean
  saved: boolean
}

function WaveTable({ waves }: { waves: NonNullable<CollectionOutputData['waves']> }) {
  return (
    <div className="mb-6">
      <p className="text-[10px] uppercase tracking-[2px] text-ink-muted mb-3">Wave structure</p>
      <div className="bg-white border border-olive/15 rounded-lg divide-y divide-olive/10">
        {waves.map((w) => (
          <div key={w.wave} className="flex items-start gap-4 px-4 py-3">
            <span className="text-[11px] font-medium text-ink-muted shrink-0 w-6">W{w.wave}</span>
            <span className="text-[12px] text-ink font-light flex-1">{w.feel}</span>
            <span className="text-[11px] text-ink-muted font-light">{w.categories.join(' · ')}</span>
            <span className="text-[11px] text-ink-muted font-light shrink-0">{w.dish_count} {w.dish_count === 1 ? 'dish' : 'dishes'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function DishConceptCard({
  state,
  onGenerate,
  onSave,
}: {
  state: DishState
  onGenerate: () => void
  onSave: () => void
}) {
  const { slot, concept, loading, saved } = state
  const isSetMenu = slot.wave != null

  return (
    <div className="bg-white border border-olive/15 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            {isSetMenu && (
              <span className="text-[9px] uppercase tracking-[1.5px] text-ink-muted border border-olive/20 rounded px-1.5 py-0.5">
                W{slot.wave}{slot.wave_order != null ? `.${slot.wave_order}` : ''}
              </span>
            )}
            <Pill variant="faint">{slot.category}</Pill>
          </div>
          {!concept && !loading && (
            <button onClick={onGenerate} className={cn(ghostBtnCls, 'shrink-0 flex items-center gap-1.5')}>
              <Sparkles size={13} />
              Generate
            </button>
          )}
          {loading && (
            <span className="flex items-center gap-1.5 text-[12px] text-ink-muted">
              <Sparkles size={13} className="animate-spin" />
              Generating…
            </span>
          )}
          {concept && (
            <button
              onClick={onSave}
              disabled={saved}
              className={cn(ghostBtnCls, 'shrink-0 flex items-center gap-1.5 disabled:opacity-50')}
            >
              <Bookmark size={13} className={saved ? 'fill-olive' : ''} />
              {saved ? 'Saved' : 'Save to menu items'}
            </button>
          )}
        </div>

        <h3 className="font-serif text-[22px] font-normal text-ink leading-snug mb-1">
          {concept?.concept_name ?? slot.concept_name}
        </h3>
        <p className="text-sm text-ink-mid font-light leading-relaxed italic">
          {concept?.one_line ?? slot.one_line}
        </p>
      </div>

      {/* Full concept — shown only after generation */}
      {concept && (
        <>
          {/* Breakdown 2×2 grid */}
          {concept.breakdown && (
            <div className="px-5 py-4 border-t border-olive/10">
              <p className="text-[10px] uppercase tracking-[1.5px] text-ink-muted mb-3">Concept Breakdown</p>
              <div className="grid grid-cols-2 gap-2">
                {([
                  ['Hero', concept.breakdown.hero],
                  ['Key Flavor Drivers', concept.breakdown.flavor_drivers.join(' · ')],
                  ['Key Textures', concept.breakdown.textures.join(' · ')],
                  ['Key Contrast', concept.breakdown.key_contrast],
                ] as [string, string][]).map(([label, value]) => (
                  <div key={label} className="bg-cream-dark rounded-lg p-3">
                    <p className="text-[10px] uppercase tracking-[1px] text-ink-muted mb-1.5">{label}</p>
                    <p className="text-[12px] text-ink font-light leading-snug">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Presentation */}
          {concept.presentation && (
            <div className="px-5 py-4 border-t border-olive/10">
              <p className="text-[10px] uppercase tracking-[1.5px] text-ink-muted mb-2">Presentation & Service Moment</p>
              <p className="text-sm text-ink-mid font-light leading-relaxed">{concept.presentation}</p>
            </div>
          )}

          {/* Why it could win */}
          {concept.why_it_could_win && typeof concept.why_it_could_win === 'object' && (
            <div className="px-5 py-4 border-t border-olive/10">
              <p className="text-[10px] uppercase tracking-[1.5px] text-ink-muted mb-3">Why It Could Win</p>
              <div className="divide-y divide-olive/10">
                {([
                  ['Menu Gap', concept.why_it_could_win.menu_gap],
                  ['Emotional Trigger', concept.why_it_could_win.emotional_trigger],
                  ['Salted Olive', concept.why_it_could_win.salted_olive],
                ] as [string, string][]).map(([label, text]) => (
                  <div key={label} className="grid grid-cols-[108px_1fr] gap-3 py-2.5 first:pt-0 last:pb-0">
                    <span className="text-[10px] uppercase tracking-[1px] text-olive font-medium pt-0.5">{label}</span>
                    <span className="text-[12px] text-ink-mid font-light leading-relaxed">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Feasibility */}
          {concept.feasibility && (concept.feasibility.assets_leveraged.length > 0 || concept.feasibility.watchouts.length > 0) && (
            <div className="px-5 py-4 border-t border-olive/10">
              <p className="text-[10px] uppercase tracking-[1.5px] text-ink-muted mb-3">Feasibility Notes</p>
              <div className="grid grid-cols-2 gap-5">
                {concept.feasibility.assets_leveraged.length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase tracking-[1px] text-ink-muted pb-2 mb-2 border-b border-olive/10">Assets Leveraged</p>
                    <div className="flex flex-wrap gap-1.5">
                      {concept.feasibility.assets_leveraged.map((a) => <Pill key={a} variant="faint">{a}</Pill>)}
                    </div>
                  </div>
                )}
                {concept.feasibility.watchouts.length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase tracking-[1px] text-ink-muted pb-2 mb-2 border-b border-olive/10">Watchouts</p>
                    <ul className="space-y-2">
                      {concept.feasibility.watchouts.map((w, i) => (
                        <li key={i} className="flex gap-2 text-[12px] text-ink-mid font-light leading-snug">
                          <span className="w-1 h-1 rounded-full bg-ink-muted mt-1.5 shrink-0" />
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Experiment focus */}
          {concept.experiment_focus?.length > 0 && (
            <div className="px-5 py-4 border-t border-olive/10 bg-cream-dark">
              <p className="text-[10px] uppercase tracking-[1.5px] text-ink-muted mb-3">Experiment Focus</p>
              <ul className="space-y-2.5">
                {concept.experiment_focus.map((f, i) => (
                  <li key={i} className="flex gap-2.5 items-start">
                    <span className="w-3.5 h-3.5 rounded border border-olive/25 shrink-0 mt-0.5 bg-white" />
                    <span className="text-[12px] text-ink-mid font-light leading-snug">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export function CollectionOutput({ briefId, outputData, existingConcepts, ff, fd }: Props) {
  const supabase = createClient()
  const isSetMenu = outputData.collection_format === 'set_menu'

  const [dishes, setDishes] = useState<DishState[]>(
    outputData.dishes.map((slot) => {
      const existing = existingConcepts.find((c) => c.concept_name === slot.concept_name) ?? null
      return {
        slot,
        concept: existing,
        loading: false,
        saved: existing?.status === 'saved',
      }
    })
  )

  const generateDish = async (index: number) => {
    setDishes((prev) => prev.map((d, i) => i === index ? { ...d, loading: true } : d))

    try {
      const res = await fetch('/api/generate-dish-concept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ briefId, slot: dishes[index].slot }),
      })

      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: 'Unknown error' }))
        toast.error(error ?? 'Failed to generate concept')
        return
      }

      const { concept } = await res.json()
      setDishes((prev) => prev.map((d, i) => i === index ? { ...d, concept, loading: false } : d))
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setDishes((prev) => prev.map((d, i) => i === index ? { ...d, loading: false } : d))
    }
  }

  const saveDish = async (index: number) => {
    const concept = dishes[index].concept
    if (!concept) return

    const { error } = await supabase
      .from('rd_concepts')
      .update({ status: 'saved' })
      .eq('id', concept.id)

    if (error) {
      toast.error(error.message)
      return
    }

    setDishes((prev) => prev.map((d, i) => i === index ? { ...d, saved: true } : d))
    toast.success('Saved to menu items')
  }

  // Group dishes by wave for set menu
  const grouped: Array<{ wave?: number; feel?: string; items: { dish: DishState; index: number }[] }> = []

  if (isSetMenu && outputData.waves) {
    for (const wave of outputData.waves) {
      const items = dishes
        .map((d, index) => ({ dish: d, index }))
        .filter(({ dish }) => dish.slot.wave === wave.wave)
        .sort((a, b) => (a.dish.slot.wave_order ?? 0) - (b.dish.slot.wave_order ?? 0))
      grouped.push({ wave: wave.wave, feel: wave.feel, items })
    }
    // any dishes without a wave
    const unassigned = dishes
      .map((d, index) => ({ dish: d, index }))
      .filter(({ dish }) => !dish.slot.wave)
    if (unassigned.length) grouped.push({ items: unassigned })
  } else {
    grouped.push({ items: dishes.map((dish, index) => ({ dish, index })) })
  }

  // Suppress unused warnings for ff/fd (reserved for future use on dish cards)
  void ff; void fd

  return (
    <div className="space-y-6">
      {/* Tensions */}
      <SectionCard variant="muted" label="Brief tensions">
        <p className="text-sm text-ink-mid font-light leading-relaxed whitespace-pre-line">
          {outputData.tensions}
        </p>
      </SectionCard>

      {/* Narrative */}
      <SectionCard label="Menu narrative">
        <p className="text-sm text-ink-mid font-light leading-relaxed whitespace-pre-line">
          {outputData.narrative}
        </p>
      </SectionCard>

      {/* Wave table */}
      {isSetMenu && outputData.waves && outputData.waves.length > 0 && (
        <WaveTable waves={outputData.waves} />
      )}

      {/* Dish cards */}
      {grouped.map((group) => (
        <div key={group.wave ?? 'flat'}>
          {group.wave != null && (
            <p className="text-[10px] uppercase tracking-[2px] text-ink-muted mb-3">
              Wave {group.wave} — {group.feel}
            </p>
          )}
          <div className="space-y-4">
            {group.items.map(({ dish, index }) => (
              <DishConceptCard
                key={dish.slot.concept_name}
                state={dish}
                onGenerate={() => generateDish(index)}
                onSave={() => saveDish(index)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
