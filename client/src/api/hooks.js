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
