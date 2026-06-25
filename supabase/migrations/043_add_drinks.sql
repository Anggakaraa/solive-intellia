-- Migration 043: Add drinks to menu_items and link historical sales
-- Prices confirmed by operator. Costs are estimated using standard
-- beverage margin benchmarks (water ~75%, coffee ~65%, teas/refreshers ~70%).

INSERT INTO menu_items (id, name, category, status, unit_price, cost_per_unit)
VALUES
  (uuid_generate_v4(), 'Mineral Water (Still)',              'Drinks', 'active', 20000,  5000),
  (uuid_generate_v4(), 'Iced Tea',                          'Drinks', 'active', 30000,  9000),
  (uuid_generate_v4(), 'Honey Lemon Spritz',                'Drinks', 'active', 35000, 10500),
  (uuid_generate_v4(), 'Ginger Beer',                       'Drinks', 'active', 35000, 10500),
  (uuid_generate_v4(), 'Mineral Water (Sparkling)',          'Drinks', 'active', 25000,  6000),
  (uuid_generate_v4(), 'Cucumber Spritz',                   'Drinks', 'active', 35000, 10500),
  (uuid_generate_v4(), 'Caramel Tea',                       'Drinks', 'active', 30000,  9000),
  (uuid_generate_v4(), 'Americano Iced',                    'Drinks', 'active', 30000, 10500),
  (uuid_generate_v4(), 'Floral Tea',                        'Drinks', 'active', 30000,  9000),
  (uuid_generate_v4(), 'Cafe Latte Iced',                   'Drinks', 'active', 30000, 10500),
  (uuid_generate_v4(), 'Aqua Reflection Still',             'Drinks', 'active', 25000,  6000),
  (uuid_generate_v4(), 'Blended Watermelon Yogurt',         'Drinks', 'active', 40000, 12000),
  (uuid_generate_v4(), 'Hot Caramel Tea',                   'Drinks', 'active', 30000,  9000),
  (uuid_generate_v4(), 'Americano Hot',                     'Drinks', 'active', 30000, 10500),
  (uuid_generate_v4(), 'Cinnamon and Star Anise Lemonade',  'Drinks', 'active', 35000, 10500),
  (uuid_generate_v4(), 'Hot Royal Bloom Tea',               'Drinks', 'active', 30000,  9000),
  (uuid_generate_v4(), 'Aqua Reflection Sparkling',         'Drinks', 'active', 30000,  7500),
  (uuid_generate_v4(), 'Cappuccino Iced',                   'Drinks', 'active', 35000, 12000),
  (uuid_generate_v4(), 'Cappuccino Hot',                    'Drinks', 'active', 35000, 12000),
  (uuid_generate_v4(), 'Cafe Latte Hot',                    'Drinks', 'active', 30000, 10500);

-- Link historical sales_items to the newly inserted drink menu_items
-- Uses raw_dish_name to match, menu_item_id IS NULL to avoid double-linking.
UPDATE sales_items si
SET    menu_item_id = mi.id
FROM   menu_items mi
WHERE  si.menu_item_id IS NULL
  AND  si.raw_dish_name = mi.name
  AND  mi.category = 'Drinks';
