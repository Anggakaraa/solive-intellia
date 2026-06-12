-- Migration 009: Unify flavor vocabulary
-- pantry_items and menu_items should share the same flavor taxonomy.
-- Add the two terms only in pantry_flavor_contributions, then drop that table.

insert into flavor_identities (name) values
  ('Floral'),
  ('Bitter')
on conflict (name) do nothing;

drop table if exists pantry_flavor_contributions;
