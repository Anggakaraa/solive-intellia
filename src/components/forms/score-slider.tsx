'use client'

import { cn } from '@/lib/utils'

interface ScoreSliderProps {
  label: string
  description?: string
  value: number | null
  onChange: (value: number | null) => void
  max?: number
}

export function ScoreSlider({ label, description, value, onChange, max = 5 }: ScoreSliderProps) {
  const scores = Array.from({ length: max }, (_, i) => i + 1)

  return (
    <div className="space-y-2">
      <div>
        <label className="text-[13px] font-medium text-ink">{label}</label>
        {description && (
          <p className="text-[11px] text-ink-muted mt-0.5">{description}</p>
        )}
      </div>
      <div className="flex gap-2">
        {scores.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(value === n ? null : n)}
            className={cn(
              'w-9 h-9 rounded-md text-sm font-medium border transition-colors',
              value === n
                ? 'border-olive bg-olive text-cream'
                : 'border-olive/20 bg-white text-ink-muted hover:border-olive/40'
            )}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}
