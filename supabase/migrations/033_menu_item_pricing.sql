-- Add pricing columns to menu_items for margin calculations
-- unit_price and cost_per_unit stored in IDR (no decimals)
ALTER TABLE menu_items
  ADD COLUMN IF NOT EXISTS unit_price    integer,
  ADD COLUMN IF NOT EXISTS cost_per_unit integer;

-- Mock prices (IDR) — replace with real data when available
UPDATE menu_items SET unit_price =  45000, cost_per_unit =  12000 WHERE name = 'House Made Pita Bread';
UPDATE menu_items SET unit_price =  65000, cost_per_unit =  18000 WHERE name = 'Salted Olive Hummus';
UPDATE menu_items SET unit_price =  65000, cost_per_unit =  18000 WHERE name = 'Pak Chandra''s Hummus';
UPDATE menu_items SET unit_price =  75000, cost_per_unit =  24000 WHERE name = 'Hummus Mushroom';
UPDATE menu_items SET unit_price =  55000, cost_per_unit =  15000 WHERE name = 'Muhammara';
UPDATE menu_items SET unit_price =  55000, cost_per_unit =  15000 WHERE name = 'Mediterranean Creamed Spinach';
UPDATE menu_items SET unit_price =  45000, cost_per_unit =  10000 WHERE name = 'Pita Chips';
UPDATE menu_items SET unit_price =  85000, cost_per_unit =  28000 WHERE name = 'Fried Feta Roll';
UPDATE menu_items SET unit_price =  65000, cost_per_unit =  16000 WHERE name = 'Fattoush Salad';
UPDATE menu_items SET unit_price =  65000, cost_per_unit =  18000 WHERE name = 'Watermelon Salad';
UPDATE menu_items SET unit_price =  65000, cost_per_unit =  18000 WHERE name = 'Caramelized Carrots';
UPDATE menu_items SET unit_price =  65000, cost_per_unit =  20000 WHERE name = 'Roasted Eggplant';
UPDATE menu_items SET unit_price =  55000, cost_per_unit =  14000 WHERE name = 'Sous Vide Potato Fries';
UPDATE menu_items SET unit_price =  75000, cost_per_unit =  22000 WHERE name = 'Mediterranean Potato Gratin';
UPDATE menu_items SET unit_price =  45000, cost_per_unit =  10000 WHERE name = 'Rice Pilaf';
UPDATE menu_items SET unit_price = 125000, cost_per_unit =  52000 WHERE name = 'Lamb Arayes';
UPDATE menu_items SET unit_price = 115000, cost_per_unit =  48000 WHERE name = 'Beef Kofta Pockets';
UPDATE menu_items SET unit_price = 185000, cost_per_unit =  95000 WHERE name = 'Grilled Beef Cheek';
UPDATE menu_items SET unit_price = 175000, cost_per_unit =  88000 WHERE name = 'Grilled Steak Cube';
UPDATE menu_items SET unit_price = 195000, cost_per_unit =  85000 WHERE name = 'Roast Chicken';
UPDATE menu_items SET unit_price = 205000, cost_per_unit = 105000 WHERE name = 'Roasted Lamb';
UPDATE menu_items SET unit_price = 175000, cost_per_unit =  88000 WHERE name = 'Lamb Stew';
UPDATE menu_items SET unit_price = 125000, cost_per_unit =  52000 WHERE name = 'Spicy Harissa Meatballs';
UPDATE menu_items SET unit_price = 165000, cost_per_unit =  70000 WHERE name = 'Bistro Burger';
UPDATE menu_items SET unit_price =  85000, cost_per_unit =  28000 WHERE name = 'Kunafa Cheese Bake';
UPDATE menu_items SET unit_price =  95000, cost_per_unit =  32000 WHERE name = 'Pistachio Crème Brûlée';
UPDATE menu_items SET unit_price =  75000, cost_per_unit =  24000 WHERE name = 'Tahini Date Cake';
