'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Textarea } from '@/components/ui/textarea'
import { Field } from '@/components/forms/field'
import { inputCls, textareaCls, primaryBtnCls } from '@/lib/styles'
import { toast } from 'sonner'

type Component = { name: string; quantity: string; notes: string }

function toLines(arr: string[] | null | undefined) {
  return (arr ?? []).join('\n')
}
function fromLines(text: string): string[] {
  return text.split('\n').map((s) => s.trim()).filter(Boolean)
}
function componentsToText(components: Component[]): string {
  return components.map((c) => `${c.name} | ${c.quantity}${c.notes ? ` | ${c.notes}` : ''}`).join('\n')
}
function textToComponents(text: string): Component[] {
  return text.split('\n').map((line) => {
    const parts = line.split('|').map((p) => p.trim())
    return { name: parts[0] ?? '', quantity: parts[1] ?? '', notes: parts[2] ?? '' }
  }).filter((c) => c.name)
}

interface Props {
  conceptId: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recipe: Record<string, any>
}

export function RecipeEditForm({ conceptId, recipe }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)

  const yieldInfo = (recipe.yield ?? {}) as { serves?: number; portion_size?: string }

  const [form, setForm] = useState({
    concept_intent: recipe.concept_intent ?? '',
    components: componentsToText((recipe.components ?? []) as Component[]),
    method: toLines(recipe.method as string[]),
    plating_notes: recipe.plating_notes ?? '',
    yield_serves: String(yieldInfo.serves ?? ''),
    yield_portion: yieldInfo.portion_size ?? '',
    success_criteria: toLines(recipe.success_criteria as string[]),
    test_kitchen_notes: recipe.test_kitchen_notes ?? '',
    status: recipe.status ?? 'draft',
  })

  const set = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const payload = {
      concept_intent: form.concept_intent || null,
      components: textToComponents(form.components),
      method: fromLines(form.method),
      plating_notes: form.plating_notes || null,
      yield: { serves: Number(form.yield_serves) || null, portion_size: form.yield_portion || null },
      success_criteria: fromLines(form.success_criteria),
      test_kitchen_notes: form.test_kitchen_notes || null,
      status: form.status,
    }

    const { error } = await supabase.from('rd_recipes').update(payload).eq('id', recipe.id)
    if (error) {
      toast.error(error.message)
      setSaving(false)
      return
    }

    toast.success('Recipe updated')
    router.push(`/concepts/${conceptId}/recipe`)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">

      <Field label="Concept Intent">
        <Textarea className={textareaCls} rows={2} value={form.concept_intent} onChange={(e) => set('concept_intent', e.target.value)} placeholder="Why this dish exists" />
      </Field>

      <Field label="Components" helper="One per line: Name | Quantity | Notes (e.g. House Labneh | 80g | whipped with olive oil)">
        <Textarea className={textareaCls} rows={8} value={form.components} onChange={(e) => set('components', e.target.value)} placeholder="Cauliflower | 1 whole (~800g) | outer leaves removed&#10;House Labneh | 80g | whipped with olive oil" />
      </Field>

      <Field label="Method" helper="One step per line">
        <Textarea className={textareaCls} rows={8} value={form.method} onChange={(e) => set('method', e.target.value)} placeholder="Preheat oven to 220°C fan.&#10;Rub cauliflower with olive oil and salt.&#10;Roast for 35–40 min until deeply charred." />
      </Field>

      <Field label="Plating Notes">
        <Textarea className={textareaCls} rows={3} value={form.plating_notes} onChange={(e) => set('plating_notes', e.target.value)} placeholder="How it should be presented" />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Serves">
          <input type="number" className={inputCls} value={form.yield_serves} onChange={(e) => set('yield_serves', e.target.value)} placeholder="1" />
        </Field>
        <Field label="Portion Size">
          <input className={inputCls} value={form.yield_portion} onChange={(e) => set('yield_portion', e.target.value)} placeholder="~450g plated" />
        </Field>
      </div>

      <Field label="Success Criteria" helper="One per line — from experiment focus">
        <Textarea className={textareaCls} rows={3} value={form.success_criteria} onChange={(e) => set('success_criteria', e.target.value)} placeholder="Does the format feel generous enough?&#10;Is the Aleppo oil distinctive?" />
      </Field>

      <Field label="Test Kitchen Notes">
        <Textarea className={textareaCls} rows={4} value={form.test_kitchen_notes} onChange={(e) => set('test_kitchen_notes', e.target.value)} placeholder="Post-prototype feedback" />
      </Field>

      <Field label="Status">
        <select className={inputCls} value={form.status} onChange={(e) => set('status', e.target.value)}>
          <option value="draft">Draft</option>
          <option value="tested">Tested</option>
          <option value="revised">Revised</option>
          <option value="approved">Approved</option>
        </select>
      </Field>

      <div className="flex justify-end pt-2 border-t border-olive/15">
        <button
          type="submit"
          disabled={saving}
          className={primaryBtnCls}
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  )
}
