# Intellia — Salted Olive R&D Intelligence

An internal web platform for capturing, organising, and analysing Salted Olive's menu R&D data. Built as the data foundation for Phase 2 AI-assisted menu intelligence.

## What it does

- **Menu Items** — Document every dish with flavor identity, strategic role, hero component, and FF/FD experience scores
- **Pantry Items** — Capture signature pantry products with flavor contributions, pairings, and applications
- **Principles** — Browse the Salted Olive identity principles across three levels (Dish, Menu, Pantry Strategy)
- **Reference Data** — Manage the controlled vocabularies (strategic roles, flavor taxonomy)
- **Export** — Download all data as CSV or JSON for external analysis

## Tech stack

- **Next.js** (App Router) + TypeScript
- **Supabase** (PostgreSQL, no auth, RLS disabled)
- **Tailwind CSS v4** with custom olive/cream/ink design tokens
- **Fraunces** (display serif) + **IBM Plex Sans** (body)

## Setup

See [SETUP.md](SETUP.md).

## Data model

See [DATA.md](DATA.md) for the full schema reference, table relationships, and intelligence model.

## Design system

See [salted-olive-design-spec.md](salted-olive-design-spec.md) for the color tokens, typography, and component patterns.
