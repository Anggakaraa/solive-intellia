-- Add pos_category to sales_items for collab/unmatched item categorisation
ALTER TABLE sales_items
  ADD COLUMN IF NOT EXISTS pos_category text;

-- Add Pita Chips as a menu item (Sides, active)
INSERT INTO menu_items (id, name, category, status)
VALUES ('11111111-0000-0000-0000-000000000001', 'Pita Chips', 'Sides', 'active')
ON CONFLICT (id) DO NOTHING;

-- Refresh category performance view to use pos_category for unmatched/collab items
CREATE OR REPLACE VIEW v_category_performance AS
SELECT
  COALESCE(mi.category, si.pos_category, 'Unmatched') AS category,
  SUM(si.revenue)  AS total_revenue,
  SUM(si.quantity) AS total_units,
  COUNT(DISTINCT si.menu_item_id) FILTER (WHERE si.menu_item_id IS NOT NULL) AS dish_count
FROM sales_items si
LEFT JOIN menu_items mi ON si.menu_item_id = mi.id
GROUP BY COALESCE(mi.category, si.pos_category, 'Unmatched');
