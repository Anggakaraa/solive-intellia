'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { ConceptTabs } from '@/components/ui/concept-tabs'
import { SectionCard } from '@/components/ui/section-card'
import type { ConceptCardData } from '@/components/ui/concept-card'
import { ghostBtnCls } from '@/lib/styles'

type Mode = 'safe' | 'balanced' | 'exploratory'

const MODE_LABELS: Record<Mode, string> = {
  safe: 'Safe',
  balanced: 'Balanced',
  exploratory: 'Explore',
}

const MODE_DESCRIPTIONS: Record<Mode, string> = {
  safe: 'Optimise for menu fit',
  balanced: 'Optimise for menu expansion',
  exploratory: 'Optimise for future identity',
}

interface Props {
  briefId: string
  generationMode: 'full' | 'fast'
  concepts: ConceptCardData[]
  ff?: number | null
  fd?: number | null
  strategicRoles?: string[]
  narrative?: string | null
  recommendation?: string | null
}

export function ModedConceptsPanel({
  briefId,
  generationMode,
  concepts,
  ff,
  fd,
  strategicRoles = [],
  narrative,
  recommendation,
}: Props) {
  const router = useRouter()

  // Default to the mode of the most-recent concept, or balanced
  const defaultMode: Mode =
    (concepts[0]?.exploration_mode as Mode | null | undefined) ?? 'balanced'
  const [activeMode, setActiveMode] = useState<Mode>(defaultMode)
  const [generating, setGenerating] = useState(false)

  const filtered = concepts.filter((c) => c.exploration_mode === activeMode)
  const savedIds = filtered.filter((c) => c.status === 'saved').map((c) => c.id)

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 120000)

      const res = await fetch('/api/generate-concepts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          briefId,
          explorationMode: activeMode,
          generationMode,
        }),
        signal: controller.signal,
      }).finally(() => clearTimeout(timeout))

      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: 'Unknown error' }))
        toast.error(error ?? 'Generation failed')
        return
      }

      router.refresh()
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        toast.error('Generation timed out — try Fast mode')
      } else {
        toast.error('Something went wrong. Please try again.')
      }
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div>
      {narrative && (
        <SectionCard variant="muted" label="Brief Tensions" className="mb-6">
          <p className="text-sm text-ink-mid font-light leading-relaxed whitespace-pre-line">{narrative}</p>
        </SectionCard>
      )}

      {/* Mode picker + generate */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex gap-1.5">
          {(['safe', 'balanced', 'exploratory'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setActiveMode(mode)}
              title={MODE_DESCRIPTIONS[mode]}
              className={cn(
                'text-[12px] px-3 py-1.5 rounded-full border transition-colors',
                activeMode === mode
                  ? 'bg-olive text-cream border-olive'
                  : 'bg-white text-ink-mid border-olive/20 hover:border-olive/50'
              )}
            >
              {MODE_LABELS[mode]}
            </button>
          ))}
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating}
          className={cn('flex items-center gap-2', ghostBtnCls)}
        >
          <Sparkles size={13} className={generating ? 'animate-spin' : ''} />
          {generating ? 'Generating…' : `Generate ${MODE_LABELS[activeMode]}`}
        </button>
      </div>

      {/* Concept display */}
      {filtered.length === 0 ? (
        <div className="border border-dashed border-olive/25 rounded-lg px-5 py-12 text-center">
          <p className="text-sm text-ink-muted font-light mb-1">
            No {MODE_LABELS[activeMode].toLowerCase()} concepts yet.
          </p>
          <p className="text-[12px] text-ink-muted font-light">{MODE_DESCRIPTIONS[activeMode]}.</p>
        </div>
      ) : (
        <ConceptTabs
          concepts={filtered}
          ff={ff}
          fd={fd}
          strategicRoles={strategicRoles}
          recommendation={recommendation ?? undefined}
          savedIds={savedIds}
        />
      )}
    </div>
  )
}
