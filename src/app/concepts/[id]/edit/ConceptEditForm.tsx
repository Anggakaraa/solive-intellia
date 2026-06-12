'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

const inputCls = 'w-full bg-white border border-olive/20 rounded-md text-sm text-ink font-light px-3 py-2 placeholder:text-ink-muted focus:outline-none focus:ring-1 focus:ring-olive focus:border-olive'
const textareaCls = 'bg-white border-olive/20 rounded-md text-sm text-ink font-light placeholder:text-ink-muted focus-visible:ring-olive focus-visible:border-olive resize-none'

function Field({ label, helper, children }: { label: string; helper?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-medium text-ink">{label}</label>
      {helper && <p className="text-[11px] text-ink-muted">{helper}</p>}
      {children}
    </div>
  )
}

function toLines(arr: string[] | null | undefined) {
  return (arr ?? []).join('\n')
}
function fromLines(text: string): string[] {
  return text.split('\n').map((s) => s.trim()).filter(Boolean)
}

interface Props {
  conceptId: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initial: Record<string, any>
}

export function ConceptEditForm({ conceptId, initial }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)

  const bd = (initial.breakdown ?? {}) as Record<string, unknown>
  const fe = (initial.feasibility ?? {}) as Record<string, unknown>

  const [form, setForm] = useState({
    concept_name: initial.concept_name ?? '',
    one_line: initial.one_line ?? '',
    hero: (bd.hero as string) ?? '',
    key_contrast: (bd.key_contrast as string) ?? '',
    flavor_drivers: toLines(bd.flavor_drivers as string[]),
    textures: toLines(bd.textures as string[]),
    presentation: initial.presentation ?? '',
    why_it_could_win: initial.why_it_could_win ?? '',
    assets_leveraged: toLines(fe.assets_leveraged as string[]),
    watchouts: toLines(fe.watchouts as string[]),
    experiment_focus: toLines(initial.experiment_focus as string[]),
    status: initial.status ?? 'draft',
  })

  const set = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.concept_name.trim()) {
      toast.error('Concept name is required')
      return
    }
    setSaving(true)

    const payload = {
      concept_name: form.concept_name,
      one_line: form.one_line || null,
      breakdown: {
        hero: form.hero,
        key_contrast: form.key_contrast,
        flavor_drivers: fromLines(form.flavor_drivers),
        textures: fromLines(form.textures),
      },
      presentation: form.presentation || null,
      why_it_could_win: form.why_it_could_win || null,
      feasibility: {
        assets_leveraged: fromLines(form.assets_leveraged),
        watchouts: fromLines(form.watchouts),
      },
      experiment_focus: fromLines(form.experiment_focus),
      status: form.status,
    }

    const { error } = await supabase.from('rd_concepts').update(payload).eq('id', conceptId)
    if (error) {
      toast.error(error.message)
      setSaving(false)
      return
    }

    toast.success('Concept updated')
    router.push(`/concepts/${conceptId}`)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">

      <Field label="Concept Name">
        <input className={inputCls} value={form.concept_name} onChange={(e) => set('concept_name', e.target.value)} placeholder="Working title" />
      </Field>

      <Field label="One-Line Concept">
        <Textarea className={textareaCls} rows={2} value={form.one_line} onChange={(e) => set('one_line', e.target.value)} placeholder="Hero + key flavor driver + format" />
      </Field>

      <div className="border-t border-olive/10 pt-6 space-y-4">
        <p className="text-[10px] uppercase tracking-[2px] text-ink-muted">Concept Breakdown</p>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Hero">
            <input className={inputCls} value={form.hero} onChange={(e) => set('hero', e.target.value)} placeholder="Main ingredient or technique" />
          </Field>
          <Field label="Key Contrast">
            <input className={inputCls} value={form.key_contrast} onChange={(e) => set('key_contrast', e.target.value)} placeholder="The defining tension" />
          </Field>
          <Field label="Flavor Drivers" helper="One per line">
            <Textarea className={textareaCls} rows={3} value={form.flavor_drivers} onChange={(e) => set('flavor_drivers', e.target.value)} placeholder="House Labneh&#10;Aleppo Oil&#10;Lemon" />
          </Field>
          <Field label="Textures" helper="One per line">
            <Textarea className={textareaCls} rows={3} value={form.textures} onChange={(e) => set('textures', e.target.value)} placeholder="Charred & tender&#10;Whipped & creamy&#10;Crunchy" />
          </Field>
        </div>
      </div>

      <Field label="Presentation & Service Moment">
        <Textarea className={textareaCls} rows={4} value={form.presentation} onChange={(e) => set('presentation', e.target.value)} placeholder="How the dish comes to life at the table" />
      </Field>

      <Field label="Why It Could Win">
        <Textarea className={textareaCls} rows={4} value={form.why_it_could_win} onChange={(e) => set('why_it_could_win', e.target.value)} placeholder="Strategic and emotional case" />
      </Field>

      <div className="border-t border-olive/10 pt-6 space-y-4">
        <p className="text-[10px] uppercase tracking-[2px] text-ink-muted">Feasibility</p>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Assets Leveraged" helper="One per line">
            <Textarea className={textareaCls} rows={3} value={form.assets_leveraged} onChange={(e) => set('assets_leveraged', e.target.value)} placeholder="House Labneh&#10;Aleppo Oil" />
          </Field>
          <Field label="Watchouts" helper="One per line">
            <Textarea className={textareaCls} rows={3} value={form.watchouts} onChange={(e) => set('watchouts', e.target.value)} placeholder="Consistency risk&#10;Cost per portion" />
          </Field>
        </div>
      </div>

      <Field label="Experiment Focus" helper="One assumption per line — the questions that determine success or failure">
        <Textarea className={textareaCls} rows={4} value={form.experiment_focus} onChange={(e) => set('experiment_focus', e.target.value)} placeholder="Does the format feel generous enough?&#10;Is the Aleppo oil distinctive enough?" />
      </Field>

      <Field label="Status">
        <select
          className={inputCls}
          value={form.status}
          onChange={(e) => set('status', e.target.value)}
        >
          <option value="draft">Draft</option>
          <option value="saved">Saved</option>
          <option value="recipe_generated">Recipe Generated</option>
          <option value="kitchen_tested">Kitchen Tested</option>
          <option value="validated">Validated</option>
        </select>
      </Field>

      <div className="flex justify-end pt-2 border-t border-olive/15">
        <button
          type="submit"
          disabled={saving}
          className="bg-olive text-cream text-sm font-medium px-5 py-2.5 rounded-md hover:bg-olive-light transition-colors disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  )
}
