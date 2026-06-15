-- Migration 019: Add 10 more base recipe menu items (batch 2)

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
    'Joojeh Kabob',
    'Chicken Kabob, Herb Yoghurt',
    'Base Recipes',
    'active',
    'Chicken',
    'Savory',
    ARRAY['Tangy', 'Smoky', 'Herbaceous'],
    ARRAY['Revenue Driver'],
    4, 3,
    'Persian-inspired chicken preparation with broad appeal.'
  ),

  (
    'Quzi Lamb',
    'Slow Cooked Lamb, Turmeric Rice',
    'Base Recipes',
    'active',
    'Lamb',
    'Umami',
    ARRAY['Rich', 'Earthy'],
    ARRAY['Brand Driver', 'VIP Driver'],
    3, 4,
    'Large-format celebratory preparation with strong premium positioning.'
  ),

  (
    'Turmeric Basmati Rice',
    'Basmati Rice, Turmeric',
    'Base Recipes',
    'active',
    'Rice',
    'Savory',
    ARRAY['Earthy'],
    ARRAY['Margin Driver'],
    5, 2,
    'Supporting starch component used in premium lamb applications.'
  ),

  (
    'Almond Raisin Crusted Quzi',
    'Quzi Lamb, Almond, Raisin',
    'Base Recipes',
    'active',
    'Lamb',
    'Rich',
    ARRAY['Sweet', 'Earthy', 'Umami'],
    ARRAY['VIP Driver', 'Brand Driver'],
    2, 5,
    'More expressive and premium interpretation of Quzi with texture and sweetness contrast.'
  ),

  (
    'Braised Beef Cheek',
    'Beef Cheek',
    'Base Recipes',
    'active',
    'Beef Cheek',
    'Umami',
    ARRAY['Rich'],
    ARRAY['Brand Driver', 'VIP Driver'],
    4, 3,
    'Long-cooked protein preparation delivering tenderness and depth.'
  ),

  (
    'Lamb Kofta',
    'Lamb Kofta, Herb Yoghurt, Sumac Onion',
    'Base Recipes',
    'active',
    'Lamb',
    'Umami',
    ARRAY['Herbaceous', 'Spicy', 'Rich'],
    ARRAY['Revenue Driver'],
    4, 3,
    'Classic grilled lamb format with broad flexibility.'
  ),

  (
    'Beef Shawarma',
    'Beef Shawarma, Shawarma Spice Blend',
    'Base Recipes',
    'active',
    'Beef',
    'Umami',
    ARRAY['Earthy', 'Spicy', 'Savory'],
    ARRAY['Revenue Driver', 'Brand Driver'],
    5, 2,
    'Highly recognizable format with strong guest familiarity.'
  ),

  (
    'Beef Chorizo',
    'Beef Chorizo',
    'Base Recipes',
    'active',
    'Beef',
    'Umami',
    ARRAY['Smoky', 'Spicy', 'Rich'],
    ARRAY['Brand Driver'],
    3, 4,
    'Bold flavor asset that can create differentiation in multiple formats.'
  ),

  (
    'Moroccan Lamb',
    'Moroccan Spiced Lamb',
    'Base Recipes',
    'active',
    'Lamb',
    'Umami',
    ARRAY['Earthy', 'Spicy', 'Rich'],
    ARRAY['Brand Driver'],
    3, 4,
    'Distinctive North African flavor profile with strong storytelling potential.'
  ),

  (
    'Lamb Arayes',
    'Lamb Arayes, Herb Yoghurt',
    'Base Recipes',
    'active',
    'Lamb',
    'Umami',
    ARRAY['Rich', 'Spicy'],
    ARRAY['Revenue Driver', 'Brand Driver'],
    4, 4,
    'One of the strongest examples of combining familiar format with distinctive Mediterranean flavors.'
  );

-- ─────────────────────────────────────────
-- Pantry links
-- ─────────────────────────────────────────

insert into menu_item_pantry_links (menu_item_id, pantry_item_id)
select mi.id, pi.id
from menu_items mi
cross join pantry_items pi
where
  (mi.name = 'Joojeh Kabob'    and pi.name = 'Herb Yoghurt')
  or (mi.name = 'Lamb Kofta'   and pi.name in ('Herb Yoghurt', 'Sumac Onion'))
  or (mi.name = 'Beef Shawarma' and pi.name = 'Shawarma Spice Blend')
  or (mi.name = 'Lamb Arayes'  and pi.name = 'Herb Yoghurt')
on conflict do nothing;
