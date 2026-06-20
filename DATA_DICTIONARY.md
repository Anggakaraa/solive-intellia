# Solive Intellia — Data Dictionary

> **AI instruction:** Read this file at the start of any task that touches migrations, sales data, menu items, or UUIDs. Never derive UUIDs from memory — always read them from this file.

---

## 1. Schema Overview

### Core tables (001–011)
| Table | Purpose |
|---|---|
| `menu_items` | Central catalogue. Every dish, base recipe, and sales-tracked item lives here. |
| `pantry_items` | Ingredients / pantry building blocks. |
| `ingredients` | Raw ingredients (separate from pantry abstraction). |
| `identity_principles` | Strategic/philosophical principles for the restaurant. |
| `flavor_identities` | Shared flavor taxonomy (used by menu_items and pantry_items). |
| `menu_categories` | Reference table for valid menu categories. |

### R&D pipeline (012–029)
| Table | Purpose |
|---|---|
| `rd_briefs` | A brief is a strategic prompt for generating concepts. |
| `rd_concepts` | AI-generated concept outputs from a brief. Each records its `exploration_mode`. |
| `rd_recipes` | Execution-layer recipes derived from a concept. |

### Sales pipeline (030–039)
```
sales_imports → sales_transactions → sales_items → menu_items
```
| Table | Purpose |
|---|---|
| `sales_imports` | One row per xlsx file imported. Audit trail. |
| `sales_transactions` | One row per operating day per import. |
| `sales_items` | One row per dish per day. Links to `menu_item_id` (nullable). |
| `menu_item_aliases` | POS name → menu_item_id lookup table (currently unused after 032 refactor). |

### Key nullable FK
`sales_items.menu_item_id` is **nullable**. NULL means the item has no menu match (beverages, discontinued items, unresolved aliases). These rows still count toward restaurant-level totals but are excluded from per-dish analytics.

### Views
- `v_dish_performance` — aggregates sales_items joined to menu_items
- `v_category_performance` — aggregates by `COALESCE(mi.category, si.pos_category, 'Unmatched')`

---

## 2. Hardcoded Menu Item UUIDs

> These items were inserted with explicit UUIDs in migrations. **Always use these exact values.** Never generate new UUIDs for these items.

### Sales-tracked food items (from migrations 031–039)

| Name | UUID | Category | Status | Price (IDR) | COGS (IDR) |
|---|---|---|---|---|---|
| Pita Chips | `11111111-0000-0000-0000-000000000001` | Sides | active | 30,000 | 4,461 |
| Beef Kofta Pockets | `1c84110b-f2bd-4698-9235-806fb0479603` | Pockets | active | 60,000 | 24,651 |
| Caramelized Carrots | `4685c982-9a9e-4b15-9326-fb30b3cb8d2f` | Vegetables & More | active | 55,000 | 19,747 |
| Cod Falafel Pockets | `d3238943-17a2-4201-84f6-00991bdff157` | Pockets | inactive | 60,000 | 22,964 |
| Fattoush Salad | `8b5fe7a8-5096-4160-810e-e17c439cc941` | Vegetables & More | active | 35,000 | 13,528 |
| Fried Feta Roll | `15e1ab7e-e72c-41a5-9ce4-8eca1f49052c` | Vegetables & More | active | 45,000 | 24,049 |
| Grilled Beef Cheek | `19e5fa3d-9544-4049-a6b3-2bdf5ee2c1e7` | Large Plates | active | 120,000 | 54,597 |
| Grilled Steak Cube | `c426fab6-bab2-433c-9716-e35feed13425` | Large Plates | active | 120,000 | 58,578 |
| House Made Pita Bread | `e3cb0f55-18b8-4860-b5eb-5f8eb49e6da2` | Sides | active | 30,000 | 2,490 |
| Hummus Mushroom | `6f7305e6-b4bc-405b-8754-91b0d6d39091` | Dips | active | 45,000 | 15,521 |
| Kunafa Cheese Bake | `d3e7b823-6ba7-4671-911d-9f3d6b07a7f0` | Desserts | active | 65,000 | 24,846 |
| Lamb Arayes | `d25e00e5-d0b5-4905-966b-2e343ee5b644` | Pockets | active | 60,000 | 21,586 |
| Lamb Stew | `86d75f8c-32de-4ab6-89a7-1463d144ad0a` | Large Plates | active | 150,000 | 82,917 |
| Mediterranean Creamed Spinach | `537e853b-25ad-4dcb-98dd-75a80e65541f` | Sides | active | 50,000 | 11,084 |
| Mediterranean Potato Gratin | `29b80682-092e-41a3-b5a7-90aba1c70515` | Sides | active | 40,000 | 19,247 |
| Muhammara | `0849159d-f0cd-4b46-b90c-b5fecba225df` | Dips | active | 40,000 | 23,088 |
| Pak Chandra's Hummus | `5c36d2c3-7f3d-4535-b736-b6a652bace68` | Dips | active | 45,000 | 12,824 |
| Pistachio Crème Brûlée | `456b1cc1-b333-4ad0-8e9c-2cc66e0c76f8` | Desserts | active | 55,000 | 25,100 |
| Rice Pilaf | `8a8de6f0-80da-49c7-a1de-463267c1263b` | Sides | active | 30,000 | 7,835 |
| Roast Chicken | `684d368a-11c3-48ef-a7ac-485474fb170f` | Large Plates | active | 150,000 | 26,304 |
| Roasted Eggplant | `ff873ee1-3f3a-45f5-868e-70e3dd04e07e` | Large Plates | active | 65,000 | 28,311 |
| Roasted Lamb | `398e6936-793e-46af-843d-de86f9fe2e92` | Large Plates | active | 150,000 | 67,454 |
| Salted Olive Hummus | `d8e2dc51-a7a9-4e2f-8127-9518a81a8185` | Dips | active | 40,000 | 15,107 |
| Sous Vide Potato Fries | `42df6a8b-fc41-4a41-aefe-a6ed2f7eda3c` | Sides | active | 30,000 | 8,768 |
| Spicy Harissa Meatballs | `ded99337-c58b-4bb0-aae5-5503dce2c868` | Large Plates | active | 120,000 | 41,139 |
| Tahini Date Cake | `b8a51a8f-9267-4175-beef-a375cad42112` | Desserts | active | 55,000 | 15,765 |
| Watermelon Salad | `a32d2ad4-0ac0-40e1-978b-57e3ed9230d7` | Vegetables & More | active | 35,000 | 20,402 |
| Bistro Burger | `9e884b12-3b41-4bc3-8b64-43940f06f90d` | Large Plates | inactive | 90,000 | 46,715 |
| **Veggie Tahini** | `a1b2c3d4-e5f6-7890-abcd-ef1234567890` | Dips | inactive | 40,000 | 16,417 |
| **Lamb Pilaf** | `b2c3d4e5-f6a7-8901-bcde-f12345678901` | Large Plates | inactive | 250,000 | 91,818 |

### Items with dynamic UUIDs (seeded via gen_random_uuid)
> These exist in the DB but their UUID is unknown from migrations alone. Use a subquery: `(SELECT id FROM menu_items WHERE name = '...')`

- `Seared Gindara` — Large Plates, inactive
- `Arabic Rice with Vermicelli` — Sides/Base Recipes, inactive

---

## 3. POS Alias Map

> POS names from xlsx exports → canonical menu_item name used in sales_items.raw_dish_name

| POS name (xlsx) | Canonical name | Notes |
|---|---|---|
| `Beef Kofta Pockets` | Beef Kofta Pockets | — |
| `Caramelized Carrots , Vegetarian Nduja Sauce` | Caramelized Carrots | — |
| `Cod Falafel Pockets` | Cod Falafel Pockets | — |
| `Fattoush Salad` | Fattoush Salad | — |
| `Fried Feta Rolls , Spiced Honey` | Fried Feta Roll | — |
| `Grilled Beef Cheeks` / `Grilled Beef Cheek` | Grilled Beef Cheek | Both POS variants map to same item |
| `Grilled Steak Cubes , Spicy Chimicurri` | Grilled Steak Cube | — |
| `House-Made Pita Bread` | House Made Pita Bread | — |
| `Kunafa Cheese Bake` | Kunafa Cheese Bake | — |
| `Lamb Arayes Pockets , Herbed Yogurt Sauce` | Lamb Arayes | — |
| `Mediterranean Potato Gratin` | Mediterranean Potato Gratin | — |
| `Muhamarra (walnut paprika)` | Muhammara | — |
| `Mushroom Humus` | Hummus Mushroom | — |
| `Pak Chandra's Hummus` | Pak Chandra's Hummus | — |
| `Pilaf Rice` | Rice Pilaf | — |
| `Pistachio Creme Brulee` | Pistachio Crème Brûlée | — |
| `Roasted Chicken , ... Half` | Roast Chicken | Half + Whole variants **summed** per day |
| `Roasted Chicken , ... Whole` | Roast Chicken | Half + Whole variants **summed** per day |
| `Roasted Egg Plant , Spiced Honey , Strained Yogurt` | Roasted Eggplant | — |
| `Roasted Lamb` | Roasted Lamb | — |
| `Salted Olive Hummus` | Salted Olive Hummus | — |
| `Sous-Vide Potato Fries` | Sous Vide Potato Fries | — |
| `Spicy Harissa Meatballs` | Spicy Harissa Meatballs | — |
| `Tahini Date Cake` | Tahini Date Cake | — |
| `Watermelon Salad , Mint , Strained Yogurt` | Watermelon Salad | — |
| `Veggie Tahini` | Veggie Tahini | — |
| `Lamb Pilaf (2-3 Persons)` | Lamb Pilaf | — |
| `Gindara , Pistachio Dukkah Crust , Herbed Butter Sauce` | Seared Gindara | Use subquery — dynamic UUID |
| `Herbed Vermicelli Rice` | Arabic Rice with Vermicelli | Use subquery — dynamic UUID |

### Beverages / misc → NULL menu_item_id (keep original pos_category)
Artisan Tea, Coffee, Tea, Refreshers, Drinks categories → all NULL.
CORKAGE → NULL, pos_category = 'Tidak Berkategori'.

---

## 4. Sales Data Coverage

| Migration | Period | Dishes (food) | Units (food) | Notes |
|---|---|---|---|---|
| 032 | Mar 2026, Apr 2026, May 2026 | 27, 25, 26 | 2719, 1863, 2330 | **Has TRUNCATE at top** — safe to re-run |
| 035 | Dec 2025, Jan 2026, Feb 2026 | 24, 25, 27 | 2053, 2688, 2236 | Append-only. Also sets Cod Falafel pricing. |
| 036 | Sep 2025, Oct 2025, Nov 2025 | 41, 41, 40 | 3071, 2929, 1918 | Append-only. Includes beverages (NULL). Creates Veggie Tahini + Lamb Pilaf items. |
| 039 | May 2025, Jun 2025 (partial: to 2025-06-25), Jul 2025, Aug 2025 | 37, 37, 46, 40 | 5481, 3002, 4075, 3414 | Append-only. Late-introduced items inserted with NULL menu_item_id directly (no correction migration needed). |

> **Total coverage:** May 2025 → May 2026 (13 months, Jun partial). Restaurant opened Feb 2025 — Feb–Apr 2025 data pending team reliability check.

### Menu item introduction dates (for unreliable data corrections)
If a future data batch includes months before these dates, the corresponding item's `menu_item_id` must be NULLed in a new migration — do not retroactively edit 037.

| Item | Introduced | Unreliable before |
|---|---|---|
| Cod Falafel Pockets | Oct 2025 | 2025-10-01 |
| Veggie Tahini | Oct 2025 | 2025-10-01 |
| Mediterranean Potato Gratin | Oct 2025 | 2025-10-01 |
| Hummus Mushroom | Oct 2025 | 2025-10-01 |
| Lamb Pilaf | Oct 2025 | 2025-10-01 |
| Beef Kofta Pockets | Oct 2025 | 2025-10-01 |
| Fattoush Salad | Oct 2025 | 2025-10-01 |
| Roasted Lamb | Oct 2025 | 2025-10-01 |
| Rice Pilaf | Jan 2026 | 2026-01-01 |
| Pita Chips | Jan 2026 | 2026-01-01 |
| Spicy Harissa Meatballs | Jan 2026 | 2026-01-01 |
| Pak Chandra's Hummus | Jan 2026 | 2026-01-01 |
| Tahini Date Cake | Jan 2026 | 2026-01-01 |
| Mediterranean Creamed Spinach | Jan 2026 | 2026-01-01 |
| Lamb Stew | Mar 2026 | 2026-03-01 |
| Bistro Burger | May 2026 | 2026-05-01 |

> **Rule:** Migrations 035 and 036 are append-only. **Never add TRUNCATE to them.** Only 032 truncates (and only because it was the first load and needed to be idempotent).

---

## 5. Migration Log

| # | File | What it does |
|---|---|---|
| 001 | `initial_schema` | Creates all core tables: menu_items, pantry_items, ingredients, identity_principles, flavor_identities, etc. |
| 002 | `schema_revision` | Renames hero_ingredient → hero_component; adds columns to menu_items. |
| 003 | `pantry_revision` | Adds pantry_flavor_contributions table; revises pantry schema. |
| 004 | `principles_revision` | Adds question + examples columns to identity_principles. |
| 005 | `principles_level2_3` | Seeds Level 2 and Level 3 identity principles. |
| 006 | `menu_items_seed` | Seeds 22 menu items from Menu Items Solive.xlsx (dynamic UUIDs). |
| 007 | `pantry_items_seed` | Seeds core pantry items. |
| 008 | `pantry_links_and_array_fields` | Junction table for pantry_items_used; converts array fields. |
| 009 | `unify_flavor_vocabulary` | Merges pantry and menu flavor taxonomy into flavor_identities. |
| 010 | `inspiration_category_and_pantry_category` | Adds Inspiration to menu categories; pantry categories. |
| 011 | `status_inspiration_and_pantry_status` | Moves Inspiration from category to status; adds pantry status. |
| 012 | `rd_briefs` | Creates rd_briefs table (R&D intelligence layer). |
| 013 | `rd_concepts` | Creates rd_concepts table. |
| 014 | `rd_recipes` | Creates rd_recipes table. |
| 015 | `rd_briefs_menu_type` | Adds brief_type and menu_theme to rd_briefs. |
| 016 | `umami_and_base_recipes_category` | Adds Umami flavor; Base Recipes menu category. |
| 017 | `pantry_items_batch2` | Seeds pantry items batch 2. |
| 018 | `base_recipes_menu_items` | Seeds 10 base recipe menu items (dynamic UUIDs, incl. Arabic Rice with Vermicelli). |
| 019 | `base_recipes_menu_items_batch2` | Seeds 10 more base recipe items. |
| 020 | `update_level1_principles` | Replaces Level 1 Dish Principles content. |
| 021 | `concept_pipeline` | Updates rd_concepts status values; adds saved_collections. |
| 022 | `brief_output_data` | Adds output_data (jsonb) to rd_briefs. |
| 023 | `brief_modes` | Adds exploration_mode + generation_mode to rd_briefs. |
| 024 | `collection_format` | Adds collection_format to rd_briefs. |
| 025 | `dish_principles_remove_pantry_led` | Removes Pantry-Led from Level 1 principles; updates remaining 4. |
| 026 | `pantry_items_batch3` | Seeds pantry items batch 3. |
| 027 | `menu_items_batch3` | Adds 20 menu items batch 3 (dynamic UUIDs, incl. Seared Gindara). |
| 028 | `base_recipes_batch3` | Adds base recipe items batch 3. |
| 029 | `concept_exploration_mode` | Adds exploration_mode to rd_concepts (moved from brief level). |
| 030 | `sales_data` | Creates sales_imports, sales_transactions, sales_items, menu_item_aliases tables + views. |
| 031 | `sales_schema_additions` | Adds pos_category to sales_items. Inserts Pita Chips (hardcoded UUID `11111111-0000-0000-0000-000000000001`). |
| 032 | `sales_data_insert` | **TRUNCATES** then inserts Mar/Apr/May 2026 data + 19 aliases. |
| 033 | `menu_item_pricing` | Adds unit_price + cost_per_unit to menu_items. Sets **mock** prices (superseded by 034). |
| 034 | `real_menu_pricing` | Sets **real** prices for 27 dishes (provided 2026-06-20). Supersedes 033. |
| 035 | `sales_dec25_feb26` | Append-only: Dec 2025, Jan 2026, Feb 2026 data. Also sets Cod Falafel pricing. |
| 036 | `sales_sep_oct_nov25` | Append-only: Sep/Oct/Nov 2025 data (incl. beverages as NULL). Creates Veggie Tahini + Lamb Pilaf items. |
| 037 | `unreliable_data_corrections` | NULLs out menu_item_id for 16 items in months before their introduction date (team-verified 2026-06-20). See introduction dates table below. |
| 038 | `fix_klepon_category` | Fixes OMNIKOPI'S KLEPON LAVA CAKE mis-categorized as 'Dips' in POS → corrected to 'Desserts'. |
| 039 | `sales_may_aug25` | Append-only: May/Jun/Jul/Aug 2025 data. Jun partial (to 2025-06-25). Items introduced after Aug 2025 inserted with NULL menu_item_id at write time — no correction migration needed. |

---

## 6. Verification Queries

Run these in Supabase SQL editor after any sales migration.

### V1 — Monthly unit totals (quick sanity check)
```sql
SELECT
  i.source_filename,
  i.date_from,
  i.date_to,
  COUNT(DISTINCT t.id)          AS days_with_data,
  SUM(si.quantity)              AS total_units,
  SUM(CASE WHEN si.menu_item_id IS NOT NULL THEN si.quantity ELSE 0 END) AS food_units,
  SUM(CASE WHEN si.menu_item_id IS NULL     THEN si.quantity ELSE 0 END) AS bev_misc_units
FROM sales_imports i
JOIN sales_transactions t  ON t.import_id     = i.id
JOIN sales_items       si ON si.transaction_id = t.id
GROUP BY i.id, i.source_filename, i.date_from, i.date_to
ORDER BY i.date_from;
```

### V2 — NULL menu_item_id items (what's unmatched — should only be beverages + known misc)
```sql
SELECT DISTINCT
  si.raw_dish_name,
  si.pos_category,
  SUM(si.quantity) AS total_units
FROM sales_items si
WHERE si.menu_item_id IS NULL
GROUP BY si.raw_dish_name, si.pos_category
ORDER BY si.pos_category, si.raw_dish_name;
```

### V3 — Menu items with pricing gaps (should return 0 rows for tracked items)
```sql
SELECT id, name, category, status
FROM menu_items
WHERE status IN ('active', 'inactive')
  AND (unit_price IS NULL OR cost_per_unit IS NULL)
  AND id IN (SELECT DISTINCT menu_item_id FROM sales_items WHERE menu_item_id IS NOT NULL);
```

### V4 — Top dishes by month (business logic spot check)
```sql
SELECT
  TO_CHAR(t.date, 'YYYY-MM')   AS month,
  mi.name,
  SUM(si.quantity)              AS units
FROM sales_items si
JOIN sales_transactions t ON t.id = si.transaction_id
JOIN menu_items mi         ON mi.id = si.menu_item_id
GROUP BY 1, mi.name
ORDER BY 1, units DESC;
```
