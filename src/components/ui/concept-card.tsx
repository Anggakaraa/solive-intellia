'use client'

import { useState } from 'react'
import { Bookmark } from 'lucide-react'
import { Pill } from '@/components/ui/pill'
import { ghostBtnCls } from '@/lib/styles'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

export type WhyItCouldWin = {
  menu_gap: string
  emotional_trigger: string
  salted_olive: string
}

export type ConceptCardData = {
  id: string
  concept_name: string
  one_line: string | null
  breakdown: {
    hero: string
    flavor_drivers: string[]
    textures: string[]
    key_contrast: string
  } | null
  presentation: string | null
  why_it_could_win: WhyItCouldWin | null
  feasibility: {
    assets_leveraged: string[]
    watchouts: string[]
  } | null
  experiment_focus: string[]
  status: string
  exploration_mode?: string | null
}

interface ConceptCardProps {
  concept: ConceptCardData
  ff?: number | null
  fd?: number | null
  strategicRoles?: string[]
  isSaved?: boolean
  onSave?: (id: string) => void
}

export function ConceptCard({
  concept,
  ff,
  fd,
  strategicRoles = [],
  isSaved = false,
  onSave,
}: ConceptCardProps) {
  const [saved, setSaved] = useState(isSaved)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()
    await supabase
      .from('rd_concepts')
      .update({ status: 'saved' })
      .eq('id', concept.id)
    setSaved(true)
    setSaving(false)
    onSave?.(concept.id)
  }

  const assets = concept.feasibility?.assets_leveraged ?? []
  const watchouts = concept.feasibility?.watchouts ?? []
  const hasMetaPills = ff != null || fd != null || strategicRoles.length > 0 || assets.length > 0

  return (
    <div className="bg-white border border-olive/15 rounded-xl overflow-hidden">

      {/* Header */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h2 className="font-serif text-[22px] font-normal text-ink leading-snug">
            {concept.concept_name}
          </h2>
          <button
            onClick={handleSave}
            disabled={saved || saving}
            className={cn('flex items-center gap-1.5 shrink-0 mt-1 disabled:opacity-50', ghostBtnCls)}
          >
            <Bookmark size={13} className={saved ? 'fill-olive' : ''} />
            {saving ? 'Saving…' : saved ? 'Saved' : 'Save to menu items'}
          </button>
        </div>
        {concept.one_line && (
          <p className="text-sm text-ink-mid font-light leading-relaxed italic">{concept.one_line}</p>
        )}
      </div>

      {/* Pills */}
      {hasMetaPills && (
        <div className="flex flex-wrap gap-1.5 px-5 py-3 border-t border-olive/10">
          {ff != null && <Pill variant="olive">FF {ff}</Pill>}
          {fd != null && <Pill variant="olive">FD {fd}</Pill>}
          {strategicRoles.map(r => <Pill key={r} variant="default">{r}</Pill>)}
          {assets.map(a => <Pill key={a} variant="faint">{a}</Pill>)}
        </div>
      )}

      {/* Breakdown 2×2 grid */}
      {concept.breakdown && (
        <div className="px-5 py-4 border-t border-olive/10">
          <p className="text-[10px] uppercase tracking-[1.5px] text-ink-muted mb-3">Concept Breakdown</p>
          <div className="grid grid-cols-2 gap-2">
            {([
              ['Hero',              concept.breakdown.hero],
              ['Key Flavor Drivers', concept.breakdown.flavor_drivers.join(' · ')],
              ['Key Textures',      concept.breakdown.textures.join(' · ')],
              ['Key Contrast',      concept.breakdown.key_contrast],
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

      {/* Why it could win — two-column grid */}
      {concept.why_it_could_win && (
        <div className="px-5 py-4 border-t border-olive/10">
          <p className="text-[10px] uppercase tracking-[1.5px] text-ink-muted mb-3">Why It Could Win</p>
          <div className="divide-y divide-olive/10">
            {([
              ['Menu Gap',         concept.why_it_could_win.menu_gap],
              ['Emotional Trigger', concept.why_it_could_win.emotional_trigger],
              ['Salted Olive',     concept.why_it_could_win.salted_olive],
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
      {(assets.length > 0 || watchouts.length > 0) && (
        <div className="px-5 py-4 border-t border-olive/10">
          <p className="text-[10px] uppercase tracking-[1.5px] text-ink-muted mb-3">Feasibility Notes</p>
          <div className="grid grid-cols-2 gap-5">
            {assets.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-[1px] text-ink-muted pb-2 mb-2 border-b border-olive/10">
                  Assets Leveraged
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {assets.map(a => <Pill key={a} variant="faint">{a}</Pill>)}
                </div>
              </div>
            )}
            {watchouts.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-[1px] text-ink-muted pb-2 mb-2 border-b border-olive/10">
                  Watchouts
                </p>
                <ul className="space-y-2">
                  {watchouts.map((w, i) => (
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
      {concept.experiment_focus.length > 0 && (
        <div className="px-5 py-4 border-t border-olive/10 bg-cream-dark">
          <p className="text-[10px] uppercase tracking-[1.5px] text-ink-muted mb-3">Experiment Focus</p>
          <ul className="space-y-2.5">
            {concept.experiment_focus.map((item, i) => (
              <li key={i} className="flex gap-2.5 items-start">
                <span className="w-3.5 h-3.5 rounded border border-olive/25 shrink-0 mt-0.5 bg-white" />
                <span className="text-[12px] text-ink-mid font-light leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

    </div>
  )
}
