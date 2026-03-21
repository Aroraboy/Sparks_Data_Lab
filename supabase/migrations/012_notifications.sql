CREATE TABLE notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id)
               ON DELETE CASCADE,
  message    TEXT NOT NULL,
  type       TEXT NOT NULL CHECK (type IN (
    'assigned',
    'status_changed',
    'comment',
    'overdue',
    'scrape_complete',
    'duplicate_detected',
    'enrichment_complete',
    'verification_complete'
  )),
  link       TEXT,
  read       BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
