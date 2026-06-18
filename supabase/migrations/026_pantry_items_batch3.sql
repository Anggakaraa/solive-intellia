-- Migration 026: Add pantry items batch 3

insert into pantry_items (name, category, status, description, flavor_contributions, best_pairings, cautions, example_applications, notes) values

  (
    'Harissa Paste',
    'Sauce',
    'active',
    'North African chili paste made from dried chilies, garlic, spices, and olive oil. Delivers deep heat, smokiness, and earthy complexity rather than sharp chili burn.',
    ARRAY['Spicy', 'Smoky', 'Savory', 'Earthy'],
    ARRAY['Lamb', 'Beef', 'Chicken', 'Eggplant', 'Chickpeas'],
    'Can dominate delicate ingredients if used aggressively.',
    ARRAY['Middle Eastern Meat Balls', 'Lamb Stew', 'Grilled Lamb'],
    'North African identity carrier; works in braises, rubs, and sauces.'
  ),

  (
    'Tahini',
    'Sauce',
    'active',
    'Sesame-based sauce providing richness, body, and nutty depth. Functions as both a flavour component and textural enhancer.',
    ARRAY['Nutty', 'Rich', 'Savory'],
    ARRAY['Eggplant', 'Lamb', 'Chicken', 'Cauliflower', 'Falafel'],
    'Can become heavy without acidity or freshness.',
    ARRAY['Eggplant Tahini Dip', 'Date Tahini Pudding'],
    'Core Middle Eastern pantry staple; bridges savory and sweet applications.'
  ),

  (
    'Chili Mayo',
    'Sauce',
    'active',
    'Creamy chili-infused mayonnaise providing richness, heat, and familiarity.',
    ARRAY['Creamy', 'Rich', 'Spicy'],
    ARRAY['Fries', 'Fried Seafood', 'Burgers', 'Fried Chicken'],
    'Can push dishes toward generic western flavour territory if overused.',
    ARRAY['Sous Vide Potato Fries'],
    'High-familiarity condiment; useful for accessible, crowd-pleasing applications.'
  ),

  (
    'Pickled Red Onion',
    'Condiment',
    'active',
    'Quick-pickled red onions delivering acidity, crunch, and visual contrast.',
    ARRAY['Tangy', 'Bright', 'Fresh'],
    ARRAY['Lamb', 'Beef', 'Falafel', 'Hummus', 'Rice Dishes'],
    'Texture deteriorates over extended holding.',
    ARRAY['Pockets', 'Grain Bowls', 'Hummus Plates'],
    'Versatile garnish and balance component across many formats.'
  ),

  (
    'Pickled Radish',
    'Condiment',
    'active',
    'Pickled radish used to cut richness and add crisp acidity.',
    ARRAY['Tangy', 'Fresh', 'Bright'],
    ARRAY['Lamb', 'Chicken', 'Falafel', 'Rice Plates'],
    'Can overpower lighter vegetables if portioned too heavily.',
    ARRAY['Pockets', 'Grain Dishes', 'Shared Plates'],
    'Effective richness-cutter in heavier protein dishes.'
  )

;
