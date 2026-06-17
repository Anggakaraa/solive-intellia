'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { IdentityPrinciple } from '@/lib/supabase/types'

interface Level {
  category: string
  subtitle: string
  items: IdentityPrinciple[]
}

export function PrinciplesClient({ levels }: { levels: Level[] }) {
  const [open, setOpen] = useState<Record<string, boolean>>(
    Object.fromEntries(levels.map((l, i) => [l.category, i === 0]))
  )

  const toggle = (category: string) =>
    setOpen((prev) => ({ ...prev, [category]: !prev[category] }))

  return (
    <div className="space-y-3">
      {levels.map(({ category, subtitle, items }) => (
        <div key={category} className="bg-white border border-olive/15 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => toggle(category)}
            className="w-full flex items-center justify-between px-5 py-4 bg-olive hover:bg-olive-light transition-colors text-left"
          >
            <div>
              <p className="font-serif text-base font-normal text-cream">{category}</p>
              <p className="text-[11px] text-cream/60 mt-0.5">{subtitle}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-4">
              <span className="text-[11px] text-cream/60">{items.length} principles</span>
              <ChevronDown
                className={`text-cream/60 transition-transform ${open[category] ? 'rotate-180' : ''}`}
                size={15}
              />
            </div>
          </button>

          {open[category] && (
            <div className="border-t border-olive/10">
              {items.map((p, i) => (
                <PrincipleCard key={p.id} principle={p} index={i + 1} />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function PrincipleCard({ principle, index }: { principle: IdentityPrinciple; index: number }) {
  const examples = principle.examples
    ? principle.examples.split('\n').filter(Boolean)
    : []

  return (
    <div className="px-6 py-6 border-b border-olive/10 last:border-b-0">
      <div className="w-8 h-8 rounded-full bg-olive-faint text-olive text-[13px] font-medium flex items-center justify-center mb-4">
        {index}
      </div>

      <p className="font-serif text-xl font-normal text-ink mb-2">{principle.name}</p>

      {principle.definition && (
        <p className="text-sm text-ink-mid font-light leading-relaxed mb-4">
          {principle.definition}
        </p>
      )}

      {principle.question && (
        <div className="border-l-2 border-olive pl-4 mt-4">
          <p className="text-[11px] uppercase tracking-[1px] text-ink-muted mb-1">Ask yourself</p>
          <p className="text-[13px] text-ink-mid italic font-light">{principle.question}</p>
        </div>
      )}

      {examples.length > 0 && (
        <div className="mt-4">
          <p className="text-[11px] uppercase tracking-[1px] text-ink-muted mb-2">Examples</p>
          <ul className="space-y-1 list-disc list-inside">
            {examples.map((ex) => (
              <li key={ex} className="text-[13px] text-ink-muted">
                {ex}
              </li>
            ))}
          </ul>
        </div>
      )}

      {principle.notes && (
        <p className="text-[11px] text-ink-muted mt-3 italic">{principle.notes}</p>
      )}
    </div>
  )
}
