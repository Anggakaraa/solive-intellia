# Intellia — Component Specifications
*Read this before building or touching any UI. The rule: if you're defining a helper component inside a page file, it belongs here instead.*

---

## Rules of Use

### Using existing components
Every component listed in this file has a single source of truth in `src/components/`. Always import from there. If you are about to write a local component definition that matches something already in this document — stop, import instead.

### Adding new components
New components **must be approved before they are built**. The process:

1. **Describe the need** — what does it do, which page(s) will use it, what data does it display
2. **Propose the design** — describe the visual appearance (size, spacing, color tokens) and the component API (prop names, variants)
3. **Wait for confirmation** — do not write code until the user has approved the design
4. **Build + document** — once approved, create the file in `src/components/` and add the full spec to this document

This applies to every new UI pattern, no matter how small. A two-line local helper today becomes an undocumented divergence tomorrow.

---

## Design Philosophy

Intellia is an internal R&D tool for a Mediterranean restaurant group. The visual language should feel like a well-designed editorial object — calm, considered, ingredient-forward. Not a SaaS dashboard. Not a recipe app.

**Three tensions to hold:**
1. Information density vs. breathing room — lean toward breathing room
2. Functional clarity vs. warmth — warm wins over clinical
3. Serif (creative/editorial) vs. sans-serif (functional/data) — use both deliberately

---

## Color Tokens

All tokens are defined in `globals.css` under `@theme {}`. Use these in Tailwind classes — never hardcode hex values.

| Token | Hex | Role |
|---|---|---|
| `olive` | `#3D5A2A` | Primary action, active states, key UI elements |
| `olive-light` | `#4A6E32` | Hover state for olive |
| `olive-faint` | `#EEF0EB` | Subtle olive-tinted background, selected pills (unselected state) |
| `cream` | `#EDEAD8` | Text on olive backgrounds |
| `cream-dark` | `#E0DCC8` | Subtle warm background, secondary pill fill |
| `pimento` | `#B22222` | Destructive actions only |
| `ink` | `#1E2218` | Primary body text |
| `ink-mid` | `#4A4D42` | Secondary text, descriptions |
| `ink-muted` | `#7A7D72` | Labels, placeholders, helper text, timestamps |

**Page background:** `bg-cream` (set in layout)
**Card/panel background:** `bg-white`
**Border standard:** `border-olive/15` for cards, `border-olive/20` for inputs

---

## Typography

Two typefaces — use them intentionally:

| Role | Class | Usage |
|---|---|---|
| Display / Concept titles | `font-serif text-3xl font-normal` | Page H1, concept names |
| Section questions | `font-serif text-lg font-normal` | Brief form question labels |
| Body | `text-sm font-light` (IBM Plex Sans) | All paragraph content |
| Labels | `text-[13px] font-medium` | Form field labels |
| Micro labels | `text-[10px] uppercase tracking-[2px]` | Section labels, field group headers |
| Helper text | `text-[11px] text-ink-muted font-light` | Subtitles, hints |

**Rule:** `font-serif` (Fraunces) = creative, editorial, concept-forward. Use for page titles and question prompts. `font-sans` (IBM Plex Sans) = functional, data, UI chrome.

---

## Spacing

| Context | Value |
|---|---|
| Page max-width | `max-w-2xl` (672px) for forms and detail pages |
| Section gap | `space-y-10` or `mb-10` between major sections |
| Card internal padding | `p-5` |
| Field gap | `gap-1.5` between label and input |
| Pill gap | `gap-1.5` in pill groups |
| Grid gap | `gap-4` for 2-col grids, `gap-5` for wider |

---

## Component Inventory

### Status: ✅ Exists in `src/components/`  |  ❌ Does not exist

---

### 1. `BackLink` ✅ — `src/components/ui/back-link.tsx`

Back navigation. Used at the top of every detail and edit page.

```tsx
<BackLink href="/brief/history" label="Brief History" />
```

---

### 2. `PageHeader` ✅ — `src/components/ui/page-header.tsx`

Every page has the same header block: eyebrow label → serif H1 → optional subtitle + optional right-side actions.

```tsx
<PageHeader
  eyebrow="Intelligence"
  title="R&D Brief"
  subtitle="Articulate a concept direction."
  actions={<>
    <Link href=".../edit" className={mutedBtnCls}>Edit</Link>
    <DeleteButton ... />
  </>}
/>
```

---

### 3. `SectionCard` ✅ — `src/components/ui/section-card.tsx`

White bordered card with an optional micro label at top. Supports a `variant="muted"` prop for cream-dark background.

```tsx
<SectionCard label="Concept Breakdown">
  {children}
</SectionCard>

<SectionCard variant="muted" label="Brief Tensions" className="mb-6">
  {children}
</SectionCard>
```

---

### 4. `SectionLabel` ✅ — `src/components/ui/section-label.tsx`

Micro-label divider. Used in forms to separate sections.

```tsx
<SectionLabel label="The Brief" className="mb-6" />
```

---

### 5. `Field` ✅ — `src/components/forms/field.tsx`

Form field wrapper: label + optional helper text + input slot.

```tsx
<Field label="Concept Name" helper="Working title — internal use only">
  <input className={inputCls} ... />
</Field>
```

---

### 6. `Pill` ✅ — `src/components/ui/pill.tsx`

Rounded tag/badge. Four variants.

| Variant | Usage |
|---|---|
| `olive` | Selected/active category, primary tags |
| `cream` | Secondary tags (textures, pantry assets) |
| `default` | Neutral tags (flavor drivers, roles) |
| `faint` | Subtle selected state in multi-selects |

```tsx
<Pill variant="olive">Veggies</Pill>
<Pill variant="cream">Charred & tender</Pill>
<Pill variant="default">House Labneh</Pill>
<Pill variant="faint">Fast</Pill>
```

---

### 7. `StatusBadge` ✅ — `src/components/ui/status-badge.tsx`

Lifecycle status indicator. All status → colour mappings live here — never hardcode in pages.

**Current status values:**

| Status | Style | Used by |
|---|---|---|
| `generated` | cream-dark / ink-muted | Concepts |
| `saved` | olive-faint / olive | Concepts |
| `testing` | green / dark-green | Concepts |
| `archived` | warm-grey | Concepts |
| `tested` / `approved` | green / dark-green | Recipes |
| `revised` | amber | Recipes |
| `active` | green / dark-green | Menu items, Pantry items |
| `concept` | amber | Menu items |
| `inspiration` | purple-tint | Menu items |
| `inactive` | warm-grey | Menu items, Pantry items |

```tsx
<StatusBadge status="saved" />
<StatusBadge status="active" />
```

---

### 8. `DeleteButton` ✅ — `src/components/ui/delete-button.tsx`

Inline confirmation delete. Accepts `table`, `id`, `redirectTo`. Already extracted.

```tsx
<DeleteButton table="rd_concepts" id={id} redirectTo={`/brief/${briefId}`} />
```

Shows "Delete" → click → "Are you sure? Confirm / Cancel" → deletes → redirects.

---

### 9. `Input` ✅ — use `inputCls` from `src/lib/styles.ts`

The shadcn `Input` component is not used directly — it doesn't resolve to Salted Olive tokens. Always use a raw `<input>` with `inputCls` imported from `src/lib/styles.ts`.

```tsx
import { inputCls } from '@/lib/styles'

<input className={inputCls} type="text" ... />
```

---

### 10. `Textarea` ✅ — use `textareaCls` from `src/lib/styles.ts`

Same pattern as Input. Always use the shadcn `<Textarea>` component with `textareaCls` override.

```tsx
import { Textarea } from '@/components/ui/textarea'
import { textareaCls } from '@/lib/styles'
import { cn } from '@/lib/utils'

<Textarea className={cn(textareaCls, 'text-[12px] italic')} rows={5} ... />
```

---

### 11. `ScoreSlider` ✅ — `src/components/forms/score-slider.tsx`

FF/FD score input (1–5 buttons). Used in brief form. Correctly extracted and working.

```tsx
<ScoreSlider
  label="Format Familiarity"
  description="How recognisable should the format feel?"
  value={form.format_familiarity}
  onChange={(v) => set('format_familiarity', v)}
  max={5}
/>
```

---

### 12. `MultiSelect` ✅ — `src/components/forms/multi-select.tsx`

Multi-select pill input. Used in brief form for strategic roles and pantry assets. Correctly extracted and working.

```tsx
<MultiSelect
  options={roleOptions}
  value={form.strategic_roles}
  onChange={(v) => set('strategic_roles', v)}
  placeholder="Select roles"
/>
```

---

### 13. `PillSelect` ✅ — `src/components/forms/pill-select.tsx`

Single-select pill group. Nearly identical to `MultiSelect` but single-value.

```tsx
<PillSelect
  options={categoryOptions}
  value={form.category}
  onChange={(v) => set('category', v)}
/>
```

---

### 14. `ConceptCard` ✅ — `src/components/ui/concept-card.tsx`

Full concept display card. Used on the output page (both tabbed single-dish and stacked collection views) and the saved concept detail page. Handles its own save-to-saved-items action via inline Supabase call.

```tsx
<ConceptCard
  concept={concept}          // ConceptCardData
  ff={brief.format_familiarity}
  fd={brief.flavor_discovery}
  strategicRoles={brief.strategic_roles ?? []}
  isSaved={concept.status === 'saved'}
  onSave={(id) => { /* optional callback */ }}
/>
```

`ConceptCardData` type is exported from the same file.

---

### 15. `ConceptTabs` ✅ — `src/components/ui/concept-tabs.tsx`

Tabbed view for single-dish briefs. Renders one `ConceptCard` at a time with a tab bar across the top. Tracks saved state locally — saving concept A then switching to B will not falsely mark B as saved.

```tsx
<ConceptTabs
  concepts={concepts}          // ConceptCardData[]
  ff={brief.format_familiarity}
  fd={brief.flavor_discovery}
  strategicRoles={brief.strategic_roles ?? []}
  recommendation="Prototype the Lamb Fatteh first…"   // optional strip at bottom
  savedIds={concepts.filter(c => c.status === 'saved').map(c => c.id)}
/>
```

The first tab is always labeled "Recommended". Concepts are passed newest-first from the server (ordered by `created_at DESC`).

---

### 16. `KpiCard` ✅ — `src/components/ui/kpi-card.tsx`

Metric display card for analytics dashboards. Shows a micro-label, a large serif value, and an optional note line.

```tsx
<KpiCard label="Total Revenue" value="Rp 4.2M" />
<KpiCard label="Units Sold" value="1,847" note="across all categories" />
```

Used in `/analytics` in a 3-column grid. Not for use outside analytics contexts.

---

## Page-Level Layout Patterns

### Detail page structure
```
<BackLink href="..." label="..." />

<PageHeader
  eyebrow="Concept"
  title={concept.concept_name}
  subtitle={concept.one_line}
  actions={<>
    <Link href=".../edit">Edit</Link>
    <DeleteButton ... />
  </>}
/>

<div className="space-y-3">
  <SectionCard label="Concept Breakdown">...</SectionCard>
  <SectionCard label="Presentation & Service Moment">...</SectionCard>
  ...
</div>
```

### Edit / form page structure
```
<BackLink href="..." label="..." />

<PageHeader eyebrow="Edit Concept" title={concept.concept_name} />

<form className="space-y-6 max-w-2xl">
  <Field label="Concept Name">
    <input className={inputCls} ... />
  </Field>

  <div className="border-t border-olive/10 pt-6 space-y-4">
    <p className="text-[10px] uppercase tracking-[2px] text-ink-muted">Section name</p>
    ...
  </div>

  <div className="flex justify-end pt-2 border-t border-olive/15">
    <button className="bg-olive text-cream text-sm font-medium px-5 py-2.5 rounded-md ...">
      Save changes
    </button>
  </div>
</form>
```

### List / history page structure
```
<PageHeader eyebrow="Intelligence" title="Brief History" subtitle="..." />

<div className="space-y-2">
  {items.map(item => (
    <Link className="group flex items-start justify-between gap-4 bg-white border border-olive/15 rounded-lg px-5 py-4 hover:border-olive/40 transition-colors">
      <div>...content...</div>
      <ChevronRight className="text-ink-muted group-hover:text-olive" />
    </Link>
  ))}
</div>
```

---

## Button Patterns

All button styles are exported from `src/lib/styles.ts`. Import the right variant — never write raw button classes inline.

**The rule: context + role determines variant.**

Two contexts:
- **Inline** — button sits alongside content (page headers, confirmation text). Text-only, no border.
- **Form footer** — button sits in a row with other buttons. Outlined or filled for visual weight.

| Export | Context | Role | Looks like |
|---|---|---|---|
| `primaryBtnCls` | Both | Main constructive action | Filled olive, cream text |
| `ghostBtnCls` | Inline | Secondary forward action | Text olive, no border |
| `mutedBtnCls` | Inline | Neutral action | Text ink-muted → ink |
| `destructiveBtnCls` | Inline | Destructive action | Text ink-muted → pimento |
| `outlinedBtnCls` | Form footer | Cancel / secondary | Olive border, transparent bg |
| `outlinedDestructiveBtnCls` | Form footer | Delete in a row | Pimento border, transparent bg |

```tsx
import {
  primaryBtnCls, ghostBtnCls,
  mutedBtnCls, destructiveBtnCls,
  outlinedBtnCls, outlinedDestructiveBtnCls
} from '@/lib/styles'

// Page header — text-only (inline context)
<Link href=".../edit" className={mutedBtnCls}>Edit</Link>
<DeleteButton ... />  // uses destructiveBtnCls internally

// Form footer — outlined row (form footer context)
<button className={outlinedBtnCls} onClick={router.back()}>Cancel</button>
<button className={outlinedDestructiveBtnCls} onClick={handleDelete}>Delete</button>
<button className={primaryBtnCls} type="submit">Save</button>

// With an icon — add flex wrapper
<button className={`flex items-center gap-2 ${primaryBtnCls}`}>
  <Sparkles size={14} /> Generate
</button>
```

**Never use `red-500` or `red-600`.** Always `pimento` via `destructiveBtnCls` or `outlinedDestructiveBtnCls`.

---

## Mock / Placeholder Banner

Used on pages where content is AI-generated placeholder, not real output.

```tsx
<div className="bg-cream-dark border border-olive/15 rounded-md px-4 py-2.5 mb-5 flex items-center gap-2">
  <span className="text-[10px] uppercase tracking-[1.5px] text-ink-muted">Mock</span>
  <span className="text-[12px] text-ink-muted font-light">AI output not yet connected — placeholder content.</span>
</div>
```

---

## Known Issues / Technical Debt

| Issue | Priority | File(s) |
|---|---|---|
| shadcn `Button` component not using Salted Olive tokens | Low | `src/components/ui/button.tsx` |

All previously tracked tech debt (local `inputCls`/`textareaCls` duplication, local Field/Pill/StatusBadge/PillSelect definitions, BackLink/PageHeader/SectionCard inline patterns) has been resolved. Classes are centralized in `src/lib/styles.ts` and all shared components are extracted to `src/components/`.
