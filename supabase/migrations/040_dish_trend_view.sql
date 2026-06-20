-- ============================================================
-- migration 040: v_dish_trend view
--
-- Classifies each dish as trending_up / trending_down / stable
-- based on whether its share of total food units increased or
-- decreased over the last 4 months (3-of-4 rule).
--
-- Share (not raw units) is used so the trend is already normalized
-- against overall restaurant volume — a dish that's flat while
-- the restaurant grows is effectively declining.
--
-- Guards:
--   avg_monthly_units < 5  → insufficient_volume
--   window_size < 3        → insufficient_history (new dish)
-- ============================================================

CREATE OR REPLACE VIEW v_dish_trend AS
WITH

-- Monthly units per matched food dish
monthly_dish AS (
  SELECT
    mi.id                              AS menu_item_id,
    mi.name                            AS dish_name,
    mi.category,
    DATE_TRUNC('month', t.date)::date  AS month,
    SUM(si.quantity)                   AS units
  FROM   sales_items si
  JOIN   sales_transactions t ON t.id = si.transaction_id
  JOIN   menu_items mi        ON mi.id = si.menu_item_id
  GROUP  BY mi.id, mi.name, mi.category, DATE_TRUNC('month', t.date)
),

-- Monthly restaurant total (food only — excludes beverages by pos_category)
monthly_total AS (
  SELECT
    DATE_TRUNC('month', t.date)::date  AS month,
    SUM(si.quantity)                   AS total_units
  FROM   sales_items si
  JOIN   sales_transactions t ON t.id = si.transaction_id
  WHERE  si.pos_category NOT IN ('Coffee','Artisan Tea','Tea','Refreshers','Drinks','Tidak Berkategori')
  GROUP  BY DATE_TRUNC('month', t.date)
),

-- Dish share of restaurant food total per month
monthly_share AS (
  SELECT
    d.menu_item_id,
    d.dish_name,
    d.category,
    d.month,
    d.units,
    d.units::float / NULLIF(r.total_units, 0)  AS share
  FROM   monthly_dish d
  JOIN   monthly_total r ON r.month = d.month
),

-- Month-over-month direction of share change (+1 up, -1 down, 0 flat)
monthly_direction AS (
  SELECT
    *,
    SIGN(
      share - LAG(share) OVER (PARTITION BY menu_item_id ORDER BY month)
    )::int  AS direction
  FROM monthly_share
),

-- Keep only the 4 most recent direction readings per dish
last4 AS (
  SELECT *
  FROM (
    SELECT
      *,
      ROW_NUMBER() OVER (PARTITION BY menu_item_id ORDER BY month DESC) AS rn
    FROM monthly_direction
    WHERE direction IS NOT NULL
  ) ranked
  WHERE rn <= 4
),

-- Overall stats across all months (for avg volume and history length)
overall AS (
  SELECT
    menu_item_id,
    ROUND(AVG(units))  AS avg_monthly_units,
    COUNT(*)           AS total_months
  FROM monthly_dish
  GROUP BY menu_item_id
),

trend_calc AS (
  SELECT
    l.menu_item_id,
    l.dish_name,
    l.category,
    o.total_months,
    o.avg_monthly_units,
    COUNT(*)                                              AS window_size,
    SUM(CASE WHEN l.direction =  1 THEN 1 ELSE 0 END)   AS up_count,
    SUM(CASE WHEN l.direction = -1 THEN 1 ELSE 0 END)   AS down_count,
    MAX(l.month)                                          AS latest_month,
    MAX(l.units) FILTER (WHERE l.rn = 1)                 AS latest_month_units
  FROM   last4 l
  JOIN   overall o ON o.menu_item_id = l.menu_item_id
  GROUP  BY l.menu_item_id, l.dish_name, l.category, o.total_months, o.avg_monthly_units
)

SELECT
  dish_name,
  category,
  total_months,
  avg_monthly_units,
  latest_month_units,
  up_count,
  down_count,
  window_size,
  CASE
    WHEN avg_monthly_units < 5  THEN 'insufficient_volume'
    WHEN window_size < 3        THEN 'insufficient_history'
    WHEN up_count >= 3          THEN 'trending_up'
    WHEN down_count >= 3        THEN 'trending_down'
    ELSE                             'stable'
  END  AS trend
FROM  trend_calc
ORDER BY
  CASE
    WHEN up_count >= 3   THEN 0
    WHEN down_count >= 3 THEN 1
    ELSE 2
  END,
  avg_monthly_units DESC;
