'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Textarea } from '@/components/ui/textarea'
import { MultiSelect } from '@/components/forms/multi-select'
import { ScoreSlider } from '@/components/forms/score-slider'
import { Field } from '@/components/forms/field'
import { PillSelect } from '@/components/forms/pill-select'
import { SectionLabel } from '@/components/ui/section-label'
import { textareaCls, primaryBtnCls } from '@/lib/styles'
import { toast } from 'sonner'

interface Props {
  categoryOptions: string[]
  roleOptions: string[]
  pantryOptions: string[]
  briefId?: string
  initialValues?: Partial<FormData>
}

type FormData = {
  category: string
  strategic_roles: string[]
  format_familiarity: number | null
  flavor_discovery: number | null
  pantry_assets: string[]
  opportunity: string
  creative_references: string
  desired_feeling: string
  constraints: string
}


function FreeTextField({
  question,
  purpose,
  placeholder,
  value,
  onChange,
  rows = 5,
}: {
  question: string
  purpose: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  rows?: number
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-serif text-lg font-normal text-ink leading-snug">{question}</label>
      <p className="text-[12px] text-ink-muted -mt-0.5">{purpose}</p>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className={textareaCls}
      />
    </div>
  )
}


export function BriefForm({ categoryOptions, roleOptions, pantryOptions, briefId, initialValues }: Props) {
  const supabase = createClient()
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState<FormData>({
    category: initialValues?.category ?? '',
    strategic_roles: initialValues?.strategic_roles ?? [],
    format_familiarity: initialValues?.format_familiarity ?? null,
    flavor_discovery: initialValues?.flavor_discovery ?? null,
    pantry_assets: initialValues?.pantry_assets ?? [],
    opportunity: initialValues?.opportunity ?? '',
    creative_references: initialValues?.creative_references ?? '',
    desired_feeling: initialValues?.desired_feeling ?? '',
    constraints: initialValues?.constraints ?? '',
  })

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.opportunity.trim()) {
      toast.error('Describe the opportunity before capturing the brief')
      return
    }
    setSaving(true)

    const payload = {
      category: form.category || null,
      strategic_roles: form.strategic_roles,
      format_familiarity: form.format_familiarity,
      flavor_discovery: form.flavor_discovery,
      pantry_assets: form.pantry_assets,
      opportunity: form.opportunity || null,
      creative_references: form.creative_references || null,
      desired_feeling: form.desired_feeling || null,
      constraints: form.constraints || null,
    }

    if (briefId) {
      const { error } = await supabase.from('rd_briefs').update(payload).eq('id', briefId)
      if (error) {
        toast.error(error.message)
        setSaving(false)
        return
      }
      toast.success('Brief updated')
      router.push(`/brief/${briefId}`)
    } else {
      const { data, error } = await supabase.from('rd_briefs').insert(payload).select().single()
      if (error || !data) {
        toast.error(error?.message ?? 'Failed to save brief')
        setSaving(false)
        return
      }
      toast.success('Brief captured')
      router.push(`/brief/${data.id}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10 max-w-2xl">

      {/* ── Context ── */}
      <div className="space-y-5">
        <SectionLabel label="Context" className="mb-6" />

        <Field label="Category">
          <PillSelect
            options={categoryOptions}
            value={form.category}
            onChange={(v) => set('category', v)}
          />
        </Field>

        <Field label="Strategic Role">
          <MultiSelect
            options={roleOptions}
            value={form.strategic_roles}
            onChange={(v) => set('strategic_roles', v)}
            placeholder="Select roles"
          />
        </Field>

        <div className="grid grid-cols-2 gap-5">
          <ScoreSlider
            label="Format Familiarity"
            description="How recognisable should the format feel?"
            value={form.format_familiarity}
            onChange={(v) => set('format_familiarity', v)}
            max={5}
          />
          <ScoreSlider
            label="Flavor Discovery"
            description="How adventurous should the flavor profile be?"
            value={form.flavor_discovery}
            onChange={(v) => set('flavor_discovery', v)}
            max={5}
          />
        </div>

        <Field label="Pantry Assets" helper="Optional — leave empty if not anchored to a specific pantry product">
          <MultiSelect
            options={pantryOptions}
            value={form.pantry_assets}
            onChange={(v) => set('pantry_assets', v)}
            placeholder="No pantry asset specified"
          />
        </Field>
      </div>

      {/* ── The Brief ── */}
      <div className="space-y-8">
        <SectionLabel label="The Brief" className="mb-6" />

        <FreeTextField
          question="What opportunity are we trying to capture?"
          purpose="Explain why this concept should exist on the menu."
          placeholder="e.g. Guests want something light and shareable for midday dining. We don't have a strong option in the Veggies section that feels exciting under $20. This concept should fill that gap without competing with our hummus line…"
          value={form.opportunity}
          onChange={(v) => set('opportunity', v)}
          rows={5}
        />

        <FreeTextField
          question="What references are inspiring this concept?"
          purpose="Dishes, restaurants, places, trends, moods, memories, or cultural references. Not to copy — to direct."
          placeholder="e.g. The salt-baked celeriac at Ottolenghi. Street food from the Mahane Yehuda market in Jerusalem. The way chaat feels — chaotic but purposeful. The tartness of labneh served with warm flatbread at a Lebanese wedding…"
          value={form.creative_references}
          onChange={(v) => set('creative_references', v)}
          rows={5}
        />

        <FreeTextField
          question="What should guests feel?"
          purpose="Capture the emotional outcome. Not the ingredients — the experience."
          placeholder="e.g. That guilty pleasure of something indulgent but surprisingly light. Nostalgic but not old-fashioned. The kind of dish you'd describe to a friend the next day…"
          value={form.desired_feeling}
          onChange={(v) => set('desired_feeling', v)}
          rows={4}
        />

        <FreeTextField
          question="What should we avoid?"
          purpose="Define the boundaries. Constraints are as useful as the brief itself."
          placeholder="e.g. No deep-fried items — we already have the feta roll. Needs to work cold or room temperature for takeaway. Should not require new equipment or sourcing. Don't want it to feel too 'healthy bowl'…"
          value={form.constraints}
          onChange={(v) => set('constraints', v)}
          rows={4}
        />
      </div>

      {/* ── Submit ── */}
      <div className="flex justify-end pt-2 border-t border-olive/15">
        <button
          type="submit"
          disabled={saving}
          className={primaryBtnCls}
        >
          {saving ? 'Saving…' : briefId ? 'Save changes' : 'Capture brief'}
        </button>
      </div>

    </form>
  )
}
