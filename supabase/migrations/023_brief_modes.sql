-- Add exploration_mode and generation_mode to rd_briefs
ALTER TABLE rd_briefs
  ADD COLUMN IF NOT EXISTS exploration_mode text NOT NULL DEFAULT 'balanced'
    CHECK (exploration_mode IN ('safe', 'balanced', 'exploratory')),
  ADD COLUMN IF NOT EXISTS generation_mode text NOT NULL DEFAULT 'full'
    CHECK (generation_mode IN ('full', 'fast'));
