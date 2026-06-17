'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Sparkles, Bookmark, BookmarkCheck } from 'lucide-react'
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
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {isSetMenu && (
              <span className="text-[9px] uppercase tracking-[1.5px] text-ink-muted border border-olive/20 rounded px-1.5 py-0.5">
                W{slot.wave}{slot.wave_order != null ? `.${slot.wave_order}` : ''}
              </span>
            )}
            <Pill variant="faint">{slot.category}</Pill>
          </div>
          {!concept && !loading && (
            <button onClick={onGenerate} className={cn(ghostBtnCls, 'shrink-0 flex items-center gap-1.5 text-[11px]')}>
              <Sparkles size={11} />
              Generate full concept
            </button>
          )}
          {loading && (
            <span className="flex items-center gap-1.5 text-[11px] text-ink-muted">
              <Sparkles size={11} className="animate-spin" />
              Generating…
            </span>
          )}
        </div>

        <h3 className="font-serif text-[18px] font-normal text-ink leading-snug mb-1">
          {concept?.concept_name ?? slot.concept_name}
        </h3>
        <p className="text-sm text-ink-mid font-light leading-relaxed">
          {concept?.one_line ?? slot.one_line}
        </p>
      </div>

      {/* Full concept — shown only after generation */}
      {concept && (
        <div className="border-t border-olive/10 px-5 py-4 space-y-4 bg-paper/40">
          {/* Breakdown */}
          {concept.breakdown && (
            <div>
              <p className="text-[10px] uppercase tracking-[1.5px] text-ink-muted mb-2">Breakdown</p>
              <div className="space-y-1.5">
                <div className="flex gap-3 text-[12px]">
                  <span className="text-ink-muted font-light w-24 shrink-0">Hero</span>
                  <span className="text-ink font-light">{concept.breakdown.hero}</span>
                </div>
                <div className="flex gap-3 text-[12px]">
                  <span className="text-ink-muted font-light w-24 shrink-0">Flavours</span>
                  <span className="text-ink font-light">{concept.breakdown.flavor_drivers.join(', ')}</span>
                </div>
                <div className="flex gap-3 text-[12px]">
                  <span className="text-ink-muted font-light w-24 shrink-0">Textures</span>
                  <span className="text-ink font-light">{concept.breakdown.textures.join(', ')}</span>
                </div>
                <div className="flex gap-3 text-[12px]">
                  <span className="text-ink-muted font-light w-24 shrink-0">Key contrast</span>
                  <span className="text-ink font-light">{concept.breakdown.key_contrast}</span>
                </div>
              </div>
            </div>
          )}

          {/* Presentation */}
          {concept.presentation && (
            <div>
              <p className="text-[10px] uppercase tracking-[1.5px] text-ink-muted mb-1.5">Presentation</p>
              <p className="text-[12px] text-ink-mid font-light leading-relaxed">{concept.presentation}</p>
            </div>
          )}

          {/* Why it could win */}
          {concept.why_it_could_win && typeof concept.why_it_could_win === 'object' && (
            <div>
              <p className="text-[10px] uppercase tracking-[1.5px] text-ink-muted mb-2">Why it could win</p>
              <div className="space-y-1.5">
                {[
                  { label: 'Menu gap', value: concept.why_it_could_win.menu_gap },
                  { label: 'Emotional trigger', value: concept.why_it_could_win.emotional_trigger },
                  { label: 'Salted Olive', value: concept.why_it_could_win.salted_olive },
                ].map(({ label, value }) => (
                  <div key={label} className="flex gap-3 text-[12px]">
                    <span className="text-ink-muted font-light w-24 shrink-0">{label}</span>
                    <span className="text-ink font-light">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Feasibility */}
          {concept.feasibility && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[1.5px] text-ink-muted mb-1.5">Assets leveraged</p>
                <ul className="space-y-0.5">
                  {concept.feasibility.assets_leveraged.map((a) => (
                    <li key={a} className="text-[12px] text-ink font-light">· {a}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[1.5px] text-ink-muted mb-1.5">Watchouts</p>
                <ul className="space-y-0.5">
                  {concept.feasibility.watchouts.map((w) => (
                    <li key={w} className="text-[12px] text-ink-mid font-light">· {w}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Experiment focus */}
          {concept.experiment_focus?.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-[1.5px] text-ink-muted mb-1.5">Experiment focus</p>
              <ul className="space-y-0.5">
                {concept.experiment_focus.map((f) => (
                  <li key={f} className="text-[12px] text-ink font-light">· {f}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Save */}
          <div className="pt-2 flex justify-end border-t border-olive/10">
            <button
              onClick={onSave}
              disabled={saved}
              className={cn(ghostBtnCls, 'flex items-center gap-1.5 text-[11px]')}
            >
              {saved
                ? <><BookmarkCheck size={12} className="text-olive" /> Saved to menu items</>
                : <><Bookmark size={12} /> Save to menu items</>
              }
            </button>
          </div>
        </div>
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
