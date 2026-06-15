-- Migration 017: Add new pantry items (batch 2)

-- ─────────────────────────────────────────
-- 1. New flavor identities
-- ─────────────────────────────────────────

insert into flavor_identities (name) values
  ('Fresh'),   -- already used in seed 007 data; formalising here
  ('Nutty')
on conflict (name) do nothing;

-- ─────────────────────────────────────────
-- 2. New pantry categories
-- ─────────────────────────────────────────

insert into pantry_categories (name) values
  ('Spread'),
  ('Dressing'),
  ('Seasoning')
on conflict (name) do nothing;

-- ─────────────────────────────────────────
-- 3. New pantry items
-- ─────────────────────────────────────────

insert into pantry_items (name, category, status, description, flavor_contributions, best_pairings, cautions, example_applications, notes) values

  (
    'Tapenade',
    'Spread',
    'active',
    'A coarse olive and pistachio condiment built from green olives, parsley, garlic, lemon juice and olive oil. Briny and savory with nutty richness, balanced by fresh herbs and citrus. More vibrant and herb-forward than traditional black olive tapenade.',
    ARRAY['Briny', 'Rich', 'Umami', 'Herbaceous'],
    ARRAY['Fish', 'Lamb', 'Chicken', 'Roasted Vegetables', 'Pita Bread'],
    'Can dominate delicate flavors due to its salinity.',
    ARRAY['Salted Olive Hummus', 'Pita Accompaniment', 'Fish Dishes'],
    'Strong Mediterranean identity marker.'
  ),

  (
    'Muhammara',
    'Spread',
    'active',
    'A roasted red pepper and walnut spread seasoned with paprika, cayenne and pomegranate. Sweet, smoky and gently spicy, with richness from walnuts and brightness from pomegranate.',
    ARRAY['Sweet', 'Tangy', 'Rich', 'Smoky'],
    ARRAY['Lamb', 'Chicken', 'Eggplant', 'Pita Bread', 'Roasted Vegetables'],
    'Can become overly sweet when paired with naturally sweet vegetables.',
    ARRAY['Muhammara', 'Vegetable Accompaniments', 'Flatbread Spreads'],
    'One of the pantry''s strongest signature flavor systems.'
  ),

  (
    'Amba Sauce',
    'Sauce',
    'active',
    'A pickled mango sauce made with mango, lemon, garlic, mustard seed, fenugreek and turmeric. Fruity, acidic and aromatic with a distinctive Middle Eastern profile.',
    ARRAY['Tangy', 'Sweet', 'Spicy', 'Bright'],
    ARRAY['Fish', 'Chicken', 'Falafel', 'Vegetables'],
    'Fruit-forward character can clash with dairy-heavy dishes.',
    ARRAY['Cod Patties', 'Fish Dishes', 'Falafel'],
    'Highly distinctive and underutilized pantry asset.'
  ),

  (
    'Habanero Sauce',
    'Sauce',
    'active',
    'A cooked chili sauce built from habanero, red chili, bird''s eye chili, green chili and onion. Delivers direct heat, savory depth and aromatic spice without excessive sweetness.',
    ARRAY['Spicy', 'Savory', 'Bright'],
    ARRAY['Chicken', 'Fish', 'Lamb', 'Potatoes'],
    'Heat can overpower subtle ingredients.',
    ARRAY['Roast Chicken', 'Grilled Proteins'],
    'Useful for adding excitement without increasing richness.'
  ),

  (
    'Green Sauce',
    'Sauce',
    'active',
    'A creamy herb sauce made with basil, coriander, ginger, green chili, garlic, lemon and mayonnaise. Delivers freshness, herbal lift and mild heat while retaining enough richness to support grilled proteins.',
    ARRAY['Fresh', 'Herbaceous', 'Bright', 'Rich'],
    ARRAY['Chicken', 'Fish', 'Lamb', 'Vegetables', 'Rice'],
    'Fresh herb character can fade over time.',
    ARRAY['Roast Chicken', 'Grilled Protein Plates'],
    'Acts as a balancing component for rich dishes.'
  ),

  (
    'Watermelon Dressing',
    'Dressing',
    'active',
    'A fruit-forward dressing built around watermelon and citrus elements. Light, refreshing and acidic with strong summer associations.',
    ARRAY['Fresh', 'Sweet', 'Tangy', 'Bright'],
    ARRAY['Watermelon', 'Citrus', 'Labneh', 'Fresh Salads'],
    'Works best in cold applications.',
    ARRAY['Watermelon Salad'],
    'Strong seasonal identity.'
  ),

  (
    'Shawarma Spice Blend',
    'Seasoning',
    'active',
    'A warm aromatic spice blend used for shawarma marinades and rubs. Earthy, savory and deeply aromatic with recognizable Middle Eastern character.',
    ARRAY['Umami', 'Earthy', 'Spicy', 'Savory'],
    ARRAY['Beef', 'Chicken', 'Lamb'],
    'Requires acidity or freshness to prevent flavor fatigue.',
    ARRAY['Beef Shawarma', 'Chicken Shawarma', 'Marinades'],
    'Defines a recognizable regional flavor territory.'
  ),

  (
    'Spicy Za''atar',
    'Seasoning',
    'active',
    'A za''atar-based seasoning blend emphasizing herbs, sesame, earthiness and chili heat. Aromatic and savory with strong Levantine character.',
    ARRAY['Herbaceous', 'Earthy', 'Spicy'],
    ARRAY['Lamb', 'Chicken', 'Flatbread', 'Vegetables'],
    'Needs fat or acidity to avoid a dry finish.',
    ARRAY['Zaatar Lamb', 'Flatbreads', 'Roasted Vegetables'],
    'Strong identity carrier for Mediterranean dishes.'
  ),

  (
    'Dukkah',
    'Seasoning',
    'active',
    'A toasted blend of nuts, seeds and spices delivering crunch, roasted depth and aromatic complexity. Primarily used as a finishing element.',
    ARRAY['Nutty', 'Roasty', 'Earthy', 'Herbaceous'],
    ARRAY['Eggplant', 'Labneh', 'Vegetables', 'Chicken', 'Fish'],
    'Functions best as a finishing component rather than a primary flavor base.',
    ARRAY['Vegetable Garnish', 'Labneh Dishes', 'Protein Finishes'],
    'Adds texture as well as flavor.'
  ),

  (
    'Sumac Onion',
    'Condiment',
    'active',
    'A mixture of red onion, sumac, lemon, parsley, mint and olive oil. Sharp, aromatic and refreshing with enough acidity to cut through rich meats.',
    ARRAY['Tangy', 'Fresh', 'Bright'],
    ARRAY['Lamb', 'Beef', 'Kebabs', 'Hummus', 'Pita'],
    'Texture deteriorates if held too long.',
    ARRAY['Lamb Hummus', 'Kebabs', 'Wraps', 'Grilled Meats'],
    'One of the pantry''s most versatile balancing components.'
  );
