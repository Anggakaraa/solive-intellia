'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface Item { id: string; name: string }

interface Props {
  table: 'flavor_identities' | 'texture_identities' | 'pantry_expression_types' | 'menu_categories' | 'pantry_flavor_contributions'
  items: Item[]
  label: string
}

export function SimpleListEditor({ table, items, label }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState(false)

  const add = async () => {
    if (!newName.trim()) return
    setAdding(true)
    const { error } = await supabase.from(table).insert({ name: newName.trim() })
    if (error) { toast.error(error.message) } else { toast.success(`${label} added`); setNewName('') }
    setAdding(false)
    router.refresh()
  }

  const remove = async (id: string, name: string) => {
    if (!confirm(`Remove "${name}"?`)) return
    await supabase.from(table).delete().eq('id', id)
    toast.success('Removed')
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 mt-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="group inline-flex items-center gap-1.5 bg-olive-faint text-olive text-sm px-3 py-1.5 rounded-full"
          >
            {item.name}
            <button
              type="button"
              onClick={() => remove(item.id, item.name)}
              className="text-olive/40 hover:text-pimento transition-colors leading-none"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2 max-w-xs">
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder={`New ${label}`}
          className="bg-cream-dark border-olive/20 rounded-md text-sm text-ink font-light placeholder:text-ink-muted focus-visible:ring-olive focus-visible:border-olive"
        />
        <button
          onClick={add}
          disabled={adding || !newName.trim()}
          className="bg-olive text-cream text-sm font-medium px-4 py-2 rounded-md hover:bg-olive-light transition-colors disabled:opacity-50 shrink-0"
        >
          Add
        </button>
      </div>
    </div>
  )
}
