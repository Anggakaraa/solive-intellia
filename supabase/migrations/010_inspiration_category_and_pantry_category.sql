-- Migration 010: Add Inspiration menu category + pantry item categories

-- ─────────────────────────────────────────
-- 1. Add Inspiration to menu categories
-- ─────────────────────────────────────────

insert into menu_categories (name) values ('Inspiration')
on conflict (name) do nothing;

-- ─────────────────────────────────────────
-- 2. Pantry categories
-- ─────────────────────────────────────────

create table if not exists pantry_categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  created_at timestamptz not null default now()
);

alter table pantry_categories disable row level security;

insert into pantry_categories (name) values
  ('Honey'),
  ('Sauce'),
  ('Dairy'),
  ('Dip'),
  ('Oil'),
  ('Spice Blend'),
  ('Pickle'),
  ('Condiment')
on conflict (name) do nothing;

-- ─────────────────────────────────────────
-- 3. Add category column to pantry_items
-- ─────────────────────────────────────────

alter table pantry_items add column if not exists category text;
