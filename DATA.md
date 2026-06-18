# Intellia — Data Model

This document describes the database schema, the intent behind each table and field, how data connects, and how the model is designed to support Phase 2 AI-assisted menu intelligence.

---

## Overview

Intellia's data model is built around two core entities — **Menu Items** and **Pantry Items** — anchored by a shared system of **reference vocabulary** (flavors, categories, strategic roles) and **editorial principles** (identity principles). The model is intentionally denormalized in some places (names stored as text rather than UUIDs) to keep the UI simple and queries readable at v1 scale.

---

## Active Tables

These tables are in use by the current UI.

---

### `menu_items`

The central record for every dish — active, concept, or retired.

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `name` | text | Dish name |
| `description` | text | Key ingredients, written as a list |
| `category` | text | Stores the **name** from `menu_categories` (not a UUID FK) |
| `status` | text | `active`, `inactive`, or `concept` |
| `hero_component` | text | The single ingredient or technique the dish is built around |
| `primary_flavor_identity` | text | Stores the **name** from `flavor_identities` |
| `secondary_flavor_identities` | text[] | Array of names from `flavor_identities` |
| `strategic_roles` | text[] | Array of names from `strategic_roles` |
| `format_familiarity` | int (1–5) | How recognisable the dish format is to a typical guest |
| `flavor_discovery` | int (1–5) | How adventurous the flavor profile is for a typical guest |
| `notes` | text | Free-text R&D notes |
| `created_at` / `updated_at` | timestamptz | Auto-managed |

**Pantry products used** are stored in `menu_item_pantry_links`, not on this table directly.

---

### `pantry_items`

The Salted Olive proprietary pantry — the signature products that differentiate the menu.

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `name` | text | Product name |
| `description` | text | Short description of what the product is |
| `flavor_contributions` | text[] | Flavor territory — uses vocabulary from `pantry_flavor_contributions` |
| `best_pairings` | text[] | Ingredients and dishes this product pairs well with |
| `example_applications` | text[] | Actual dishes or use cases where this product has been applied |
| `cautions` | text | Known risks, over-use patterns, flavor conflicts |
| `notes` | text | Free-text |
| `created_at` / `updated_at` | timestamptz | Auto-managed |

`best_pairings` and `example_applications` were converted from free text to `text[]` in migration 008, enabling structured querying.

---

### `menu_item_pantry_links`

Junction table linking menu items to the pantry products they use. Added in migration 008, replacing a plain `text[]` array on `menu_items`.

| Field | Type | Notes |
|---|---|---|
| `menu_item_id` | uuid | FK → `menu_items.id` (cascade delete) |
| `pantry_item_id` | uuid | FK → `pantry_items.id` (cascade delete) |
| `created_at` | timestamptz | |

**Why this matters for intelligence:** this is the primary relationship that enables questions like "which dishes feature Hot Honey?" or "how many menu items use this pantry product?" — queries that are impossible with a text array.

---

### `identity_principles`

The Salted Olive design philosophy, structured across three levels. These are used in the Principles page and serve as the editorial criteria for evaluating new concepts.

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | |
| `name` | text | Principle name |
| `category` | text | `Level 1: Dish Principles`, `Level 2: Menu Principles`, or `Level 3: Pantry Strategy` |
| `definition` | text | What the principle means |
| `question` | text | A prompt to apply the principle to a specific dish |
| `examples` | text | Concrete examples (free text) |
| `notes` | text | Edge cases, caveats |

**Three levels:**
- **Level 1 — Dish Principles** (4): Applied to every individual dish. Contemporary Eastern Mediterranean Hospitality, Accessible Formats, Craveability First, Operationally Realistic. *(Pantry-Led was removed in migration 025 — the AI system is designed to think beyond pantry constraints, not within them.)*
- **Level 2 — Menu Principles** (5): Applied to the menu as a whole — balance, shareability, pantry exposure, familiarity vs. discovery tension.
- **Level 3 — Pantry Strategy** (3): How to build and extend the pantry product ecosystem.

---

### `strategic_roles`

The four business roles a dish can play on the menu. A dish can hold multiple roles.

| Name | Purpose |
|---|---|
| Revenue Driver | Broad appeal, consistent volume |
| Margin Driver | Efficient ingredients, strong profitability |
| Brand Driver | Identity-forward, pantry-led, memorable |
| VIP Driver | Premium experience, higher price point |

Stored on `menu_items.strategic_roles` as `text[]` of names.

---

### `menu_categories`

The menu sections. Dishes sit in exactly one category.

Current values: `Dips`, `Sides`, `Pockets`, `Veggies`, `Large Plates`, `Dessert`, `Drinks`

Stored on `menu_items.category` as a plain text name (not a UUID FK).

---

### `flavor_identities`

The flavor vocabulary used to tag menu items.

Current values: `Bright`, `Herbaceous`, `Smoky`, `Spicy`, `Creamy`, `Tangy`, `Sweet`, `Briny`, `Earthy`, `Roasty`, `Rich`, `Savory`, `Fresh`, `Nutty`

Used in `menu_items.primary_flavor_identity` (single) and `menu_items.secondary_flavor_identities` (array).

Both `menu_items` and `pantry_items` draw from this same table. Flavors are flavors — the vocabulary is shared regardless of whether it's describing a dish or a pantry product.

---

### `rd_briefs`

The intent layer of the intelligence system. Each brief captures a strategic direction the team wants to explore before any concept is generated.

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `brief_type` | text | `dish` \| `menu_collection` |
| `category` | text | Target menu category (dish briefs only) |
| `menu_theme` | text | Working title for dish briefs; theme for menu collections |
| `collection_format` | text | `a_la_carte` \| `set_menu` (menu collection only; default `a_la_carte`) |
| `menu_composition` | jsonb | `{ "Dips": 2, "Large Plates": 3, … }` — dish count per category |
| `ai_recommend_composition` | boolean | If true, AI determines composition |
| `strategic_roles` | text[] | Target strategic roles (names from `strategic_roles`) |
| `format_familiarity` | int (1–5) | Target FF position |
| `flavor_discovery` | int (1–5) | Target FD position |
| `pantry_assets` | text[] | Pantry products the concept should leverage |
| `opportunity` | text | Why this concept should exist |
| `creative_references` | text | Directional references (dishes, places, moods) |
| `desired_feeling` | text | Emotional outcome for the guest |
| `constraints` | text | What to avoid or work within |
| `exploration_mode` | text | `safe` \| `balanced` \| `exploratory` (default `balanced`) |
| `generation_mode` | text | `full` \| `fast` (default `full`) |
| `output_data` | jsonb | Written by API after generation. Dish: `{ narrative, recommendation }`. Collection: `{ type: 'collection', collection_name, narrative, … }` |

---

### `rd_concepts`

The intellectual property layer. The primary artifact produced by the intelligence system. A brief can produce multiple concepts. Concepts persist independently — they are the most valuable records in the system.

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `brief_id` | uuid | FK → `rd_briefs.id` (cascade delete) |
| `concept_name` | text | Working title |
| `one_line` | text | Single sentence: hero + flavor driver + format |
| `breakdown` | jsonb | `{ hero, flavor_drivers: [], textures: [], key_contrast }` |
| `presentation` | text | How the dish comes to life at the table |
| `why_it_could_win` | text | Strategic and emotional case for the concept |
| `feasibility` | jsonb | `{ assets_leveraged: [], watchouts: [] }` |
| `experiment_focus` | text[] | The 2–4 assumptions that determine success |
| `status` | text | `generated` → `saved` → `testing` → `active` → `archived` |

---

### `rd_recipes`

The execution layer. Prototype recipes derived from a concept. A concept can produce multiple recipe versions (V1, V2, V3 as iterations refine the dish).

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `concept_id` | uuid | FK → `rd_concepts.id` (cascade delete) |
| `version` | integer | 1 = first prototype, increments with each revision |
| `concept_intent` | text | Copied from concept at generation time — self-contained |
| `components` | jsonb | `[{ name, quantity, notes }]` |
| `method` | text[] | Ordered preparation steps |
| `plating_notes` | text | How the dish should be presented |
| `yield` | jsonb | `{ serves, portion_size }` |
| `success_criteria` | text[] | Copied from `experiment_focus` at generation time |
| `test_kitchen_notes` | text | Human-entered after prototyping — the longitudinal record |
| `status` | text | `draft` → `tested` → `revised` → `approved` |

---

### `saved_collections`

A user-saved snapshot of a menu collection. Created when the user clicks "Save Collection" on the output page of a `menu_collection` brief.

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `brief_id` | uuid | FK → `rd_briefs.id` |
| `name` | text | Collection name (from AI output or user-edited) |
| `menu_theme` | text | Copied from `rd_briefs.menu_theme` at save time |
| `created_at` | timestamptz | |

---

### `saved_collection_concepts`

Junction table linking a saved collection to its individual dish concepts. Supports wave-based ordering for set menus.

| Field | Type | Notes |
|---|---|---|
| `collection_id` | uuid | FK → `saved_collections.id` (cascade delete) |
| `concept_id` | uuid | FK → `rd_concepts.id` (cascade delete) |
| `wave` | integer | Course/wave number (set menus) |
| `wave_order` | integer | Position within a wave |

---

## Dormant Tables

These tables were scaffolded in the initial schema but are not currently wired into the UI. They represent planned capability that was deliberately parked in v1.

| Table | Original Intent | Status |
|---|---|---|
| `menu_intents` | Why a dish exists on the menu (e.g. "Introduce Pantry Product", "Everyday Staple") | Seeded, not exposed |
| `menu_formats` | Physical dish format (Plate, Bowl, Mezze, Sandwich, etc.) | Seeded, dropped from menu_items in migration 002 |
| `ingredient_categories` | Categorize ingredients (Protein, Dairy, Herb, etc.) | Seeded, no UI |
| `occasion_types` | When a dish fits (Everyday Lunch, Sharing, Celebration, etc.) | Seeded, dropped from menu_items in migration 002 |
| `pantry_expression_types` | How a pantry product appears in a dish (Hero, Supporting, Finishing, Hidden) | Seeded, dropped from menu_items in migration 002 |
| `experience_dimensions` | The original 5-dimension scoring model (1–10 scale) | Replaced by 1–5 FF/FD in migration 002 |
| `texture_identities` | Texture vocabulary (Crispy, Tender, Creamy, etc.) | Seeded, not exposed in menu item form |
| `ingredients` | Full ingredient library | Empty, no UI |
| `recipe_ingredients` | Junction: menu items → ingredients with quantity/unit/function | Empty, no UI |

---

## Relationships

```
identity_principles         (editorial criteria — no FK, used as evaluation lens)

menu_categories             ← menu_items.category (text name, not UUID FK)
flavor_identities           ← menu_items.primary_flavor_identity (text name)
                            ← menu_items.secondary_flavor_identities (text[])
                            ← pantry_items.flavor_contributions (text[])
strategic_roles             ← menu_items.strategic_roles (text[])

menu_items ──────────────── menu_item_pantry_links ──────────── pantry_items
                            (UUID FK both sides)

Intelligence layer:

rd_briefs
    └── rd_concepts (brief_id FK, cascade delete)
            └── rd_recipes (concept_id FK, cascade delete)
```

**Denormalization note:** `category`, `primary_flavor_identity`, `secondary_flavor_identities`, and `strategic_roles` on `menu_items` all store names as plain text rather than UUID foreign keys. This was a v1 simplification — it keeps queries readable and the forms simple, but means renaming a category or role requires updating all menu item records. For the current scale (22 dishes) this is fine.

---

## The FF / FD Matrix

Every menu item is scored on two dimensions (1–5 each):

- **Format Familiarity (FF):** How recognisable is the dish format? 1 = unfamiliar, 5 = immediately understood.
- **Flavor Discovery (FD):** How adventurous is the flavor profile? 1 = safe and expected, 5 = challenging and novel.

This creates a 2-axis positioning map for the menu:

```
        FD (Flavor Discovery)
        1 ──────────────── 5
FF 1 │  Unfamiliar format,   Unfamiliar format,
     │  safe flavor          adventurous flavor
     │
FF 5 │  Familiar format,     Familiar format,
     │  safe flavor          adventurous flavor
        (comfort zone)       (discovery zone — Salted Olive sweet spot)
```

The Salted Olive sweet spot is **high FF + moderate-to-high FD**: guests feel safe ordering (familiar format) while the pantry products deliver unexpected flavor. This matrix is the primary tool for assessing menu balance and identifying where new concepts should be positioned.

---

## Intelligence Model (Phase 2 Foundation)

The data as structured enables the following AI-assisted queries and reasoning:

**Pantry ecosystem analysis**
- Which menu items use a given pantry product? → `menu_item_pantry_links`
- Which pantry products are underutilised (only appear on 1–2 dishes)? → count via junction table
- What flavor territory does each pantry product occupy? → `pantry_items.flavor_contributions`
- What does a pantry product pair well with? → `pantry_items.best_pairings`

**Menu balance analysis**
- What is the distribution of dishes across strategic roles? → `menu_items.strategic_roles`
- Where do current dishes sit on the FF/FD matrix? → `format_familiarity` × `flavor_discovery`
- Are there under-represented categories? → `menu_items.category` distribution
- Does the menu have enough Brand Drivers? Margin Drivers? → role count by category

**Concept generation**
- Given a target pantry product, which flavor zones could the dish explore? → pantry `flavor_contributions` → compatible `flavor_identities`
- Given a target FF/FD position, which existing dishes already occupy that space? → matrix proximity
- Does this concept satisfy Level 1 principles? → evaluate against `identity_principles` (Level 1 category)
- What strategic role is this concept filling? → compare to current role distribution gap

**Flavor network**
- Which flavors appear most frequently across the menu? → `flavor_identities` frequency
- Which flavor combinations recur? → `primary_flavor_identity` × `secondary_flavor_identities` patterns
- Are there untapped flavor territories? → gaps in the taxonomy not represented on current menu

---

## Current Data Snapshot

| Entity | Count |
|---|---|
| Menu items (active) | 22 |
| Pantry items | 6 |
| Identity principles | 12 (4 × L1, 5 × L2, 3 × L3) |
| Strategic roles | 4 (Revenue, Margin, Brand, VIP) |
| Menu categories | 7 |
| Flavor identities | 16 (shared across menu and pantry) |

---

## Known Gaps

These are limitations in the current data model that are relevant for Phase 2 planning:

1. **Pantry library is small.** 6 items covers the core, but the intelligence model benefits from a richer pantry — more products means more combinatorial signal. Items like Amba Sauce, Harissa, and future seasonal products should be added as they become signature.

2. **No occasion or shareability signal.** `occasion_types` and shareability were dropped from menu items in migration 002. The FF/FD matrix partially covers this but doesn't capture "this is a sharing dish" explicitly.

3. **No concept/R&D notes field that's structured.** `notes` exists but is free text. A structured `rd_stage` field (e.g. `idea`, `tested`, `refined`, `active`) would make the pipeline queryable.

4. **`best_pairings` and `example_applications` are text arrays, not structured links.** They name ingredients and dishes as free text. Phase 2 could benefit from linking `best_pairings` to actual `menu_items` or ingredient records.
