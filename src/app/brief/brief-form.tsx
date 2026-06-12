'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Textarea } from '@/components/ui/textarea'
import { MultiSelect } from '@/components/forms/multi-select'
import { ScoreSlider } from '@/components/forms/score-slider'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Props {
  categoryOptions: string[]
  roleOptions: string[]
  pantryOptions: string[]
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

type SavedBrief = FormData & { id: string; created_at: string }

const textareaCls = 'bg-white border-olive/20 rounded-md text-sm text-ink font-light placeholder:text-ink-muted focus-visible:ring-olive focus-visible:border-olive resize-none'

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="h-px flex-1 bg-olive/15" />
      <p className="text-[10px] uppercase tracking-[2px] text-ink-muted shrink-0">{label}</p>
      <div className="h-px flex-1 bg-olive/15" />
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

function PillSelect({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(value === opt ? '' : opt)}
          className={cn(
            'text-[12px] px-2.5 py-1 rounded-full border transition-colors',
            value === opt
              ? 'bg-olive text-cream border-olive'
              : 'bg-white text-ink-mid border-olive/20 hover:border-olive/50'
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  )
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

function CapturedBrief({ brief, onReset }: { brief: SavedBrief; onReset: () => void }) {
  return (
    <div className="space-y-8">
      <div className="bg-[#EAF3DE] border border-[#3B6D11]/20 rounded-lg px-5 py-4">
        <p className="text-[11px] uppercase tracking-[1.5px] text-[#3B6D11] font-medium mb-1">Brief captured</p>
        <p className="text-sm text-ink-mid font-light">
          Saved {new Date(brief.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      <div className="bg-white border border-olive/15 rounded-lg p-5 space-y-4">
        <p className="text-[10px] uppercase tracking-[2px] text-ink-muted">Context</p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {brief.category && (
            <div>
              <p className="text-[11px] text-ink-muted mb-1">Category</p>
              <span className="text-[12px] px-2.5 py-1 rounded-full border bg-olive text-cream border-olive">
                {brief.category}
              </span>
            </div>
          )}
          {brief.strategic_roles.length > 0 && (
            <div>
              <p className="text-[11px] text-ink-muted mb-1">Strategic Roles</p>
              <div className="flex flex-wrap gap-1">
                {brief.strategic_roles.map((r) => (
                  <span key={r} className="text-[11px] px-2 py-0.5 rounded-full bg-olive-faint text-olive">{r}</span>
                ))}
              </div>
            </div>
          )}
          {brief.format_familiarity != null && (
            <div>
              <p className="text-[11px] text-ink-muted mb-1">Format Familiarity</p>
              <p className="text-ink font-medium">{brief.format_familiarity} / 5</p>
            </div>
          )}
          {brief.flavor_discovery != null && (
            <div>
              <p className="text-[11px] text-ink-muted mb-1">Flavor Discovery</p>
              <p className="text-ink font-medium">{brief.flavor_discovery} / 5</p>
            </div>
          )}
          {brief.pantry_assets.length > 0 && (
            <div className="col-span-2">
              <p className="text-[11px] text-ink-muted mb-1">Pantry Assets</p>
              <div className="flex flex-wrap gap-1">
                {brief.pantry_assets.map((p) => (
                  <span key={p} className="text-[11px] px-2 py-0.5 rounded-full bg-cream-dark text-ink-mid">{p}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {[
          { label: 'Opportunity', value: brief.opportunity },
          { label: 'References', value: brief.creative_references },
          { label: 'Desired Feeling', value: brief.desired_feeling },
          { label: 'Constraints', value: brief.constraints },
        ].filter((f) => f.value).map(({ label, value }) => (
          <div key={label} className="border-l-2 border-olive/20 pl-4">
            <p className="text-[10px] uppercase tracking-[2px] text-ink-muted mb-2">{label}</p>
            <p className="text-sm text-ink font-light leading-relaxed whitespace-pre-wrap">{value}</p>
          </div>
        ))}
      </div>

      <button
        onClick={onReset}
        className="bg-olive text-cream text-sm font-medium px-4 py-2 rounded-md hover:bg-olive-light transition-colors"
      >
        New brief
      </button>
    </div>
  )
}

export function BriefForm({ categoryOptions, roleOptions, pantryOptions }: Props) {
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState<SavedBrief | null>(null)

  const [form, setForm] = useState<FormData>({
    category: '',
    strategic_roles: [],
    format_familiarity: null,
    flavor_discovery: null,
    pantry_assets: [],
    opportunity: '',
    creative_references: '',
    desired_feeling: '',
    constraints: '',
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

    const { data, error } = await supabase.from('rd_briefs').insert(payload).select().single()
    if (error || !data) {
      toast.error(error?.message ?? 'Failed to save brief')
      setSaving(false)
      return
    }

    setSaved({ ...form, id: data.id, created_at: data.created_at })
    toast.success('Brief captured')
    setSaving(false)
  }

  const handleReset = () => {
    setSaved(null)
    setForm({
      category: '',
      strategic_roles: [],
      format_familiarity: null,
      flavor_discovery: null,
      pantry_assets: [],
      opportunity: '',
      creative_references: '',
      desired_feeling: '',
      constraints: '',
    })
  }

  if (saved) return <CapturedBrief brief={saved} onReset={handleReset} />

  return (
    <form onSubmit={handleSubmit} className="space-y-10 max-w-2xl">

      {/* ── Context ── */}
      <div className="space-y-5">
        <SectionLabel label="Context" />

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
        <SectionLabel label="The Brief" />

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
          className="bg-olive text-cream text-sm font-medium px-5 py-2.5 rounded-md hover:bg-olive-light transition-colors disabled:opacity-60"
        >
          {saving ? 'Capturing…' : 'Capture brief'}
        </button>
      </div>

    </form>
  )
}
