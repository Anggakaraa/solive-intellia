-- Migration 028: Add new base recipes batch 3
-- Existing: Merguez, Spiced Lamb Kebabs, Zaatar Lamb, Sumac Chicken Drumstick,
--           Arabic Rice with Vermicelli, Fish Cake (018);
--           Joojeh Kabob, Moroccan Lamb, Quzi Lamb, Almond Raisin Crusted Quzi,
--           Beef Shawarma, Beef Chorizo, Braised Beef Cheek, Turmeric Basmati Rice,
--           Lamb Kofta, Lamb Arayes (019)
-- New: Lamb Stew, Marinated Tenderloin, Beef Patty

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
    'Lamb Stew',
    'Slow-Cooked Lamb, Harissa Paste',
    'Base Recipes',
    'active',
    'Slow-Cooked Lamb',
    'Umami',
    ARRAY['Earthy', 'Rich', 'Savory'],
    ARRAY['Brand Driver'],
    4, 3,
    'Slow-cooked lamb base with depth and richness; adaptable into multiple finished dishes.'
  ),

  (
    'Marinated Tenderloin',
    'Beef Tenderloin',
    'Base Recipes',
    'active',
    'Beef Tenderloin',
    'Savory',
    ARRAY['Rich', 'Smoky'],
    ARRAY['VIP Driver'],
    5, 2,
    'Premium beef cut for VIP applications; high-familiarity format with strong perceived value.'
  ),

  (
    'Beef Patty',
    'Ground Beef Patty',
    'Base Recipes',
    'active',
    'Ground Beef',
    'Umami',
    ARRAY['Rich', 'Savory'],
    ARRAY['Revenue Driver'],
    5, 1,
    'Core burger patty base; maximum format familiarity for broad revenue applications.'
  );

-- ─────────────────────────────────────────
-- Pantry links
-- ─────────────────────────────────────────

insert into menu_item_pantry_links (menu_item_id, pantry_item_id)
select mi.id, pi.id
from menu_items mi
cross join pantry_items pi
where
  (mi.name = 'Lamb Stew' and mi.category = 'Base Recipes' and pi.name = 'Harissa Paste')
on conflict (menu_item_id, pantry_item_id) do nothing;
