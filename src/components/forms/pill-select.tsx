'use client'

import { cn } from '@/lib/utils'

interface PillSelectProps {
  options: string[]
  value: string
  onChange: (value: string) => void
}

/**
 * Single-select pill group.
 * Click again to deselect. Related: MultiSelect for multi-value.
 */
export function PillSelect({ options, value, onChange }: PillSelectProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(value === opt ? '' : opt)}
          className={cn(
            'text-[12px] px-2.5 py-1 rounded-full border transition-colors',
            value === opt
              ? 'bg-olive text-cream border-olive'
              : 'bg-white text-ink-mid border-olive/20 hover:border-olive/50'
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}
