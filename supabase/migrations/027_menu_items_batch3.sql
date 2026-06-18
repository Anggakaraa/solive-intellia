-- Migration 027: Add 20 menu items (batch 3)

insert into menu_items (
  name,
  description,
  category,
  status,
  hero_component,
  primary_flavor_identity,
  secondary_flavor_identities,
  strategic_roles,
  format_familiarity,
  flavor_discovery,
  notes
) values

  (
    'Cod Falafel Pockets',
    'Cod Falafel, Tzatziki',
    'Pockets',
    'active',
    'Cod Falafel',
    'Savory',
    ARRAY[]::text[],
    ARRAY['Brand Driver', 'Revenue Driver'],
    4, 4,
    'Seafood-forward falafel pocket with cooling tzatziki; strong brand differentiation play.'
  ),

  (
    'Eggplant Tahini Dip',
    'Roasted Eggplant, Tahini',
    'Dips',
    'active',
    'Eggplant',
    'Smoky',
    ARRAY[]::text[],
    ARRAY['Brand Driver'],
    3, 4,
    'Smoky roasted eggplant base with tahini richness; plant-forward and distinctive.'
  ),

  (
    'Fattoush Salad',
    'Fattoush, Watermelon Dressing',
    'Veggies',
    'active',
    'Fattoush',
    'Fresh',
    ARRAY[]::text[],
    ARRAY['Margin Driver'],
    4, 3,
    'Classic Levantine salad elevated with signature watermelon dressing.'
  ),

  (
    'Beef Kofta Pockets',
    'Beef Kofta, Tzatziki',
    'Pockets',
    'active',
    'Beef Kofta',
    'Savory',
    ARRAY[]::text[],
    ARRAY['Revenue Driver'],
    5, 2,
    'High-familiarity pocket format; strong revenue potential with broad guest appeal.'
  ),

  (
    'Potato Gratin',
    'Potato Gratin',
    'Sides',
    'active',
    'Potato',
    'Rich',
    ARRAY[]::text[],
    ARRAY['Margin Driver'],
    5, 1,
    'Comfort-forward side with universal appeal; reliable margin contributor.'
  ),

  (
    'Nasi Persia',
    'Persian Rice',
    'Large Plates',
    'active',
    'Rice',
    'Savory',
    ARRAY[]::text[],
    ARRAY['Revenue Driver'],
    4, 3,
    'Persian-style rice dish with aromatic depth; strong regional identity.'
  ),

  (
    'Crispy Lamb',
    'Crispy Lamb',
    'Large Plates',
    'active',
    'Lamb',
    'Umami',
    ARRAY[]::text[],
    ARRAY['VIP Driver', 'Brand Driver'],
    4, 3,
    'Premium lamb preparation with textural contrast; strong VIP and brand positioning.'
  ),

  (
    'Pudding Kurma Tahini',
    'Kurma Pudding, Labneh',
    'Dessert',
    'active',
    'Pudding',
    'Sweet',
    ARRAY[]::text[],
    ARRAY['Brand Driver'],
    3, 4,
    'Middle Eastern dessert with kurma and tahini character; distinctive brand statement.'
  ),

  (
    'Chicken Hummus',
    'Roast Chicken, Hummus',
    'Large Plates',
    'active',
    'Chicken',
    'Savory',
    ARRAY[]::text[],
    ARRAY['Revenue Driver'],
    4, 3,
    'Accessible protein-on-hummus format; dependable revenue driver with strong familiarity.'
  ),

  (
    'Middle Eastern Meat Balls',
    'Spiced Meatballs, Harissa Paste',
    'Large Plates',
    'active',
    'Beef',
    'Umami',
    ARRAY[]::text[],
    ARRAY['Revenue Driver'],
    4, 3,
    'Spiced meatball format with harissa heat; familiar but regionally distinctive.'
  ),

  (
    'Mediterranean Creamed Spinach',
    'Creamed Spinach',
    'Veggies',
    'active',
    'Spinach',
    'Rich',
    ARRAY[]::text[],
    ARRAY['Margin Driver'],
    4, 2,
    'Rich vegetable side with Mediterranean character; reliable margin contributor.'
  ),

  (
    'Phyllo Meat Pie',
    'Phyllo Pastry, Spiced Meat',
    'Sides',
    'active',
    'Lamb',
    'Savory',
    ARRAY[]::text[],
    ARRAY['Brand Driver'],
    4, 3,
    'Pastry-wrapped meat preparation with strong regional identity; brand-forward side.'
  ),

  (
    'Rice Pilaf',
    'Rice Pilaf',
    'Sides',
    'active',
    'Rice',
    'Savory',
    ARRAY[]::text[],
    ARRAY['Margin Driver'],
    5, 2,
    'Versatile supporting starch; high-familiarity margin side.'
  ),

  (
    'Sofresh Lamb Hind',
    'Lamb Hind',
    'Large Plates',
    'active',
    'Lamb',
    'Umami',
    ARRAY[]::text[],
    ARRAY['VIP Driver', 'Brand Driver'],
    3, 4,
    'Premium whole lamb cut; strong VIP positioning with brand storytelling potential.'
  ),

  (
    'Sofresh Lamb Shank',
    'Lamb Shank',
    'Large Plates',
    'active',
    'Lamb',
    'Umami',
    ARRAY[]::text[],
    ARRAY['VIP Driver', 'Brand Driver'],
    4, 3,
    'Classic slow-cooked lamb shank; VIP-tier dish with broad recognition.'
  ),

  (
    'Bulgur Lentil',
    'Bulgur, Lentil',
    'Veggies',
    'active',
    'Bulgur',
    'Savory',
    ARRAY[]::text[],
    ARRAY['Margin Driver'],
    3, 3,
    'Grain and legume combination with earthy depth; plant-forward margin item.'
  ),

  (
    'Fillo Pastry Apple Pie',
    'Fillo Pastry, Apple',
    'Dessert',
    'active',
    'Apple',
    'Sweet',
    ARRAY[]::text[],
    ARRAY['Revenue Driver'],
    5, 2,
    'Approachable dessert in fillo pastry; high familiarity revenue item.'
  ),

  (
    'Beef Burger',
    'Beef Patty',
    'Large Plates',
    'active',
    'Beef',
    'Umami',
    ARRAY[]::text[],
    ARRAY['Revenue Driver'],
    5, 1,
    'Universal format with maximum familiarity; core revenue driver.'
  ),

  (
    'Lamb Stew',
    'Braised Lamb',
    'Large Plates',
    'active',
    'Lamb',
    'Umami',
    ARRAY[]::text[],
    ARRAY['Brand Driver'],
    4, 3,
    'Slow-cooked lamb with strong comfort and brand associations.'
  ),

  (
    'Ayam Bakar Buncis',
    'Grilled Chicken, Green Beans',
    'Large Plates',
    'active',
    'Chicken',
    'Savory',
    ARRAY[]::text[],
    ARRAY['Revenue Driver'],
    5, 2,
    'Southeast Asian-inspired grilled chicken; accessible and familiar revenue item.'
  );

-- ─────────────────────────────────────────
-- Pantry links
-- ─────────────────────────────────────────

insert into menu_item_pantry_links (menu_item_id, pantry_item_id)
select mi.id, pi.id
from menu_items mi
cross join pantry_items pi
where
  (mi.name = 'Cod Falafel Pockets'          and pi.name = 'Tzatziki')
  or (mi.name = 'Beef Kofta Pockets'        and pi.name = 'Tzatziki')
  or (mi.name = 'Eggplant Tahini Dip'       and pi.name = 'Tahini')
  or (mi.name = 'Fattoush Salad'            and pi.name = 'Watermelon Dressing')
  or (mi.name = 'Pudding Kurma Tahini'      and pi.name = 'Labneh')
  or (mi.name = 'Middle Eastern Meat Balls' and pi.name = 'Harissa Paste')
on conflict (menu_item_id, pantry_item_id) do nothing;
