'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MultiSelect } from '@/components/forms/multi-select'
import { toast } from 'sonner'
import type { PantryItem } from '@/lib/supabase/types'

interface Props {
  item?: PantryItem
  flavorOptions: string[]
  categoryOptions: string[]
}

type FormData = {
  name: string
  category: string
  status: 'active' | 'inactive' | 'concept' | 'inspiration'
  description: string
  flavor_contributions: string[]
  best_pairings: string
  cautions: string
  example_applications: string
  notes: string
}

const inputCls = 'bg-cream-dark border-olive/20 rounded-md text-sm text-ink font-light placeholder:text-ink-muted focus-visible:ring-olive focus-visible:border-olive'

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="mt-8 mb-5">
      <p className="text-[10px] uppercase tracking-[2px] text-ink-muted mb-2">{label}</p>
      <div className="h-px bg-olive/15" />
    </div>
  )
}

function Field({ label, helper, children }: { label: string; helper?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-medium text-ink">{label}</label>
      {helper && <p className="text-[11px] text-ink-muted -mt-0.5">{helper}</p>}
      {children}
    </div>
  )
}

function toLines(value: string[] | string | null | undefined): string {
  if (!value) return ''
  if (Array.isArray(value)) return value.join('\n')
  return value
}

function fromLines(text: string): string[] {
  return text.split(/[\n,]/).map((s) => s.trim()).filter(Boolean)
}

export function PantryItemForm({ item, flavorOptions, categoryOptions }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState<FormData>({
    name: item?.name ?? '',
    category: item?.category ?? '',
    status: item?.status ?? 'active',
    description: item?.description ?? '',
    flavor_contributions: item?.flavor_contributions ?? [],
    best_pairings: toLines(item?.best_pairings),
    cautions: item?.cautions ?? '',
    example_applications: toLines(item?.example_applications),
    notes: item?.notes ?? '',
  })

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Name is required'); return }
    setSaving(true)

    const payload = {
      name: form.name,
      category: form.category || null,
      status: form.status,
      description: form.description || null,
      flavor_contributions: form.flavor_contributions,
      best_pairings: fromLines(form.best_pairings),
      cautions: form.cautions || null,
      example_applications: fromLines(form.example_applications),
      notes: form.notes || null,
    }

    if (item) {
      const { error } = await supabase.from('pantry_items').update(payload).eq('id', item.id)
      if (error) { toast.error(error.message); setSaving(false); return }
      toast.success('Saved')
    } else {
      const { error } = await supabase.from('pantry_items').insert(payload)
      if (error) { toast.error(error.message); setSaving(false); return }
      toast.success('Pantry item created')
    }

    router.push('/pantry-items')
    router.refresh()
  }

  const handleDelete = async () => {
    if (!item || !confirm('Delete this pantry item?')) return
    await supabase.from('pantry_items').delete().eq('id', item.id)
    toast.success('Deleted')
    router.push('/pantry-items')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">

      <div className="grid grid-cols-2 gap-5">
        <Field label="Name">
          <Input
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="e.g. Mint Honey"
            className={inputCls}
          />
        </Field>

        <Field label="Category">
          <Select value={form.category || undefined} onValueChange={(v) => set('category', v ?? '')}>
            <SelectTrigger className={inputCls}>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Status">
          <Select value={form.status} onValueChange={(v) => set('status', (v ?? 'active') as FormData['status'])}>
            <SelectTrigger className={inputCls}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="concept">Concept</SelectItem>
              <SelectItem value="inspiration">Inspiration</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>

      {/* Flavor Contributions — hero field */}
      <Field
        label="Flavor Contributions"
        helper="The flavor territory this pantry product occupies."
      >
        <MultiSelect
          options={flavorOptions}
          value={form.flavor_contributions}
          onChange={(v) => set('flavor_contributions', v)}
          placeholder="Select flavor contributions"
        />
      </Field>

      <SectionHeader label="Details" />

      <Field label="Description">
        <Textarea
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          rows={3}
          placeholder='Describe the pantry product. e.g. "Mint-infused honey that brings sweetness, freshness, and herbal lift."'
          className={inputCls}
        />
      </Field>

      <Field label="Best Pairings" helper="Comma-separated or one per line">
        <Textarea
          value={form.best_pairings}
          onChange={(e) => set('best_pairings', e.target.value)}
          rows={3}
          placeholder="Chicken, Yogurt, Halloumi, Roasted Carrots"
          className={inputCls}
        />
      </Field>

      <Field label="Example Applications" helper="Comma-separated or one per line">
        <Textarea
          value={form.example_applications}
          onChange={(e) => set('example_applications', e.target.value)}
          rows={3}
          placeholder="Mint Honey Yogurt, Mint Honey Halloumi"
          className={inputCls}
        />
      </Field>

      <Field label="Cautions">
        <Textarea
          value={form.cautions}
          onChange={(e) => set('cautions', e.target.value)}
          rows={2}
          placeholder="e.g. Can become overly sweet if overused."
          className={inputCls}
        />
      </Field>

      <Field label="Notes">
        <Textarea
          value={form.notes}
          onChange={(e) => set('notes', e.target.value)}
          rows={2}
          placeholder="Any additional context that does not fit elsewhere."
          className={inputCls}
        />
      </Field>

      <div className="flex items-center gap-3 justify-end mt-8 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="border border-olive/30 text-ink-mid text-sm font-medium px-4 py-2 rounded-md bg-transparent hover:border-olive/60 hover:text-ink transition-colors"
        >
          Cancel
        </button>
        {item && (
          <button
            type="button"
            onClick={handleDelete}
            className="border border-pimento/30 text-pimento text-sm font-medium px-4 py-2 rounded-md bg-transparent hover:bg-pimento/5 transition-colors"
          >
            Delete
          </button>
        )}
        <button
          type="submit"
          disabled={saving}
          className="bg-olive text-cream text-sm font-medium px-4 py-2 rounded-md hover:bg-olive-light transition-colors disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  )
}
