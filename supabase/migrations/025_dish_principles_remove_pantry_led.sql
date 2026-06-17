-- Migration 025: Remove Pantry-Led from Level 1 Dish Principles, update remaining 4

delete from identity_principles where category = 'Level 1: Dish Principles';

insert into identity_principles (name, category, definition, question, examples, notes) values

  (
    'Contemporary Eastern Mediterranean Hospitality',
    'Level 1: Dish Principles',
    'Salted Olive is inspired by the food cultures of the Eastern Mediterranean, particularly the Levant, and by contemporary restaurants that reinterpret these traditions through modern bistro formats.

Our food draws from the warmth of home cooking, the generosity of shared meals, and the creativity of chefs who use regional flavours as a starting point rather than a limitation.

We are inspired by the spirit of contemporary Eastern Mediterranean hospitality: familiar dishes made more interesting through thoughtful use of spices, sauces, condiments, vegetables, and technique.

We do not aim to recreate classic recipes exactly as they have always been made. We aim to capture their spirit and reinterpret them for how people want to eat today.

The goal is familiarity with surprise.',
    'Does this feel like something that could belong in a contemporary Eastern Mediterranean bistro?',
    'Rooted but not traditional
Familiar but not predictable
Contemporary but not trend-driven
Generous but not excessive
Comforting enough to crave repeatedly
Interesting enough to discover something new',
    null
  ),

  (
    'Accessible Formats',
    'Level 1: Dish Principles',
    'Salted Olive expresses its flavours through formats that guests already understand.

We favour familiar formats such as pot pies, croquettes, sandwiches, roast chicken, steak frites, salads, soups, shared platters, and bistro desserts.

Innovation should come from flavour, technique, and pantry products — not from creating unnecessarily complicated formats.

Guests should immediately understand what they are ordering.',
    null,
    'Pot pies
Croquettes
Sandwiches
Roast chicken
Steak frites
Salads
Soups
Shared platters
Bistro desserts',
    null
  ),

  (
    'Craveability First',
    'Level 1: Dish Principles',
    'Salted Olive creates dishes that guests want to order again.

Novelty may attract attention, but flavour drives repeat visits.

Every dish should prioritise balance, satisfaction, texture, generosity, and repeatability.

A dish should earn its place on the menu because people want to eat it repeatedly, not because it generates conversation.',
    'Would a guest order this a second time?',
    'Balance
Satisfaction
Texture
Generosity
Repeatability',
    null
  ),

  (
    'Operationally Realistic',
    'Level 1: Dish Principles',
    'Every dish must be executable using available ingredients, reliable suppliers, existing equipment, and existing team capabilities.

No dish should depend on fragile sourcing, highly specialised ingredients, or excessive operational complexity.

A great dish that cannot be executed consistently is not a successful dish.',
    null,
    null,
    null
  );
