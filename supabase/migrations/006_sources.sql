CREATE TABLE sources (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id  UUID NOT NULL REFERENCES datasets(id)
                ON DELETE CASCADE,
  source_name TEXT NOT NULL,
  source_url  TEXT,
  tool_used   TEXT,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
