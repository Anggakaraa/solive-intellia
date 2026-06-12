import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { GenerateConceptButton } from './GenerateConceptButton'
import { DeleteButton } from '@/components/ui/delete-button'

function BriefField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[1.5px] text-ink-muted mb-1.5">{label}</p>
      <div className="text-sm text-ink font-light leading-relaxed">{children}</div>
    </div>
  )
}

export default async function BriefDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: brief }, { data: concepts }] = await Promise.all([
    supabase.from('rd_briefs').select('*').eq('id', id).single(),
    supabase.from('rd_concepts').select('id, concept_name, one_line, status, created_at').eq('brief_id', id).order('created_at'),
  ])

  if (!brief) notFound()

  return (
    <div className="max-w-2xl">
      <Link
        href="/brief/history"
        className="flex items-center gap-1 text-[13px] text-ink-muted hover:text-ink mb-6 transition-colors"
      >
        <ChevronLeft size={14} /> Brief History
      </Link>

      <div className="mb-10">
        <p className="text-[10px] uppercase tracking-[2px] text-ink-muted mb-1.5">R&D Brief</p>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-normal text-ink tracking-tight leading-tight mb-1">
              {brief.category ?? 'Untitled Brief'}
            </h1>
            <p className="text-sm text-ink-muted font-light">
              {new Date(brief.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-4 mt-1 shrink-0">
            <Link href={`/brief/${id}/edit`} className="text-sm text-ink-muted hover:text-ink transition-colors">
              Edit
            </Link>
            <DeleteButton table="rd_briefs" id={id} redirectTo="/brief/history" />
          </div>
        </div>
      </div>

      {/* ── The Brief ── */}
      <div className="bg-white border border-olive/15 rounded-lg p-5 space-y-5 mb-8">

        {(brief.category || brief.strategic_roles?.length > 0) && (
          <div className="flex flex-wrap gap-2">
            {brief.category && (
              <span className="text-[11px] px-2.5 py-1 rounded-full bg-olive text-cream">
                {brief.category}
              </span>
            )}
            {brief.strategic_roles?.map((r: string) => (
              <span key={r} className="text-[11px] px-2.5 py-1 rounded-full border border-olive/20 text-ink-mid">
                {r}
              </span>
            ))}
            {brief.format_familiarity != null && (
              <span className="text-[11px] px-2.5 py-1 rounded-full bg-cream-dark text-ink-mid">
                FF {brief.format_familiarity}
              </span>
            )}
            {brief.flavor_discovery != null && (
              <span className="text-[11px] px-2.5 py-1 rounded-full bg-cream-dark text-ink-mid">
                FD {brief.flavor_discovery}
              </span>
            )}
          </div>
        )}

        {brief.pantry_assets?.length > 0 && (
          <BriefField label="Pantry Assets">
            <div className="flex flex-wrap gap-1.5 mt-0.5">
              {brief.pantry_assets.map((p: string) => (
                <span key={p} className="text-[11px] px-2 py-0.5 rounded-full bg-cream-dark text-ink-mid">
                  {p}
                </span>
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

      {/* ── Concepts ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] uppercase tracking-[2px] text-ink-muted">Concepts</p>
          {concepts && concepts.length > 0 && (
            <span className="text-[11px] text-ink-muted">{concepts.length} generated</span>
          )}
        </div>

        {concepts && concepts.length > 0 ? (
          <div className="space-y-2">
            {concepts.map((concept) => (
              <Link
                key={concept.id}
                href={`/concepts/${concept.id}`}
                className="group flex items-start justify-between gap-4 bg-white border border-olive/15 rounded-lg px-5 py-4 hover:border-olive/40 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-ink truncate">{concept.concept_name}</p>
                    <StatusBadge status={concept.status} />
                  </div>
                  {concept.one_line && (
                    <p className="text-[12px] text-ink-muted font-light truncate">{concept.one_line}</p>
                  )}
                </div>
                <ChevronRight size={15} className="text-ink-muted shrink-0 mt-1 group-hover:text-olive transition-colors" />
              </Link>
            ))}
            <div className="pt-2">
              <GenerateConceptButton briefId={id} label="Generate another concept" variant="ghost" />
            </div>
          </div>
        ) : (
          <div className="border border-dashed border-olive/25 rounded-lg px-5 py-8 text-center">
            <p className="text-sm text-ink-muted font-light mb-4">No concepts generated yet.</p>
            <GenerateConceptButton briefId={id} label="Generate Concept" variant="primary" />
          </div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: 'bg-cream-dark text-ink-muted',
    saved: 'bg-olive-faint text-olive',
    recipe_generated: 'bg-olive-faint text-olive',
    kitchen_tested: 'bg-[#EAF3DE] text-[#3B6D11]',
    validated: 'bg-[#EAF3DE] text-[#3B6D11]',
  }
  const labels: Record<string, string> = {
    draft: 'Draft',
    saved: 'Saved',
    recipe_generated: 'Recipe ready',
    kitchen_tested: 'Kitchen tested',
    validated: 'Validated',
  }
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${styles[status] ?? styles.draft}`}>
      {labels[status] ?? status}
    </span>
  )
}
