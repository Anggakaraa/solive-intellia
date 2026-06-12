-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────
-- REFERENCE TABLES
-- ─────────────────────────────────────────

-- Identity Principles (Salted Olive design philosophy)
create table identity_principles (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  category text,
  definition text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Strategic / Menu Roles
create table strategic_roles (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  definition text,
  characteristics text,
  success_indicator text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Menu Intents (purpose of a dish on the menu)
create table menu_intents (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  definition text,
  created_at timestamptz not null default now()
);

-- Menu Formats (physical dish format)
create table menu_formats (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  definition text,
  created_at timestamptz not null default now()
);

-- Ingredient Categories
create table ingredient_categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  examples text,
  created_at timestamptz not null default now()
);

-- Occasion Types
create table occasion_types (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  definition text,
  created_at timestamptz not null default now()
);

-- Experience Dimensions
create table experience_dimensions (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  definition text,
  low_end_description text,
  high_end_description text,
  low_examples text,
  high_examples text,
  scoring_guideline text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Flavor Identities
create table flavor_identities (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  created_at timestamptz not null default now()
);

-- Texture Identities
create table texture_identities (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  created_at timestamptz not null default now()
);

-- Pantry Expression Types
create table pantry_expression_types (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  definition text,
  example text,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- CORE DATA TABLES
-- ─────────────────────────────────────────

-- Menu Items
create table menu_items (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  category text,
  status text not null default 'concept' check (status in ('active', 'inactive', 'concept')),
  format text,
  hero_ingredient text,
  primary_flavor_identity text,
  secondary_flavor_identities text[] not null default '{}',
  texture_identities text[] not null default '{}',
  pantry_expression_type text,
  pantry_items_used text[] not null default '{}',
  occasion text,
  menu_intents text[] not null default '{}',
  strategic_roles text[] not null default '{}',
  notes text,
  familiarity_score integer check (familiarity_score between 1 and 10),
  discovery_score integer check (discovery_score between 1 and 10),
  comfort_score integer check (comfort_score between 1 and 10),
  freshness_score integer check (freshness_score between 1 and 10),
  shareability_score integer check (shareability_score between 1 and 10),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Pantry Items
create table pantry_items (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  flavor_contributions text,
  possible_functions text,
  best_pairings text,
  cautions text,
  example_applications text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ingredients
create table ingredients (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  category text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Recipe Ingredients (junction)
create table recipe_ingredients (
  id uuid primary key default uuid_generate_v4(),
  menu_item_id uuid not null references menu_items(id) on delete cascade,
  ingredient_id uuid not null references ingredients(id) on delete cascade,
  quantity text,
  unit text,
  function text,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- UPDATED_AT TRIGGERS
-- ─────────────────────────────────────────

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger identity_principles_updated_at    before update on identity_principles    for each row execute function update_updated_at();
create trigger strategic_roles_updated_at        before update on strategic_roles        for each row execute function update_updated_at();
create trigger experience_dimensions_updated_at  before update on experience_dimensions  for each row execute function update_updated_at();
create trigger menu_items_updated_at             before update on menu_items             for each row execute function update_updated_at();
create trigger pantry_items_updated_at           before update on pantry_items           for each row execute function update_updated_at();
create trigger ingredients_updated_at            before update on ingredients            for each row execute function update_updated_at();

-- ─────────────────────────────────────────
-- SEED: IDENTITY PRINCIPLES
-- ─────────────────────────────────────────

insert into identity_principles (name, category, definition, notes) values
  (
    'Mediterranean First',
    'Core Philosophy',
    'Mediterranean culinary principles should be visible in most menu items through ingredients, flavor logic, techniques, or dining rituals.',
    'The goal is not strict authenticity. The goal is reinterpretation through the Salted Olive lens.'
  ),
  (
    'Comfort Over Cleverness',
    'Core Philosophy',
    'A guest should enjoy a dish before they admire it. Novelty should support satisfaction, not replace it.',
    'Avoid creating dishes that require explanation before enjoyment.'
  ),
  (
    'Pantry-Led Innovation',
    'Core Philosophy',
    'Pantry products are strategic assets that create differentiation and strengthen the Salted Olive ecosystem.',
    'Pantry products should contribute meaningfully to the dining experience rather than function as decorative additions.'
  ),
  (
    'Bistro Format',
    'Operating Principle',
    'Food should feel approachable, casual, generous, and suitable for everyday dining.',
    'Avoid fine dining complexity and presentation-driven concepts.'
  );

-- ─────────────────────────────────────────
-- SEED: STRATEGIC ROLES (MENU ROLES)
-- ─────────────────────────────────────────

insert into strategic_roles (name, definition, characteristics, success_indicator) values
  (
    'Revenue Driver',
    'Designed primarily to drive sales volume.',
    'Broad appeal, High familiarity, Repeat order potential',
    'Consistent sales volume.'
  ),
  (
    'Margin Driver',
    'Designed primarily to improve profitability.',
    'Efficient ingredients, Operational simplicity, Strong margins',
    'Strong contribution margin.'
  ),
  (
    'Brand Driver',
    'Designed primarily to express Salted Olive identity.',
    'Distinctive, Memorable, Pantry-forward',
    'Customers associate the dish with Salted Olive.'
  ),
  (
    'Pantry Driver',
    'Designed primarily to showcase pantry products.',
    'Demonstrates pantry versatility, Highlights pantry flavor contributions',
    'Increased pantry awareness and adoption.'
  ),
  (
    'Seasonal Driver',
    'Designed primarily to create novelty and seasonal relevance.',
    'Time-limited, Exploratory, Conversation-generating',
    'Customer excitement and engagement.'
  );

-- ─────────────────────────────────────────
-- SEED: MENU INTENTS
-- ─────────────────────────────────────────

insert into menu_intents (name, definition) values
  ('Introduce Pantry Product', 'Help customers discover a pantry product.'),
  ('Drive Trial',              'Encourage first-time purchase or experimentation.'),
  ('Create Sharing Occasion',  'Encourage group dining and social interaction.'),
  ('Signature Item',           'Represent the restaurant''s identity.'),
  ('Seasonal Exploration',     'Experiment with new ideas within a limited timeframe.'),
  ('Everyday Staple',          'Provide dependable and repeatable menu choices.');

-- ─────────────────────────────────────────
-- SEED: MENU FORMATS
-- ─────────────────────────────────────────

insert into menu_formats (name, definition) values
  ('Sandwich', 'Bread-based handheld format.'),
  ('Plate',    'Traditional composed entrée.'),
  ('Bowl',     'Single vessel meal combining multiple components.'),
  ('Salad',    'Vegetable-forward format.'),
  ('Mezze',    'Mediterranean sharing format.'),
  ('Snack',    'Small portion or appetizer.'),
  ('Pasta',    'Pasta-based entrée.'),
  ('Dessert',  'Sweet course.'),
  ('Beverage', 'Drink offering.');

-- ─────────────────────────────────────────
-- SEED: INGREDIENT CATEGORIES
-- ─────────────────────────────────────────

insert into ingredient_categories (name, examples) values
  ('Protein',          'Chicken, Beef, Lamb, Fish'),
  ('Vegetable',        'Carrot, Eggplant, Tomato'),
  ('Herb',             'Mint, Parsley, Dill'),
  ('Spice',            'Harissa, Sumac, Aleppo Pepper'),
  ('Dairy',            'Yogurt, Feta, Labneh'),
  ('Pantry Product',   'Mint Honey, Olive Relish'),
  ('Starch',           'Bread, Potato, Rice'),
  ('Sauce',            'Tahini Sauce, Yogurt Sauce'),
  ('Garnish',          'Microgreens, Herb Oil');

-- ─────────────────────────────────────────
-- SEED: OCCASION TYPES
-- ─────────────────────────────────────────

insert into occasion_types (name, definition) values
  ('Everyday Lunch',  'Casual repeatable meal.'),
  ('Everyday Dinner', 'Casual evening meal.'),
  ('Sharing',         'Designed for multiple people.'),
  ('Celebration',     'Suitable for special occasions.'),
  ('Light Meal',      'Smaller and lighter eating occasion.'),
  ('Indulgence',      'Comfort-focused and rewarding experience.');

-- ─────────────────────────────────────────
-- SEED: PANTRY EXPRESSION TYPES
-- ─────────────────────────────────────────

insert into pantry_expression_types (name, definition, example) values
  ('Hero',       'The pantry product is central to the dish''s identity and flavor.',         'Harissa Chicken'),
  ('Supporting', 'The pantry product contributes meaningfully but is not the primary focus.', 'Olive Relish Steak Sandwich'),
  ('Finishing',  'The pantry product is applied near the end to provide contrast or enhancement.', 'Mint Honey Drizzle'),
  ('Hidden',     'The pantry product contributes to flavor but is not explicitly noticeable.', 'Harissa incorporated into a braising liquid.'),
  ('None',       'No pantry product used.',                                                   null);

-- ─────────────────────────────────────────
-- SEED: EXPERIENCE DIMENSIONS
-- ─────────────────────────────────────────

insert into experience_dimensions (name, definition, low_end_description, high_end_description, scoring_guideline, notes) values
  (
    'Familiarity',
    'How easily a guest can predict the dish before tasting.',
    '1 = Unexpected',
    '10 = Instantly Recognizable',
    'Score based on how much prior mental model a typical guest has for this dish.',
    null
  ),
  (
    'Discovery',
    'How much newness exists in the experience.',
    '1 = Predictable',
    '10 = Highly Novel',
    'Score based on how many elements would surprise a typical guest.',
    null
  ),
  (
    'Comfort',
    'Degree of emotional and sensory reassurance.',
    '1 = Challenging',
    '10 = Comforting',
    'Score based on how emotionally safe and satisfying the dish feels.',
    null
  ),
  (
    'Freshness',
    'Perception of brightness, lightness, and vitality.',
    '1 = Heavy',
    '10 = Fresh',
    'Score based on how light, bright, and alive the dish feels.',
    'This dimension is currently considered provisional and should be validated during workshops.'
  ),
  (
    'Shareability',
    'Extent to which a dish encourages social dining.',
    '1 = Individual',
    '10 = Highly Shareable',
    'Score based on portion format, visual appeal, and social dining fit.',
    'This dimension is currently considered provisional and should be validated during workshops.'
  );

-- ─────────────────────────────────────────
-- SEED: FLAVOR IDENTITIES
-- ─────────────────────────────────────────

-- NOTE: This taxonomy is provisional and should be refined through menu tagging workshops.
insert into flavor_identities (name) values
  ('Bright'),
  ('Herbaceous'),
  ('Smoky'),
  ('Spicy'),
  ('Creamy'),
  ('Tangy'),
  ('Sweet'),
  ('Briny'),
  ('Earthy'),
  ('Roasty'),
  ('Rich'),
  ('Savory');

-- ─────────────────────────────────────────
-- SEED: TEXTURE IDENTITIES
-- ─────────────────────────────────────────

insert into texture_identities (name) values
  ('Crispy'),
  ('Crunchy'),
  ('Tender'),
  ('Creamy'),
  ('Chewy'),
  ('Soft'),
  ('Juicy');
