'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { ghostBtnCls } from '@/lib/styles'

export type SavedCollectionData = {
  id: string
  name: string
  brief_id: string | null
  menu_theme: string | null
  liveTitle: string | null
  status: string
  notes: string | null
  created_at: string
  dishes: Array<{ concept_name: string; category: string; one_line: string }>
}

export function CollectionCard({ col }: { col: SavedCollectionData }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-white border border-olive/15 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left px-5 py-5 hover:bg-cream/40 transition-colors"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="font-serif text-lg font-normal text-ink leading-snug">
              {col.liveTitle ?? col.menu_theme ?? col.name}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <span className="text-[11px] text-ink-muted">
              {new Date(col.created_at).toLocaleDateString('en-AU', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
            {open
              ? <ChevronUp size={14} className="text-ink-muted" />
              : <ChevronDown size={14} className="text-ink-muted" />}
          </div>
        </div>
      </button>

      {open && (
        <div className="border-t border-olive/10 px-5 pb-5 pt-4 bg-cream/20">
          {col.notes && (
            <p className="text-sm text-ink-mid font-light leading-relaxed mb-4">{col.notes}</p>
          )}

          {col.dishes.length > 0 ? (
            <div className="mb-4">
              <div className="space-y-0.5">
                {col.dishes.map((d, i) => (
                  <p key={i} className="text-[13px] text-ink font-light py-1">
                    {d.concept_name}
                  </p>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-[12px] text-ink-muted font-light mb-4">
              No dish overview yet — open the brief output to generate the collection.
            </p>
          )}

          {col.brief_id && (
            <Link href={`/brief/${col.brief_id}/output`} className={ghostBtnCls}>
              Open Menu Collection →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
