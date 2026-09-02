-- Migration 042: Fix POS alias mapping in sales_items
-- Updates menu_item_id on sales_items where raw_dish_name didn't match
-- at import time — either due to name differences or timing (dish added
-- to menu_items after the sales data was imported).
-- Drinks are excluded — no menu_items exist for them yet.

-- Exact name matches (sold before menu_item was linked)
UPDATE sales_items SET menu_item_id = '1c84110b-f2bd-4698-9235-806fb0479603'
  WHERE menu_item_id IS NULL AND raw_dish_name = 'Beef Kofta Pockets';

UPDATE sales_items SET menu_item_id = '8b5fe7a8-5096-4160-810e-e17c439cc941'
  WHERE menu_item_id IS NULL AND raw_dish_name = 'Fattoush Salad';

UPDATE sales_items SET menu_item_id = '6f7305e6-b4bc-405b-8754-91b0d6d39091'
  WHERE menu_item_id IS NULL AND raw_dish_name = 'Hummus Mushroom';

UPDATE sales_items SET menu_item_id = '29b80682-092e-41a3-b5a7-90aba1c70515'
  WHERE menu_item_id IS NULL AND raw_dish_name = 'Mediterranean Potato Gratin';

UPDATE sales_items SET menu_item_id = '5c36d2c3-7f3d-4535-b736-b6a652bace68'
  WHERE menu_item_id IS NULL AND raw_dish_name = 'Pak Chandra''s Hummus';

UPDATE sales_items SET menu_item_id = '11111111-0000-0000-0000-000000000001'
  WHERE menu_item_id IS NULL AND raw_dish_name = 'Pita Chips';

UPDATE sales_items SET menu_item_id = '8a8de6f0-80da-49c7-a1de-463267c1263b'
  WHERE menu_item_id IS NULL AND raw_dish_name = 'Rice Pilaf';

UPDATE sales_items SET menu_item_id = '398e6936-793e-46af-843d-de86f9fe2e92'
  WHERE menu_item_id IS NULL AND raw_dish_name = 'Roasted Lamb';

UPDATE sales_items SET menu_item_id = 'ded99337-c58b-4bb0-aae5-5503dce2c868'
  WHERE menu_item_id IS NULL AND raw_dish_name = 'Spicy Harissa Meatballs';

UPDATE sales_items SET menu_item_id = 'b8a51a8f-9267-4175-beef-a375cad42112'
  WHERE menu_item_id IS NULL AND raw_dish_name = 'Tahini Date Cake';

-- POS name mismatches → correct menu_item
UPDATE sales_items SET menu_item_id = '537e853b-25ad-4dcb-98dd-75a80e65541f'
  WHERE menu_item_id IS NULL AND raw_dish_name = 'Creamy Spinach Dip';

UPDATE sales_items SET menu_item_id = '8a8de6f0-80da-49c7-a1de-463267c1263b'
  WHERE menu_item_id IS NULL AND raw_dish_name = 'Pilaf Rice';

UPDATE sales_items SET menu_item_id = '6f7305e6-b4bc-405b-8754-91b0d6d39091'
  WHERE menu_item_id IS NULL AND raw_dish_name = 'Mushroom Humus';

UPDATE sales_items SET menu_item_id = 'd8e2dc51-a7a9-4e2f-8127-9518a81a8185'
  WHERE menu_item_id IS NULL AND raw_dish_name = 'Salted Olive Dip';

-- Historical items (now inactive/concept — still valid to link for historical accuracy)
UPDATE sales_items SET menu_item_id = '85b8b766-19c7-4f8c-a17a-e0e02c89a964'
  WHERE menu_item_id IS NULL AND raw_dish_name = 'Burghul Salad';

UPDATE sales_items SET menu_item_id = 'd3238943-17a2-4201-84f6-00991bdff157'
  WHERE menu_item_id IS NULL AND raw_dish_name = 'Cod Falafel Pockets';

UPDATE sales_items SET menu_item_id = '86d75f8c-32de-4ab6-89a7-1463d144ad0a'
  WHERE menu_item_id IS NULL AND raw_dish_name = 'Lamb Stew';

-- Not mapped (no menu_item exists):
-- 'OMNIKOPI''S KLEPON LAVA CAKE' — external collab dish
-- 'Corkage'                       — not a menu item
-- All drink items                  — pending migration 043
