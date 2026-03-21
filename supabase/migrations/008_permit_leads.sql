CREATE TABLE permit_leads (
  id                UUID PRIMARY KEY
                      DEFAULT gen_random_uuid(),
  permit_number     TEXT,
  city              TEXT NOT NULL,
  state             TEXT DEFAULT 'TX',
  project_name      TEXT,
  address           TEXT,
  formatted_address TEXT,
  latitude          DOUBLE PRECISION,
  longitude         DOUBLE PRECISION,
  zip_code          TEXT,
  project_type      TEXT CHECK (project_type IN (
    'Ground-Up',
    'Interior Build-Out',
    'Mixed',
    'Unknown'
  )),
  estimated_value   BIGINT,
  application_date  DATE,
  approval_date     DATE,
  owner_name        TEXT,
  gc_name           TEXT,
  architect_name    TEXT,
  source_url        TEXT,
  portal_name       TEXT,
  status            TEXT DEFAULT 'New'
    CHECK (status IN (
      'New','Contacted','Assigned','Not Relevant'
    )),
  assigned_to       UUID REFERENCES users(id)
                      ON DELETE SET NULL,
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (permit_number, city)
);
