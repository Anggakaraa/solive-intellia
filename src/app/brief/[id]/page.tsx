import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Mock result (replace with real AI output once connected) ──────────────
const MOCK_RESULT = {
  concept_name: 'Charred Cauliflower with Whipped Labneh & Aleppo Oil',
  one_line: 'Whole-roasted cauliflower served over whipped house labneh, finished with Aleppo oil, toasted pine nuts, and a crisp herb salad.',
  concept_breakdown: {
    hero: 'Cauliflower — whole-roasted until deeply charred',
    flavor_drivers: ['House Labneh', 'Aleppo Oil', 'Lemon'],
    textures: ['Charred & tender', 'Whipped & creamy', 'Crunchy (pine nuts)'],
    key_contrast: 'The heat and fruitiness of Aleppo oil against the cool, tangy labneh base',
  },
  presentation: 'The cauliflower arrives whole at the table — dark, dramatic, and aromatic. Guests cut into it themselves, exposing the tender interior. The labneh is already spread beneath it, so the first cut pulls the two elements together. No tableside theater needed — the contrast does the work.',
  why_it_could_win: 'The vegetable main gap is real, and most competitors fill it with salads or grain bowls. A whole-roasted format at $19–22 creates visual impact that justifies the price point without requiring premium protein. The Aleppo oil gives it a distinctly Salted Olive flavor signature — guests will ask what that oil is. That question is a selling moment.',
  feasibility: {
    assets_leveraged: ['House Labneh', 'Aleppo Oil', 'Herb prep (existing)'],
    watchouts: ['Cauliflower size inconsistency affects roasting time and portion cost', 'Needs to hold well for takeaway — test labneh separation at room temp', 'Pine nut cost per portion needs validation'],
  },
  experiment_focus: [
    'Does the whole-cauliflower format feel generous enough as a solo main at $20?',
    'Is the Aleppo oil distinctive enough that guests notice and ask about it?',
    'Does the dish feel Mediterranean-specific, or does it read as generic roasted veg?',
    'Can labneh be pre-spread and held without weeping for 20+ minutes?',
  ],
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="h-px flex-1 bg-olive/15" />
      <p className="text-[10px] uppercase tracking-[2px] text-ink-muted shrink-0">{label}</p>
      <div className="h-px flex-1 bg-olive/15" />
    </div>
  )
}

function BriefField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[1.5px] text-ink-muted mb-1.5">{label}</p>
      <div className="text-sm text-ink font-light leading-relaxed">{children}</div>
    </div>
  )
}

function Pill({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'olive' | 'cream' | 'default' }) {
  return (
    <span className={cn(
      'text-[11px] px-2.5 py-1 rounded-full border',
      variant === 'olive' && 'bg-olive text-cream border-olive',
      variant === 'cream' && 'bg-cream-dark text-ink-mid border-transparent',
      variant === 'default' && 'bg-white text-ink-mid border-olive/20',
    )}>
      {children}
    </span>
  )
}

export default async function BriefDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: brief } = await supabase
    .from('rd_briefs')
    .select('*')
    .eq('id', id)
    .single()

  if (!brief) notFound()

  const result = MOCK_RESULT

  return (
    <div className="max-w-3xl">
      {/* Back */}
      <Link
        href="/brief/history"
        className="flex items-center gap-1 text-[13px] text-ink-muted hover:text-ink mb-6 transition-colors"
      >
        <ChevronLeft size={14} /> Brief History
      </Link>

      {/* Header */}
      <div className="mb-10">
        <p className="text-[10px] uppercase tracking-[2px] text-ink-muted mb-1.5">R&D Brief</p>
        <h1 className="font-serif text-3xl font-normal text-ink tracking-tight leading-tight mb-1">
          {result.concept_name}
        </h1>
        <p className="text-sm text-ink-mid font-light">
          {new Date(brief.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}
          {brief.category && <span className="ml-2 text-ink-muted">· {brief.category}</span>}
        </p>
      </div>

      <div className="space-y-10">

        {/* ── The Brief ── */}
        <div>
          <SectionLabel label="The Brief" />
          <div className="bg-white border border-olive/15 rounded-lg p-5 space-y-5">

            <div className="grid grid-cols-2 gap-5">
              {brief.category && (
                <BriefField label="Category">
                  <Pill variant="olive">{brief.category}</Pill>
                </BriefField>
              )}
              {brief.strategic_roles?.length > 0 && (
                <BriefField label="Strategic Role">
                  <div className="flex flex-wrap gap-1.5 mt-0.5">
                    {brief.strategic_roles.map((r: string) => (
                      <Pill key={r} variant="default">{r}</Pill>
                    ))}
                  </div>
                </BriefField>
              )}
              {brief.format_familiarity != null && (
                <BriefField label="Format Familiarity">
                  <span className="font-medium text-ink">{brief.format_familiarity}</span>
                  <span className="text-ink-muted"> / 5</span>
                </BriefField>
              )}
              {brief.flavor_discovery != null && (
                <BriefField label="Flavor Discovery">
                  <span className="font-medium text-ink">{brief.flavor_discovery}</span>
                  <span className="text-ink-muted"> / 5</span>
                </BriefField>
              )}
            </div>

            {brief.pantry_assets?.length > 0 && (
              <BriefField label="Pantry Assets">
                <div className="flex flex-wrap gap-1.5 mt-0.5">
                  {brief.pantry_assets.map((p: string) => (
                    <Pill key={p} variant="cream">{p}</Pill>
                  ))}
                </div>
              </BriefField>
            )}

            {brief.opportunity && (
              <BriefField label="Opportunity">
                <p className="whitespace-pre-wrap">{brief.opportunity}</p>
              </BriefField>
            )}
            {brief.creative_references && (
              <BriefField label="References">
                <p className="whitespace-pre-wrap">{brief.creative_references}</p>
              </BriefField>
            )}
            {brief.desired_feeling && (
              <BriefField label="Desired Feeling">
                <p className="whitespace-pre-wrap">{brief.desired_feeling}</p>
              </BriefField>
            )}
            {brief.constraints && (
              <BriefField label="Context">
                <p className="whitespace-pre-wrap">{brief.constraints}</p>
              </BriefField>
            )}
          </div>
        </div>

        {/* ── AI Result ── */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 bg-olive/15" />
            <div className="flex items-center gap-1.5 shrink-0">
              <Sparkles size={11} className="text-ink-muted" />
              <p className="text-[10px] uppercase tracking-[2px] text-ink-muted">Generated Response</p>
            </div>
            <div className="h-px flex-1 bg-olive/15" />
          </div>

          {/* Mock banner */}
          <div className="bg-cream-dark border border-olive/15 rounded-md px-4 py-2.5 mb-5 flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-[1.5px] text-ink-muted">Mock</span>
            <span className="text-[12px] text-ink-muted font-light">AI output not yet connected — this is placeholder content to validate the structure.</span>
          </div>

          <div className="space-y-6">

            {/* Concept */}
            <div className="bg-white border border-olive/15 rounded-lg p-5">
              <p className="text-[10px] uppercase tracking-[1.5px] text-ink-muted mb-2">Concept</p>
              <h2 className="font-serif text-xl font-normal text-ink mb-1">{result.concept_name}</h2>
              <p className="text-sm text-ink-mid font-light leading-relaxed">{result.one_line}</p>
            </div>

            {/* Concept Breakdown */}
            <div className="bg-white border border-olive/15 rounded-lg p-5 space-y-4">
              <p className="text-[10px] uppercase tracking-[1.5px] text-ink-muted">Concept Breakdown</p>

              <div className="grid grid-cols-2 gap-4">
                <BriefField label="Hero">
                  <p>{result.concept_breakdown.hero}</p>
                </BriefField>
                <BriefField label="Key Contrast">
                  <p>{result.concept_breakdown.key_contrast}</p>
                </BriefField>
                <BriefField label="Flavor Drivers">
                  <div className="flex flex-wrap gap-1.5 mt-0.5">
                    {result.concept_breakdown.flavor_drivers.map((f) => (
                      <Pill key={f} variant="default">{f}</Pill>
                    ))}
                  </div>
                </BriefField>
                <BriefField label="Textures">
                  <div className="flex flex-wrap gap-1.5 mt-0.5">
                    {result.concept_breakdown.textures.map((t) => (
                      <Pill key={t} variant="cream">{t}</Pill>
                    ))}
                  </div>
                </BriefField>
              </div>
            </div>

            {/* Presentation */}
            <div className="bg-white border border-olive/15 rounded-lg p-5">
              <p className="text-[10px] uppercase tracking-[1.5px] text-ink-muted mb-2">Presentation & Service Moment</p>
              <p className="text-sm text-ink font-light leading-relaxed">{result.presentation}</p>
            </div>

            {/* Why It Could Win */}
            <div className="bg-white border border-olive/15 rounded-lg p-5">
              <p className="text-[10px] uppercase tracking-[1.5px] text-ink-muted mb-2">Why It Could Win</p>
              <p className="text-sm text-ink font-light leading-relaxed">{result.why_it_could_win}</p>
            </div>

            {/* Feasibility */}
            <div className="bg-white border border-olive/15 rounded-lg p-5 space-y-4">
              <p className="text-[10px] uppercase tracking-[1.5px] text-ink-muted">Feasibility Notes</p>
              <div className="grid grid-cols-2 gap-4">
                <BriefField label="Assets Leveraged">
                  <ul className="space-y-1 mt-0.5">
                    {result.feasibility.assets_leveraged.map((a) => (
                      <li key={a} className="flex items-start gap-1.5">
                        <span className="text-olive mt-0.5">·</span> {a}
                      </li>
                    ))}
                  </ul>
                </BriefField>
                <BriefField label="Watchouts">
                  <ul className="space-y-1 mt-0.5">
                    {result.feasibility.watchouts.map((w) => (
                      <li key={w} className="flex items-start gap-1.5">
                        <span className="text-ink-muted mt-0.5">·</span> {w}
                      </li>
                    ))}
                  </ul>
                </BriefField>
              </div>
            </div>

            {/* Experiment Focus */}
            <div className="bg-white border border-olive/15 rounded-lg p-5">
              <p className="text-[10px] uppercase tracking-[1.5px] text-ink-muted mb-3">Experiment Focus</p>
              <ol className="space-y-2.5">
                {result.experiment_focus.map((q, i) => (
                  <li key={i} className="flex gap-3 text-sm text-ink font-light leading-relaxed">
                    <span className="text-ink-muted shrink-0 font-medium">{i + 1}.</span>
                    {q}
                  </li>
                ))}
              </ol>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
