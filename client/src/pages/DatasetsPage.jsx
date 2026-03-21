import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDatasets } from '../api/hooks';
import { format } from 'date-fns';

const COMPANIES = ['', 'TX Sparks Construction', 'SuperConstruct', 'REF — Real Estate Forum', 'Leezaspace', 'General'];
const MARKETS = ['', 'DFW', 'Austin', 'Houston', 'San Antonio', 'California', 'Phoenix', 'Multi-state', 'National', 'Texas — All Markets'];

export default function DatasetsPage() {
  const [filters, setFilters] = useState({ company: '', market: '', search: '', page: 1 });

  const queryParams = { ...filters };
  Object.keys(queryParams).forEach(k => { if (queryParams[k] === '') delete queryParams[k]; });

  const { data, isLoading } = useDatasets(queryParams);
  const datasets = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 20);

  const updateFilter = (key, value) => setFilters(f => ({ ...f, [key]: value, page: 1 }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Datasets</h1>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 mb-4">
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
          placeholder="Search datasets..."
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
              <th className="text-left px-4 py-3 font-medium text-gray-500">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Company</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Market</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Records</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Owner</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Created</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-100">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-200 rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : datasets.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400">No datasets found.</td>
              </tr>
            ) : (
              datasets.map(ds => (
                <tr key={ds.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link to={`/datasets/${ds.id}`} className="text-gray-900 font-medium hover:text-indigo-600">
                      {ds.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{ds.company || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{ds.market || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{ds.record_count ?? 0}</td>
                  <td className="px-4 py-3 text-gray-500">{ds.owner_name || '—'}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {format(new Date(ds.created_at), 'MMM d, yyyy')}
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
          <p className="text-sm text-gray-500">{total} total datasets</p>
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
