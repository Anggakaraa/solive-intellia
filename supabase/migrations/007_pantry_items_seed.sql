-- Migration 007: Seed core pantry items

insert into pantry_items (
  name,
  description,
  flavor_contributions,
  best_pairings,
  cautions,
  example_applications
) values

  (
    'Hot Honey',
    'Honey infused with chili that combines sweetness and gentle heat.',
    ARRAY['Sweet', 'Spicy'],
    'Fried Cheese, Chicken, Roasted Vegetables, Pizza, Labneh',
    'Can become overly sweet if layered with other sweet elements.',
    'Fried Feta Roll, Drizzle for roasted vegetables'
  ),

  (
    'Labneh',
    'Strained yoghurt providing richness, acidity and cooling balance.',
    ARRAY['Tangy', 'Rich', 'Fresh'],
    'Lamb, Salmon, Eggplant, Tomato, Watermelon, Hot Honey',
    'Can mute lighter flavors if overused.',
    'Watermelon Salad, Tarator Salmon, Roasted Eggplant'
  ),

  (
    'Herb Yoghurt',
    'Yoghurt sauce enhanced with fresh herbs to provide freshness and lift.',
    ARRAY['Herbaceous', 'Fresh', 'Tangy'],
    'Lamb, Chicken, Beef, Pita, Grilled Vegetables',
    'Fresh herb character diminishes over time.',
    'Lamb Arayes, Grilled Lamb Chops'
  ),

  (
    'Tzatziki',
    'Yoghurt and cucumber sauce delivering freshness, acidity and cooling contrast.',
    ARRAY['Fresh', 'Tangy', 'Herbaceous'],
    'Lamb, Chicken, Beef, Eggplant, Carrot, Pita',
    'Can dilute richer flavors if used excessively.',
    'Caramelized Carrots, Grilled Beef Cheek'
  ),

  (
    'Nduja Sauce',
    'Spicy chili-based sauce providing richness, heat and depth.',
    ARRAY['Spicy', 'Smoky', 'Rich'],
    'Eggplant, Carrot, Beef, Chicken, Cheese',
    'Can dominate delicate ingredients due to heat and richness.',
    'Roasted Eggplant, Hummus Mushroom, Caramelized Carrots'
  ),

  (
    'Chimichurri',
    'Herb-forward condiment delivering freshness, acidity and aromatic lift.',
    ARRAY['Herbaceous', 'Fresh', 'Tangy'],
    'Beef, Lamb, Chicken, Grilled Vegetables, Potato',
    'Can overpower delicate proteins if applied too heavily.',
    'Grilled Steak Cube'
  );
