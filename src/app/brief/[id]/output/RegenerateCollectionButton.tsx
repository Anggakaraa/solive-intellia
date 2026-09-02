'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { mutedBtnCls, primaryBtnCls, outlinedBtnCls } from '@/lib/styles'

interface Props {
  briefId: string
  initialComposition: Record<string, number>
  aiRecommend: boolean
}

export function RegenerateCollectionButton({ briefId, initialComposition, aiRecommend }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [composition, setComposition] = useState<Record<string, number>>(
    Object.keys(initialComposition).length > 0
      ? initialComposition
      : {}
  )

  const categories = Object.keys(composition).length > 0
    ? Object.keys(composition)
    : []

  const delta = (cat: string, d: number) =>
    setComposition((prev) => ({ ...prev, [cat]: Math.max(0, (prev[cat] ?? 0) + d) }))

  const totalDishes = Object.values(composition).reduce((s, n) => s + n, 0)

  const handleRegenerate = async () => {
    setGenerating(true)
    try {
      const res = await fetch('/api/generate-collection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          briefId,
          compositionOverride: totalDishes > 0 ? composition : undefined,
        }),
      })

      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: 'Unknown error' }))
        toast.error(error ?? 'Regeneration failed')
        return
      }

      toast.success('Collection regenerated')
      setOpen(false)
      router.refresh()
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className={cn(mutedBtnCls, 'flex items-center gap-1.5')}>
        <RefreshCw size={13} />
        Regenerate
      </button>
    )
  }

  return (
    <div className="border border-olive/15 rounded-lg bg-white p-5 mt-2 mb-6 space-y-4">
      <div>
        <p className="text-[10px] uppercase tracking-[1.5px] text-ink-muted mb-1">Composition override</p>
        <p className="text-[12px] text-ink-muted font-light">
          Adjust dish counts for this run only — the brief stays unchanged.
        </p>
      </div>

      {aiRecommend && categories.length === 0 ? (
        <p className="text-[12px] text-ink-muted font-light italic">
          Original brief uses AI-recommended composition. Add category counts below or leave empty to let AI decide again.
        </p>
      ) : null}

      {categories.length > 0 && (
        <div className="space-y-2">
          {categories.map((cat) => (
            <div key={cat} className="flex items-center gap-3">
              <span className="text-sm text-ink font-light w-28 shrink-0">{cat}</span>
              <button
                onClick={() => delta(cat, -1)}
                className="w-6 h-6 rounded border border-olive/20 text-ink-muted hover:border-olive/50 text-sm leading-none flex items-center justify-center"
              >
                −
              </button>
              <span className="w-5 text-center text-sm tabular-nums text-ink">{composition[cat] ?? 0}</span>
              <button
                onClick={() => delta(cat, +1)}
                className="w-6 h-6 rounded border border-olive/20 text-ink-muted hover:border-olive/50 text-sm leading-none flex items-center justify-center"
              >
                +
              </button>
            </div>
          ))}
          <p className="text-[11px] text-ink-muted pt-1">{totalDishes} dishes total</p>
        </div>
      )}

      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={handleRegenerate}
          disabled={generating}
          className={cn(primaryBtnCls, 'flex items-center gap-1.5 disabled:opacity-50')}
        >
          <RefreshCw size={13} className={generating ? 'animate-spin' : ''} />
          {generating ? 'Regenerating…' : 'Regenerate collection'}
        </button>
        <button onClick={() => setOpen(false)} className={outlinedBtnCls} disabled={generating}>
          Cancel
        </button>
      </div>
    </div>
  )
}
