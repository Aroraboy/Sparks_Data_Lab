ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_all"
  ON users FOR SELECT USING (TRUE);
CREATE POLICY "users_update_own"
  ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "requests_select_all"
  ON requests FOR SELECT USING (TRUE);
CREATE POLICY "requests_insert_auth"
  ON requests FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "requests_update_own_or_assigned"
  ON requests FOR UPDATE USING (
    auth.uid() = requested_by
    OR auth.uid() = ANY(assigned_to)
  );
CREATE POLICY "notifications_own"
  ON notifications FOR ALL
  USING (auth.uid() = user_id);
