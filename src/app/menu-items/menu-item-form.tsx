'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MultiSelect } from '@/components/forms/multi-select'
import { ScoreSlider } from '@/components/forms/score-slider'
import { Field } from '@/components/forms/field'
import { catalogueInputCls, primaryBtnCls, outlinedBtnCls, outlinedDestructiveBtnCls } from '@/lib/styles'
import { toast } from 'sonner'
import type { MenuItem } from '@/lib/supabase/types'

interface Props {
  item?: MenuItem
  initialPantryItems?: string[]
  categoryOptions: string[]
  flavorOptions: string[]
  strategicRoleOptions: string[]
  pantryItemOptions: { id: string; name: string }[]
}

type FormData = {
  name: string
  description: string
  category: string
  status: 'active' | 'inactive' | 'concept' | 'inspiration'
  hero_component: string
  primary_flavor_identity: string
  secondary_flavor_identities: string[]
  pantry_items_used: string[]
  strategic_roles: string[]
  notes: string
  format_familiarity: number | null
  flavor_discovery: number | null
}

const inputCls = catalogueInputCls

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="mt-8 mb-5">
      <p className="text-[10px] uppercase tracking-[2px] text-ink-muted mb-2">{label}</p>
      <div className="h-px bg-olive/15" />
    </div>
  )
}


export function MenuItemForm({
  item,
  initialPantryItems,
  categoryOptions,
  flavorOptions,
  strategicRoleOptions,
  pantryItemOptions,
}: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState<FormData>({
    name: item?.name ?? '',
    description: item?.description ?? '',
    category: item?.category ?? '',
    status: item?.status ?? 'concept',
    hero_component: item?.hero_component ?? '',
    primary_flavor_identity: item?.primary_flavor_identity ?? '',
    secondary_flavor_identities: item?.secondary_flavor_identities ?? [],
    pantry_items_used: initialPantryItems ?? [],
    strategic_roles: item?.strategic_roles ?? [],
    notes: item?.notes ?? '',
    format_familiarity: item?.format_familiarity ?? null,
    flavor_discovery: item?.flavor_discovery ?? null,
  })

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const savePantryLinks = async (menuItemId: string) => {
    await supabase.from('menu_item_pantry_links').delete().eq('menu_item_id', menuItemId)
    if (form.pantry_items_used.length === 0) return

    const links = form.pantry_items_used
      .map((name) => {
        const p = pantryItemOptions.find((o) => o.name === name)
        return p ? { menu_item_id: menuItemId, pantry_item_id: p.id } : null
      })
      .filter((l): l is { menu_item_id: string; pantry_item_id: string } => l !== null)

    if (links.length > 0) {
      await supabase.from('menu_item_pantry_links').insert(links)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Name is required'); return }
    setSaving(true)

    const payload = {
      name: form.name,
      description: form.description || null,
      category: form.category || null,
      status: form.status,
      hero_component: form.hero_component || null,
      primary_flavor_identity: form.primary_flavor_identity || null,
      secondary_flavor_identities: form.secondary_flavor_identities,
      strategic_roles: form.strategic_roles,
      notes: form.notes || null,
      format_familiarity: form.format_familiarity,
      flavor_discovery: form.flavor_discovery,
    }

    if (item) {
      const { error } = await supabase.from('menu_items').update(payload).eq('id', item.id)
      if (error) { toast.error(error.message); setSaving(false); return }
      await savePantryLinks(item.id)
      toast.success('Saved')
    } else {
      const { data: created, error } = await supabase
        .from('menu_items')
        .insert(payload)
        .select('id')
        .single()
      if (error || !created) { toast.error(error?.message ?? 'Create failed'); setSaving(false); return }
      await savePantryLinks(created.id)
      toast.success('Menu item created')
    }

    router.push('/menu-items')
    router.refresh()
  }

  const handleDelete = async () => {
    if (!item || !confirm('Delete this menu item?')) return
    await supabase.from('menu_items').delete().eq('id', item.id)
    toast.success('Deleted')
    router.push('/menu-items')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">

      {/* Core Info */}
      <SectionHeader label="Core Info" />

      <Field label="Name">
        <Input
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="e.g. Harissa Chicken"
          className={inputCls}
        />
      </Field>

      <Field label="Description">
        <Textarea
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          rows={3}
          placeholder="Short description of the dish"
          className={inputCls}
        />
      </Field>

      <div className="grid grid-cols-2 gap-5">
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
          <Select value={form.status} onValueChange={(v) => set('status', (v ?? 'concept') as FormData['status'])}>
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

      {/* Dish Identity */}
      <SectionHeader label="Dish Identity" />

      <Field
        label="Hero Component"
        helper="The single ingredient, technique, or product this dish is built around"
      >
        <Input
          value={form.hero_component}
          onChange={(e) => set('hero_component', e.target.value)}
          placeholder="e.g. Whipped Feta, Halloumi, Chicken"
          className={inputCls}
        />
      </Field>

      {/* Flavor Identity */}
      <SectionHeader label="Flavor Identity" />

      <Field label="Primary Flavor">
        <Select value={form.primary_flavor_identity || undefined} onValueChange={(v) => set('primary_flavor_identity', v ?? '')}>
          <SelectTrigger className={inputCls}>
            <SelectValue placeholder="Select primary flavor" />
          </SelectTrigger>
          <SelectContent>
            {flavorOptions.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Secondary Flavors">
        <MultiSelect
          options={flavorOptions}
          value={form.secondary_flavor_identities}
          onChange={(v) => set('secondary_flavor_identities', v)}
        />
      </Field>

      {/* Pantry Products */}
      <SectionHeader label="Pantry Products" />

      <Field label="Pantry Products Used" helper="Which pantry products does this dish use?">
        <MultiSelect
          options={pantryItemOptions.map((p) => p.name)}
          value={form.pantry_items_used}
          onChange={(v) => set('pantry_items_used', v)}
          placeholder="Select pantry products"
        />
      </Field>

      {/* Strategic Role */}
      <SectionHeader label="Strategic Role" />

      <Field label="Strategic Roles">
        <MultiSelect
          options={strategicRoleOptions}
          value={form.strategic_roles}
          onChange={(v) => set('strategic_roles', v)}
        />
      </Field>

      {/* Experience Dimensions */}
      <SectionHeader label="Experience Dimensions" />

      <ScoreSlider
        label="Format Familiarity"
        description="How familiar is the format to the average guest?"
        value={form.format_familiarity}
        onChange={(v) => set('format_familiarity', v)}
        max={5}
      />

      <ScoreSlider
        label="Flavor Discovery"
        description="How adventurous is the flavor profile for the average guest?"
        value={form.flavor_discovery}
        onChange={(v) => set('flavor_discovery', v)}
        max={5}
      />

      {/* Notes */}
      <SectionHeader label="Notes" />

      <Textarea
        value={form.notes}
        onChange={(e) => set('notes', e.target.value)}
        rows={4}
        placeholder="Anything that doesn't fit the structured fields…"
        className={inputCls}
      />

      {/* Footer actions */}
      <div className="flex items-center gap-3 justify-end mt-8 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className={outlinedBtnCls}
        >
          Cancel
        </button>
        {item && (
          <button
            type="button"
            onClick={handleDelete}
            className={outlinedDestructiveBtnCls}
          >
            Delete
          </button>
        )}
        <button
          type="submit"
          disabled={saving}
          className={primaryBtnCls}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  )
}
