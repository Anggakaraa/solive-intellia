'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { StatusBadge } from '@/components/ui/status-badge'
import { ghostBtnCls } from '@/lib/styles'

export type SavedCollectionData = {
  id: string
  name: string
  brief_id: string | null
  menu_theme: string | null
  status: string
  notes: string | null
  created_at: string
  concepts: Array<{ concept_name: string; status: string }>
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
            <div className="flex items-center gap-2 mb-1">
              <p className="font-serif text-[17px] text-ink">{col.name}</p>
              <StatusBadge status={col.status} />
            </div>
            {col.menu_theme && (
              <p className="text-[12px] text-ink-muted font-light">{col.menu_theme}</p>
            )}
            <p className="text-[12px] text-ink-muted font-light mt-1">
              {col.concepts.length > 0
                ? `${col.concepts.length} dish concept${col.concepts.length !== 1 ? 's' : ''} developed`
                : 'Overview only — no dish concepts yet'}
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

          {col.concepts.length > 0 ? (
            <div className="mb-4">
              <p className="text-[10px] uppercase tracking-[1.5px] text-ink-muted mb-2">Dish concepts</p>
              <div className="space-y-1">
                {col.concepts.map((c) => (
                  <div key={c.concept_name} className="flex items-center justify-between py-1">
                    <p className="text-[13px] text-ink font-light">{c.concept_name}</p>
                    <StatusBadge status={c.status} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-[12px] text-ink-muted font-light mb-4">
              No dish concepts generated yet — open the brief output to develop dishes.
            </p>
          )}

          {col.brief_id && (
            <Link href={`/brief/${col.brief_id}/output`} className={ghostBtnCls}>
              Open in R&D Output →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
