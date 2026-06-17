'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Pill } from '@/components/ui/pill'
import { StatusBadge } from '@/components/ui/status-badge'
import { ghostBtnCls } from '@/lib/styles'

const MOCK_SAVED_COLLECTIONS = [
  {
    id: 'mock-col-1',
    name: 'The Gathering Table',
    menu_theme: 'Family-style sharing for mid-week social dining',
    status: 'saved',
    notes: 'Built around pantry-forward shareable formats. Hot Honey as a through-line across 2 dishes. Designed for groups of 4–6 at the community table.',
    concepts: [
      { name: 'Hot Honey Sundae Tower', status: 'saved' },
      { name: 'Charred Mezze Board with Labneh', status: 'saved' },
      { name: 'Hot Honey Cheese Pull Knafeh Cup', status: 'saved' },
      { name: 'Labneh Parfait with Hot Honey Lava', status: 'saved' },
    ],
    strategic_roles: ['Signature', 'Social-Proof', 'Everyday'],
    created_at: '2025-06-10T04:00:00.000Z',
  },
]

function CollectionCard({ col }: { col: typeof MOCK_SAVED_COLLECTIONS[0] }) {
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
            <p className="text-[12px] text-ink-muted font-light">{col.menu_theme}</p>
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {col.strategic_roles.map((r) => (
                <Pill key={r} variant="default">{r}</Pill>
              ))}
            </div>
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
              : <ChevronDown size={14} className="text-ink-muted" />
            }
          </div>
        </div>
      </button>

      {open && (
        <div className="border-t border-olive/10 px-5 pb-5 pt-4 bg-cream/20">
          {col.notes && (
            <p className="text-sm text-ink-mid font-light leading-relaxed mb-4">
              {col.notes}
            </p>
          )}
          <p className="text-[10px] uppercase tracking-[1.5px] text-ink-muted mb-2">
            {col.concepts.length} dishes
          </p>
          <div className="space-y-1.5">
            {col.concepts.map((c) => (
              <div key={c.name} className="flex items-center justify-between py-1">
                <p className="text-[13px] text-ink font-light">{c.name}</p>
                <StatusBadge status={c.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function SavedCollectionsPage() {
  return (
    <div className="max-w-2xl">
      <PageHeader
        eyebrow="Intelligence"
        title="Saved Collections"
        subtitle="Full menu collections saved from R&D output for review and testing."
      />

      {/* Mock banner */}
      <div className="bg-cream-dark border border-olive/15 rounded-md px-4 py-2.5 mb-6 flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-[1.5px] text-ink-muted">Mock</span>
        <span className="text-[12px] text-ink-muted font-light">
          Showing a placeholder collection — Save Collection on menu collection output will populate this list.
        </span>
      </div>

      {MOCK_SAVED_COLLECTIONS.length === 0 ? (
        <div className="text-center py-16 text-ink-muted">
          <p className="text-sm font-light">No collections saved yet.</p>
          <Link href="/brief" className={`mt-3 inline-block ${ghostBtnCls}`}>
            Submit a menu collection brief →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {MOCK_SAVED_COLLECTIONS.map((col) => (
            <CollectionCard key={col.id} col={col} />
          ))}
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-olive/10">
        <p className="text-[12px] text-ink-muted font-light mb-3">
          Want to develop a full menu collection?
        </p>
        <Link href="/brief" className={ghostBtnCls}>
          New R&D Brief →
        </Link>
      </div>
    </div>
  )
}
