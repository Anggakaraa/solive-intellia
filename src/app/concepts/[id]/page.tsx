import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { BackLink } from '@/components/ui/back-link'
import { PageHeader } from '@/components/ui/page-header'
import { SectionCard } from '@/components/ui/section-card'
import { Pill } from '@/components/ui/pill'
import { DeleteButton } from '@/components/ui/delete-button'
import { mutedBtnCls, ghostBtnCls } from '@/lib/styles'
import { GenerateRecipeButton } from './GenerateRecipeButton'

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
      <BackLink href={`/brief/${concept.brief_id}`} label="Brief" />

      <PageHeader
        eyebrow="Concept"
        title={concept.concept_name}
        subtitle={concept.one_line ?? undefined}
        actions={
          <>
            <Link href={`/concepts/${id}/edit`} className={mutedBtnCls}>
              Edit
            </Link>
            <DeleteButton table="rd_concepts" id={id} redirectTo={`/brief/${concept.brief_id}`} />
          </>
        }
      />

      <div className="space-y-3 mb-8">

        {/* Breakdown */}
        {breakdown && (
          <SectionCard label="Concept Breakdown">
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
                    {breakdown.flavor_drivers.map((f) => <Pill key={f} variant="default">{f}</Pill>)}
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
          </SectionCard>
        )}

        {/* Presentation */}
        {concept.presentation && (
          <SectionCard label="Presentation & Service Moment">
            <p className="text-sm text-ink font-light leading-relaxed">{concept.presentation}</p>
          </SectionCard>
        )}

        {/* Why it could win */}
        {concept.why_it_could_win && (
          <SectionCard label="Why It Could Win">
            {typeof concept.why_it_could_win === 'object' ? (
              <div className="space-y-3">
                {(['menu_gap', 'emotional_trigger', 'salted_olive'] as const).map((key) => {
                  const win = concept.why_it_could_win as Record<string, string>
                  return win[key] ? (
                    <div key={key}>
                      <p className="text-[10px] uppercase tracking-[1.5px] text-ink-muted mb-1">
                        {key === 'menu_gap' ? 'Menu Gap' : key === 'emotional_trigger' ? 'Emotional Trigger' : 'Salted Olive'}
                      </p>
                      <p className="text-sm text-ink font-light leading-relaxed">{win[key]}</p>
                    </div>
                  ) : null
                })}
              </div>
            ) : (
              <p className="text-sm text-ink font-light leading-relaxed">{concept.why_it_could_win as string}</p>
            )}
          </SectionCard>
        )}

        {/* Feasibility */}
        {feasibility && (
          <SectionCard label="Feasibility Notes">
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
          </SectionCard>
        )}

        {/* Experiment Focus */}
        {concept.experiment_focus && concept.experiment_focus.length > 0 && (
          <SectionCard label="Experiment Focus">
            <ol className="space-y-2.5">
              {concept.experiment_focus.map((q: string, i: number) => (
                <li key={i} className="flex gap-3 text-sm text-ink font-light leading-relaxed">
                  <span className="text-ink-muted shrink-0 font-medium">{i + 1}.</span>
                  {q}
                </li>
              ))}
            </ol>
          </SectionCard>
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
              className={ghostBtnCls}
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
