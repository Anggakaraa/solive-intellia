-- Migration 003: Pantry Item Schema Revision

-- New reference table for pantry flavor contributions
create table pantry_flavor_contributions (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  created_at timestamptz not null default now()
);

-- Remove possible_functions (not an intrinsic property)
alter table pantry_items drop column if exists possible_functions;

-- Change flavor_contributions from free text to structured array
alter table pantry_items drop column if exists flavor_contributions;
alter table pantry_items add column flavor_contributions text[] not null default '{}';

-- Seed pantry flavor contributions
insert into pantry_flavor_contributions (name) values
  ('Sweet'),
  ('Savory'),
  ('Tangy'),
  ('Spicy'),
  ('Smoky'),
  ('Herbaceous'),
  ('Floral'),
  ('Rich'),
  ('Fresh'),
  ('Earthy'),
  ('Briny'),
  ('Bitter');

alter table pantry_flavor_contributions disable row level security;
