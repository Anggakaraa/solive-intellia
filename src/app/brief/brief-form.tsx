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
import { textareaCls, primaryBtnCls, inputCls } from '@/lib/styles'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface Props {
  categoryOptions: string[]
  roleOptions: string[]
  pantryOptions: string[]
  briefId?: string
  initialValues?: Partial<FormData>
}

type FormData = {
  brief_type: 'dish' | 'menu_collection'
  collection_format: 'a_la_carte' | 'set_menu'
  category: string
  menu_theme: string
  menu_composition: Record<string, number>
  ai_recommend_composition: boolean
  strategic_roles: string[]
  format_familiarity: number | null
  flavor_discovery: number | null
  pantry_assets: string[]
  opportunity: string
  creative_references: string
  desired_feeling: string
  constraints: string
  exploration_mode: 'safe' | 'balanced' | 'exploratory'
  generation_mode: 'full' | 'fast'
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
        className={cn(textareaCls, 'text-[12px] italic')}
      />
    </div>
  )
}


export function BriefForm({ categoryOptions, roleOptions, pantryOptions, briefId, initialValues }: Props) {
  const supabase = createClient()
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState<FormData>({
    brief_type: initialValues?.brief_type ?? 'dish',
    collection_format: (initialValues?.collection_format as FormData['collection_format']) ?? 'a_la_carte',
    category: initialValues?.category ?? '',
    menu_theme: initialValues?.menu_theme ?? '',
    menu_composition: (initialValues?.menu_composition as Record<string, number>) ?? {},
    ai_recommend_composition: initialValues?.ai_recommend_composition ?? false,
    strategic_roles: initialValues?.strategic_roles ?? [],
    format_familiarity: initialValues?.format_familiarity ?? null,
    flavor_discovery: initialValues?.flavor_discovery ?? null,
    pantry_assets: initialValues?.pantry_assets ?? [],
    opportunity: initialValues?.opportunity ?? '',
    creative_references: initialValues?.creative_references ?? '',
    desired_feeling: initialValues?.desired_feeling ?? '',
    constraints: initialValues?.constraints ?? '',
    exploration_mode: (initialValues?.exploration_mode as FormData['exploration_mode']) ?? 'balanced',
    generation_mode: (initialValues?.generation_mode as FormData['generation_mode']) ?? 'full',
  })

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const adjustComposition = (cat: string, delta: number) => {
    setForm((prev) => ({
      ...prev,
      menu_composition: {
        ...prev.menu_composition,
        [cat]: Math.max(0, (prev.menu_composition[cat] ?? 0) + delta),
      },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const isMenu = form.brief_type === 'menu_collection'

    if (!form.menu_theme.trim()) {
      toast.error(isMenu ? 'Add a theme before generating' : 'Add a working title before generating')
      return
    }
    if (!form.opportunity.trim()) {
      toast.error('Describe the opportunity before generating')
      return
    }
    setSaving(true)

    const payload = {
      brief_type: form.brief_type,
      category: !isMenu ? (form.category || null) : null,
      menu_theme: form.menu_theme || null,
      menu_composition: isMenu && !form.ai_recommend_composition ? form.menu_composition : null,
      ai_recommend_composition: isMenu ? form.ai_recommend_composition : false,
      strategic_roles: form.strategic_roles,
      format_familiarity: form.format_familiarity,
      flavor_discovery: form.flavor_discovery,
      pantry_assets: form.pantry_assets,
      opportunity: form.opportunity || null,
      creative_references: form.creative_references || null,
      desired_feeling: form.desired_feeling || null,
      constraints: form.constraints || null,
      collection_format: isMenu ? form.collection_format : 'a_la_carte',
      exploration_mode: form.exploration_mode,
      generation_mode: form.generation_mode,
    }

    if (briefId) {
      // Edit mode — just save
      const { error } = await supabase.from('rd_briefs').update(payload).eq('id', briefId)
      if (error) {
        toast.error(error.message)
        setSaving(false)
        return
      }
      toast.success('Brief updated')
      router.push(`/brief/${briefId}`)
    } else {
      // New brief — save then generate immediately
      const { data, error } = await supabase.from('rd_briefs').insert(payload).select().single()
      if (error || !data) {
        toast.error(error?.message ?? 'Failed to save brief')
        setSaving(false)
        return
      }

      const endpoint = isMenu ? '/api/generate-collection' : '/api/generate-concepts'
      const genRes = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ briefId: data.id }),
      })

      if (!genRes.ok) {
        const genData = await genRes.json()
        toast.error(genData.error ?? 'Generation failed')
        router.push(`/brief/${data.id}`)
        return
      }

      router.push(`/brief/${data.id}/output`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10 max-w-2xl">

      {/* ── Context ── */}
      <div className="space-y-5">
        <SectionLabel label="Context" className="mb-6" />

        {/* Brief type toggle */}
        <Field label="What are we creating?">
          <div className="flex gap-1.5">
            {(['dish', 'menu_collection'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => set('brief_type', type)}
                className={cn(
                  'text-[12px] px-2.5 py-1 rounded-full border transition-colors',
                  form.brief_type === type
                    ? 'bg-olive text-cream border-olive'
                    : 'bg-white text-ink-mid border-olive/20 hover:border-olive/50'
                )}
              >
                {type === 'dish' ? 'Single Dish' : 'Menu Collection'}
              </button>
            ))}
          </div>
        </Field>

        {/* Title + Category — dish only */}
        {form.brief_type === 'dish' && (
          <>
            <Field label="Working Title">
              <input
                type="text"
                value={form.menu_theme}
                onChange={(e) => set('menu_theme', e.target.value)}
                placeholder="e.g. Lamb pocket with amba, Signature hummus upgrade…"
                className={inputCls}
              />
            </Field>
            <Field label="Category">
              <PillSelect
                options={categoryOptions}
                value={form.category}
                onChange={(v) => set('category', v)}
              />
            </Field>
          </>
        )}

        {/* Theme + Format — menu_collection only */}
        {form.brief_type === 'menu_collection' && (
          <>
            <Field label="Collection Format">
              <div className="flex gap-2 mt-1">
                {([
                  { value: 'a_la_carte', label: 'À la carte', description: 'A group of thematically coherent dishes guests order freely. No prescribed sequence.' },
                  { value: 'set_menu', label: 'Set / tasting menu', description: 'Dishes designed to arrive in waves. Claude designs the progression arc.' },
                ] as const).map(({ value, label, description }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => set('collection_format', value)}
                    className={cn(
                      'flex-1 text-left px-3.5 py-3 rounded-lg border transition-colors',
                      form.collection_format === value
                        ? 'bg-olive-faint border-olive/40'
                        : 'bg-white border-olive/15 hover:border-olive/35'
                    )}
                  >
                    <span className={cn('text-[12px] font-medium block mb-0.5', form.collection_format === value ? 'text-olive' : 'text-ink')}>{label}</span>
                    <p className="text-[11px] text-ink-muted font-light leading-snug">{description}</p>
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Theme" helper="What holds this menu together?">
              <input
                type="text"
                value={form.menu_theme}
                onChange={(e) => set('menu_theme', e.target.value)}
                placeholder="e.g. Summer solstice dinner party, Levantine collaboration menu…"
                className={inputCls}
              />
            </Field>
          </>
        )}

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
            description={
              form.brief_type === 'menu_collection'
                ? 'How familiar should the overall menu format feel?'
                : 'How recognisable should the format feel?'
            }
            value={form.format_familiarity}
            onChange={(v) => set('format_familiarity', v)}
            max={5}
          />
          <ScoreSlider
            label="Flavor Discovery"
            description={
              form.brief_type === 'menu_collection'
                ? "How adventurous should the menu's flavor profile be?"
                : 'How adventurous should the flavor profile be?'
            }
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

        {/* Exploration Mode */}
        <Field label="Exploration Mode">
          <div className="flex gap-1.5">
            {(['safe', 'balanced', 'exploratory'] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => set('exploration_mode', value)}
                className={cn(
                  'text-[12px] px-3 py-1.5 rounded-full border transition-colors capitalize',
                  form.exploration_mode === value
                    ? 'bg-olive text-cream border-olive'
                    : 'bg-white text-ink-mid border-olive/20 hover:border-olive/50'
                )}
              >
                {value === 'exploratory' ? 'Explore' : value.charAt(0).toUpperCase() + value.slice(1)}
              </button>
            ))}
          </div>
        </Field>

        {/* Generation Mode — single dish only */}
        {form.brief_type === 'dish' && (
          <Field label="Generation Mode">
            <div className="flex gap-1.5">
              {(['full', 'fast'] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => set('generation_mode', value)}
                  className={cn(
                    'text-[12px] px-3 py-1.5 rounded-full border transition-colors',
                    form.generation_mode === value
                      ? 'bg-olive text-cream border-olive'
                      : 'bg-white text-ink-mid border-olive/20 hover:border-olive/50'
                  )}
                >
                  {value.charAt(0).toUpperCase() + value.slice(1)}
                </button>
              ))}
            </div>
          </Field>
        )}

        {/* Composition — menu_collection only */}
        {form.brief_type === 'menu_collection' && (
          <Field label="Composition" helper="How many dishes per category?">
            <div className="mb-3 flex items-center gap-2">
              <input
                type="checkbox"
                id="ai_recommend_composition"
                checked={form.ai_recommend_composition}
                onChange={(e) => set('ai_recommend_composition', e.target.checked)}
                className="accent-olive"
              />
              <label htmlFor="ai_recommend_composition" className="text-[12px] text-ink-mid cursor-pointer select-none">
                Let AI recommend composition
              </label>
            </div>

            {!form.ai_recommend_composition && (
              <div className="bg-white border border-olive/15 rounded-lg divide-y divide-olive/10">
                {categoryOptions.map((cat) => (
                  <div key={cat} className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-[11px] text-ink-mid">{cat}</span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => adjustComposition(cat, -1)}
                        className="w-6 h-6 flex items-center justify-center text-ink-muted hover:text-ink rounded transition-colors text-base leading-none"
                      >
                        −
                      </button>
                      <span className="text-sm font-medium text-ink w-5 text-center tabular-nums">
                        {form.menu_composition[cat] ?? 0}
                      </span>
                      <button
                        type="button"
                        onClick={() => adjustComposition(cat, 1)}
                        className="w-6 h-6 flex items-center justify-center text-ink-muted hover:text-ink rounded transition-colors text-base leading-none"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Field>
        )}
      </div>

      {/* ── The Brief ── */}
      <div className="space-y-8">
        <SectionLabel label="The Brief" className="mb-6" />

        <FreeTextField
          question="What opportunity are we trying to capture?"
          purpose={
            form.brief_type === 'menu_collection'
              ? 'Explain why this menu should exist and what it aims to achieve.'
              : 'Explain why this concept should exist on the menu.'
          }
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
          {saving
            ? (briefId ? 'Saving…' : 'Generating…')
            : briefId
            ? 'Save changes'
            : form.brief_type === 'menu_collection'
            ? 'Generate Collection →'
            : 'Generate Concept →'}
        </button>
      </div>

    </form>
  )
}
