-- Migration 018: Add 10 base recipe menu items

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
    'Home Made Pita Bread',
    'Pita Bread',
    'Base Recipes',
    'active',
    'Pita Bread',
    'Savory',
    ARRAY['Rich'],
    ARRAY['Revenue Driver', 'Margin Driver'],
    5, 1,
    'Foundational carrier for dips, spreads and grilled proteins.'
  ),

  (
    'Merguez',
    'Merguez Sausage',
    'Base Recipes',
    'active',
    'Lamb',
    'Umami',
    ARRAY['Spicy', 'Smoky', 'Rich'],
    ARRAY['Brand Driver', 'VIP Driver'],
    3, 3,
    'North African-inspired lamb sausage with strong identity and versatility.'
  ),

  (
    'Spiced Lamb Kebabs',
    'Lamb Kebab, Herb Yoghurt, Sumac Onion',
    'Base Recipes',
    'active',
    'Lamb',
    'Umami',
    ARRAY['Spicy', 'Herbaceous', 'Rich'],
    ARRAY['Revenue Driver', 'Brand Driver'],
    4, 4,
    'Versatile grilled protein format suitable for wraps, platters and rice dishes.'
  ),

  (
    'Arabic Rice with Vermicelli',
    'Basmati Rice, Vermicelli',
    'Base Recipes',
    'active',
    'Rice',
    'Savory',
    ARRAY['Rich'],
    ARRAY['Margin Driver'],
    5, 2,
    'Acts as a familiarity anchor and supporting component for protein dishes.'
  ),

  (
    'Baharat Beef Mixture',
    'Minced Beef, Baharat Spice Blend',
    'Base Recipes',
    'active',
    'Beef',
    'Umami',
    ARRAY['Earthy', 'Spicy', 'Savory'],
    ARRAY['Brand Driver', 'Revenue Driver'],
    4, 3,
    'Flexible beef base adaptable into wraps, flatbreads and grilled applications.'
  ),

  (
    'Fish Cake',
    'Fish Cake, Amba Sauce',
    'Base Recipes',
    'active',
    'Fish',
    'Umami',
    ARRAY['Rich', 'Savory'],
    ARRAY['Brand Driver', 'Revenue Driver'],
    4, 3,
    'Relatively neutral protein vehicle that gains character from accompanying sauces and garnishes.'
  ),

  (
    'Harissa Spiced Beef Kebabs',
    'Beef Kebab, Harissa Seasoning, Herb Yoghurt',
    'Base Recipes',
    'active',
    'Beef',
    'Umami',
    ARRAY['Spicy', 'Smoky', 'Rich'],
    ARRAY['Brand Driver', 'Revenue Driver'],
    4, 4,
    'More assertive and memorable than standard beef kebabs due to harissa-led flavor profile.'
  ),

  (
    'Beef Kofta',
    'Beef Kofta, Herb Yoghurt, Sumac Onion',
    'Base Recipes',
    'active',
    'Beef',
    'Umami',
    ARRAY['Herbaceous', 'Spicy', 'Rich'],
    ARRAY['Revenue Driver'],
    4, 3,
    'Classic Middle Eastern protein format with broad menu applicability.'
  ),

  (
    'Zaatar Lamb',
    'Lamb, Spicy Za''atar',
    'Base Recipes',
    'active',
    'Lamb',
    'Umami',
    ARRAY['Herbaceous', 'Earthy', 'Savory'],
    ARRAY['Brand Driver'],
    3, 4,
    'Strong Levantine flavor identity driven by za''atar seasoning.'
  ),

  (
    'Sumac Chicken Drumstick',
    'Chicken Drumstick, Sumac Onion',
    'Base Recipes',
    'active',
    'Chicken',
    'Savory',
    ARRAY['Tangy', 'Herbaceous', 'Fresh'],
    ARRAY['Revenue Driver', 'Margin Driver'],
    5, 3,
    'Accessible protein format with brightness and acidity from sumac-driven seasoning.'
  );

-- ─────────────────────────────────────────
-- Pantry links (requires migration 017 pantry items to exist)
-- ─────────────────────────────────────────

insert into menu_item_pantry_links (menu_item_id, pantry_item_id)
select mi.id, pi.id
from menu_items mi
cross join pantry_items pi
where
  (mi.name = 'Spiced Lamb Kebabs'          and pi.name in ('Herb Yoghurt', 'Sumac Onion'))
  or (mi.name = 'Fish Cake'                and pi.name = 'Amba Sauce')
  or (mi.name = 'Harissa Spiced Beef Kebabs' and pi.name = 'Herb Yoghurt')
  or (mi.name = 'Beef Kofta'               and pi.name in ('Herb Yoghurt', 'Sumac Onion'))
  or (mi.name = 'Zaatar Lamb'              and pi.name = 'Spicy Za''atar')
  or (mi.name = 'Sumac Chicken Drumstick'  and pi.name = 'Sumac Onion')
on conflict do nothing;
