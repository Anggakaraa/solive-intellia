'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Sparkles, Bookmark } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { SectionCard } from '@/components/ui/section-card'
import { BackLink } from '@/components/ui/back-link'
import { Pill } from '@/components/ui/pill'
import { StatusBadge } from '@/components/ui/status-badge'
import { DeleteButton } from '@/components/ui/delete-button'
import { ScoreSlider } from '@/components/forms/score-slider'
import { MultiSelect } from '@/components/forms/multi-select'
import { ConceptCard } from '@/components/ui/concept-card'
import { ConceptTabs } from '@/components/ui/concept-tabs'
import {
  primaryBtnCls, ghostBtnCls, mutedBtnCls, destructiveBtnCls,
  outlinedBtnCls, outlinedDestructiveBtnCls,
  inputCls, textareaCls, catalogueInputCls,
} from '@/lib/styles'
import type { ConceptCardData } from '@/components/ui/concept-card'

// ─── Local helper ──────────────────────────────────────────────────────────────
function Section({ title, description, children }: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="mb-12">
      <div className="mb-4 pb-3 border-b border-olive/15">
        <p className="text-[10px] uppercase tracking-[2px] text-ink-muted mb-0.5">{title}</p>
        {description && <p className="text-[12px] text-ink-muted font-light">{description}</p>}
      </div>
      {children}
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] uppercase tracking-[1px] text-ink-muted mt-3 mb-1.5">{children}</p>
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap items-center gap-3">{children}</div>
}

// ─── Sample data ───────────────────────────────────────────────────────────────
const SAMPLE_CONCEPT: ConceptCardData = {
  id: 'lib-demo-1',
  concept_name: 'Charred Eggplant with Muhammara & Dukkah',
  one_line: 'Whole-roasted eggplant over muhammara, finished with dukkah and a lemon herb oil.',
  breakdown: {
    hero: 'Eggplant — whole-roasted until collapsed and smoky',
    flavor_drivers: ['Muhammara', 'Dukkah', 'Lemon herb oil'],
    textures: ['Collapsed eggplant flesh', 'Thick muhammara base', 'Crunchy dukkah scatter'],
    key_contrast: 'Smoky softness vs. crunchy nut finish · Sweet pepper richness vs. bright lemon',
  },
  presentation: 'Eggplant arrives whole, charred and fragrant. Muhammara visible beneath it. Guest tears and folds the flesh into the sauce. Dukkah scattered last.',
  why_it_could_win: {
    menu_gap: 'No vegetable centrepiece exists. Veggies has 3 items and no standalone main.',
    emotional_trigger: 'Tearing and scooping is primal and satisfying — guests feel the generosity of the dish.',
    salted_olive: 'Muhammara is one of our strongest pantry signatures. Dukkah adds texture and finishes the identity.',
  },
  feasibility: {
    assets_leveraged: ['Muhammara', 'Dukkah'],
    watchouts: ['Eggplant size affects roasting time', 'Muhammara base must be spread consistently'],
  },
  experiment_focus: [
    'Does the whole eggplant format feel generous enough as a solo order?',
    'Is muhammara distinctive enough that guests ask about it?',
    'Does the dish read as Salted Olive, not generic Middle Eastern?',
  ],
  status: 'generated',
}

const SAMPLE_CONCEPTS: ConceptCardData[] = [
  SAMPLE_CONCEPT,
  {
    ...SAMPLE_CONCEPT,
    id: 'lib-demo-2',
    concept_name: 'Lamb Kofta with Amba Sauce',
    one_line: 'Spiced lamb kofta over a pool of amba sauce, finished with sumac onion and fresh herbs.',
    status: 'generated',
  },
]

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function ComponentLibraryPage() {
  const [sliderVal, setSliderVal] = useState(3)
  const [multiVal, setMultiVal] = useState<string[]>(['Revenue Driver'])

  return (
    <div className="max-w-3xl">
      <PageHeader
        eyebrow="Tools"
        title="Component Library"
        subtitle="Visual reference for every shared component and its states."
      />

      {/* ── Colors ── */}
      <Section title="Color Tokens" description="Defined in globals.css @theme. Never use raw hex values.">
        <div className="grid grid-cols-3 gap-2">
          {[
            { token: 'olive', hex: '#3D5A2A', bg: 'bg-olive', text: 'text-cream', role: 'Primary action, active states' },
            { token: 'olive-light', hex: '#4A6E32', bg: 'bg-olive-light', text: 'text-cream', role: 'Hover state for olive' },
            { token: 'olive-faint', hex: '#EEF0EB', bg: 'bg-olive-faint', text: 'text-olive', role: 'Subtle tinted background' },
            { token: 'cream', hex: '#EDEAD8', bg: 'bg-cream', text: 'text-ink', role: 'Page background, text on olive' },
            { token: 'cream-dark', hex: '#E0DCC8', bg: 'bg-cream-dark', text: 'text-ink', role: 'Card background, secondary pill' },
            { token: 'pimento', hex: '#B22222', bg: 'bg-pimento', text: 'text-white', role: 'Destructive actions only' },
            { token: 'ink', hex: '#1E2218', bg: 'bg-ink', text: 'text-cream', role: 'Primary body text' },
            { token: 'ink-mid', hex: '#4A4D42', bg: 'bg-ink-mid', text: 'text-cream', role: 'Secondary text' },
            { token: 'ink-muted', hex: '#7A7D72', bg: 'bg-ink-muted', text: 'text-white', role: 'Labels, placeholders' },
          ].map(({ token, hex, bg, text, role }) => (
            <div key={token} className="rounded-lg overflow-hidden border border-olive/10">
              <div className={`${bg} ${text} px-3 py-4 text-[11px] font-medium`}>{hex}</div>
              <div className="bg-white px-3 py-2">
                <p className="text-[11px] font-medium text-ink">{token}</p>
                <p className="text-[10px] text-ink-muted font-light">{role}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Typography ── */}
      <Section title="Typography" description="Fraunces (serif) = editorial. IBM Plex Sans (sans) = functional.">
        <div className="space-y-4">
          <div><p className="font-serif text-3xl font-normal text-ink">Page Title (Fraunces 3xl)</p><Label>font-serif text-3xl font-normal</Label></div>
          <div><p className="font-serif text-[22px] font-normal text-ink">Concept Name (Fraunces 22px)</p><Label>font-serif text-[22px] font-normal</Label></div>
          <div><p className="font-serif text-lg font-normal text-ink">Section Question (Fraunces lg)</p><Label>font-serif text-lg font-normal</Label></div>
          <div><p className="text-sm font-light text-ink">Body text — IBM Plex Sans, font-light. Used for all paragraph content, descriptions, and values.</p><Label>text-sm font-light</Label></div>
          <div><p className="text-[13px] font-medium text-ink">Field label (13px medium)</p><Label>text-[13px] font-medium</Label></div>
          <div><p className="text-[12px] text-ink-mid font-light">Helper / secondary text (12px ink-mid)</p><Label>text-[12px] text-ink-mid font-light</Label></div>
          <div><p className="text-[11px] text-ink-muted font-light">Timestamp / hint text (11px ink-muted)</p><Label>text-[11px] text-ink-muted font-light</Label></div>
          <div><p className="text-[10px] uppercase tracking-[2px] text-ink-muted">Micro label (10px uppercase)</p><Label>text-[10px] uppercase tracking-[2px] text-ink-muted</Label></div>
        </div>
      </Section>

      {/* ── Buttons ── */}
      <Section title="Buttons" description="All from src/lib/styles.ts. Never write raw button classes.">
        <Label>primaryBtnCls — main constructive action</Label>
        <Row>
          <button className={primaryBtnCls}>Save Changes</button>
          <button className={`flex items-center gap-2 ${primaryBtnCls}`}><Sparkles size={14} />Generate Concept</button>
          <button className={primaryBtnCls} disabled>Disabled</button>
        </Row>

        <Label>ghostBtnCls — secondary forward action (inline)</Label>
        <Row>
          <button className={ghostBtnCls}>View Output →</button>
          <button className={`flex items-center gap-2 ${ghostBtnCls}`}><Bookmark size={13} />Save to menu items</button>
          <button className={ghostBtnCls} disabled>Disabled</button>
        </Row>

        <Label>mutedBtnCls — neutral inline action</Label>
        <Row>
          <button className={mutedBtnCls}>Edit</button>
          <button className={mutedBtnCls}>Cancel</button>
        </Row>

        <Label>destructiveBtnCls — irreversible inline action</Label>
        <Row>
          <button className={destructiveBtnCls}>Delete</button>
        </Row>

        <Label>outlinedBtnCls — cancel in form footer row</Label>
        <Row>
          <button className={outlinedBtnCls}>Cancel</button>
          <button className={outlinedBtnCls} disabled>Disabled</button>
        </Row>

        <Label>outlinedDestructiveBtnCls — delete in form footer row</Label>
        <Row>
          <button className={outlinedDestructiveBtnCls}>Delete</button>
        </Row>

        <Label>Combined form footer row (typical pattern)</Label>
        <div className="flex justify-end gap-3 pt-3 border-t border-olive/15 mt-2">
          <button className={outlinedBtnCls}>Cancel</button>
          <button className={outlinedDestructiveBtnCls}>Delete</button>
          <button className={primaryBtnCls}>Save Changes</button>
        </div>
      </Section>

      {/* ── Pills ── */}
      <Section title="Pill" description="src/components/ui/pill.tsx — rounded tag. 4 variants.">
        <Label>variant=&quot;olive&quot; — selected/active category</Label>
        <Row>
          <Pill variant="olive">Veggies</Pill>
          <Pill variant="olive">Dessert</Pill>
          <Pill variant="olive">Menu Collection</Pill>
        </Row>

        <Label>variant=&quot;default&quot; — neutral tags (roles, flavor drivers)</Label>
        <Row>
          <Pill variant="default">Revenue Driver</Pill>
          <Pill variant="default">Brand Driver</Pill>
          <Pill variant="default">Gateway</Pill>
        </Row>

        <Label>variant=&quot;cream&quot; — secondary tags (pantry assets, textures)</Label>
        <Row>
          <Pill variant="cream">Hot Honey</Pill>
          <Pill variant="cream">Labneh</Pill>
          <Pill variant="cream">FF 4</Pill>
          <Pill variant="cream">FD 3</Pill>
        </Row>

        <Label>variant=&quot;faint&quot; — subtle olive (assets leveraged in concept card)</Label>
        <Row>
          <Pill variant="faint">Muhammara</Pill>
          <Pill variant="faint">Dukkah</Pill>
        </Row>
      </Section>

      {/* ── Status Badges ── */}
      <Section title="StatusBadge" description="src/components/ui/status-badge.tsx — R&D pipeline states.">
        <Label>Current pipeline statuses</Label>
        <Row>
          <div className="flex flex-col items-center gap-1.5">
            <StatusBadge status="generated" />
            <span className="text-[10px] text-ink-muted">generated</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <StatusBadge status="saved" />
            <span className="text-[10px] text-ink-muted">saved</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <StatusBadge status="testing" />
            <span className="text-[10px] text-ink-muted">testing</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <StatusBadge status="active" />
            <span className="text-[10px] text-ink-muted">active</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <StatusBadge status="archived" />
            <span className="text-[10px] text-ink-muted">archived</span>
          </div>
        </Row>
        <Label>Menu item statuses</Label>
        <Row>
          {['active', 'inactive', 'concept', 'inspiration'].map((s) => (
            <div key={s} className="flex flex-col items-center gap-1.5">
              <StatusBadge status={s} />
              <span className="text-[10px] text-ink-muted">{s}</span>
            </div>
          ))}
        </Row>
      </Section>

      {/* ── Cards ── */}
      <Section title="SectionCard" description="src/components/ui/section-card.tsx — content panel with optional label.">
        <Label>variant=&quot;default&quot; (bg-white)</Label>
        <SectionCard label="Concept Breakdown">
          <p className="text-sm text-ink font-light">Card content goes here. White background, olive/15 border.</p>
        </SectionCard>

        <Label>variant=&quot;muted&quot; (bg-cream-dark) — used for narratives and contextual notes</Label>
        <SectionCard variant="muted" label="Brief Tensions">
          <p className="text-sm text-ink-mid font-light">Muted variant — cream-dark background. Used for AI-generated narrative text, contextual framing, secondary information.</p>
        </SectionCard>

        <Label>No label</Label>
        <SectionCard>
          <p className="text-sm text-ink font-light">SectionCard without a label — just a clean card container.</p>
        </SectionCard>
      </Section>

      {/* ── Navigation ── */}
      <Section title="Navigation Components">
        <Label>BackLink — top of every detail and edit page</Label>
        <BackLink href="#" label="Brief History" />

        <Label>PageHeader — no actions</Label>
        <div className="border border-olive/10 rounded-lg p-5 bg-white mt-2">
          <PageHeader
            eyebrow="Intelligence"
            title="R&D Brief"
            subtitle="Articulate a concept direction for testing."
          />
        </div>

        <Label>PageHeader — with actions</Label>
        <div className="border border-olive/10 rounded-lg p-5 bg-white mt-2">
          <PageHeader
            eyebrow="Concept"
            title="Hot Honey Sundae Tower"
            subtitle="Towering diner-style sundae on a labneh cream base."
            actions={
              <>
                <button className={mutedBtnCls}>Edit</button>
                <button className={destructiveBtnCls}>Delete</button>
              </>
            }
          />
        </div>

        <Label>List row — the standard clickable list item pattern</Label>
        <div className="space-y-2 mt-2">
          <div className="group flex items-start justify-between gap-4 bg-white border border-olive/15 rounded-lg px-5 py-4 hover:border-olive/40 transition-colors cursor-pointer">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Pill variant="olive">Dessert</Pill>
                <Pill variant="default">Revenue Driver</Pill>
              </div>
              <p className="text-sm text-ink-mid font-light truncate">Hot Honey is mandatory but the dessert menu already skews Rich/Sweet.</p>
            </div>
            <ChevronRight size={15} className="text-ink-muted shrink-0 mt-1 group-hover:text-olive transition-colors" />
          </div>
        </div>
      </Section>

      {/* ── Mock Banner ── */}
      <Section title="Mock Banner" description="Used on pages where content is placeholder, not real AI output.">
        <div className="bg-cream-dark border border-olive/15 rounded-md px-4 py-2.5 flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-[1.5px] text-ink-muted">Mock</span>
          <span className="text-[12px] text-ink-muted font-light">AI output not yet connected — placeholder content shown.</span>
        </div>
      </Section>

      {/* ── Form Elements ── */}
      <Section title="Form Elements" description="Input styles from src/lib/styles.ts. Wrappers from src/components/forms/.">
        <Label>inputCls — white background (R&D / intelligence forms)</Label>
        <input className={inputCls} placeholder="e.g. Hot Honey Sundae Tower" />

        <Label>textareaCls — white background</Label>
        <textarea className={`${textareaCls} w-full border px-3 py-2 h-20`} placeholder="Describe the opportunity..." />

        <Label>catalogueInputCls — cream-dark background (catalogue forms)</Label>
        <div className="bg-cream-dark p-4 rounded-lg">
          <input className={`${catalogueInputCls} w-full border px-3 py-2`} placeholder="e.g. Menu Item Name" />
        </div>

        <Label>Field pattern — label + helper + input</Label>
        <div className="space-y-4 bg-white border border-olive/15 rounded-lg p-5 mt-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-ink">Concept Name</label>
            <p className="text-[11px] text-ink-muted font-light">Working title — internal use only</p>
            <input className={inputCls} placeholder="e.g. Hot Honey Sundae Tower" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-ink">Opportunity</label>
            <textarea className={`${textareaCls} w-full border px-3 py-2 h-24`} placeholder="What gap does this fill?" />
          </div>
        </div>

        <Label>ScoreSlider — FF/FD score (1–5, interactive)</Label>
        <div className="bg-white border border-olive/15 rounded-lg p-5 mt-2">
          <ScoreSlider
            label="Format Familiarity (FF)"
            description="How recognisable should the format feel?"
            value={sliderVal}
            onChange={(v) => setSliderVal(v ?? 1)}
            max={5}
          />
        </div>

        <Label>MultiSelect — pill multi-select (interactive)</Label>
        <div className="bg-white border border-olive/15 rounded-lg p-5 mt-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-ink">Strategic Roles</label>
            <MultiSelect
              options={['Revenue Driver', 'Margin Driver', 'Brand Driver', 'VIP Driver']}
              value={multiVal}
              onChange={setMultiVal}
              placeholder="Select roles"
            />
          </div>
        </div>
      </Section>

      {/* ── DeleteButton ── */}
      <Section title="DeleteButton" description="src/components/ui/delete-button.tsx — inline confirmation pattern.">
        <Label>States: idle → confirming → (deletes + redirects)</Label>
        <Row>
          <DeleteButton table="rd_concepts" id="demo-id-no-op" redirectTo="#" />
          <p className="text-[11px] text-ink-muted font-light">Click to see confirmation state. Won't delete — ID doesn't exist.</p>
        </Row>
      </Section>

      {/* ── ConceptCard ── */}
      <Section title="ConceptCard" description="src/components/ui/concept-card.tsx — full R&D concept display with save button.">
        <Label>Default state (unsaved)</Label>
        <ConceptCard
          concept={SAMPLE_CONCEPT}
          ff={4}
          fd={3}
          strategicRoles={['Brand Driver']}
        />

        <div className="mt-6"><Label>With isSaved=true</Label></div>
        <ConceptCard
          concept={{ ...SAMPLE_CONCEPT, id: 'lib-demo-saved', status: 'saved' }}
          ff={4}
          fd={3}
          strategicRoles={['Brand Driver']}
          isSaved
        />
      </Section>

      {/* ── ConceptTabs ── */}
      <Section title="ConceptTabs" description="src/components/ui/concept-tabs.tsx — tabbed concept alternatives with recommendation strip.">
        <ConceptTabs
          concepts={SAMPLE_CONCEPTS}
          ff={4}
          fd={3}
          strategicRoles={['Brand Driver']}
          recommendation="Concept 1 — Charred Eggplant — is the stronger choice. It fills the vegetable centrepiece gap cleanly and gives Muhammara its first standalone showcase moment on the main menu."
          savedIds={[]}
        />
      </Section>
    </div>
  )
}
