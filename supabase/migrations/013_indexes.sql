CREATE INDEX idx_requests_status
  ON requests(status);
CREATE INDEX idx_requests_requested_by
  ON requests(requested_by);
CREATE INDEX idx_requests_request_type
  ON requests(request_type);
CREATE INDEX idx_requests_company
  ON requests(company);
CREATE INDEX idx_requests_created_at
  ON requests(created_at DESC);
CREATE INDEX idx_contacts_dataset_id
  ON contacts(dataset_id);
CREATE INDEX idx_contacts_email
  ON contacts(email);
CREATE INDEX idx_contacts_pdl_id
  ON contacts(pdl_id);
CREATE INDEX idx_contacts_verification_status
  ON contacts(verification_status);
CREATE INDEX idx_permit_leads_city
  ON permit_leads(city);
CREATE INDEX idx_permit_leads_status
  ON permit_leads(status);
CREATE INDEX idx_permit_leads_approval_date
  ON permit_leads(approval_date DESC);
CREATE INDEX idx_notifications_user_read
  ON notifications(user_id, read);
