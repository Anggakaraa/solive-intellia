import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { GenerateRecipeButton } from './GenerateRecipeButton'
import { DeleteButton } from '@/components/ui/delete-button'

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-olive/15 rounded-lg p-5">
      <p className="text-[10px] uppercase tracking-[1.5px] text-ink-muted mb-3">{label}</p>
      {children}
    </div>
  )
}

function Pill({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'cream' }) {
  return (
    <span className={`text-[11px] px-2.5 py-1 rounded-full border ${
      variant === 'cream'
        ? 'bg-cream-dark text-ink-mid border-transparent'
        : 'bg-white text-ink-mid border-olive/20'
    }`}>
      {children}
    </span>
  )
}

export default async function ConceptDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: concept }, { data: recipe }] = await Promise.all([
    supabase.from('rd_concepts').select('*').eq('id', id).single(),
    supabase.from('rd_recipes').select('id, version, status').eq('concept_id', id).order('version').limit(1).single(),
  ])

  if (!concept) notFound()

  const breakdown = concept.breakdown as {
    hero?: string
    flavor_drivers?: string[]
    textures?: string[]
    key_contrast?: string
  } | null

  const feasibility = concept.feasibility as {
    assets_leveraged?: string[]
    watchouts?: string[]
  } | null

  return (
    <div className="max-w-2xl">
      <Link
        href={`/brief/${concept.brief_id}`}
        className="flex items-center gap-1 text-[13px] text-ink-muted hover:text-ink mb-6 transition-colors"
      >
        <ChevronLeft size={14} /> Brief
      </Link>

      {/* Header */}
      <div className="mb-8">
        <p className="text-[10px] uppercase tracking-[2px] text-ink-muted mb-1.5">Concept</p>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-normal text-ink tracking-tight leading-tight mb-2">
              {concept.concept_name}
            </h1>
            {concept.one_line && (
              <p className="text-sm text-ink-mid font-light leading-relaxed">{concept.one_line}</p>
            )}
          </div>
          <div className="flex items-center gap-4 mt-1 shrink-0">
            <Link href={`/concepts/${id}/edit`} className="text-sm text-ink-muted hover:text-ink transition-colors">
              Edit
            </Link>
            <DeleteButton table="rd_concepts" id={id} redirectTo={`/brief/${concept.brief_id}`} />
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-8">

        {/* Breakdown */}
        {breakdown && (
          <Section label="Concept Breakdown">
            <div className="grid grid-cols-2 gap-4">
              {breakdown.hero && (
                <div>
                  <p className="text-[10px] uppercase tracking-[1.5px] text-ink-muted mb-1.5">Hero</p>
                  <p className="text-sm text-ink font-light">{breakdown.hero}</p>
                </div>
              )}
              {breakdown.key_contrast && (
                <div>
                  <p className="text-[10px] uppercase tracking-[1.5px] text-ink-muted mb-1.5">Key Contrast</p>
                  <p className="text-sm text-ink font-light">{breakdown.key_contrast}</p>
                </div>
              )}
              {breakdown.flavor_drivers && breakdown.flavor_drivers.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-[1.5px] text-ink-muted mb-1.5">Flavor Drivers</p>
                  <div className="flex flex-wrap gap-1.5">
                    {breakdown.flavor_drivers.map((f) => <Pill key={f}>{f}</Pill>)}
                  </div>
                </div>
              )}
              {breakdown.textures && breakdown.textures.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-[1.5px] text-ink-muted mb-1.5">Textures</p>
                  <div className="flex flex-wrap gap-1.5">
                    {breakdown.textures.map((t) => <Pill key={t} variant="cream">{t}</Pill>)}
                  </div>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* Presentation */}
        {concept.presentation && (
          <Section label="Presentation & Service Moment">
            <p className="text-sm text-ink font-light leading-relaxed">{concept.presentation}</p>
          </Section>
        )}

        {/* Why it could win */}
        {concept.why_it_could_win && (
          <Section label="Why It Could Win">
            <p className="text-sm text-ink font-light leading-relaxed">{concept.why_it_could_win}</p>
          </Section>
        )}

        {/* Feasibility */}
        {feasibility && (
          <Section label="Feasibility Notes">
            <div className="grid grid-cols-2 gap-4">
              {feasibility.assets_leveraged && feasibility.assets_leveraged.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-[1.5px] text-ink-muted mb-2">Assets Leveraged</p>
                  <ul className="space-y-1">
                    {feasibility.assets_leveraged.map((a) => (
                      <li key={a} className="text-sm text-ink font-light flex gap-1.5">
                        <span className="text-olive">·</span> {a}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {feasibility.watchouts && feasibility.watchouts.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-[1.5px] text-ink-muted mb-2">Watchouts</p>
                  <ul className="space-y-1">
                    {feasibility.watchouts.map((w) => (
                      <li key={w} className="text-sm text-ink font-light flex gap-1.5">
                        <span className="text-ink-muted">·</span> {w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* Experiment Focus */}
        {concept.experiment_focus && concept.experiment_focus.length > 0 && (
          <Section label="Experiment Focus">
            <ol className="space-y-2.5">
              {concept.experiment_focus.map((q: string, i: number) => (
                <li key={i} className="flex gap-3 text-sm text-ink font-light leading-relaxed">
                  <span className="text-ink-muted shrink-0 font-medium">{i + 1}.</span>
                  {q}
                </li>
              ))}
            </ol>
          </Section>
        )}
      </div>

      {/* Recipe CTA */}
      <div className="border-t border-olive/15 pt-6">
        {recipe ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-ink">Prototype Recipe V{recipe.version}</p>
              <p className="text-[12px] text-ink-muted font-light capitalize">{recipe.status}</p>
            </div>
            <Link
              href={`/concepts/${id}/recipe`}
              className="text-sm font-medium text-olive hover:text-olive-light transition-colors"
            >
              View Recipe →
            </Link>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-ink">Prototype Recipe</p>
              <p className="text-[12px] text-ink-muted font-light">Not generated yet</p>
            </div>
            <GenerateRecipeButton conceptId={id} experimentFocus={concept.experiment_focus ?? []} conceptIntent={concept.one_line ?? ''} />
          </div>
        )}
      </div>
    </div>
  )
}
