import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { BackLink } from '@/components/ui/back-link'
import { PageHeader } from '@/components/ui/page-header'
import { Pill } from '@/components/ui/pill'
import { StatusBadge } from '@/components/ui/status-badge'
import { SectionCard } from '@/components/ui/section-card'
import { DeleteButton } from '@/components/ui/delete-button'
import { mutedBtnCls } from '@/lib/styles'
import { GenerateConceptButton } from './GenerateConceptButton'

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

  const dateStr = new Date(brief.created_at).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="max-w-2xl">
      <BackLink href="/brief/history" label="Brief History" />

      <PageHeader
        eyebrow={brief.brief_type === 'menu_collection' ? 'R&D Brief · Menu Collection' : 'R&D Brief'}
        title={
          brief.brief_type === 'menu_collection'
            ? (brief.menu_theme ?? 'Menu Collection')
            : (brief.category ?? 'Untitled Brief')
        }
        subtitle={dateStr}
        actions={
          <>
            <Link href={`/brief/${id}/edit`} className={mutedBtnCls}>
              Edit
            </Link>
            <DeleteButton table="rd_briefs" id={id} redirectTo="/brief/history" />
          </>
        }
      />

      {/* ── The Brief ── */}
      <SectionCard className="space-y-5 mb-8">

        <div className="flex flex-wrap gap-2">
          {brief.brief_type === 'menu_collection' ? (
            <Pill variant="olive">Menu Collection</Pill>
          ) : brief.category ? (
            <Pill variant="olive">{brief.category}</Pill>
          ) : null}
          {brief.strategic_roles?.map((r: string) => (
            <Pill key={r} variant="default">{r}</Pill>
          ))}
          {brief.format_familiarity != null && (
            <Pill variant="cream">FF {brief.format_familiarity}</Pill>
          )}
          {brief.flavor_discovery != null && (
            <Pill variant="cream">FD {brief.flavor_discovery}</Pill>
          )}
        </div>

        {/* Menu theme */}
        {brief.brief_type === 'menu_collection' && brief.menu_theme && (
          <BriefField label="Theme">
            <p>{brief.menu_theme}</p>
          </BriefField>
        )}

        {/* Menu composition */}
        {brief.brief_type === 'menu_collection' && (
          <BriefField label="Composition">
            {brief.ai_recommend_composition ? (
              <p className="text-ink-muted italic text-sm">AI will recommend composition</p>
            ) : brief.menu_composition ? (
              <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-0.5">
                {Object.entries(brief.menu_composition as Record<string, number>)
                  .filter(([, count]) => count > 0)
                  .map(([cat, count]) => (
                    <span key={cat} className="text-sm">
                      <span className="text-ink-muted">{cat}</span>
                      <span className="text-ink font-medium ml-1.5 tabular-nums">{count}</span>
                    </span>
                  ))}
              </div>
            ) : (
              <p className="text-ink-muted italic text-sm">No composition specified</p>
            )}
          </BriefField>
        )}

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
      </SectionCard>

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
