import supabase from './supabase.js';

const log = (msg) => console.log(`[${new Date().toISOString()}] ${msg}`);

// ─── REQUESTS ────────────────────────────────────────────

export async function insertRequest(data) {
  const { data: request, error } = await supabase
    .from('requests')
    .insert(data)
    .select()
    .single();
  if (error) {
    log(`insertRequest error: ${error.message}`);
    throw error;
  }
  return request;
}

export async function getRequests(filters = {}) {
  let query = supabase.from('requests').select('*, requester:users!requested_by(id, name, email, avatar_url)', { count: 'exact' });

  if (filters.status) query = query.eq('status', filters.status);
  if (filters.request_type) query = query.eq('request_type', filters.request_type);
  if (filters.company) query = query.eq('company', filters.company);
  if (filters.market) query = query.eq('market', filters.market);
  if (filters.requested_by) query = query.eq('requested_by', filters.requested_by);
  if (filters.assigned_to) query = query.contains('assigned_to', [filters.assigned_to]);
  if (filters.from_date) query = query.gte('created_at', filters.from_date);
  if (filters.to_date) query = query.lte('created_at', filters.to_date);
  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,requirement.ilike.%${filters.search}%`);
  }

  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  query = query.order('created_at', { ascending: false }).range(from, to);

  const { data, error, count } = await query;
  if (error) {
    log(`getRequests error: ${error.message}`);
    throw error;
  }
  return { data, total: count, page, limit };
}

export async function getRequestById(id) {
  const { data, error } = await supabase
    .from('requests')
    .select('*, requester:users!requested_by(id, name, email, avatar_url)')
    .eq('id', id)
    .single();
  if (error) {
    log(`getRequestById error: ${error.message}`);
    throw error;
  }
  return data;
}

export async function updateRequest(id, updates) {
  const { data, error } = await supabase
    .from('requests')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) {
    log(`updateRequest error: ${error.message}`);
    throw error;
  }
  return data;
}

export async function deleteRequest(id) {
  const { error } = await supabase.from('requests').delete().eq('id', id);
  if (error) {
    log(`deleteRequest error: ${error.message}`);
    throw error;
  }
}

// ─── STATUS HISTORY ──────────────────────────────────────

export async function insertStatusHistory(data) {
  const { data: row, error } = await supabase
    .from('request_status_history')
    .insert(data)
    .select()
    .single();
  if (error) {
    log(`insertStatusHistory error: ${error.message}`);
    throw error;
  }
  return row;
}

export async function getStatusHistory(requestId) {
  const { data, error } = await supabase
    .from('request_status_history')
    .select('*, changer:users!changed_by(id, name, avatar_url)')
    .eq('request_id', requestId)
    .order('created_at', { ascending: true });
  if (error) {
    log(`getStatusHistory error: ${error.message}`);
    throw error;
  }
  return data;
}

// ─── COMMENTS ────────────────────────────────────────────

export async function insertComment(data) {
  const { data: comment, error } = await supabase
    .from('request_comments')
    .insert(data)
    .select('*, commenter:users!user_id(id, name, avatar_url)')
    .single();
  if (error) {
    log(`insertComment error: ${error.message}`);
    throw error;
  }
  return comment;
}

export async function getComments(requestId) {
  const { data, error } = await supabase
    .from('request_comments')
    .select('*, commenter:users!user_id(id, name, avatar_url)')
    .eq('request_id', requestId)
    .order('created_at', { ascending: true });
  if (error) {
    log(`getComments error: ${error.message}`);
    throw error;
  }
  return data;
}

// ─── NOTIFICATIONS ───────────────────────────────────────

export async function insertNotification(data) {
  const { error } = await supabase.from('notifications').insert(data);
  if (error) {
    log(`insertNotification error: ${error.message}`);
  }
}

export async function insertNotifications(rows) {
  const { error } = await supabase.from('notifications').insert(rows);
  if (error) {
    log(`insertNotifications error: ${error.message}`);
  }
}

// ─── DATASETS ────────────────────────────────────────────

export async function getAllDatasetNames() {
  const { data, error } = await supabase
    .from('datasets')
    .select('id, name, sheet_url, created_at, owner_name');
  if (error) {
    log(`getAllDatasetNames error: ${error.message}`);
    throw error;
  }
  return data;
}

export async function getDatasets(filters = {}) {
  let query = supabase.from('datasets').select('*', { count: 'exact' });

  if (filters.company) query = query.eq('company', filters.company);
  if (filters.market) query = query.eq('market', filters.market);
  if (filters.request_type) query = query.eq('request_type', filters.request_type);
  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,purpose.ilike.%${filters.search}%`);
  }

  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  query = query.order('created_at', { ascending: false }).range(from, to);

  const { data, error, count } = await query;
  if (error) { log(`getDatasets error: ${error.message}`); throw error; }
  return { data, total: count, page, limit };
}

export async function getDatasetById(id) {
  const { data, error } = await supabase
    .from('datasets').select('*').eq('id', id).single();
  if (error) { log(`getDatasetById error: ${error.message}`); throw error; }
  return data;
}

export async function insertDataset(row) {
  const { data, error } = await supabase
    .from('datasets').insert(row).select().single();
  if (error) { log(`insertDataset error: ${error.message}`); throw error; }
  return data;
}

export async function updateDataset(id, updates) {
  const { data, error } = await supabase
    .from('datasets')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id).select().single();
  if (error) { log(`updateDataset error: ${error.message}`); throw error; }
  return data;
}

// ─── SOURCES ─────────────────────────────────────────────

export async function getSourcesByDatasetId(datasetId) {
  const { data, error } = await supabase
    .from('sources').select('*').eq('dataset_id', datasetId)
    .order('created_at', { ascending: true });
  if (error) { log(`getSourcesByDatasetId error: ${error.message}`); throw error; }
  return data;
}

export async function insertSource(row) {
  const { data, error } = await supabase
    .from('sources').insert(row).select().single();
  if (error) { log(`insertSource error: ${error.message}`); throw error; }
  return data;
}

// ─── CONTACTS ────────────────────────────────────────────

export async function getContacts(filters = {}) {
  let query = supabase.from('contacts').select('*', { count: 'exact' });

  if (filters.dataset_id) query = query.eq('dataset_id', filters.dataset_id);
  if (filters.market) query = query.eq('market', filters.market);
  if (filters.category) query = query.eq('category', filters.category);
  if (filters.source) query = query.eq('source', filters.source);
  if (filters.verified !== undefined) query = query.eq('verified', filters.verified);
  if (filters.search) {
    query = query.or(`full_name.ilike.%${filters.search}%,company.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
  }

  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 50;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  query = query.order('created_at', { ascending: false }).range(from, to);

  const { data, error, count } = await query;
  if (error) { log(`getContacts error: ${error.message}`); throw error; }
  return { data, total: count, page, limit };
}

// ─── PERMIT LEADS ────────────────────────────────────────

export async function getPermitLeads(filters = {}) {
  let query = supabase.from('permit_leads').select('*', { count: 'exact' });

  if (filters.city) query = query.eq('city', filters.city);
  if (filters.state) query = query.eq('state', filters.state);
  if (filters.project_type) query = query.eq('project_type', filters.project_type);
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.assigned_to) query = query.eq('assigned_to', filters.assigned_to);
  if (filters.search) {
    query = query.or(`project_name.ilike.%${filters.search}%,address.ilike.%${filters.search}%,owner_name.ilike.%${filters.search}%,gc_name.ilike.%${filters.search}%`);
  }

  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  query = query.order('created_at', { ascending: false }).range(from, to);

  const { data, error, count } = await query;
  if (error) { log(`getPermitLeads error: ${error.message}`); throw error; }
  return { data, total: count, page, limit };
}

export async function getPermitLeadById(id) {
  const { data, error } = await supabase
    .from('permit_leads').select('*').eq('id', id).single();
  if (error) { log(`getPermitLeadById error: ${error.message}`); throw error; }
  return data;
}

export async function updatePermitLead(id, updates) {
  const { data, error } = await supabase
    .from('permit_leads')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id).select().single();
  if (error) { log(`updatePermitLead error: ${error.message}`); throw error; }
  return data;
}

// ─── NOTIFICATIONS (extended) ────────────────────────────

export async function getNotifications(userId) {
  const { data, error } = await supabase
    .from('notifications').select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) { log(`getNotifications error: ${error.message}`); throw error; }
  return data;
}

export async function markNotificationRead(id, userId) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id).eq('user_id', userId);
  if (error) { log(`markNotificationRead error: ${error.message}`); throw error; }
}

export async function markAllNotificationsRead(userId) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId).eq('is_read', false);
  if (error) { log(`markAllNotificationsRead error: ${error.message}`); throw error; }
}

// ─── ADMIN / ANALYTICS ──────────────────────────────────

export async function getAllUsersAdmin() {
  const { data, error } = await supabase
    .from('users').select('*').order('name');
  if (error) { log(`getAllUsersAdmin error: ${error.message}`); throw error; }
  return data;
}

export async function updateUserRole(id, role) {
  const { data, error } = await supabase
    .from('users')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', id).select().single();
  if (error) { log(`updateUserRole error: ${error.message}`); throw error; }
  return data;
}

export async function getRequestStats() {
  const { data, error } = await supabase
    .from('requests').select('status', { count: 'exact', head: false });
  if (error) { log(`getRequestStats error: ${error.message}`); throw error; }

  const stats = { total: data.length, in_progress: 0, completed: 0, flagged: 0, on_hold: 0 };
  for (const r of data) {
    const key = r.status.toLowerCase().replace(/\s/g, '_');
    if (key in stats) stats[key]++;
  }
  return stats;
}

export async function getDatasetStats() {
  const { count, error } = await supabase
    .from('datasets').select('*', { count: 'exact', head: true });
  if (error) { log(`getDatasetStats error: ${error.message}`); throw error; }

  const { count: contactCount, error: cErr } = await supabase
    .from('contacts').select('*', { count: 'exact', head: true });
  if (cErr) { log(`getDatasetStats contact count error: ${cErr.message}`); }

  return { total_datasets: count, total_contacts: contactCount || 0 };
}

export async function getUserStats() {
  const { count, error } = await supabase
    .from('users').select('*', { count: 'exact', head: true }).eq('is_active', true);
  if (error) { log(`getUserStats error: ${error.message}`); throw error; }
  return { active_users: count };
}

export async function getRecentRequestsSummary() {
  const { data, error } = await supabase
    .from('requests')
    .select('id, title, status, priority, company, created_at, requested_by')
    .order('created_at', { ascending: false })
    .limit(10);
  if (error) { log(`getRecentRequestsSummary error: ${error.message}`); throw error; }
  return data;
}

export async function getTopDatasets() {
  const { data, error } = await supabase
    .from('datasets')
    .select('id, name, record_count, company, created_at')
    .order('record_count', { ascending: false })
    .limit(10);
  if (error) { log(`getTopDatasets error: ${error.message}`); throw error; }
  return data;
}

// ─── USERS ───────────────────────────────────────────────

export async function getAllUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, avatar_url, role, is_active')
    .eq('is_active', true)
    .order('name');
  if (error) {
    log(`getAllUsers error: ${error.message}`);
    throw error;
  }
  return data;
}

export async function getUserById(id) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();
  if (error) {
    log(`getUserById error: ${error.message}`);
    throw error;
  }
  return data;
}

export async function getUsersByIds(ids) {
  if (!ids || ids.length === 0) return [];
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, avatar_url')
    .in('id', ids);
  if (error) {
    log(`getUsersByIds error: ${error.message}`);
    throw error;
  }
  return data;
}
