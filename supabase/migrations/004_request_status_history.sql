CREATE TABLE request_status_history (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES requests(id)
               ON DELETE CASCADE,
  changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  old_status TEXT,
  new_status TEXT NOT NULL,
  note       TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
