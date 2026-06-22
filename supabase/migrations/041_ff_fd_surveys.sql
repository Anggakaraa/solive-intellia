-- Migration 041: FF/FD Survey system
-- Stores individual survey responses + calculated scores.
-- Sub-scores stored permanently so the formula can be recalculated later without re-surveying.

-- Add FF/FD + survey timestamp to rd_concepts
alter table rd_concepts
  add column if not exists format_familiarity  integer check (format_familiarity between 1 and 5),
  add column if not exists flavor_discovery    integer check (flavor_discovery between 1 and 5),
  add column if not exists ff_fd_surveyed_at   timestamptz;

-- Add survey timestamp to menu_items (FF/FD columns already exist from migration 002)
alter table menu_items
  add column if not exists ff_fd_surveyed_at   timestamptz;

-- Survey responses table
-- One row per survey session per dish.
-- source_type + id pair identifies the dish.
-- All sub-scores stored so formula changes don't require re-surveying.
create table if not exists ff_fd_surveys (
  id                      uuid        primary key default uuid_generate_v4(),

  -- Source
  source_type             text        not null check (source_type in ('menu_item', 'rd_concept')),
  menu_item_id            uuid        references menu_items(id) on delete cascade,
  rd_concept_id           uuid        references rd_concepts(id) on delete cascade,

  -- FF sub-scores (raw 1–5 from survey)
  format_recognition      integer     not null check (format_recognition between 1 and 5),
  ordering_confidence     integer     not null check (ordering_confidence between 1 and 5),
  eating_familiarity      integer     not null check (eating_familiarity between 1 and 5),

  -- FD sub-scores
  -- flavor_familiarity_auto: averaged from flavor tags (menu_items) or manually entered (rd_concepts)
  flavor_familiarity_auto numeric(4,2) not null,
  ingredient_familiarity  integer     not null check (ingredient_familiarity between 1 and 5),
  combination_novelty     integer     not null check (combination_novelty between 1 and 5),

  -- Calculated results
  ff_raw                  numeric(4,2) not null,
  fd_raw                  numeric(4,2) not null,
  ff                      integer     not null check (ff between 1 and 5),
  fd                      integer     not null check (fd between 1 and 5),

  created_at              timestamptz not null default now(),

  constraint chk_source_id check (
    (source_type = 'menu_item'  and menu_item_id  is not null and rd_concept_id is null) or
    (source_type = 'rd_concept' and rd_concept_id is not null and menu_item_id  is null)
  )
);

alter table ff_fd_surveys disable row level security;

create index ff_fd_surveys_menu_item_idx  on ff_fd_surveys(menu_item_id);
create index ff_fd_surveys_rd_concept_idx on ff_fd_surveys(rd_concept_id);
