-- Migration 029: Add exploration_mode to rd_concepts
-- Moves mode from brief-level to concept-level so each generated concept
-- records which mode it was generated in. Enables mode-scoped deduplication
-- and mode-filtered views on the output page.

ALTER TABLE rd_concepts
  ADD COLUMN IF NOT EXISTS exploration_mode text NOT NULL DEFAULT 'balanced'
    CHECK (exploration_mode IN ('safe', 'balanced', 'exploratory'));
