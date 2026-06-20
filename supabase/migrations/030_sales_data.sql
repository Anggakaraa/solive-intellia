-- Migration 030: Sales data ingestion tables for Phase 1 analytics

-- Audit trail: one row per CSV upload
create table if not exists sales_imports (
  id            uuid primary key default uuid_generate_v4(),
  source_filename text not null,
  imported_at   timestamptz not null default now(),
  row_count     int not null default 0,
  matched_count int not null default 0,
  date_from     date,
  date_to       date
);

alter table sales_imports disable row level security;

-- One row per receipt / bill
create table if not exists sales_transactions (
  id          uuid primary key default uuid_generate_v4(),
  import_id   uuid references sales_imports(id) on delete cascade,
  receipt_id  text,
  date        date not null,
  time        time,
  table_id    text,
  created_at  timestamptz not null default now()
);

alter table sales_transactions disable row level security;
create index if not exists sales_transactions_date_idx on sales_transactions(date);
create index if not exists sales_transactions_import_idx on sales_transactions(import_id);

-- One row per line item on a receipt
create table if not exists sales_items (
  id              uuid primary key default uuid_generate_v4(),
  transaction_id  uuid not null references sales_transactions(id) on delete cascade,
  menu_item_id    uuid references menu_items(id) on delete set null,
  raw_dish_name   text not null,
  quantity        int not null default 1,
  unit_price      numeric(12,2),
  revenue         numeric(12,2),
  cost            numeric(12,2),
  created_at      timestamptz not null default now()
);

alter table sales_items disable row level security;
create index if not exists sales_items_menu_item_idx on sales_items(menu_item_id);
create index if not exists sales_items_transaction_idx on sales_items(transaction_id);

-- Maps POS dish name strings to Intellia menu items
-- Populated during import review; auto-resolves on future imports
create table if not exists menu_item_aliases (
  id            uuid primary key default uuid_generate_v4(),
  alias_name    text not null unique,
  menu_item_id  uuid not null references menu_items(id) on delete cascade,
  created_at    timestamptz not null default now()
);

alter table menu_item_aliases disable row level security;

-- ── Analytics views ──────────────────────────────────────────────

-- Dish performance: revenue and units per matched menu item
create or replace view v_dish_performance as
select
  mi.id              as menu_item_id,
  mi.name            as dish_name,
  mi.category,
  mi.format_familiarity,
  mi.flavor_discovery,
  mi.strategic_roles,
  sum(si.revenue)    as total_revenue,
  sum(si.quantity)   as total_units,
  sum(si.cost)       as total_cost,
  avg(si.unit_price) as avg_price
from sales_items si
join menu_items mi on si.menu_item_id = mi.id
group by
  mi.id, mi.name, mi.category,
  mi.format_familiarity, mi.flavor_discovery, mi.strategic_roles;

-- Category performance: revenue and units per category
create or replace view v_category_performance as
select
  coalesce(mi.category, 'Unmatched') as category,
  sum(si.revenue)  as total_revenue,
  sum(si.quantity) as total_units,
  count(distinct si.menu_item_id) filter (where si.menu_item_id is not null) as dish_count
from sales_items si
left join menu_items mi on si.menu_item_id = mi.id
group by coalesce(mi.category, 'Unmatched');
