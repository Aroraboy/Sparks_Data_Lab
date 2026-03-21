CREATE TABLE scrape_logs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city             TEXT NOT NULL,
  portal_url       TEXT,
  records_found    INTEGER DEFAULT 0,
  records_inserted INTEGER DEFAULT 0,
  records_skipped  INTEGER DEFAULT 0,
  run_at           TIMESTAMPTZ DEFAULT NOW(),
  status           TEXT NOT NULL
    CHECK (status IN ('success','failed','blocked')),
  error_message    TEXT,
  duration_ms      INTEGER
);
