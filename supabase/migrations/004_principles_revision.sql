-- Migration 004: Enrich identity_principles with question + examples

alter table identity_principles add column if not exists question text;
alter table identity_principles add column if not exists examples text;

-- Clear old sparse seed and replace with full content
delete from identity_principles;

insert into identity_principles (name, category, definition, question, examples, notes) values
  (
    'Mediterranean First',
    'Level 1: Dish Principles',
    'Every dish must have a recognisable Mediterranean foundation. Contemporary twists are encouraged, but the underlying identity should remain Mediterranean.',
    'If the contemporary twist was removed, would this still feel Mediterranean?',
    'Crispy chicken with mint honey
Spanakopita-inspired pot pie
Harissa steak frites',
    null
  ),
  (
    'Bistro Format',
    'Level 1: Dish Principles',
    'Every dish should be rooted in a familiar and approachable bistro format. Guests should immediately understand what they are ordering. The innovation should come from flavour and execution, not confusion.',
    null,
    'Roast chicken
Steak frites
Croquettes
Gratin
Salad
Soup
Sandwich',
    null
  ),
  (
    'Pantry-Led',
    'Level 1: Dish Principles',
    'Every dish must prominently feature at least one Salted Olive pantry product. The pantry product should contribute meaningfully to the dish, not simply appear as a garnish.',
    null,
    'Hot Honey
Mint Honey
Salted Olive Dip
Harissa
Chicken Spice Rub
Eggplant Rub
Future sauces, dressings, pickles, and spice blends',
    null
  ),
  (
    'Comfort Over Cleverness',
    'Level 1: Dish Principles',
    'Salted Olive serves food that is warm, generous, and craveable. The goal is repeat orders, not novelty for novelty''s sake.',
    'Would someone order this again next month? If not, the concept should be reconsidered.',
    null,
    null
  ),
  (
    'Operationally Realistic',
    'Level 1: Dish Principles',
    'Every dish must be executable using available ingredients, reliable suppliers, existing equipment, and existing team capabilities.',
    null,
    null,
    'No dish should depend on fragile sourcing, highly specialised ingredients, or excessive operational complexity.'
  );
