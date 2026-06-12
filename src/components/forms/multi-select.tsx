'use client'

import { cn } from '@/lib/utils'

interface MultiSelectProps {
  options: string[]
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  className?: string
}

export function MultiSelect({ options, value, onChange, placeholder, className }: MultiSelectProps) {
  const toggle = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter((v) => v !== option))
    } else {
      onChange([...value, option])
    }
  }

  const remove = (option: string) => {
    onChange(value.filter((v) => v !== option))
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex flex-wrap gap-1.5 min-h-[32px] mb-2">
        {value.length === 0 && (
          <span className="text-[12px] text-ink-muted italic self-center">
            {placeholder ?? 'None selected'}
          </span>
        )}
        {value.map((item) => (
          <span
            key={item}
            className="inline-flex items-center gap-1 bg-olive text-cream text-[12px] px-2.5 py-1 rounded-full"
          >
            {item}
            <button
              type="button"
              onClick={() => remove(item)}
              className="text-cream/60 hover:text-cream ml-0.5 leading-none"
            >
              ×
            </button>
          </span>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={cn(
              'text-[12px] px-2.5 py-1 rounded-full border transition-colors',
              value.includes(opt)
                ? 'bg-olive-faint text-olive border-olive/30'
                : 'bg-white text-ink-mid border-olive/20 hover:border-olive/50'
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}
