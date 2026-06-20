'use client'

import { useState } from 'react'
import { SectionCard } from '@/components/ui/section-card'

type TooltipState = { cell: FFDCell; rect: DOMRect } | null

export type FFDCell = {
  ff: number
  fd: number
  margin: number
  activeDishes: number
  conceptDishes: number
  dishNames: string[]
  conceptNames: string[]
}

function fmtMargin(n: number): string {
  if (n >= 1_000_000) return `Rp ${Math.round(n / 1_000_000)}m`
  if (n >= 1_000)     return `Rp ${Math.round(n / 1_000)}k`
  return `Rp ${n}`
}

export function FFDMatrix({ cells }: { cells: FFDCell[] }) {
  const ffs = [1, 2, 3, 4, 5]
  const fds = [1, 2, 3, 4, 5]

  const cellMap = Object.fromEntries(cells.map((c) => [`${c.ff}-${c.fd}`, c]))
  const maxMargin = Math.max(...cells.map((c) => c.margin), 1)

  const [tooltip, setTooltip] = useState<TooltipState>(null)

  function bgColor(margin: number): string {
    const pct = margin / maxMargin
    return `rgba(61,90,42,${(0.08 + pct * 0.77).toFixed(2)})`
  }

  function handleEnter(e: React.MouseEvent<HTMLDivElement>, cell: FFDCell) {
    setTooltip({ cell, rect: e.currentTarget.getBoundingClientRect() })
  }

  return (
    <SectionCard label="FF / FD Territory">
      <p className="text-[11px] text-ink-muted font-light -mt-1 mb-5">
        Format Familiarity (x) × Flavor Discovery (y) · Color intensity = gross margin · Hover for dishes
      </p>

      <div className="overflow-x-auto">
        <div className="min-w-[400px]">

          {/* Column headers */}
          <div className="flex mb-1 ml-10">
            {ffs.map((ff) => (
              <div key={ff} className="flex-1 text-center text-[10px] text-ink-muted font-medium">
                FF{ff}
              </div>
            ))}
          </div>

          {/* Rows — FD descending (5 at top) */}
          {[...fds].reverse().map((fd) => (
            <div key={fd} className="flex items-stretch mb-1">
              <div className="w-10 shrink-0 flex items-center justify-end pr-2 text-[10px] text-ink-muted font-medium">
                FD{fd}
              </div>

              {ffs.map((ff) => {
                const key  = `${ff}-${fd}`
                const cell = cellMap[key]

                if (!cell) {
                  return (
                    <div key={ff} className="flex-1 mx-0.5 rounded h-16 bg-cream-dark border border-olive/5" />
                  )
                }

                const hasActive   = cell.activeDishes > 0
                const conceptOnly = cell.conceptDishes > 0 && !hasActive

                if (conceptOnly) {
                  return (
                    <div
                      key={ff}
                      className="flex-1 mx-0.5 rounded h-16 border border-dashed border-olive/30 flex flex-col items-center justify-center gap-0.5 cursor-default"
                      onMouseEnter={(e) => handleEnter(e, cell)}
                      onMouseLeave={() => setTooltip(null)}
                    >
                      <span className="text-[10px] text-ink-muted">
                        {cell.conceptDishes} concept{cell.conceptDishes > 1 ? 's' : ''}
                      </span>
                    </div>
                  )
                }

                return (
                  <div
                    key={ff}
                    className="flex-1 mx-0.5 rounded h-16 flex flex-col items-center justify-center gap-0.5 cursor-default"
                    style={{ backgroundColor: bgColor(cell.margin) }}
                    onMouseEnter={(e) => handleEnter(e, cell)}
                    onMouseLeave={() => setTooltip(null)}
                  >
                    <span className="text-[12px] font-medium text-ink leading-none">
                      {fmtMargin(cell.margin)}
                    </span>
                    <span className="text-[10px] text-ink-muted leading-none">
                      {cell.activeDishes} dish{cell.activeDishes > 1 ? 'es' : ''}
                    </span>
                    {cell.conceptDishes > 0 && (
                      <span className="text-[9px] text-ink-muted leading-none opacity-60">
                        +{cell.conceptDishes} concept{cell.conceptDishes > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          ))}

          {/* Axis labels */}
          <div className="flex mt-3 ml-10">
            <div className="flex-1 text-center text-[10px] text-ink-muted">
              ← familiar format · FF · novel format →
            </div>
          </div>
          <div className="mt-0.5 text-center text-[10px] text-ink-muted">
            FD: safe flavor ↓ · ↑ high discovery
          </div>
        </div>
      </div>

      {/* Fixed-position tooltip — escapes any parent overflow clipping */}
      {tooltip && (
        <div
          className="fixed z-50 w-52 bg-[#1E2218] text-cream rounded-md shadow-xl px-3 py-2.5 pointer-events-none"
          style={{
            left: tooltip.rect.left + tooltip.rect.width / 2,
            top:  tooltip.rect.top - 10,
            transform: 'translate(-50%, -100%)',
          }}
        >
          {tooltip.cell.dishNames.length > 0 && (
            <>
              <p className="text-[9px] uppercase tracking-wide text-cream/50 mb-1.5">Active</p>
              {tooltip.cell.dishNames.map((n) => (
                <p key={n} className="text-[11px] leading-snug text-cream/90">{n}</p>
              ))}
            </>
          )}
          {tooltip.cell.conceptNames.length > 0 && (
            <>
              <p className="text-[9px] uppercase tracking-wide text-cream/50 mt-2 mb-1">Concepts</p>
              {tooltip.cell.conceptNames.map((n) => (
                <p key={n} className="text-[11px] leading-snug text-cream/60 italic">{n}</p>
              ))}
            </>
          )}
        </div>
      )}
    </SectionCard>
  )
}
