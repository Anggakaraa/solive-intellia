-- ─────────────────────────────────────────
-- Migration 002: Menu Item Schema Revision
-- ─────────────────────────────────────────

-- New: Menu Categories (replaces free-text category field)
create table menu_categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  created_at timestamptz not null default now()
);

-- Rename hero_ingredient → hero_component
alter table menu_items rename column hero_ingredient to hero_component;

-- Remove low-signal fields
alter table menu_items
  drop column if exists format,
  drop column if exists occasion,
  drop column if exists menu_intents,
  drop column if exists pantry_expression_type,
  drop column if exists comfort_score,
  drop column if exists freshness_score,
  drop column if exists shareability_score;

-- Replace 1–10 scores with 1–5 format_familiarity + flavor_discovery
alter table menu_items
  drop column if exists familiarity_score,
  drop column if exists discovery_score;

alter table menu_items
  add column format_familiarity integer check (format_familiarity between 1 and 5),
  add column flavor_discovery integer check (flavor_discovery between 1 and 5);

-- ─────────────────────────────────────────
-- Seed: Menu Categories
-- ─────────────────────────────────────────

insert into menu_categories (name) values
  ('Dips'),
  ('Sides'),
  ('Pockets'),
  ('Veggies'),
  ('Large Plates'),
  ('Dessert'),
  ('Drinks');

-- ─────────────────────────────────────────
-- Update Strategic Roles
-- Remove Pantry Driver and Seasonal Driver, add VIP Driver
-- ─────────────────────────────────────────

delete from strategic_roles where name in ('Pantry Driver', 'Seasonal Driver');

insert into strategic_roles (name, definition, characteristics, success_indicator) values
  (
    'VIP Driver',
    'Designed to attract and delight premium guests.',
    'Higher price point, premium ingredients, elevated experience',
    'Attracts high-value guests, positive premium perception.'
  );

-- ─────────────────────────────────────────
-- Disable RLS on new table
-- ─────────────────────────────────────────

alter table menu_categories disable row level security;
