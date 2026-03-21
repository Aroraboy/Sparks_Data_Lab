CREATE TABLE users (
  id                   UUID PRIMARY KEY
                         DEFAULT gen_random_uuid(),
  email                TEXT UNIQUE NOT NULL,
  name                 TEXT NOT NULL,
  role                 TEXT NOT NULL DEFAULT 'member'
                         CHECK (role IN ('admin','member')),
  avatar_url           TEXT,
  google_id            TEXT UNIQUE,
  google_access_token  TEXT,
  google_refresh_token TEXT,
  is_active            BOOLEAN DEFAULT TRUE,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);
