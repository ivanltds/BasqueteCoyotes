ALTER TABLE members ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'membro'
  CHECK (role IN ('membro', 'organizador'));
