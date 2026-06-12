# Salted Olive R&D Tool — Design Specification

> Internal culinary knowledge capture platform. Stack: Next.js, TypeScript, Tailwind CSS, shadcn/ui.

---

## 1. Design Philosophy

**Three words:** Rigorous. Editorial. Grounded.

This is a serious internal tool that shares visual DNA with its brand — without borrowing the brand's marketing energy. Think: a well-designed Berlin food journal's back office. The green and cream do all the atmosphere work; typography and structure do the rest. Nothing decorates for its own sake.

---

## 2. Color Tokens

Define these in `tailwind.config.ts` under `theme.extend.colors`:

```ts
colors: {
  olive: {
    DEFAULT: '#3D5A2A',
    light:   '#4A6E32',
    faint:   '#EEF0EB',
  },
  cream: {
    DEFAULT: '#EDEAD8',
    dark:    '#E0DCC8',
  },
  pimento: '#B22222',        // red — use sparingly: destructive actions only
  ink: {
    DEFAULT: '#1E2218',      // primary text
    mid:     '#4A4D42',      // secondary text
    muted:   '#7A7D72',      // labels, placeholders
  },
}
```

### Usage rules

| Token | Use |
|-------|-----|
| `olive` | Sidebar background, primary buttons, active states, filled chips |
| `olive-faint` | Icon backgrounds, chip hover, subtle section fills |
| `cream` | Page background |
| `cream-dark` | Input backgrounds, subtle dividers |
| `white` | Card surfaces (lift off cream) |
| `pimento` | Destructive actions only (delete, remove) |
| `ink` | Body text |
| `ink-mid` | Secondary text, descriptions |
| `ink-muted` | Labels, placeholders, eyebrows |

**Red (`pimento`) must not appear as an accent, highlight, or decorative element — only on destructive actions.**

---

## 3. Typography

Load via `next/font/google` or `<link>` in `_document`:

```
Fraunces — variable font, opsz 9–144
IBM Plex Sans — weights 300, 400, 500
```

### Type scale

| Role | Font | Size | Weight | Notes |
|------|------|------|--------|-------|
| Page title | Fraunces | 30px / `text-3xl` | 400 | `tracking-tight`, `leading-tight` |
| Section heading | Fraunces | 22px / `text-2xl` | 400 | `tracking-tight` |
| Card title / dish name | Fraunces | 15–16px | 400 | Serif in lists gives editorial warmth |
| Stat number | Fraunces | 40px / `text-5xl` | 300 | Light weight, feels precise |
| Eyebrow / section label | IBM Plex Sans | 10px | 400 | `uppercase tracking-[2px]` |
| Body | IBM Plex Sans | 14px / `text-sm` | 300–400 | `leading-relaxed` |
| UI label | IBM Plex Sans | 13px | 400 | Form labels, nav items |
| Caption / helper | IBM Plex Sans | 11–12px | 300 | Muted color |

### Tailwind font config

```ts
fontFamily: {
  serif: ['Fraunces', 'Georgia', 'serif'],
  sans:  ['IBM Plex Sans', 'system-ui', 'sans-serif'],
}
```

---

## 4. Spacing & Layout

- **Page background:** `bg-cream`
- **Content max-width:** `max-w-5xl` (1024px), centered within the main area
- **Page padding:** `px-9 py-10` (36px / 40px)
- **Card gap:** `gap-3.5` (14px)
- **Section gap:** `mb-8` between major page sections
- **Border radius:** `rounded-lg` (10px) for cards; `rounded-md` (8px) for inputs, badges, chips; `rounded-full` for score dots and small pills

---

## 5. Component Specifications

---

### 5.1 Sidebar

```
Width:      220px, fixed left, full viewport height
Background: bg-olive
```

**Structure (top to bottom):**
1. Logo block — `px-6 py-7`, bottom border `border-white/10`
   - Brand name: `font-serif text-lg font-medium text-cream tracking-tight`
   - Subline: `text-[10px] uppercase tracking-[1.5px] text-cream/40 mt-0.5` → "R&D Tool"
2. Nav sections — each with an eyebrow label + nav items
3. Eyebrow: `text-[9px] uppercase tracking-[1.8px] text-cream/40 px-6 mt-4 mb-1.5`

**Nav item:**
```
px-6 py-2.5 flex items-center gap-2.5
text-sm text-cream/70
icon: 15px, opacity-80
hover: text-cream bg-white/7
```

**Active nav item:**
```
text-cream font-medium bg-cream/13
border-r-2 border-cream
```

**Nav sections:**
- Catalogue: Dashboard, Menu Items, Pantry Items
- Knowledge: Principles, Reference Data
- Tools: Export

---

### 5.2 Page Header

```jsx
<div className="mb-9">
  <p className="text-[10px] uppercase tracking-[2px] text-ink-muted mb-1.5">
    {eyebrow}
  </p>
  <h1 className="font-serif text-3xl font-normal text-ink tracking-tight leading-tight">
    {title}
  </h1>
  {subtitle && (
    <p className="text-sm text-ink-mid font-light mt-1.5">{subtitle}</p>
  )}
  {action && (
    <div className="absolute top-10 right-9">{action}</div>
  )}
</div>
```

Wrap the page header's parent in `relative` when using the action slot.

---

### 5.3 Stat Card

```
bg-white border border-olive/15 rounded-lg p-5
```

```jsx
<div>
  <p className="text-[11px] uppercase tracking-[1px] text-ink-muted mb-2.5">
    {label}
  </p>
  <p className="font-serif text-5xl font-light text-ink leading-none">
    {count}
  </p>
  <p className="text-[11px] text-ink-muted mt-1.5">{description}</p>
</div>
```

Grid: `grid grid-cols-2 gap-3.5`

---

### 5.4 Quick-Entry Card

Dashed border card linking to create flows.

```
border border-dashed border-olive/25 rounded-lg p-4.5
flex items-center gap-3.5
hover: bg-olive/4 border-olive cursor-pointer transition-colors
```

Icon container: `w-9 h-9 rounded-lg bg-olive-faint flex items-center justify-center text-olive text-lg`

Label: `text-sm font-medium text-ink`
Subtext: `text-[11px] text-ink-muted mt-0.5`

---

### 5.5 Section Label / Divider

Used inside pages to separate content zones.

```jsx
<div className="text-[10px] uppercase tracking-[2px] text-ink-muted mb-3.5 pb-2 border-b border-olive/15">
  {label}
</div>
```

---

### 5.6 List Row Card

Used in Menu Items and Pantry Items list views.

```
bg-white border border-olive/15 rounded-lg px-4.5 py-3.5
flex items-center gap-4 mb-2
hover: border-olive/25 transition-colors cursor-pointer
```

**Left block (flex-1):**
- Dish name: `font-serif text-[15px] font-normal text-ink`
- Meta line: `text-[11px] text-ink-muted mt-0.5` → "Category · Flavor, Flavor"

**Right block:**
- Status badge
- Score indicators (see 5.8)

---

### 5.7 Status Badge

Three variants, all: `text-[10px] tracking-[0.5px] font-medium px-2.5 py-1 rounded-full`

| Variant | Classes |
|---------|---------|
| Active | `bg-[#EAF3DE] text-[#3B6D11]` |
| Concept | `bg-[#FAEEDA] text-[#854F0B]` |
| Inactive | `bg-[#F1EFE8] text-[#5F5E5A]` |

---

### 5.8 Score Indicator (list view, compact)

Displayed as a row of 5 dots. Two per row card (FF = Format Familiarity, FD = Flavor Discovery).

```jsx
<div className="flex items-center gap-1.5">
  <span className="text-[10px] text-ink-muted">{label}</span>
  <div className="flex gap-[3px]">
    {[1,2,3,4,5].map(i => (
      <div key={i} className={`w-[7px] h-[7px] rounded-full ${i <= value ? 'bg-olive' : 'bg-olive/20'}`} />
    ))}
  </div>
</div>
```

---

### 5.9 Score Selector (form, interactive)

5 numbered tap-to-select buttons. Used in the Menu Item form for Format Familiarity and Flavor Discovery.

```
flex gap-2
```

Each button:
```
w-9 h-9 rounded-md text-sm font-medium border
unselected: border-olive/20 bg-white text-ink-muted hover:border-olive/40
selected:   border-olive bg-olive text-cream
```

Include a label above and a description below in muted text.

---

### 5.10 Form Field

```jsx
<div className="flex flex-col gap-1.5">
  <label className="text-[13px] font-medium text-ink">
    {label}
  </label>
  {helper && (
    <p className="text-[11px] text-ink-muted -mt-0.5">{helper}</p>
  )}
  {/* input / select / textarea */}
</div>
```

**Input / Textarea:**
```
w-full bg-cream-dark border border-olive/20 rounded-md
px-3 py-2 text-sm text-ink font-light
placeholder:text-ink-muted
focus:outline-none focus:ring-1 focus:ring-olive focus:border-olive
```

**Select:** same styles, use shadcn `<Select>` with custom trigger matching above.

**Form layout:** Single column. `space-y-5` between fields. Two-column grid (`grid grid-cols-2 gap-5`) only for short paired fields (e.g. Category + Status side by side).

---

### 5.11 Section Header (inside forms)

Separates form sections visually.

```jsx
<div className="mt-8 mb-5">
  <p className="text-[10px] uppercase tracking-[2px] text-ink-muted mb-2">
    {sectionName}
  </p>
  <div className="h-px bg-olive/15" />
</div>
```

---

### 5.12 Multi-Select Chip Picker

Used for: Secondary Flavors, Pantry Products, Strategic Role, Flavor Contributions.

**Structure:**
1. Selected chips row (above) — empty state shows placeholder text
2. Option pills row (below) — all available options as toggleable pills

```jsx
{/* Selected chips */}
<div className="flex flex-wrap gap-1.5 min-h-[32px] mb-2">
  {selected.length === 0 && (
    <span className="text-[12px] text-ink-muted italic">None selected</span>
  )}
  {selected.map(item => (
    <span key={item} className="inline-flex items-center gap-1 bg-olive text-cream text-[12px] px-2.5 py-1 rounded-full">
      {item}
      <button onClick={() => remove(item)} className="text-cream/60 hover:text-cream ml-0.5">×</button>
    </span>
  ))}
</div>

{/* Option pills */}
<div className="flex flex-wrap gap-1.5">
  {options.map(opt => (
    <button
      key={opt}
      onClick={() => toggle(opt)}
      className={`text-[12px] px-2.5 py-1 rounded-full border transition-colors ${
        selected.includes(opt)
          ? 'bg-olive text-cream border-olive'
          : 'bg-white text-ink-mid border-olive/20 hover:border-olive/50'
      }`}
    >
      {opt}
    </button>
  ))}
</div>
```

---

### 5.13 Primary Button

```
bg-olive text-cream text-sm font-medium
px-4 py-2 rounded-md
hover:bg-olive-light transition-colors
```

### 5.14 Secondary / Ghost Button

```
border border-olive/30 text-ink-mid text-sm font-medium
px-4 py-2 rounded-md bg-transparent
hover:border-olive/60 hover:text-ink transition-colors
```

### 5.15 Destructive Button

```
border border-pimento/30 text-pimento text-sm font-medium
px-4 py-2 rounded-md bg-transparent
hover:bg-pimento/5 transition-colors
```

---

### 5.16 Expandable Card (Reference Data)

Collapsed state: title row with chevron
Expanded state: reveals editable fields

```
bg-white border border-olive/15 rounded-lg overflow-hidden mb-2
```

**Header row:**
```
px-5 py-4 flex items-center justify-between cursor-pointer
hover:bg-olive/3
```
Title: `text-sm font-medium text-ink`
Chevron icon: `text-ink-muted transition-transform` → rotate 180° when open

**Expanded body:**
```
px-5 pb-5 pt-1 border-t border-olive/10 space-y-4
```

---

### 5.17 Principle Card (read-only)

```
bg-white border border-olive/15 rounded-lg p-6 mb-4
```

**Number badge:**
```
w-8 h-8 rounded-full bg-olive-faint text-olive
text-[13px] font-medium flex items-center justify-center mb-4
```

**Principle name:** `font-serif text-xl font-normal text-ink mb-2`

**Definition:** `text-sm text-ink-mid font-light leading-relaxed`

**"Ask yourself" callout:**
```
border-l-2 border-olive pl-4 mt-4
text-[13px] text-ink-mid italic font-light
```
No border-radius on border-left elements.

**Examples list:**
```
mt-3 space-y-1
text-[13px] text-ink-muted
list-disc list-inside
```

---

## 6. Page-by-Page Specs

---

### 6.1 Dashboard

- Eyebrow: "Overview"
- Title: "Dashboard"
- Subtitle: "Internal R&D knowledge capture platform"
- Stat cards grid (2 cols): Menu Items count + Pantry Items count
- Quick-entry cards grid (2 cols): New menu item + New pantry item
- Section label: "Recent menu items"
- List of 3–5 most recent `ListRowCard` components

---

### 6.2 Menu Items — List View

- Eyebrow: "Catalogue"
- Title: "Menu items"
- Subtitle: "{n} items"
- Action button (top right): "Add item" (primary button)
- Section label: "All items" (or filtered label)
- List of `ListRowCard` — each shows: dish name, category · flavors, status badge, FF + FD score dots

---

### 6.3 Menu Items — Create / Edit Form

Single column layout. Sections separated by `SectionHeader`.

**Sections in order:**

1. **Core info**
   - Name (text input)
   - Description (textarea, 3 rows)
   - Category + Status (2-col grid)

2. **Dish identity**
   - Hero Component (text input)
   - Helper: "The single ingredient, technique, or product this dish is built around"

3. **Flavor identity**
   - Primary Flavor (single select dropdown)
   - Secondary Flavors (multi-select chip picker)

4. **Pantry products**
   - Multi-select chip picker
   - Helper: "Which pantry products does this dish use?"

5. **Strategic role**
   - Multi-select chip picker

6. **Experience dimensions**
   - Format Familiarity score selector (1–5)
     - Description: "How familiar is the format to the average guest?"
   - Flavor Discovery score selector (1–5)
     - Description: "How adventurous is the flavor profile for the average guest?"

7. **Notes**
   - Textarea (4 rows)

**Footer actions:** "Save" (primary) + "Cancel" (ghost) — `flex gap-3 justify-end mt-8`

---

### 6.4 Pantry Items — List View

Same structure as Menu Items list, simplified.

Each `ListRowCard` shows:
- Item name (serif)
- Flavor contribution chips (inline, small, olive-faint background)

No score indicators. No status badge.

---

### 6.5 Pantry Items — Create / Edit Form

**Flavor Contributions is the hero field** — place it first after Name, give it a larger visual treatment (label in `text-sm font-medium`, not eyebrow style).

**Sections:**

1. Name
2. **Flavor Contributions** (multi-select chip picker — visually prominent)
3. Description (textarea)
4. Best Pairings (textarea)
5. Cautions (textarea, optional — consider collapsing behind "Add cautions" toggle)
6. Example Applications (textarea)
7. Notes (textarea)

---

### 6.6 Principles (read-only)

- Title: "Principles"
- Subtitle: "The five guiding principles of every Salted Olive dish"
- 5 × `PrincipleCard` components stacked, full width

---

### 6.7 Reference Data

Tabbed page using shadcn `<Tabs>`.

Tab list: Strategic Roles · Menu Flavors · Pantry Flavors · Menu Categories

**Tab styles:**
```
text-sm text-ink-muted
active: text-ink border-b-2 border-olive font-medium
```

**Strategic Roles tab:** list of `ExpandableCard` components

**Other tabs (Menu Flavors, Pantry Flavors, Menu Categories):**
```
flex flex-wrap gap-2 mt-4
```
Each item: pill badge (olive-faint bg, olive text) + a subtle remove `×` button on hover
"Add new" input at the bottom: inline text input + "Add" button

---

### 6.8 Export

- Title: "Export"
- Subtitle: "Download your catalogue data"
- Two export cards side by side (`grid grid-cols-2 gap-4`):
  - Menu Items — CSV button + JSON button
  - Pantry Items — CSV button + JSON button
- Full export section below: single "Export all (JSON)" button (ghost style, full width)

Export card structure:
```
bg-white border border-olive/15 rounded-lg p-5
```
Card title: `font-serif text-base font-normal text-ink mb-1`
Count: `text-[11px] text-ink-muted mb-4`
Buttons: row of ghost buttons with download icon

---

## 7. Tailwind Config Summary

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        olive: {
          DEFAULT: '#3D5A2A',
          light:   '#4A6E32',
          faint:   '#EEF0EB',
        },
        cream: {
          DEFAULT: '#EDEAD8',
          dark:    '#E0DCC8',
        },
        pimento: '#B22222',
        ink: {
          DEFAULT: '#1E2218',
          mid:     '#4A4D42',
          muted:   '#7A7D72',
        },
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans:  ['IBM Plex Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
```

---

## 8. shadcn/ui Component Mapping

| shadcn component | Usage in this app |
|-----------------|-------------------|
| `Button` | All buttons — override variant styles with Tailwind |
| `Input` | All text inputs — style with `bg-cream-dark border-olive/20` |
| `Textarea` | All textareas — same styles as Input |
| `Select` + `SelectTrigger` | Category, Status, Primary Flavor dropdowns |
| `Tabs` + `TabsList` | Reference Data page |
| `Badge` | Status badges (Active / Concept / Inactive) |
| `Separator` | Section dividers in forms |

All shadcn components should have their default styles overridden via `className` to match this spec. Do not use shadcn's default color theme (slate/zinc) — all surfaces and states should use the olive/cream/ink token system defined above.

---

## 9. Layout Shell

```tsx
// app/layout.tsx or _app.tsx

<div className="flex h-screen bg-cream overflow-hidden">
  <Sidebar />                          {/* 220px fixed */}
  <main className="flex-1 overflow-y-auto">
    <div className="max-w-5xl mx-auto px-9 py-10">
      {children}
    </div>
  </main>
</div>
```

---

## 10. Design Rules Summary

1. **Red (`pimento`) is reserved for destructive actions only** — never use as accent or highlight
2. **White cards lift off the cream background** — don't use cream-colored cards, use white
3. **Serif (Fraunces) for headings and dish names only** — all UI labels, buttons, badges, and body text use IBM Plex Sans
4. **Border opacity not full color** — use `border-olive/15` (not `border-olive`) to keep borders quiet
5. **Uppercase eyebrows** — 10px, 2px letter-spacing, ink-muted — used to label sections, not headings
6. **No decorative elements** — no illustrations, no background patterns, no gradient fills
7. **Score dots over numbers** — compact visual encoding for the list view scores
8. **Chip picker selected state = filled olive** — unselected options are outlined only
