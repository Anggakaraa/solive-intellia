'use client'

import { useRouter, useSearchParams } from 'next/navigation'

const STATUSES = ['active', 'concept', 'inactive']

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={[
        'text-[10px] px-2.5 py-1 rounded-full transition-colors whitespace-nowrap',
        active
          ? 'bg-olive text-cream'
          : 'bg-white border border-olive/20 text-ink-muted hover:border-olive/40 hover:text-ink-mid',
      ].join(' ')}
    >
      {label}
    </button>
  )
}

export function PantryItemFilters({ categories }: { categories: string[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const activeStatuses = searchParams.get('status')?.split(',').filter(Boolean) ?? []
  const activeCategories = searchParams.get('category')?.split(',').filter(Boolean) ?? []

  const toggle = (key: string, value: string, current: string[]) => {
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]

    const params = new URLSearchParams(searchParams.toString())
    if (next.length === 0) {
      params.delete(key)
    } else {
      params.set(key, next.join(','))
    }
    const qs = params.toString()
    router.push(`/pantry-items${qs ? `?${qs}` : ''}`)
  }

  return (
    <div className="space-y-2 mb-5 pb-4 border-b border-olive/15">
      <div className="flex items-center gap-3">
        <span className="text-[9px] uppercase tracking-[1.5px] text-ink-muted shrink-0 w-14">Status</span>
        <div className="flex gap-1.5 flex-wrap">
          {STATUSES.map((s) => (
            <FilterPill
              key={s}
              label={s.charAt(0).toUpperCase() + s.slice(1)}
              active={activeStatuses.includes(s)}
              onClick={() => toggle('status', s, activeStatuses)}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-[9px] uppercase tracking-[1.5px] text-ink-muted shrink-0 w-14">Category</span>
        <div className="flex gap-1.5 flex-wrap">
          {categories.map((c) => (
            <FilterPill
              key={c}
              label={c}
              active={activeCategories.includes(c)}
              onClick={() => toggle('category', c, activeCategories)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
