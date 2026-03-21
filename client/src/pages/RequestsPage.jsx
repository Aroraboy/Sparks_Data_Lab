import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useRequests } from '../api/hooks';
import useAuthStore from '../stores/authStore';
import { format } from 'date-fns';

const STATUS_COLORS = {
  'In Progress': 'bg-amber-100 text-amber-800',
  'Completed': 'bg-green-100 text-green-800',
  'Flagged': 'bg-red-100 text-red-800',
  'On Hold': 'bg-gray-100 text-gray-800',
};

const PRIORITY_COLORS = {
  'Normal': 'bg-blue-100 text-blue-800',
  'High': 'bg-orange-100 text-orange-800',
  'Urgent': 'bg-red-100 text-red-800',
};

const REQUEST_TYPES = [
  '', 'Contact Database', 'Permit Intelligence', 'Real Estate Comps',
  'Influencer & Media Research', 'Subdivision & Land Intelligence', 'Event & REF Data',
];

const COMPANIES = [
  '', 'TX Sparks Construction', 'SuperConstruct',
  'REF — Real Estate Forum', 'Leezaspace', 'General',
];

const MARKETS = [
  '', 'DFW', 'Austin', 'Houston', 'San Antonio',
  'California', 'Phoenix', 'Multi-state', 'National', 'Texas — All Markets',
];

const STATUSES = ['', 'In Progress', 'Completed', 'Flagged', 'On Hold'];

export default function RequestsPage() {
  const { user } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    request_type: searchParams.get('request_type') || '',
    company: searchParams.get('company') || '',
    market: searchParams.get('market') || '',
    search: searchParams.get('search') || '',
    page: parseInt(searchParams.get('page')) || 1,
  });

  const [tab, setTab] = useState('all');

  const queryParams = { ...filters };
  if (tab === 'my_tasks') queryParams.my_tasks = 'true';
  if (tab === 'unassigned') queryParams.assigned_to = '';
  Object.keys(queryParams).forEach(k => {
    if (queryParams[k] === '') delete queryParams[k];
  });

  const { data, isLoading } = useRequests(queryParams);
  const requests = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 20);

  const updateFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Requests</h1>
        <Link
          to="/requests/new"
          className="bg-indigo-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-indigo-700 transition"
        >
          + New Request
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 rounded-lg p-1 w-fit">
        {[
          { key: 'all', label: 'All Requests' },
          { key: 'my_tasks', label: 'My Tasks' },
          { key: 'unassigned', label: 'Unassigned' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
              tab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 mb-4">
        <select value={filters.status} onChange={e => updateFilter('status', e.target.value)} className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm">
          <option value="">All Statuses</option>
          {STATUSES.filter(Boolean).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filters.request_type} onChange={e => updateFilter('request_type', e.target.value)} className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm">
          <option value="">All Types</option>
          {REQUEST_TYPES.filter(Boolean).map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filters.company} onChange={e => updateFilter('company', e.target.value)} className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm">
          <option value="">All Companies</option>
          {COMPANIES.filter(Boolean).map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filters.market} onChange={e => updateFilter('market', e.target.value)} className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm">
          <option value="">All Markets</option>
          {MARKETS.filter(Boolean).map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <input
          type="text"
          placeholder="Search..."
          value={filters.search}
          onChange={e => updateFilter('search', e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-48"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-500">Date</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Title</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Type</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Company</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Priority</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-100">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-gray-200 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : requests.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400">
                  No requests yet. Submit your first data request to get started.
                </td>
              </tr>
            ) : (
              requests.map(req => (
                <tr key={req.id} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    <Link to={`/requests/${req.id}`} className="block">
                      {format(new Date(req.created_at), 'MMM d, yyyy')}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Link to={`/requests/${req.id}`} className="text-gray-900 font-medium hover:text-indigo-600">
                      {req.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{req.request_type}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{req.company}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_COLORS[req.priority]}`}>
                      {req.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[req.status]}`}>
                      {req.status}
                    </span>
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
          <p className="text-sm text-gray-500">{total} total requests</p>
          <div className="flex gap-2">
            <button
              onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
              disabled={filters.page <= 1}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm text-gray-600">
              Page {filters.page} of {totalPages}
            </span>
            <button
              onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
              disabled={filters.page >= totalPages}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
