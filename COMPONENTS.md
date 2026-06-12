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

### Status: ✅ Exists in `src/components/`  |  ⚠️ Needs extraction from page files  |  ❌ Does not exist

---

### 1. `BackLink` ✅ — Pattern (not yet extracted)

Back navigation. Used at the top of every detail and edit page.

**Current pattern (repeated in 8+ files — should be extracted):**
```tsx
<Link
  href="/brief/history"
  className="flex items-center gap-1 text-[13px] text-ink-muted hover:text-ink mb-6 transition-colors"
>
  <ChevronLeft size={14} /> Brief History
</Link>
```

**Extract to:** `src/components/ui/back-link.tsx`
```tsx
<BackLink href="/brief/history" label="Brief History" />
```

---

### 2. `PageHeader` ⚠️ — Pattern (not extracted)

Every page has the same header block: eyebrow label → serif H1 → optional subtitle.

**Current pattern:**
```tsx
<div className="mb-9">
  <p className="text-[10px] uppercase tracking-[2px] text-ink-muted mb-1.5">Intelligence</p>
  <h1 className="font-serif text-3xl font-normal text-ink tracking-tight leading-tight">
    R&D Brief
  </h1>
  <p className="text-sm text-ink-mid font-light mt-1.5">
    Articulate a concept direction.
  </p>
</div>
```

**Extract to:** `src/components/ui/page-header.tsx`
```tsx
<PageHeader
  eyebrow="Intelligence"
  title="R&D Brief"
  subtitle="Articulate a concept direction."
  actions={<EditDeleteRow />}  // optional
/>
```

---

### 3. `SectionCard` ⚠️ — Pattern (not extracted)

White bordered card with an optional micro label at top. Used throughout detail pages.

**Current pattern (defined locally in concept page, recipe page, brief detail):**
```tsx
<div className="bg-white border border-olive/15 rounded-lg p-5">
  <p className="text-[10px] uppercase tracking-[1.5px] text-ink-muted mb-3">{label}</p>
  {children}
</div>
```

**Extract to:** `src/components/ui/section-card.tsx`
```tsx
<SectionCard label="Concept Breakdown">
  {children}
</SectionCard>
```

---

### 4. `SectionLabel` ⚠️ — Pattern (not extracted)

Horizontal divider with centered micro label. Used in forms to separate context from brief sections.

**Current pattern (defined in `brief-form.tsx` and `brief/[id]/page.tsx`):**
```tsx
<div className="flex items-center gap-3 mb-6">
  <div className="h-px flex-1 bg-olive/15" />
  <p className="text-[10px] uppercase tracking-[2px] text-ink-muted shrink-0">{label}</p>
  <div className="h-px flex-1 bg-olive/15" />
</div>
```

**Extract to:** `src/components/ui/section-label.tsx`
```tsx
<SectionLabel label="The Brief" icon={<Sparkles />} />  // icon optional
```

---

### 5. `Field` ⚠️ — Pattern (not extracted)

Form field wrapper: label + optional helper text + input slot. Defined separately in `BriefForm`, `ConceptEditForm`, `RecipeEditForm`.

**Current pattern:**
```tsx
<div className="flex flex-col gap-1.5">
  <label className="text-[13px] font-medium text-ink">{label}</label>
  {helper && <p className="text-[11px] text-ink-muted">{helper}</p>}
  {children}
</div>
```

**Extract to:** `src/components/forms/field.tsx`
```tsx
<Field label="Concept Name" helper="Working title — internal use only">
  <Input ... />
</Field>
```

---

### 6. `Pill` ⚠️ — Pattern (not extracted)

Rounded tag/badge. Three variants used across brief, concept, and pantry pages. Currently defined locally in 4+ files.

**Variants:**

| Variant | Classes | Usage |
|---|---|---|
| `olive` | `bg-olive text-cream border-olive` | Selected/active category, selected state |
| `cream` | `bg-cream-dark text-ink-mid border-transparent` | Secondary tags (textures, pantry assets) |
| `default` | `bg-white text-ink-mid border-olive/20` | Neutral tags (flavor drivers, roles) |
| `faint` | `bg-olive-faint text-olive border-olive/20` | Subtle selected state in multi-selects |

**Extract to:** `src/components/ui/pill.tsx`
```tsx
<Pill variant="olive">Veggies</Pill>
<Pill variant="cream">Charred & tender</Pill>
<Pill variant="default">House Labneh</Pill>
```

---

### 7. `StatusBadge` ⚠️ — Pattern (not extracted)

Lifecycle status indicator. Currently defined inside `brief/[id]/page.tsx`.

**Status values and styles:**

| Status | Style | Entities |
|---|---|---|
| `draft` | `bg-cream-dark text-ink-muted` | Concepts, Recipes |
| `saved` | `bg-olive-faint text-olive` | Concepts |
| `recipe_generated` | `bg-olive-faint text-olive` | Concepts |
| `kitchen_tested` | `bg-[#EAF3DE] text-[#3B6D11]` | Concepts, Recipes |
| `validated` | `bg-[#EAF3DE] text-[#3B6D11]` | Concepts |
| `tested` | `bg-[#EAF3DE] text-[#3B6D11]` | Recipes |
| `approved` | `bg-[#EAF3DE] text-[#3B6D11]` | Recipes |

**Extract to:** `src/components/ui/status-badge.tsx`
```tsx
<StatusBadge status="kitchen_tested" />
```

---

### 8. `DeleteButton` ✅ — `src/components/ui/delete-button.tsx`

Inline confirmation delete. Accepts `table`, `id`, `redirectTo`. Already extracted.

```tsx
<DeleteButton table="rd_concepts" id={id} redirectTo={`/brief/${briefId}`} />
```

Shows "Delete" → click → "Are you sure? Confirm / Cancel" → deletes → redirects.

---

### 9. `Input` ✅ — `src/components/ui/input.tsx` (shadcn — needs styling fix)

**Current issue:** The shadcn `Input` uses generic `border-input`, `focus-visible:border-ring` tokens which don't resolve to Salted Olive colors. As a result, all page files bypass it and use a raw `<input>` with a manually defined `inputCls` string.

**The correct fix:** Override the input with Salted Olive classes:
```tsx
// Usage pattern until Input is fixed:
const inputCls = 'w-full bg-white border border-olive/20 rounded-md text-sm text-ink font-light px-3 py-2 placeholder:text-ink-muted focus:outline-none focus:ring-1 focus:ring-olive focus:border-olive'
```
This constant is defined in 3 separate files. Should either fix `Input` component or centralize the class string in `src/lib/styles.ts`.

---

### 10. `Textarea` ✅ — `src/components/ui/textarea.tsx` (shadcn — used with overrides)

Same issue as `Input` — used with `className={textareaCls}` override in every file. The override string is:
```tsx
const textareaCls = 'bg-white border-olive/20 rounded-md text-sm text-ink font-light placeholder:text-ink-muted focus-visible:ring-olive focus-visible:border-olive resize-none'
```
Defined in 3+ files. Centralize.

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

### 13. `PillSelect` ⚠️ — Defined locally in `brief-form.tsx`

Single-select pill group. Currently defined as a local component inside `brief-form.tsx`. Nearly identical to `MultiSelect` but single-value.

**Extract to:** `src/components/forms/pill-select.tsx`
```tsx
<PillSelect
  options={categoryOptions}
  value={form.category}
  onChange={(v) => set('category', v)}
/>
```

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
| `inputCls` string defined in 3 files | High | `ConceptEditForm`, `RecipeEditForm`, brief form |
| `textareaCls` string defined in 3 files | High | Same files |
| `Field` component defined locally in 3 files | High | Same files |
| `Pill` defined locally in 4 files | High | `brief/[id]/page`, concept page, brief form |
| `SectionCard` defined locally in 2 files | Medium | Concept page, recipe page |
| `BackLink` repeated as raw JSX in 8+ files | Medium | All detail/edit pages |
| `PageHeader` repeated as raw JSX in all pages | Medium | All pages |
| `StatusBadge` defined locally | Medium | `brief/[id]/page` |
| `PillSelect` defined locally | Medium | `brief-form.tsx` |
| shadcn `Button` and `Input` not using Salted Olive tokens | Low | `src/components/ui/` |

**Resolution order:**
1. Centralize `inputCls` + `textareaCls` into `src/lib/styles.ts`
2. Extract `Field`, `Pill`, `StatusBadge` — highest reuse
3. Extract `BackLink`, `PageHeader`, `SectionCard` — structural patterns
4. Extract `PillSelect` — moves it closer to `MultiSelect`
5. Align `Button` + `Input` to Salted Olive tokens — last, lowest risk
