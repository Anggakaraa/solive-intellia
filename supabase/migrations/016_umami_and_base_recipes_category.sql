-- Add Umami to the shared flavor taxonomy (used by menu_items and pantry_items)
insert into flavor_identities (name) values ('Umami') on conflict (name) do nothing;

-- Add Base Recipes as a menu category
insert into menu_categories (name)
select 'Base Recipes'
where not exists (select 1 from menu_categories where lower(name) = 'base recipes');
