-- Migration 014: R&D Recipes table
-- Recipes are the execution layer derived from a concept.
-- A concept produces 1–n recipe versions (V1, V2, V3 as iterations).

create table if not exists rd_recipes (
  id                  uuid    primary key default uuid_generate_v4(),
  concept_id          uuid    not null references rd_concepts(id) on delete cascade,

  -- Version tracking for iteration (1 = first prototype, 2 = revised, etc.)
  version             integer not null default 1,

  -- Concept Intent: auto-copied from concept at generation time.
  -- Stored here so the recipe is self-contained even if the concept changes.
  concept_intent      text,

  -- Components: array of objects { name, quantity, notes }
  -- Example: [{ "name": "House Labneh", "quantity": "80g", "notes": "whipped with olive oil" }]
  components          jsonb   not null default '[]',

  -- Method: ordered steps as a text array
  method              text[]  not null default '{}',

  -- Plating Notes: free text describing presentation
  plating_notes       text,

  -- Yield: { serves, portion_size }
  -- Example: { "serves": 2, "portion_size": "180g" }
  yield               jsonb,

  -- Success Criteria: auto-generated from concept's experiment_focus at generation time.
  -- Stored here to preserve the intent even if the concept is later edited.
  success_criteria    text[]  not null default '{}',

  -- Test Kitchen Notes: human-entered after prototyping.
  -- This field is the most valuable longitudinal data in the system.
  test_kitchen_notes  text,

  -- Lifecycle
  status              text    not null default 'draft'
                      check (status in ('draft', 'tested', 'revised', 'approved')),

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table rd_recipes disable row level security;

create trigger rd_recipes_updated_at
  before update on rd_recipes
  for each row execute function update_updated_at();

-- Index for fetching all recipes belonging to a concept
create index rd_recipes_concept_id_idx on rd_recipes(concept_id);

-- Unique constraint: one version number per concept
create unique index rd_recipes_concept_version_idx on rd_recipes(concept_id, version);
