-- Add menu collection fields to rd_briefs
alter table rd_briefs
  add column if not exists brief_type text not null default 'dish'
    check (brief_type in ('dish', 'menu_collection')),
  add column if not exists menu_theme text,
  add column if not exists menu_composition jsonb,
  add column if not exists ai_recommend_composition boolean not null default false;
