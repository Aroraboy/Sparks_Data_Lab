CREATE TABLE requests (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  requirement  TEXT NOT NULL,
  request_type TEXT NOT NULL CHECK (request_type IN (
    'Contact Database',
    'Permit Intelligence',
    'Real Estate Comps',
    'Influencer & Media Research',
    'Subdivision & Land Intelligence',
    'Event & REF Data'
  )),
  company      TEXT NOT NULL CHECK (company IN (
    'TX Sparks Construction',
    'SuperConstruct',
    'REF — Real Estate Forum',
    'Leezaspace',
    'General'
  )),
  market       TEXT NOT NULL CHECK (market IN (
    'DFW',
    'Austin',
    'Houston',
    'San Antonio',
    'California',
    'Phoenix',
    'Multi-state',
    'National',
    'Texas — All Markets'
  )),
  priority     TEXT NOT NULL DEFAULT 'Normal'
                 CHECK (priority IN (
                   'Normal','High','Urgent'
                 )),
  status       TEXT NOT NULL DEFAULT 'In Progress'
                 CHECK (status IN (
                   'In Progress','Completed',
                   'Flagged','On Hold'
                 )),
  requested_by UUID REFERENCES users(id)
                 ON DELETE SET NULL,
  assigned_to  UUID[] DEFAULT '{}',
  timeline     DATE,
  sheet_url    TEXT,
  ai_plan      TEXT,
  record_count INTEGER DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);
