import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';

// ─── REQUESTS ────────────────────────────────────────────

export function useRequests(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') query.set(k, v);
  });
  return useQuery({
    queryKey: ['requests', params],
    queryFn: () => api.get(`/requests?${query}`).then(r => r.data),
  });
}

export function useRequest(id) {
  return useQuery({
    queryKey: ['request', id],
    queryFn: () => api.get(`/requests/${id}`).then(r => r.data),
    enabled: !!id,
  });
}

export function useCreateRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/requests', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['requests'] }),
  });
}

export function useUpdateRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => api.patch(`/requests/${id}`, data).then(r => r.data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['requests'] });
      qc.invalidateQueries({ queryKey: ['request', vars.id] });
    },
  });
}

export function useDeleteRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/requests/${id}`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['requests'] }),
  });
}

// ─── COMMENTS ────────────────────────────────────────────

export function useComments(requestId) {
  return useQuery({
    queryKey: ['comments', requestId],
    queryFn: () => api.get(`/requests/${requestId}/comments`).then(r => r.data),
    enabled: !!requestId,
  });
}

export function useAddComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, message }) =>
      api.post(`/requests/${requestId}/comments`, { message }).then(r => r.data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['comments', vars.requestId] });
    },
  });
}

// ─── USERS ───────────────────────────────────────────────

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => api.get('/users').then(r => r.data),
  });
}

// ─── AUTH ────────────────────────────────────────────────

export function useSyncUser() {
  return useMutation({
    mutationFn: () => api.post('/auth/sync-user').then(r => r.data),
  });
}

// ─── NOTIFICATIONS ───────────────────────────────────────

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then(r => r.data),
    refetchInterval: 60000,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.patch(`/notifications/${id}/read`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.patch('/notifications/read-all').then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

// ─── DATASETS ────────────────────────────────────────────

export function useDatasets(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') query.set(k, v);
  });
  return useQuery({
    queryKey: ['datasets', params],
    queryFn: () => api.get(`/datasets?${query}`).then(r => r.data),
  });
}

export function useDataset(id) {
  return useQuery({
    queryKey: ['dataset', id],
    queryFn: () => api.get(`/datasets/${id}`).then(r => r.data),
    enabled: !!id,
  });
}

export function useCreateDataset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/datasets', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['datasets'] }),
  });
}

export function useUpdateDataset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => api.patch(`/datasets/${id}`, data).then(r => r.data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['datasets'] });
      qc.invalidateQueries({ queryKey: ['dataset', vars.id] });
    },
  });
}

export function useAddSource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ datasetId, ...data }) => api.post(`/datasets/${datasetId}/sources`, data).then(r => r.data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['dataset', vars.datasetId] });
    },
  });
}

// ─── PERMITS ─────────────────────────────────────────────

export function usePermits(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') query.set(k, v);
  });
  return useQuery({
    queryKey: ['permits', params],
    queryFn: () => api.get(`/permits?${query}`).then(r => r.data),
  });
}

export function useUpdatePermit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => api.patch(`/permits/${id}`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['permits'] }),
  });
}

// ─── ADMIN ───────────────────────────────────────────────

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/admin/users').then(r => r.data),
  });
}

export function useUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }) => api.patch(`/admin/users/${id}/role`, { role }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });
}

export function useAnalytics() {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: () => api.get('/admin/analytics').then(r => r.data),
  });
}

// ─── RESEARCH ────────────────────────────────────────────

export function useRunResearch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/research', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['research-history'] }),
  });
}

export function useResearchHistory() {
  return useQuery({
    queryKey: ['research-history'],
    queryFn: () => api.get('/research/history').then(r => r.data),
  });
}

// ─── CONTACTS ────────────────────────────────────────────

export function useContacts(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') query.set(k, v);
  });
  return useQuery({
    queryKey: ['contacts', params],
    queryFn: () => api.get(`/contacts?${query}`).then(r => r.data),
  });
}

export function usePdlSearchPersons() {
  return useMutation({
    mutationFn: (data) => api.post('/contacts/pdl/search-persons', data).then(r => r.data),
  });
}

export function usePdlEnrich() {
  return useMutation({
    mutationFn: (data) => api.post('/contacts/pdl/enrich', data).then(r => r.data),
  });
}

export function usePdlSearchCompanies() {
  return useMutation({
    mutationFn: (data) => api.post('/contacts/pdl/search-companies', data).then(r => r.data),
  });
}

export function useVerifyEmail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/contacts/verify-email', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contacts'] }),
  });
}

export function useVerifyBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/contacts/verify-batch', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contacts'] }),
  });
}

// ─── GOOGLE SHEETS IMPORT ────────────────────────────────

export function useImportSheet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ datasetId, ...data }) =>
      api.post(`/datasets/${datasetId}/import-sheet`, data).then(r => r.data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['dataset', vars.datasetId] });
      qc.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
}

// ─── USER PROFILE ────────────────────────────────────────

export function useUpdateUserProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => api.patch(`/users/${id}`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

// ─── SCRAPE LOGS ─────────────────────────────────────────

export function useScrapeLogs() {
  return useQuery({
    queryKey: ['scrape-logs'],
    queryFn: () => api.get('/admin/scrape-logs').then(r => r.data),
  });
}
