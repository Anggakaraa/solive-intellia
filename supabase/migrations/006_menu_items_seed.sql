-- Migration 006: Seed menu items from Sheet2 of Menu Items Solive.xlsx
-- Adds 2 missing flavor identities, then inserts 22 menu items

-- ─────────────────────────────────────────
-- Add missing flavor identities
-- ─────────────────────────────────────────

insert into flavor_identities (name) values
  ('Fresh'),
  ('Nutty')
on conflict (name) do nothing;

-- ─────────────────────────────────────────
-- Seed menu items
-- ─────────────────────────────────────────

insert into menu_items (
  name,
  description,
  category,
  status,
  hero_component,
  primary_flavor_identity,
  secondary_flavor_identities,
  pantry_items_used,
  strategic_roles,
  format_familiarity,
  flavor_discovery
) values

  (
    'Burghul Salad',
    'Bulgur, Cucumber, Red Onion, Tomato, Parsley, Olive Oil, White Vinegar',
    'Veggies', 'active', 'Burghul', 'Fresh',
    ARRAY['Tangy', 'Herbaceous'],
    ARRAY[]::text[],
    ARRAY['Margin Driver'],
    4, 2
  ),

  (
    'Salted Olive Hummus',
    'Hummus, Olive Oil, Black Olive, Macadamia, Olive Dip',
    'Dips', 'active', 'Hummus', 'Savory',
    ARRAY['Briny', 'Rich'],
    ARRAY[]::text[],
    ARRAY['Brand Driver'],
    5, 3
  ),

  (
    'Lamb Hummus',
    'Hummus, Lamb Arayes, Sumac Onion, Olive Oil',
    'Dips', 'active', 'Lamb Arayes', 'Savory',
    ARRAY['Tangy', 'Rich'],
    ARRAY[]::text[],
    ARRAY['Revenue Driver'],
    4, 3
  ),

  (
    'Fried Feta Roll',
    'Feta Roll, Hot Honey',
    'Sides', 'active', 'Feta Roll', 'Rich',
    ARRAY['Sweet', 'Savory'],
    ARRAY['Hot Honey'],
    ARRAY['Brand Driver'],
    4, 3
  ),

  (
    'Cod Patties',
    'Gindara Cod Patties, Amba Sauce',
    'Sides', 'active', 'Gindara Cod Patties', 'Savory',
    ARRAY['Tangy', 'Fresh'],
    ARRAY['Amba Sauce'],
    ARRAY['Brand Driver'],
    3, 4
  ),

  (
    'Muhammara',
    'Muhammara Base, Macadamia, Olive Oil',
    'Dips', 'active', 'Muhammara Base', 'Smoky',
    ARRAY['Sweet', 'Rich'],
    ARRAY[]::text[],
    ARRAY['Brand Driver'],
    3, 4
  ),

  (
    'Lamb Arayes',
    'Lamb Arayes, Herb Yoghurt',
    'Sides', 'active', 'Lamb Arayes', 'Savory',
    ARRAY['Smoky', 'Herbaceous'],
    ARRAY['Herb Yoghurt'],
    ARRAY['Revenue Driver'],
    4, 2
  ),

  (
    'Caramelized Carrots',
    'Baby Carrot, Orange Juice, Tzatziki, Hot Honey Nduja Sauce, Feta Cheese',
    'Veggies', 'active', 'Baby Carrot', 'Sweet',
    ARRAY['Tangy', 'Spicy', 'Rich'],
    ARRAY['Tzatziki', 'Hot Honey Nduja Sauce'],
    ARRAY['Brand Driver'],
    3, 4
  ),

  (
    'Watermelon Salad',
    'Watermelon, Pomelo, Orange, Labneh, Watermelon Dressing',
    'Veggies', 'active', 'Watermelon', 'Fresh',
    ARRAY['Sweet', 'Tangy'],
    ARRAY['Labneh'],
    ARRAY['Brand Driver'],
    3, 4
  ),

  (
    'House Made Pita Bread',
    'House-made pita bread, served warm',
    'Sides', 'active', 'Pita Bread', 'Savory',
    ARRAY['Rich'],
    ARRAY[]::text[],
    ARRAY['Margin Driver'],
    5, 1
  ),

  (
    'Hummus Mushroom',
    'Hummus, Shiitake Mushroom, Nduja Sauce, Walnut, Sumac Onion',
    'Dips', 'active', 'Hummus', 'Savory',
    ARRAY['Earthy', 'Rich'],
    ARRAY['Nduja Sauce'],
    ARRAY['Brand Driver'],
    4, 3
  ),

  (
    'Roast Chicken',
    'Whole Chicken, Garlic, Lemon, Onion, Habanero Sauce, Green Sauce, Olive Oil',
    'Large Plates', 'active', 'Whole Chicken', 'Savory',
    ARRAY['Tangy', 'Smoky'],
    ARRAY[]::text[],
    ARRAY['Revenue Driver'],
    5, 2
  ),

  (
    'Seared Gindara',
    'Gindara Fillet, Pistachio Crust, Beurre Blanc Sauce, Cherry Tomato, Lemon',
    'Large Plates', 'active', 'Gindara Fillet', 'Rich',
    ARRAY['Tangy', 'Savory'],
    ARRAY[]::text[],
    ARRAY['Brand Driver'],
    3, 4
  ),

  (
    'Grilled Lamb Chops',
    'Lamb Chops, Herb Yoghurt, Side Salad',
    'Large Plates', 'active', 'Lamb Chops', 'Savory',
    ARRAY['Herbaceous', 'Rich'],
    ARRAY['Herb Yoghurt'],
    ARRAY['Revenue Driver'],
    4, 2
  ),

  (
    'Grilled Steak Cube',
    'Tenderloin, Chimichurri, Red Chili, Green Chili, Tomato',
    'Large Plates', 'active', 'Tenderloin', 'Savory',
    ARRAY['Smoky', 'Fresh'],
    ARRAY['Chimichurri'],
    ARRAY['Revenue Driver'],
    5, 2
  ),

  (
    'Grilled Beef Cheek',
    'Braised Beef Cheek, Labneh, Tzatziki, Tomato Sauce, Chili',
    'Large Plates', 'active', 'Braised Beef Cheek', 'Rich',
    ARRAY['Tangy', 'Savory'],
    ARRAY['Labneh', 'Tzatziki'],
    ARRAY['Brand Driver'],
    4, 3
  ),

  (
    'Tarator Salmon',
    'Salmon Fillet, Hummus, Labneh, Cherry Tomato',
    'Large Plates', 'active', 'Salmon Fillet', 'Rich',
    ARRAY['Tangy', 'Fresh'],
    ARRAY['Labneh'],
    ARRAY['Brand Driver'],
    3, 4
  ),

  (
    'Roasted Eggplant',
    'Spiced Eggplant, Eggplant Confit, Labneh, Hot Honey Nduja Sauce, Feta Cheese',
    'Large Plates', 'active', 'Eggplant', 'Rich',
    ARRAY['Smoky', 'Sweet', 'Tangy'],
    ARRAY['Hot Honey'],
    ARRAY['Brand Driver'],
    3, 4
  ),

  (
    'Vermicelli Rice',
    'Vermicelli Rice, Crushed Macadamia, Parsley',
    'Sides', 'active', 'Vermicelli Rice', 'Savory',
    ARRAY['Rich'],
    ARRAY[]::text[],
    ARRAY['Margin Driver'],
    5, 1
  ),

  (
    'Sous Vide Potato Fries',
    'Potato Fries, Chili Mayo, Garlic Seasoning',
    'Sides', 'active', 'Potato Fries', 'Savory',
    ARRAY['Rich', 'Spicy'],
    ARRAY[]::text[],
    ARRAY['Revenue Driver'],
    5, 1
  ),

  (
    'Pistachio Crème Brûlée',
    'Crème Brûlée Base, Sugar, Pistachio',
    'Dessert', 'active', 'Crème Brûlée', 'Sweet',
    ARRAY['Rich', 'Nutty'],
    ARRAY[]::text[],
    ARRAY['Revenue Driver'],
    4, 2
  ),

  (
    'Kunafa Cheese Bake',
    'Kunafa, Pistachio, Simple Syrup',
    'Dessert', 'active', 'Kunafa', 'Sweet',
    ARRAY['Rich', 'Tangy'],
    ARRAY[]::text[],
    ARRAY['Brand Driver'],
    3, 4
  );
