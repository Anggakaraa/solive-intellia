'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Upload, CheckCircle2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { primaryBtnCls, outlinedBtnCls } from '@/lib/styles'

type MenuItem = { id: string; name: string }
type Alias = { alias_name: string; menu_item_id: string }

type ParsedRow = {
  date: string
  time?: string
  receipt_id?: string
  table_id?: string
  raw_dish_name: string
  quantity: number
  unit_price?: number
  revenue: number
  cost?: number
}

type MatchedRow = ParsedRow & {
  menu_item_id: string | null
  menu_item_name: string | null
  match_source: 'alias' | 'name' | 'none'
}

interface Props {
  menuItems: MenuItem[]
  aliases: Alias[]
}

// ── CSV parser ───────────────────────────────────────────────────

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++ }
      else inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      result.push(current); current = ''
    } else {
      current += ch
    }
  }
  result.push(current)
  return result
}

function parseCSV(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = text.trim().split(/\r?\n/)
  if (lines.length < 2) return { headers: [], rows: [] }
  const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase().trim().replace(/\s+/g, '_'))
  const rows = lines.slice(1).filter((l) => l.trim()).map((line) => {
    const values = parseCSVLine(line)
    const row: Record<string, string> = {}
    headers.forEach((h, i) => { row[h] = values[i]?.trim() ?? '' })
    return row
  })
  return { headers, rows }
}

// ── Dish matching ────────────────────────────────────────────────

function normalize(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim()
}

function matchDish(
  dishName: string,
  menuItems: MenuItem[],
  aliases: Alias[]
): { menu_item_id: string | null; menu_item_name: string | null; match_source: 'alias' | 'name' | 'none' } {
  const norm = normalize(dishName)
  const alias = aliases.find((a) => normalize(a.alias_name) === norm)
  if (alias) {
    const item = menuItems.find((m) => m.id === alias.menu_item_id)
    return { menu_item_id: alias.menu_item_id, menu_item_name: item?.name ?? null, match_source: 'alias' }
  }
  const item = menuItems.find((m) => normalize(m.name) === norm)
  if (item) return { menu_item_id: item.id, menu_item_name: item.name, match_source: 'name' }
  return { menu_item_id: null, menu_item_name: null, match_source: 'none' }
}

// ── Required CSV columns ─────────────────────────────────────────
const REQUIRED_COLUMNS = ['date', 'dish_name', 'quantity', 'revenue']
const COLUMN_ALIASES: Record<string, string[]> = {
  dish_name: ['item_name', 'name', 'menu_item', 'item'],
  receipt_id: ['bill_id', 'order_id', 'check_id', 'receipt_number'],
  unit_price: ['price', 'selling_price'],
}

function resolveColumn(headers: string[], target: string): string | null {
  if (headers.includes(target)) return target
  const alts = COLUMN_ALIASES[target] ?? []
  return alts.find((a) => headers.includes(a)) ?? null
}

// ── Component ────────────────────────────────────────────────────

export function ImportForm({ menuItems, aliases: initialAliases }: Props) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  type Step = 'upload' | 'review' | 'importing' | 'done'
  const [step, setStep] = useState<Step>('upload')
  const [filename, setFilename] = useState('')
  const [rows, setRows] = useState<MatchedRow[]>([])
  const [userMappings, setUserMappings] = useState<Record<string, string>>({})
  const [importResult, setImportResult] = useState<{ imported: number; matched: number } | null>(null)

  const aliases = [...initialAliases]

  const handleFile = (file: File) => {
    setFilename(file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const { headers, rows: rawRows } = parseCSV(text)

      // Column validation
      const missing = REQUIRED_COLUMNS.filter((col) => !resolveColumn(headers, col))
      if (missing.length > 0) {
        toast.error(`Missing required columns: ${missing.join(', ')}`)
        return
      }

      const dishCol = resolveColumn(headers, 'dish_name')!
      const dateCol = resolveColumn(headers, 'date')!
      const qtyCol = resolveColumn(headers, 'quantity')!
      const revCol = resolveColumn(headers, 'revenue')!
      const timeCol = resolveColumn(headers, 'time')
      const receiptCol = resolveColumn(headers, 'receipt_id')
      const tableCol = resolveColumn(headers, 'table_id')
      const priceCol = resolveColumn(headers, 'unit_price')
      const costCol = resolveColumn(headers, 'cost')

      const matched: MatchedRow[] = rawRows
        .filter((r) => r[dishCol] && r[dateCol] && r[qtyCol] && r[revCol])
        .map((r) => {
          const dishName = r[dishCol]
          const m = matchDish(dishName, menuItems, aliases)
          return {
            date: r[dateCol],
            time: timeCol ? r[timeCol] || undefined : undefined,
            receipt_id: receiptCol ? r[receiptCol] || undefined : undefined,
            table_id: tableCol ? r[tableCol] || undefined : undefined,
            raw_dish_name: dishName,
            quantity: parseInt(r[qtyCol]) || 1,
            unit_price: priceCol ? parseFloat(r[priceCol]) || undefined : undefined,
            revenue: parseFloat(r[revCol]) || 0,
            cost: costCol ? parseFloat(r[costCol]) || undefined : undefined,
            ...m,
          }
        })

      setRows(matched)
      setUserMappings({})
      setStep('review')
    }
    reader.readAsText(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file?.name.endsWith('.csv')) handleFile(file)
    else toast.error('Please upload a CSV file')
  }

  const unmatched = rows.filter((r) => r.match_source === 'none')
  const uniqueUnmatched = [...new Set(unmatched.map((r) => r.raw_dish_name))]

  const handleImport = async () => {
    setStep('importing')

    const newAliases = Object.entries(userMappings)
      .filter(([, v]) => v !== '__skip')
      .map(([alias_name, menu_item_id]) => ({ alias_name, menu_item_id }))

    const finalRows = rows.map((r) => {
      if (r.match_source !== 'none') return r
      const mapped = userMappings[r.raw_dish_name]
      if (mapped && mapped !== '__skip') {
        return { ...r, menu_item_id: mapped }
      }
      return r
    })

    try {
      const res = await fetch('/api/import-sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: filename,
          rows: finalRows.map((r) => ({
            date: r.date,
            time: r.time,
            receipt_id: r.receipt_id,
            table_id: r.table_id,
            raw_dish_name: r.raw_dish_name,
            menu_item_id: r.menu_item_id,
            quantity: r.quantity,
            unit_price: r.unit_price,
            revenue: r.revenue,
            cost: r.cost,
          })),
          newAliases,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'Import failed')
        setStep('review')
        return
      }

      setImportResult({ imported: data.imported, matched: data.matched })
      setStep('done')
    } catch {
      toast.error('Something went wrong. Please try again.')
      setStep('review')
    }
  }

  // ── Render ───────────────────────────────────────────────────

  if (step === 'done' && importResult) {
    return (
      <div className="bg-white border border-olive/15 rounded-lg px-8 py-12 text-center max-w-lg">
        <CheckCircle2 size={32} className="text-olive mx-auto mb-4" />
        <p className="font-serif text-xl text-ink mb-1">Import complete</p>
        <p className="text-sm text-ink-muted font-light mb-6">
          {importResult.imported} rows imported · {importResult.matched} matched to menu items
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => { setStep('upload'); setRows([]); setFilename('') }} className={outlinedBtnCls}>
            Import another
          </button>
          <button onClick={() => router.push('/analytics')} className={primaryBtnCls}>
            View Performance →
          </button>
        </div>
      </div>
    )
  }

  if (step === 'upload') {
    return (
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed border-olive/25 rounded-lg px-8 py-16 text-center cursor-pointer hover:border-olive/50 transition-colors max-w-lg"
      >
        <Upload size={24} className="text-ink-muted mx-auto mb-3" />
        <p className="text-sm text-ink font-light mb-1">Drop your CSV here, or click to browse</p>
        <p className="text-[11px] text-ink-muted font-light">
          Required columns: date, dish_name, quantity, revenue
        </p>
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
          }}
        />
      </div>
    )
  }

  if (step === 'review' || step === 'importing') {
    const matchedCount = rows.filter((r) => r.match_source !== 'none').length
    const hasCost = rows.some((r) => r.cost != null)

    return (
      <div className="space-y-6 max-w-2xl">
        {/* Summary */}
        <div className="bg-white border border-olive/15 rounded-lg p-5">
          <p className="text-[10px] uppercase tracking-[1.5px] text-ink-muted mb-3">{filename}</p>
          <div className="flex gap-6">
            <div>
              <p className="font-serif text-2xl text-ink">{rows.length}</p>
              <p className="text-[11px] text-ink-muted font-light mt-0.5">rows parsed</p>
            </div>
            <div>
              <p className="font-serif text-2xl text-olive">{matchedCount}</p>
              <p className="text-[11px] text-ink-muted font-light mt-0.5">matched</p>
            </div>
            <div>
              <p className="font-serif text-2xl text-ink">{uniqueUnmatched.length}</p>
              <p className="text-[11px] text-ink-muted font-light mt-0.5">unmatched dishes</p>
            </div>
            {hasCost && (
              <div>
                <p className="font-serif text-2xl text-ink">✓</p>
                <p className="text-[11px] text-ink-muted font-light mt-0.5">cost data</p>
              </div>
            )}
          </div>
        </div>

        {/* Unmatched review */}
        {uniqueUnmatched.length > 0 && (
          <div className="bg-white border border-olive/15 rounded-lg overflow-hidden">
            <div className="px-5 py-3.5 border-b border-olive/10 flex items-center gap-2">
              <AlertCircle size={13} className="text-ink-muted" />
              <p className="text-[10px] uppercase tracking-[1.5px] text-ink-muted">
                Unmatched dishes — map or skip
              </p>
            </div>
            <div className="divide-y divide-olive/10">
              {uniqueUnmatched.map((name) => (
                <div key={name} className="flex items-center justify-between gap-4 px-5 py-3">
                  <p className="text-sm text-ink font-light">{name}</p>
                  <select
                    value={userMappings[name] ?? ''}
                    onChange={(e) => setUserMappings((prev) => ({ ...prev, [name]: e.target.value }))}
                    className="text-[12px] text-ink border border-olive/20 rounded px-2 py-1 bg-white focus:outline-none focus:border-olive"
                  >
                    <option value="">Select menu item…</option>
                    <option value="__skip">Skip (keep unmatched)</option>
                    {menuItems.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setStep('upload'); setRows([]); setFilename('') }}
            className={outlinedBtnCls}
            disabled={step === 'importing'}
          >
            Back
          </button>
          <button
            onClick={handleImport}
            disabled={step === 'importing'}
            className={cn('flex items-center gap-2', primaryBtnCls)}
          >
            {step === 'importing' ? 'Importing…' : `Import ${rows.length} rows →`}
          </button>
        </div>
      </div>
    )
  }

  return null
}
