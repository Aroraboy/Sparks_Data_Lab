CREATE TABLE contacts (
  id                  UUID PRIMARY KEY
                        DEFAULT gen_random_uuid(),
  dataset_id          UUID REFERENCES datasets(id)
                        ON DELETE SET NULL,
  request_id          UUID REFERENCES requests(id)
                        ON DELETE SET NULL,
  full_name           TEXT,
  company             TEXT,
  designation         TEXT,
  email               TEXT,
  phone               TEXT,
  linkedin_url        TEXT,
  website             TEXT,
  city                TEXT,
  state               TEXT,
  market              TEXT,
  category            TEXT,
  source              TEXT DEFAULT 'manual',
  pdl_id              TEXT UNIQUE,
  verified            BOOLEAN DEFAULT FALSE,
  verified_at         TIMESTAMPTZ,
  verification_status TEXT DEFAULT 'pending'
    CHECK (verification_status IN (
      'pending','valid','invalid',
      'catchall','unknown'
    )),
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);
