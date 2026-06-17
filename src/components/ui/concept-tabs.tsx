'use client'

import { useState } from 'react'
import { ConceptCard, type ConceptCardData } from '@/components/ui/concept-card'
import { cn } from '@/lib/utils'

interface ConceptTabsProps {
  concepts: ConceptCardData[]
  ff?: number | null
  fd?: number | null
  strategicRoles?: string[]
  recommendation?: string
  savedIds?: string[]
  onSave?: (id: string) => void
}

export function ConceptTabs({
  concepts,
  ff,
  fd,
  strategicRoles = [],
  recommendation,
  savedIds = [],
  onSave,
}: ConceptTabsProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [localSavedIds, setLocalSavedIds] = useState<Set<string>>(() => new Set(savedIds))

  const handleSave = (id: string) => {
    setLocalSavedIds((prev) => new Set([...prev, id]))
    onSave?.(id)
  }

  if (concepts.length === 0) return null

  const activeConcept = concepts[activeIndex]

  return (
    <div>
      {/* Tab bar */}
      <div className="flex border-b border-olive/15 mb-5 overflow-x-auto">
        {concepts.map((concept, i) => (
          <button
            key={concept.id}
            onClick={() => setActiveIndex(i)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-[12px] border-b-2 -mb-px shrink-0 transition-colors whitespace-nowrap',
              activeIndex === i
                ? 'border-olive text-olive font-medium'
                : 'border-transparent text-ink-muted hover:text-ink-mid'
            )}
          >
            {concept.concept_name}
            {i === 0 && (
              <span className="text-[9px] bg-olive-faint text-olive px-1.5 py-0.5 rounded-full font-medium">
                Recommended
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Active concept — key forces remount on tab switch so saved state resets correctly */}
      <ConceptCard
        key={activeConcept.id}
        concept={activeConcept}
        ff={ff}
        fd={fd}
        strategicRoles={strategicRoles}
        isSaved={localSavedIds.has(activeConcept.id)}
        onSave={handleSave}
      />

      {/* Recommendation strip */}
      {recommendation && (
        <div className="mt-4 bg-olive-faint border border-olive/20 rounded-lg px-4 py-3.5 flex gap-3 items-start">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
            className="text-olive shrink-0 mt-0.5" aria-hidden="true">
            <path d="M12 2a7 7 0 0 1 7 7c0 3.1-1.9 5.8-4.7 6.9L14 19H10l-.3-3.1C6.9 14.8 5 12.1 5 9a7 7 0 0 1 7-7z" strokeLinejoin="round" />
            <path d="M10 22h4" strokeLinecap="round" />
          </svg>
          <p className="text-[12px] text-ink-mid font-light leading-relaxed">{recommendation}</p>
        </div>
      )}
    </div>
  )
}
