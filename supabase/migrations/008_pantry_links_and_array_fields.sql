-- Migration 008: Convert pantry_items_used to a junction table,
-- and convert best_pairings / example_applications to text arrays.

-- ─────────────────────────────────────────
-- 1. Create junction table
-- ─────────────────────────────────────────

create table if not exists menu_item_pantry_links (
  menu_item_id  uuid not null references menu_items(id) on delete cascade,
  pantry_item_id uuid not null references pantry_items(id) on delete cascade,
  primary key (menu_item_id, pantry_item_id),
  created_at    timestamptz not null default now()
);

alter table menu_item_pantry_links disable row level security;

-- ─────────────────────────────────────────
-- 2. Migrate existing text-array data → junction rows
-- ─────────────────────────────────────────

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'menu_items' and column_name = 'pantry_items_used'
  ) then
    insert into menu_item_pantry_links (menu_item_id, pantry_item_id)
    select mi.id, pi.id
    from menu_items mi
    cross join lateral unnest(mi.pantry_items_used) as t(pname)
    join pantry_items pi on pi.name = t.pname
    on conflict do nothing;

    alter table menu_items drop column pantry_items_used;
  end if;
end $$;

-- ─────────────────────────────────────────
-- 3. Convert best_pairings text → text[]
-- ─────────────────────────────────────────

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'pantry_items'
      and column_name = 'best_pairings'
      and data_type = 'text'
  ) then
    alter table pantry_items
      alter column best_pairings type text[]
      using case
        when best_pairings is null or trim(best_pairings) = '' then null
        else string_to_array(regexp_replace(trim(best_pairings), '\s*,\s*', ',', 'g'), ',')
      end;
  end if;
end $$;

-- ─────────────────────────────────────────
-- 4. Convert example_applications text → text[]
-- ─────────────────────────────────────────

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'pantry_items'
      and column_name = 'example_applications'
      and data_type = 'text'
  ) then
    alter table pantry_items
      alter column example_applications type text[]
      using case
        when example_applications is null or trim(example_applications) = '' then null
        else string_to_array(regexp_replace(trim(example_applications), '\s*,\s*', ',', 'g'), ',')
      end;
  end if;
end $$;
