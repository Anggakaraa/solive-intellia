'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import type { StrategicRole } from '@/lib/supabase/types'
import { catalogueInputCls, primaryBtnCls } from '@/lib/styles'

interface Props { roles: StrategicRole[] }

const inputCls = catalogueInputCls

export function StrategicRolesEditor({ roles }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')

  const upsert = async (role: StrategicRole) => {
    const { error } = await supabase.from('strategic_roles').update(role).eq('id', role.id)
    if (error) toast.error(error.message); else toast.success('Saved')
    router.refresh()
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this role?')) return
    await supabase.from('strategic_roles').delete().eq('id', id)
    toast.success('Deleted')
    router.refresh()
  }

  const addNew = async () => {
    if (!newName.trim()) return
    setAdding(true)
    const { error } = await supabase.from('strategic_roles').insert({ name: newName.trim() })
    if (error) toast.error(error.message); else { toast.success('Added'); setNewName('') }
    setAdding(false)
    router.refresh()
  }

  return (
    <div className="space-y-2">
      {roles.map((role) => (
        <RoleCard key={role.id} role={role} onSave={upsert} onDelete={() => remove(role.id)} />
      ))}
      <div className="flex gap-2 max-w-xs pt-4">
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addNew())}
          placeholder="New role name"
          className={inputCls}
        />
        <button
          onClick={addNew}
          disabled={adding || !newName.trim()}
          className={`${primaryBtnCls} shrink-0`}
        >
          Add
        </button>
      </div>
    </div>
  )
}

function RoleCard({ role, onSave, onDelete }: { role: StrategicRole; onSave: (r: StrategicRole) => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false)
  const [data, setData] = useState(role)
  const set = (key: keyof StrategicRole, value: string) => setData((p) => ({ ...p, [key]: value }))

  return (
    <div className="bg-white border border-olive/15 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-olive/[0.03] cursor-pointer transition-colors text-left"
      >
        <p className="text-sm font-medium text-ink">{role.name}</p>
        <ChevronDown
          className={`text-ink-muted transition-transform ${open ? 'rotate-180' : ''}`}
          size={15}
        />
      </button>

      {open && (
        <div className="px-5 pb-5 pt-1 border-t border-olive/10 space-y-4">
          {([
            ['definition', 'Definition'],
            ['characteristics', 'Characteristics'],
            ['success_indicator', 'Success Indicator'],
          ] as [keyof StrategicRole, string][]).map(([field, label]) => (
            <div key={field} className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-ink">{label}</label>
              <Textarea
                value={(data[field] as string) ?? ''}
                onChange={(e) => set(field, e.target.value)}
                rows={2}
                className={inputCls}
              />
            </div>
          ))}
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => onSave(data)}
              className={primaryBtnCls}
            >
              Save
            </button>
            <button
              onClick={onDelete}
              className="border border-pimento/30 text-pimento text-sm font-medium px-4 py-2 rounded-md bg-transparent hover:bg-pimento/5 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
