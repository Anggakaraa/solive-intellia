# Salted Olive Intelligence — Architecture & Roadmap

This document covers the design of the AI recommendation system: how it works now, how it is designed to evolve, and what is explicitly out of scope for the current milestone.

---

## Current Milestone

**Goal:** Validate that the recommendation engine consistently generates useful, differentiated, prototype-worthy concepts.

This is not an intelligence platform yet. It is a concept generation tool. Every architectural decision at this stage should optimise for recommendation quality and testing velocity — not for future capabilities.

---

## 1. Concept Generation — Current Architecture

### Overview

A user submits an R&D Brief through a structured form. Clicking "Generate Concepts" calls the AI, which returns structured concept data saved directly to the database.

### Request Flow

```
User clicks "Generate Concepts"
  → POST /api/generate-concepts { briefId }
  → Fetch rd_briefs WHERE id = briefId
  → Build prompt (system prompt + brief message)
  → Claude API call (tool use, claude-sonnet-4-6)
  → Extract save_concepts tool call result
  → Insert rows into rd_concepts
  → Update rd_briefs.output_data (narrative, recommendation, collection_name)
  → Return { success: true }
  → Client redirects to /brief/[id]/output
```

### Prompt Architecture

The prompt is split into two parts:

**System Prompt** (`src/lib/ai/system-prompt.ts`) — static, sent on every call
- Salted Olive identity and role definition
- Exploration mode behavior (Safe / Balanced / Exploratory)
- Generation mode behavior (Full / Fast)
- Thinking hierarchy (Level 1: Dish Principles → ... → Level 6: Pantry Knowledge)
- Dish Principles (non-negotiable)
- Menu Principles (collective standards)
- Strategic roles (Revenue / Margin / Brand / VIP Driver)
- FF/FD matrix explanation
- Active pantry assets (currently hardcoded — see Roadmap for planned migration)
- Existing menu (currently hardcoded — see Roadmap for planned migration)
- Key gaps (currently hardcoded — derived by LLM from menu data in future)
- Menu collection behavior
- Concept evaluation checklist
- Behavioral guardrails
- Output instruction (tool use only, no prose)

**User Message** (built dynamically per request in `buildBriefMessage`)
- Brief type (Single Dish / Menu Collection)
- Category or menu theme
- Menu composition (if collection)
- Strategic roles
- FF / FD scores
- Pantry assets to feature
- Opportunity
- Creative references
- Desired guest feeling
- Constraints
- Exploration mode
- Generation mode

### Output Method

Claude is forced to call the `save_concepts` tool via `tool_choice: { type: 'any' }`. This guarantees structured JSON output matching the concept schema — no parsing, no extraction, no risk of hallucinated format.

The tool schema matches the `rd_concepts` table shape:
- `concept_name`, `one_line`
- `breakdown` (hero, flavor_drivers, textures, key_contrast) — optional in Fast mode
- `presentation` — optional in Fast mode
- `why_it_could_win` (menu_gap, emotional_trigger, salted_olive)
- `feasibility` (assets_leveraged, watchouts) — optional in Fast mode
- `experiment_focus` (array)
- Top-level: `narrative`, `recommendation` (dish), `collection_name` (collection)

### Token Budget (current scale)

| Component | Approx. tokens |
|---|---|
| System prompt | ~2,200 |
| Brief data (user message) | ~300–500 |
| **Total input** | **~2,500–2,700** |
| Output — Full, 3 dish concepts | ~2,500–3,500 |
| Output — Fast, 3 dish concepts | ~800–1,200 |
| Output — Full, 4 collection concepts | ~3,500–5,000 |
| **Cost per call — Full (Sonnet 4.6)** | **~$0.05–0.08** |
| **Cost per call — Fast (Sonnet 4.6)** | **~$0.02–0.03** |

As the menu grows (e.g. to 50 items), the hardcoded menu section will add ~1,000 tokens. This is manageable without retrieval optimisation until 80–100+ items. See Roadmap section for the planned migration to live DB retrieval.

---

## 2. Brief Configuration

### Exploration Mode

Controls how closely the AI adheres to existing menu and operational constraints.

| Mode | Behavior |
|---|---|
| **Safe** | Must use pantry assets. Strong preference for Base Recipes. Prioritises operational feasibility. Optimises for immediate deployment. |
| **Balanced** (default) | Pantry-led when useful. Can stretch current territory. Balances practicality and novelty. |
| **Exploratory** | Dish Principles still apply. Pantry-led is optional. Can propose future assets. Can challenge menu assumptions. Focus on breakthrough thinking. |

### Generation Mode

Controls output depth.

| Mode | Output |
|---|---|
| **Full** (default) | Complete concept: name, one-liner, breakdown, presentation, why it could win, feasibility, experiment focus |
| **Fast** | Rapid ideation: name, one-liner, why it could win, experiment focus only. ~60% fewer output tokens. |

### Brief Type

| Type | AI Behavior |
|---|---|
| **Single Dish** | Generates 3 ranked alternatives. Includes recommendation strip identifying strongest concept. |
| **Menu Collection** | Generates 1 concept per requested dish. Establishes menu narrative first. Concepts designed as a coherent collection, not independent dishes. |

---

## 3. Data Model

### rd_briefs
Stores the brief input and AI output metadata.

Key fields:
- `brief_type`: `dish` | `menu_collection`
- `exploration_mode`: `safe` | `balanced` | `exploratory` (default: `balanced`)
- `generation_mode`: `full` | `fast` (default: `full`)
- `output_data` (jsonb): `{ narrative, recommendation, collection_name }` — written by the API after generation

### rd_concepts
One row per generated concept, linked to a brief.

Key fields:
- `status`: `generated` → `saved` → `testing` → `active` → `archived`
- `why_it_could_win` (jsonb): `{ menu_gap, emotional_trigger, salted_olive }`
- `breakdown` (jsonb): `{ hero, flavor_drivers, textures, key_contrast }`
- `feasibility` (jsonb): `{ assets_leveraged, watchouts }`
- `experiment_focus` (text array)

### saved_collections
Stores saved menu collections (user-triggered, not auto-created on generation).

### saved_collection_concepts
Junction table linking a collection to its concepts with `wave` and `wave_order`.

---

## 4. R&D Pipeline

Concepts move through these statuses:

```
generated → saved → testing → active → archived
```

- **generated**: AI output, not yet reviewed
- **saved**: User clicked "Save to menu items" — worth developing
- **testing**: In kitchen or guest testing
- **active**: On the menu
- **archived**: Dropped

---

## 5. Migrations

| File | Purpose |
|---|---|
| `021_concept_pipeline.sql` | Updates status constraints, adds saved_collections tables, migrates legacy statuses |
| `022_brief_output_data.sql` | Adds `output_data jsonb` column to rd_briefs |
| `023_brief_modes.sql` | Adds `exploration_mode` and `generation_mode` columns to rd_briefs |

All migrations must be run manually in the Supabase SQL editor in order.

---

## 6. Roadmap — Future Capabilities

The following are explicitly **not in scope** for the current milestone. Documented here for future reference.

### Dynamic Context Retrieval

**Current state:** Menu items and pantry assets are hardcoded in the system prompt as static text.

**Future state:** At query time, the context builder will:
1. Query `pantry_items WHERE status = 'active'` → format as pantry assets section
2. Query `menu_items WHERE status = 'active'` → format as existing menu section
3. Inject both into the user message (not the system prompt)

The system prompt becomes principles-only (~900 tokens, static). Live context grows with the catalogue but is always accurate.

**When to migrate:** When the menu reaches ~50+ active items, or when pantry assets change frequently enough that the hardcoded list becomes a maintenance burden.

**Gap analysis:** With live menu data injected, Claude derives gaps itself from the data — no separate gap document required. Strategic intent that can't be derived (e.g. "we're avoiding Pockets for kitchen reasons") can be stored in a `rd_strategy_notes` table and injected alongside.

---

### Gap Engine

A deterministic service that automatically calculates:
- Category gaps (items per category vs. target)
- Flavor territory gaps (distribution across flavor profiles)
- FF/FD distribution gaps (which quadrants are under/overrepresented)
- Pantry utilisation gaps (which assets appear on 0 or 1 dishes)
- Strategic role gaps (Revenue/Margin/Brand/VIP balance)

**Current approach:** LLM performs gap identification from the injected menu data. This is sufficient for current scale and avoids premature engineering.

**Future trigger:** When gap analysis needs to be surfaced outside of concept generation (e.g. dashboard, intelligence chat, automated reports).

---

### Intelligence Layer (Conversational)

A chat interface for open-ended R&D analysis outside of concept generation.

Capability areas:
- **Analyze** — menu gaps, pantry utilisation, FF/FD distribution
- **Evaluate** — assess a concept, menu, or collection against principles
- **Prioritize** — where to focus R&D effort
- **Learn** — synthesize patterns from prototype results and guest feedback

**Architecture when built:**
- Separate system prompt (capabilities framework, not generation-focused)
- Same context builder (live menu + pantry from Supabase)
- Streaming response (conversational feel)
- `prototype_results` table for accumulated learning
- Conversation history managed client-side, live context injected once per session
- Generate intent detected → hands off to brief form, not direct generation

**Current approach:** LLM-based concept generation serves as a proxy for the analysis capability. Analyze and Prioritize questions can be handled ad hoc in the brief's Opportunity field.

---

### Concept Memory

Persist and retrieve:
- Generated concepts and their briefs
- Prototype outcomes (kitchen test results, guest reactions)
- Launch decisions (why a concept was accepted or dropped)
- Feedback accumulation over time

**Current state:** Concepts are stored in `rd_concepts` with a pipeline status. Outcome capture (what happened in testing, why it was dropped) is not yet built.

**Future state:** `prototype_results` table linked to `rd_concepts`. AI retrieves relevant past learnings when generating new concepts in the same category or using the same pantry assets.

---

### Recipe Generation

Future workflow:
```
Brief → Concept Generation → Human Selection → Recipe Generation
```

Recipe generation is a separate AI call taking a selected concept as input and returning a structured prototype recipe with method, quantities, and plating notes.

**Current state:** The `/concepts/[id]/recipe` route and `rd_recipes` table exist as scaffolding. Not wired to the generation flow.

---

## 7. Success Criteria — Current Milestone

The current milestone succeeds when:

1. A brief can be submitted and concepts generated reliably end-to-end
2. Generated concepts are consistently useful, differentiated, and prototype-worthy — not generic
3. Concepts reflect Salted Olive's identity, pantry, and strategic context in every output
4. The save flow works: concepts can be saved, appear in Saved Items, and link to the concept detail
5. Exploration mode meaningfully changes the creative territory of output
6. Fast mode provides useful rapid ideation at lower cost

What is explicitly not measured at this stage: intelligence chat, gap analysis accuracy, concept memory, or recipe generation.
