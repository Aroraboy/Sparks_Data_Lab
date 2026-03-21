CREATE TABLE permit_lead_contacts (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  permit_lead_id UUID NOT NULL REFERENCES permit_leads(id)
                   ON DELETE CASCADE,
  contact_id     UUID NOT NULL REFERENCES contacts(id)
                   ON DELETE CASCADE,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (permit_lead_id, contact_id)
);
