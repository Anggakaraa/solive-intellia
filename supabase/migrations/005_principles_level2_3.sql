-- Migration 005: Add Level 2 and Level 3 principles

insert into identity_principles (name, category, definition, question, examples, notes) values

-- LEVEL 2: MENU PRINCIPLES

  (
    'The Menu Must Showcase The Pantry',
    'Level 2: Menu Principles',
    'Guests should encounter Salted Olive pantry products throughout their experience. The menu should create repeated exposure to proprietary flavours across Starters, Mains, Desserts, and Beverages.',
    null,
    null,
    'The objective is to build familiarity with the Salted Olive flavour ecosystem.'
  ),
  (
    'The Menu Must Balance Business Objectives',
    'Level 2: Menu Principles',
    'The menu should contain a mix of Revenue Drivers, Margin Drivers, Brand Drivers, and VIP Drivers. Not every dish requires a business objective. The menu does.',
    null,
    'Revenue Drivers — Broad appeal items designed to sell consistently.
Margin Drivers — Items designed to generate strong profitability.
Brand Drivers — Items that strengthen identity and create conversation.
VIP Drivers — Higher-ticket items designed to attract and delight premium guests.',
    null
  ),
  (
    'The Menu Must Encourage Sharing',
    'Level 2: Menu Principles',
    'Salted Olive is a social dining restaurant. The menu should contain enough shared starters, shared mains, centrepiece dishes, and group-friendly items to encourage communal dining experiences.',
    null,
    null,
    null
  ),
  (
    'The Menu Must Balance Familiarity And Discovery',
    'Level 2: Menu Principles',
    'The menu should provide both comfort and curiosity. Guests should feel comfortable ordering while still having reasons to return.',
    null,
    'Familiar Anchors — Roast chicken, Steak, Comfort dishes, Classic bistro formats.
Discovery Items — Seasonal specials, New pantry products, Test Kitchen creations.',
    null
  ),
  (
    'The Menu Must Build Pantry Equity',
    'Level 2: Menu Principles',
    'Over time, guests should begin recognising Salted Olive pantry products as signature flavour systems. The long-term objective is for guests to seek out Salted Olive flavours, not just individual dishes.',
    null,
    'Mint Honey
Hot Honey
Harissa
Salted Olive Dip
Future pantry products',
    null
  ),

-- LEVEL 3: PANTRY STRATEGY

  (
    'Build Proprietary Flavour Systems',
    'Level 3: Pantry Strategy',
    'Salted Olive develops sauces, spice blends, dressings, pickles, condiments, and oils before developing dishes. The flavour system is the intellectual property. The dish is the delivery vehicle.',
    null,
    null,
    null
  ),
  (
    'One Product, Multiple Uses',
    'Level 3: Pantry Strategy',
    'Every pantry product should ideally appear across multiple touchpoints. The objective is to maximise usefulness and strengthen brand recognition.',
    null,
    'Mint Honey — Main dishes, Side dishes, Beverages, Retail jars, Hampers',
    null
  ),
  (
    'Build From Core Ingredients',
    'Level 3: Pantry Strategy',
    'Product development should prioritise ingredients that support multiple menu applications and future retail opportunities. Preference should be given to ingredients that are accessible, consistently available, flexible, and scalable.',
    null,
    'Olive oil
Honey
Lemon
Garlic
Chilli
Yogurt
Herbs
Sesame
Eggplant
Olives',
    'Avoid building the pantry around ingredients that are difficult to source or difficult to replicate.'
  );
