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
