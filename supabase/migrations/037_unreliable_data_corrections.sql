-- ============================================================
-- migration 037: null out menu_item_id for unreliable sales data
--
-- Reason: POS system sometimes reuses a slot for a new menu item
-- without creating a new entry. This makes historical data for
-- that slot unreliable — it may refer to a different dish.
--
-- Fix: set menu_item_id = NULL for affected item + months before
-- introduction. Rows still count toward restaurant-level totals
-- (pos_category is preserved) but are excluded from per-dish analytics.
--
-- Source: team-verified introduction dates (provided 2026-06-20)
-- ============================================================

-- ── Introduced Oct 2025 — Sep 2025 data is unreliable ─────────────────────

UPDATE sales_items si
SET    menu_item_id = NULL
FROM   sales_transactions t
WHERE  si.transaction_id = t.id
  AND  si.menu_item_id   = 'd3238943-17a2-4201-84f6-00991bdff157' -- Cod Falafel Pockets
  AND  t.date            < '2025-10-01';

UPDATE sales_items si
SET    menu_item_id = NULL
FROM   sales_transactions t
WHERE  si.transaction_id = t.id
  AND  si.menu_item_id   = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' -- Veggie Tahini
  AND  t.date            < '2025-10-01';

UPDATE sales_items si
SET    menu_item_id = NULL
FROM   sales_transactions t
WHERE  si.transaction_id = t.id
  AND  si.menu_item_id   = '29b80682-092e-41a3-b5a7-90aba1c70515' -- Mediterranean Potato Gratin
  AND  t.date            < '2025-10-01';

UPDATE sales_items si
SET    menu_item_id = NULL
FROM   sales_transactions t
WHERE  si.transaction_id = t.id
  AND  si.menu_item_id   = '6f7305e6-b4bc-405b-8754-91b0d6d39091' -- Hummus Mushroom
  AND  t.date            < '2025-10-01';

UPDATE sales_items si
SET    menu_item_id = NULL
FROM   sales_transactions t
WHERE  si.transaction_id = t.id
  AND  si.menu_item_id   = 'b2c3d4e5-f6a7-8901-bcde-f12345678901' -- Lamb Pilaf
  AND  t.date            < '2025-10-01';

UPDATE sales_items si
SET    menu_item_id = NULL
FROM   sales_transactions t
WHERE  si.transaction_id = t.id
  AND  si.menu_item_id   = '1c84110b-f2bd-4698-9235-806fb0479603' -- Beef Kofta Pockets
  AND  t.date            < '2025-10-01';

UPDATE sales_items si
SET    menu_item_id = NULL
FROM   sales_transactions t
WHERE  si.transaction_id = t.id
  AND  si.menu_item_id   = '8b5fe7a8-5096-4160-810e-e17c439cc941' -- Fattoush Salad
  AND  t.date            < '2025-10-01';

UPDATE sales_items si
SET    menu_item_id = NULL
FROM   sales_transactions t
WHERE  si.transaction_id = t.id
  AND  si.menu_item_id   = '398e6936-793e-46af-843d-de86f9fe2e92' -- Roasted Lamb
  AND  t.date            < '2025-10-01';

-- ── Introduced Jan 2026 — Sep–Dec 2025 data is unreliable ─────────────────

UPDATE sales_items si
SET    menu_item_id = NULL
FROM   sales_transactions t
WHERE  si.transaction_id = t.id
  AND  si.menu_item_id   = '8a8de6f0-80da-49c7-a1de-463267c1263b' -- Rice Pilaf
  AND  t.date            < '2026-01-01';

UPDATE sales_items si
SET    menu_item_id = NULL
FROM   sales_transactions t
WHERE  si.transaction_id = t.id
  AND  si.menu_item_id   = '11111111-0000-0000-0000-000000000001' -- Pita Chips
  AND  t.date            < '2026-01-01';

UPDATE sales_items si
SET    menu_item_id = NULL
FROM   sales_transactions t
WHERE  si.transaction_id = t.id
  AND  si.menu_item_id   = 'ded99337-c58b-4bb0-aae5-5503dce2c868' -- Spicy Harissa Meatballs
  AND  t.date            < '2026-01-01';

UPDATE sales_items si
SET    menu_item_id = NULL
FROM   sales_transactions t
WHERE  si.transaction_id = t.id
  AND  si.menu_item_id   = '5c36d2c3-7f3d-4535-b736-b6a652bace68' -- Pak Chandra's Hummus
  AND  t.date            < '2026-01-01';

UPDATE sales_items si
SET    menu_item_id = NULL
FROM   sales_transactions t
WHERE  si.transaction_id = t.id
  AND  si.menu_item_id   = 'b8a51a8f-9267-4175-beef-a375cad42112' -- Tahini Date Cake
  AND  t.date            < '2026-01-01';

UPDATE sales_items si
SET    menu_item_id = NULL
FROM   sales_transactions t
WHERE  si.transaction_id = t.id
  AND  si.menu_item_id   = '537e853b-25ad-4dcb-98dd-75a80e65541f' -- Mediterranean Creamed Spinach
  AND  t.date            < '2026-01-01';

-- ── Introduced Mar 2026 — Sep 2025–Feb 2026 data is unreliable ────────────

UPDATE sales_items si
SET    menu_item_id = NULL
FROM   sales_transactions t
WHERE  si.transaction_id = t.id
  AND  si.menu_item_id   = '86d75f8c-32de-4ab6-89a7-1463d144ad0a' -- Lamb Stew
  AND  t.date            < '2026-03-01';

-- ── Introduced May 2026 — Sep 2025–Apr 2026 data is unreliable ────────────

UPDATE sales_items si
SET    menu_item_id = NULL
FROM   sales_transactions t
WHERE  si.transaction_id = t.id
  AND  si.menu_item_id   = '9e884b12-3b41-4bc3-8b64-43940f06f90d' -- Bistro Burger
  AND  t.date            < '2026-05-01';

-- ── Verify: run this after migration to see what changed ──────────────────
-- SELECT pos_category, raw_dish_name, COUNT(*) AS rows_nulled
-- FROM   sales_items
-- WHERE  menu_item_id IS NULL
--   AND  pos_category NOT IN ('Coffee','Artisan Tea','Tea','Refreshers','Drinks','Tidak Berkategori')
-- GROUP  BY pos_category, raw_dish_name
-- ORDER  BY pos_category, raw_dish_name;
