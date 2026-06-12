'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Download } from 'lucide-react'

function toCSV(data: Record<string, unknown>[]): string {
  if (!data.length) return ''
  const headers = Object.keys(data[0])
  const rows = data.map((row) =>
    headers.map((h) => {
      const val = row[h]
      const str = Array.isArray(val) ? val.join('; ') : String(val ?? '')
      return str.includes(',') || str.includes('"') || str.includes('\n')
        ? `"${str.replace(/"/g, '""')}"`
        : str
    }).join(',')
  )
  return [headers.join(','), ...rows].join('\n')
}

function download(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

interface ExportConfig {
  label: string
  description: string
  table: string
  csvName: string
  jsonName: string
}

const exports: ExportConfig[] = [
  { label: 'Menu Items', description: 'All menu items', table: 'menu_items', csvName: 'menu_items.csv', jsonName: 'menu_items.json' },
  { label: 'Pantry Items', description: 'All pantry items and their flavor contributions', table: 'pantry_items', csvName: 'pantry_items.csv', jsonName: 'pantry_items.json' },
]

export function ExportButtons() {
  const supabase = createClient()
  const [loading, setLoading] = useState<string | null>(null)

  const handleExport = async (table: string, format: 'csv' | 'json', filename: string) => {
    const key = `${table}-${format}`
    setLoading(key)
    const { data, error } = await supabase.from(table).select('*').order('name' as never)
    if (error || !data) { toast.error(error?.message ?? 'Export failed'); setLoading(null); return }

    if (format === 'csv') {
      download(toCSV(data as Record<string, unknown>[]), filename, 'text/csv')
    } else {
      download(JSON.stringify(data, null, 2), filename, 'application/json')
    }
    toast.success(`Downloaded ${filename}`)
    setLoading(null)
  }

  const handleExportAll = async () => {
    setLoading('all')
    const results = await Promise.all(
      exports.map(({ table }) => supabase.from(table).select('*'))
    )
    const all: Record<string, unknown> = {}
    exports.forEach(({ table }, i) => { all[table] = results[i].data ?? [] })
    download(JSON.stringify(all, null, 2), 'salted_olive_export.json', 'application/json')
    toast.success('Downloaded full export')
    setLoading(null)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {exports.map(({ label, description, table, csvName, jsonName }) => (
          <div key={table} className="bg-white border border-olive/15 rounded-lg p-5">
            <p className="font-serif text-base font-normal text-ink mb-1">{label}</p>
            <p className="text-[11px] text-ink-muted mb-5">{description}</p>
            <div className="flex gap-2">
              <button
                className="inline-flex items-center gap-1.5 border border-olive/30 text-ink-mid text-sm font-medium px-3 py-1.5 rounded-md bg-transparent hover:border-olive/60 hover:text-ink transition-colors disabled:opacity-50"
                disabled={loading === `${table}-csv`}
                onClick={() => handleExport(table, 'csv', csvName)}
              >
                <Download size={13} />
                {loading === `${table}-csv` ? 'Exporting…' : 'CSV'}
              </button>
              <button
                className="inline-flex items-center gap-1.5 border border-olive/30 text-ink-mid text-sm font-medium px-3 py-1.5 rounded-md bg-transparent hover:border-olive/60 hover:text-ink transition-colors disabled:opacity-50"
                disabled={loading === `${table}-json`}
                onClick={() => handleExport(table, 'json', jsonName)}
              >
                <Download size={13} />
                {loading === `${table}-json` ? 'Exporting…' : 'JSON'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2">
        <button
          className="w-full inline-flex items-center justify-center gap-2 border border-olive/30 text-ink-mid text-sm font-medium px-4 py-2.5 rounded-md bg-transparent hover:border-olive/60 hover:text-ink transition-colors disabled:opacity-50"
          disabled={loading === 'all'}
          onClick={handleExportAll}
        >
          <Download size={15} />
          {loading === 'all' ? 'Exporting…' : 'Export everything (JSON)'}
        </button>
      </div>
    </div>
  )
}
