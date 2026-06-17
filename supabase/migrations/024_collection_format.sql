-- Migration 024: Add collection_format to rd_briefs
ALTER TABLE rd_briefs
  ADD COLUMN IF NOT EXISTS collection_format text NOT NULL DEFAULT 'a_la_carte'
    CHECK (collection_format IN ('a_la_carte', 'set_menu'));
