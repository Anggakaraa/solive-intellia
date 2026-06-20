# Intellia Intelligence System — Roadmap

## Context

Today Intellia generates menu concepts using menu items, pantry products, base recipes, FF/FD metadata, strategic roles, and flavor profiles.

The next evolution is an **Intelligence Layer** that can answer:
- What is performing well?
- Why is it performing well?
- What opportunities exist in the menu?
- What should we build next?

The goal is not to replace traditional BI tools. The goal is to **connect business performance with menu design decisions**.

---

## Architecture

```
POS / Sales System
       ↓
      CSV
       ↓
Data Ingestion Layer   ← Phase 1
       ↓
   Supabase
       ↓
Analytics Layer        ← Phase 1–2
       ↓
Intelligence Layer     ← Phase 2–3
       ↓
Opportunity Engine     ← Phase 4
       ↓
Strategic R&D Advisor  ← Phase 5
       ↓
Concept Generation     ← existing
```

---

## Data Sources

### Source A — Sales Data
Exported from POS as CSV. Expected columns:

| Column | Required | Notes |
|---|---|---|
| `date` | Yes | Format: YYYY-MM-DD or DD/MM/YYYY |
| `dish_name` | Yes | Will be matched against Intellia menu items |
| `quantity` | Yes | Integer |
| `revenue` | Yes | Total revenue for this line item |
| `time` | No | |
| `receipt_id` | No | Required for companion analysis (Phase 3) |
| `unit_price` | No | |
| `cost` | No | Required for margin analysis |
| `table_id` | No | Required for table-size analysis (Phase 3) |

### Source B — Intellia Metadata
Already exists. Each menu item has: name, category, format_familiarity, flavor_discovery, strategic_roles, primary_flavor_identity, secondary_flavor_identities, pantry links, status.

---

## Data Model

### Existing tables (used as enrichment layer)
- `menu_items` — dish catalogue with FF/FD, flavors, strategic roles
- `pantry_items` — pantry products with flavor profiles

### New tables

**`sales_imports`** — audit trail per CSV upload
```
id, source_filename, imported_at, row_count, matched_count, date_from, date_to
```

**`sales_transactions`** — one row per receipt/bill
```
id, import_id, receipt_id, date, time, table_id
```

**`sales_items`** — one row per line item on a receipt
```
id, transaction_id, menu_item_id (nullable), raw_dish_name, quantity, unit_price, revenue, cost
```
Note: `raw_dish_name` always stores the original CSV string for re-matching.
Note: `menu_item_id` is nullable — unmatched dishes are stored, not rejected.

**`menu_item_aliases`** — maps POS dish names to Intellia menu items
```
id, alias_name (unique), menu_item_id
```
Populated during import review. Future imports auto-resolve via this table.

---

## Dish Matching

POS systems often export dish names differently from Intellia:
```
Roast Chicken → Roasted Chicken
Lamb Chops → Grilled Lamb Chops
```

**Matching order during import:**
1. Check `menu_item_aliases` (saved from previous imports)
2. Check `menu_items.name` (normalized: lowercase, punctuation stripped)
3. If no match → flag as unmatched

**Alias review (import UI):**
- Unmatched dishes are surfaced in a review step
- User maps each unmatched dish to a menu item (or skips)
- Mapping is saved as an alias → auto-resolves in all future imports

---

## Build Phases

---

### Phase 1 — Business Performance Dashboard
**Goal: "What happened?"**
**Status: In progress**

**Data ingestion:**
- Manual CSV upload via import page
- Column validation
- Alias matching with review step
- Inserts into sales_imports → sales_transactions → sales_items

**Dashboard metrics:**
- KPIs: Total Revenue, Units Sold, Unique Dishes, Date Range
- Top dishes by revenue and units sold
- Revenue by category (with inline bar visualization)
- Data health: last import date, match rate, date range

**Revenue vs Margin Matrix (gated):**
Only shown when cost data is present in the imported CSV.
Classifies dishes into: Stars (high rev, high margin), Workhorses (high rev, low margin), Puzzles (low rev, high margin), Dogs (low rev, low margin).

**AI usage:** None. Pure SQL + aggregation.

---

### Phase 2 — Menu Intelligence
**Goal: "Why did it happen?"**

**FF/FD Analysis:**
Join `sales_items` → `menu_items` and compute:
- Revenue by `format_familiarity` (1–5)
- Revenue by `flavor_discovery` (1–5)
- Revenue by FF/FD territory combination
- Performance vs menu average per territory

**Flavor Analysis:**
Using `primary_flavor_identity` and `secondary_flavor_identities`:
- Revenue by flavor territory
- Most common flavor combinations in top performers

**Pantry Analysis:**
Using `menu_item_pantry_links`:
- Revenue influenced by each pantry asset
- Number of dishes using each pantry asset
- Revenue per pantry placement
- Identifies underutilized high-value assets

**Strategic Role Analysis:**
- Revenue contribution by role (Revenue Driver, Brand Driver, etc.)
- Are Brand Drivers actually performing?
- Are Margin Drivers pulling weight?

**AI usage (optional):**
AI receives pre-computed SQL aggregations and generates a natural-language summary:
> "FF5 FD4 dishes consistently outperform menu average by 22%. This suggests familiar formats carrying higher flavor discovery are the sweet spot for Salted Olive guests."

AI never calculates. Only interprets.

---

### Phase 3 — Guest Behavior Intelligence
**Goal: "How are guests using the menu?"**
**Requires:** `receipt_id` consistently populated in CSV exports.

**Companion analysis:**
Which dishes are ordered together? (co-occurrence by receipt)

**Basket analysis:**
- Typical order for table of 2 / 4 / 6+
- Average basket size by category mix

**Category interaction:**
- Do dips increase large plate sales?
- Do desserts follow specific mains?

**Occasion detection (inferred):**
From table size + order volume + dish mix:
- Date Night (table of 2, higher average spend)
- Family Table (larger table, mix of mains and sharing)
- Group Sharing (large table, high starter count)

**AI usage:** Interpretation only — not calculation.

---

### Phase 4 — Opportunity Engine
**Goal: "What should we build next?"**

Inputs: Phase 1 + 2 + 3 outputs

**Detection rules (examples):**

| Signal | Condition | Opportunity type |
|---|---|---|
| Underutilized Pantry | Low menu presence + high performance when used | Pantry expansion |
| Missing Territory | Strong FF/FD performance + low category coverage | Category opportunity |
| Flavor Opportunity | High-performing flavor + few dishes | Flavor expansion |
| Strategic Role Gap | Revenue Driver undercount + high demand signal | Role gap |

**AI output:**
Given pre-computed opportunity signals, AI generates a structured recommendation:
> Underutilized Pantry: Amba (1 dish, above average revenue).
> Target Territory: FF5 FD4, Veggies category.
> Recommendation: Develop a Revenue Driver veggie dish featuring Amba.

---

### Phase 5 — Strategic R&D Advisor
**Goal: Close the loop — Analytics → Opportunity → Brief → Concept.**

**Flow:**
```
Analytics identifies opportunity
        ↓
AI drafts R&D Brief
        ↓
User reviews + edits brief    ← human-in-the-loop required
        ↓
User confirms
        ↓
Intellia generates concept
        ↓
Concept enters prototype pipeline
```

The brief is never auto-confirmed. User always reviews before generation.

---

## Key Principles

**AI does not calculate.**
All analytics, aggregations, and classifications go through SQL first. AI only interprets, explains, and recommends based on pre-computed outputs. This keeps the system cheaper, faster, more reliable, and easier to validate.

**Human in the loop at Phase 5.**
The opportunity-to-concept flow always has a human review step. AI drafts the brief; the user confirms it.

**Unmatched data is stored, not discarded.**
Every imported row is kept, even if the dish name doesn't match. This prevents data loss and enables re-matching later.
