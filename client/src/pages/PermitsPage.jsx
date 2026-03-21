import { useState } from 'react';
import { usePermits, useUpdatePermit, useUsers } from '../api/hooks';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  'New': 'bg-blue-100 text-blue-800',
  'Contacted': 'bg-amber-100 text-amber-800',
  'Assigned': 'bg-green-100 text-green-800',
  'Not Relevant': 'bg-gray-100 text-gray-800',
};

const PROJECT_TYPES = ['', 'Ground-Up', 'Interior Build-Out', 'Mixed', 'Unknown'];
const PERMIT_STATUSES = ['', 'New', 'Contacted', 'Assigned', 'Not Relevant'];

export default function PermitsPage() {
  const [filters, setFilters] = useState({ city: '', project_type: '', status: '', search: '', page: 1 });
  const queryParams = { ...filters };
  Object.keys(queryParams).forEach(k => { if (queryParams[k] === '') delete queryParams[k]; });

  const { data, isLoading } = usePermits(queryParams);
  const { data: usersData } = useUsers();
  const updateMutation = useUpdatePermit();

  const permits = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 20);
  const users = usersData?.data || [];

  const updateFilter = (key, value) => setFilters(f => ({ ...f, [key]: value, page: 1 }));

  const handleStatusChange = (id, status) => {
    updateMutation.mutate({ id, status }, {
      onSuccess: () => toast.success('Status updated'),
      onError: (err) => toast.error(err.response?.data?.error || 'Failed'),
    });
  };

  const handleAssign = (id, assigned_to) => {
    updateMutation.mutate({ id, assigned_to: assigned_to || null }, {
      onSuccess: () => toast.success('Assignment updated'),
      onError: (err) => toast.error(err.response?.data?.error || 'Failed'),
    });
  };

  const formatCurrency = (v) => {
    if (!v) return '—';
    return '$' + v.toLocaleString();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Permit Leads</h1>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input type="text" placeholder="City" value={filters.city} onChange={e => updateFilter('city', e.target.value)} className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-32" />
        <select value={filters.project_type} onChange={e => updateFilter('project_type', e.target.value)} className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm">
          <option value="">All Types</option>
          {PROJECT_TYPES.filter(Boolean).map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filters.status} onChange={e => updateFilter('status', e.target.value)} className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm">
          <option value="">All Statuses</option>
          {PERMIT_STATUSES.filter(Boolean).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <input type="text" placeholder="Search..." value={filters.search} onChange={e => updateFilter('search', e.target.value)} className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-48" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-500">Permit #</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Project</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">City</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Type</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Value</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Owner/GC</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Assigned</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-100">
                  {Array.from({ length: 8 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-200 rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : permits.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-gray-400">No permit leads found.</td>
              </tr>
            ) : (
              permits.map(p => (
                <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{p.permit_number || '—'}</td>
                  <td className="px-4 py-3">
                    <p className="text-gray-900 font-medium">{p.project_name || p.address || '—'}</p>
                    {p.address && p.project_name && <p className="text-xs text-gray-400">{p.address}</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{p.city}, {p.state}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{p.project_type || '—'}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatCurrency(p.estimated_value)}</td>
                  <td className="px-4 py-3 text-gray-500">
                    <p>{p.owner_name || '—'}</p>
                    {p.gc_name && <p className="text-xs text-gray-400">GC: {p.gc_name}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <select value={p.status} onChange={e => handleStatusChange(p.id, e.target.value)} className="border border-gray-200 rounded px-2 py-1 text-xs">
                      {PERMIT_STATUSES.filter(Boolean).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select value={p.assigned_to || ''} onChange={e => handleAssign(p.id, e.target.value)} className="border border-gray-200 rounded px-2 py-1 text-xs max-w-[120px]">
                      <option value="">Unassigned</option>
                      {users.map(u => <option key={u.id} value={u.id}>{u.name || u.email}</option>)}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">{total} total permits</p>
          <div className="flex gap-2">
            <button onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))} disabled={filters.page <= 1} className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50">Previous</button>
            <span className="px-3 py-1 text-sm text-gray-600">Page {filters.page} of {totalPages}</span>
            <button onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))} disabled={filters.page >= totalPages} className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
