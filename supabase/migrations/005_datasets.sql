CREATE TABLE datasets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id      UUID REFERENCES requests(id)
                    ON DELETE SET NULL,
  name            TEXT NOT NULL,
  owner_id        UUID REFERENCES users(id)
                    ON DELETE SET NULL,
  owner_name      TEXT,
  purpose         TEXT,
  company         TEXT,
  market          TEXT,
  request_type    TEXT,
  sheet_url       TEXT,
  record_count    INTEGER DEFAULT 0,
  delivery_note   TEXT,
  is_pre_existing BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
