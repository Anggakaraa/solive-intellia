-- Migration 012: R&D Briefs table for the Intelligence Layer prototype

create table if not exists rd_briefs (
  id                  uuid primary key default uuid_generate_v4(),
  category            text,
  strategic_roles     text[]  not null default '{}',
  format_familiarity  integer check (format_familiarity between 1 and 5),
  flavor_discovery    integer check (flavor_discovery between 1 and 5),
  pantry_assets       text[]  not null default '{}',
  opportunity         text,
  creative_references text,
  desired_feeling     text,
  constraints         text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table rd_briefs disable row level security;

create trigger rd_briefs_updated_at
  before update on rd_briefs
  for each row execute function update_updated_at();
