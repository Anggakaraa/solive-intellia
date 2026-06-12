-- Migration 013: R&D Concepts table
-- Concepts are the primary intellectual output of the intelligence layer.
-- A brief produces 1–n concepts. Concepts persist independently of briefs.

create table if not exists rd_concepts (
  id                uuid    primary key default uuid_generate_v4(),
  brief_id          uuid    not null references rd_briefs(id) on delete cascade,

  -- Core concept fields (maps to OUTPUT GUIDELINES.md sections 1–6)
  concept_name      text    not null,
  one_line          text,
  breakdown         jsonb,  -- { hero, flavor_drivers: [], textures: [], key_contrast }
  presentation      text,
  why_it_could_win  text,
  feasibility       jsonb,  -- { assets_leveraged: [], watchouts: [] }
  experiment_focus  text[]  not null default '{}',

  -- Lifecycle
  status            text    not null default 'draft'
                    check (status in ('draft', 'saved', 'recipe_generated', 'kitchen_tested', 'validated')),

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

alter table rd_concepts disable row level security;

create trigger rd_concepts_updated_at
  before update on rd_concepts
  for each row execute function update_updated_at();

-- Index for fetching all concepts belonging to a brief
create index rd_concepts_brief_id_idx on rd_concepts(brief_id);
