-- Migration 021: Concept pipeline status update + saved_collections

-- 1. Update rd_concepts status values to match pipeline
alter table rd_concepts drop constraint if exists rd_concepts_status_check;

update rd_concepts set status = 'generated' where status = 'draft';
update rd_concepts set status = 'testing'   where status in ('recipe_generated', 'kitchen_tested');
update rd_concepts set status = 'active'    where status = 'validated';

alter table rd_concepts
  alter column status set default 'generated',
  add constraint rd_concepts_status_check
    check (status in ('generated', 'saved', 'testing', 'active', 'archived'));

-- 2. Change why_it_could_win from text to jsonb
--    Structure: { menu_gap, emotional_trigger, salted_olive }
--    Existing mock data is cleared (null) — will be repopulated by real AI output
alter table rd_concepts
  alter column why_it_could_win type jsonb using null::jsonb;

-- 3. saved_collections — stores menu collection outputs
create table if not exists saved_collections (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  brief_id    uuid references rd_briefs(id) on delete set null,
  menu_theme  text,
  status      text not null default 'saved'
              check (status in ('saved', 'testing', 'active', 'archived')),
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table saved_collections disable row level security;

create trigger saved_collections_updated_at
  before update on saved_collections
  for each row execute function update_updated_at();

-- 4. Junction: collection → its dish concepts
create table if not exists saved_collection_concepts (
  collection_id  uuid not null references saved_collections(id) on delete cascade,
  concept_id     uuid not null references rd_concepts(id) on delete cascade,
  wave           text,
  wave_order     integer,
  primary key (collection_id, concept_id)
);

alter table saved_collection_concepts disable row level security;
