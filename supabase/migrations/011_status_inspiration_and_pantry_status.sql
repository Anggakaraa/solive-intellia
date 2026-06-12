-- Migration 011: Move Inspiration from category to status,
-- and add status to pantry_items.

-- ─────────────────────────────────────────
-- 1. Remove Inspiration from menu_categories
-- ─────────────────────────────────────────

delete from menu_categories where name = 'Inspiration';

-- ─────────────────────────────────────────
-- 2. Expand menu_items status check to include 'inspiration'
-- ─────────────────────────────────────────

do $$
declare
  v_constraint text;
begin
  select conname into v_constraint
  from pg_constraint
  where conrelid = 'menu_items'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) ilike '%status%';

  if v_constraint is not null then
    execute 'alter table menu_items drop constraint ' || quote_ident(v_constraint);
  end if;
end $$;

alter table menu_items
  add constraint menu_items_status_check
  check (status in ('active', 'inactive', 'concept', 'inspiration'));

-- ─────────────────────────────────────────
-- 3. Add status to pantry_items
-- ─────────────────────────────────────────

alter table pantry_items
  add column if not exists status text not null default 'active'
  check (status in ('active', 'inactive', 'concept', 'inspiration'));
