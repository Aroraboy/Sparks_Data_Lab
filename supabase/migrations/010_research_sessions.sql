CREATE TABLE research_sessions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id     UUID REFERENCES requests(id)
                   ON DELETE SET NULL,
  user_id        UUID REFERENCES users(id)
                   ON DELETE SET NULL,
  query          TEXT NOT NULL,
  mode           TEXT NOT NULL CHECK (mode IN (
    'Full Research Plan',
    'Sources Only',
    'Validation Checklist',
    'Outreach Strategy'
  )),
  request_type   TEXT,
  market         TEXT,
  company        TEXT,
  ai_response    TEXT,
  haiku_tokens   INTEGER DEFAULT 0,
  opus_tokens    INTEGER DEFAULT 0,
  estimated_cost NUMERIC(10,4) DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);
