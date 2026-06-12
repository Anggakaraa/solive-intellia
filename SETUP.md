# Setup

## 1. Create a Supabase project

Go to https://supabase.com and create a new project.

## 2. Run all database migrations

In Supabase → SQL Editor, run the following files **in order**:

```
supabase/migrations/001_initial_schema.sql        — tables, RLS, seed reference data
supabase/migrations/002_schema_revision.sql       — menu categories, FF/FD scores, strategic role cleanup
supabase/migrations/003_pantry_revision.sql       — pantry flavor contributions vocabulary
supabase/migrations/004_principles_revision.sql   — enrich identity principles with questions + examples
supabase/migrations/005_principles_level2_3.sql   — add Level 2 and Level 3 principles
supabase/migrations/006_menu_items_seed.sql       — seed 22 active menu items
supabase/migrations/007_pantry_items_seed.sql     — seed 6 core pantry items
supabase/migrations/008_pantry_links_and_array_fields.sql — junction table, convert array fields
```

## 3. Configure environment variables

Create `.env.local` in the project root:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Find these in Supabase → Project Settings → API.

## 4. Install and run

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Notes

- RLS is disabled on all tables — this app has no auth and is intended for internal use only
- The app uses the Supabase anon key directly; do not expose it in a public deployment without adding authentication
