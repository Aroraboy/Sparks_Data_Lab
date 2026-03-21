import { useState } from 'react';
import { useContacts, useVerifyEmail, useVerifyBatch, usePdlSearchPersons, usePdlEnrich } from '../api/hooks';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const MARKETS = ['DFW', 'Austin', 'Houston', 'San Antonio', 'California', 'Phoenix', 'Multi-state', 'National', 'Texas — All Markets'];
const SOURCES = ['manual', 'pdl', 'google_sheet', 'scraper'];
const VERIFICATION_STATUSES = ['pending', 'valid', 'invalid', 'catchall', 'unknown'];

export default function ContactsPage() {
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [pdlOpen, setPdlOpen] = useState(false);
  const [pdlQuery, setPdlQuery] = useState('');

  const { data, isLoading } = useContacts({ ...filters, page, limit: 50 });
  const contacts = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 50);

  const verifyEmail = useVerifyEmail();
  const verifyBatch = useVerifyBatch();
  const pdlSearch = usePdlSearchPersons();
  const pdlEnrich = usePdlEnrich();

  const handleFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined }));
    setPage(1);
  };

  const handleVerifySingle = (email) => {
    verifyEmail.mutate({ email }, {
      onSuccess: (result) => {
        toast.success(`${email}: ${result.status}`);
      },
      onError: (err) => toast.error(err.response?.data?.error || 'Verification failed'),
    });
  };

  const handleVerifySelected = () => {
    const emails = contacts
      .filter((c) => selectedIds.includes(c.id) && c.email)
      .map((c) => c.email);

    if (emails.length === 0) {
      toast.error('No emails selected');
      return;
    }

    verifyBatch.mutate({ emails }, {
      onSuccess: (result) => {
        const valid = result.results.filter((r) => r.status === 'valid').length;
        toast.success(`Verified ${result.results.length} emails (${valid} valid)`);
        setSelectedIds([]);
      },
      onError: (err) => toast.error(err.response?.data?.error || 'Batch verification failed'),
    });
  };

  const handleEnrich = (contact) => {
    const params = {};
    if (contact.email) params.email = contact.email;
    if (contact.linkedin_url) params.linkedin_url = contact.linkedin_url;
    if (contact.full_name) params.name = contact.full_name;
    if (contact.company) params.company = contact.company;

    pdlEnrich.mutate(params, {
      onSuccess: (result) => {
        toast.success(`Enriched: ${result.person?.full_name || 'contact'} (${Math.round(result.likelihood * 100)}% match)`);
      },
      onError: (err) => toast.error(err.response?.data?.error || 'Enrichment failed'),
    });
  };

  const handlePdlSearch = (e) => {
    e.preventDefault();
    if (!pdlQuery.trim()) return;
    pdlSearch.mutate({ query: pdlQuery, size: 10 }, {
      onError: (err) => toast.error(err.response?.data?.error || 'PDL search failed'),
    });
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === contacts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(contacts.map((c) => c.id));
    }
  };

  const statusBadge = (status) => {
    const colors = {
      valid: 'bg-green-100 text-green-800',
      invalid: 'bg-red-100 text-red-800',
      catchall: 'bg-yellow-100 text-yellow-800',
      unknown: 'bg-gray-100 text-gray-600',
      pending: 'bg-blue-100 text-blue-800',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || colors.pending}`}>
        {status || 'pending'}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <p className="text-sm text-gray-500 mt-1">{total} contacts total</p>
        </div>
        <div className="flex gap-2">
          {selectedIds.length > 0 && (
            <button
              onClick={handleVerifySelected}
              disabled={verifyBatch.isPending}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-700 disabled:opacity-50"
            >
              {verifyBatch.isPending ? 'Verifying...' : `Verify ${selectedIds.length} Selected`}
            </button>
          )}
          <button
            onClick={() => setPdlOpen(!pdlOpen)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
          >
            PDL Search
          </button>
        </div>
      </div>

      {/* PDL Search Panel */}
      {pdlOpen && (
        <div className="bg-white p-4 rounded-lg border border-indigo-200 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">People Data Labs Search</h3>
          <form onSubmit={handlePdlSearch} className="flex gap-2 mb-4">
            <input
              type="text"
              value={pdlQuery}
              onChange={(e) => setPdlQuery(e.target.value)}
              placeholder="Search by name, company, title, location..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={pdlSearch.isPending}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50"
            >
              {pdlSearch.isPending ? 'Searching...' : 'Search'}
            </button>
          </form>

          {pdlSearch.data && (
            <div>
              <p className="text-xs text-gray-500 mb-2">{pdlSearch.data.total} results found</p>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {(pdlSearch.data.results || []).map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                    <div>
                      <span className="font-medium">{p.full_name || 'Unknown'}</span>
                      {p.company && <span className="text-gray-500 ml-2">@ {p.company}</span>}
                      {p.designation && <span className="text-gray-400 ml-1">— {p.designation}</span>}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      {p.email && <span>{p.email}</span>}
                      {p.city && <span>{p.city}, {p.state}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search contacts..."
          onChange={(e) => handleFilter('search', e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64 focus:ring-2 focus:ring-indigo-500"
        />
        <select
          onChange={(e) => handleFilter('market', e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All Markets</option>
          {MARKETS.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <select
          onChange={(e) => handleFilter('source', e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All Sources</option>
          {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          onChange={(e) => handleFilter('verified', e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All Verification</option>
          {VERIFICATION_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Contacts Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === contacts.length && contacts.length > 0}
                    onChange={toggleAll}
                    className="rounded"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Market</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Verified</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    {Array.from({ length: 9 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-200 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : contacts.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">No contacts found</td></tr>
              ) : (
                contacts.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(c.id)}
                        onChange={() => toggleSelect(c.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{c.full_name || '—'}</div>
                      {c.designation && <div className="text-xs text-gray-400">{c.designation}</div>}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{c.company || '—'}</td>
                    <td className="px-4 py-3">
                      {c.email ? (
                        <a href={`mailto:${c.email}`} className="text-indigo-600 hover:underline text-xs">
                          {c.email}
                        </a>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{c.phone || '—'}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{c.market || '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{c.source || '—'}</td>
                    <td className="px-4 py-3">{statusBadge(c.verification_status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {c.email && (
                          <button
                            onClick={() => handleVerifySingle(c.email)}
                            disabled={verifyEmail.isPending}
                            className="px-2 py-1 text-xs bg-amber-50 text-amber-700 rounded hover:bg-amber-100 disabled:opacity-50"
                            title="Verify email"
                          >
                            ✓
                          </button>
                        )}
                        <button
                          onClick={() => handleEnrich(c)}
                          disabled={pdlEnrich.isPending}
                          className="px-2 py-1 text-xs bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100 disabled:opacity-50"
                          title="Enrich via PDL"
                        >
                          ↗
                        </button>
                        {c.linkedin_url && (
                          <a
                            href={c.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                            title="LinkedIn"
                          >
                            in
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <span className="text-sm text-gray-500">
              Page {page} of {totalPages} ({total} contacts)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1 text-sm border rounded hover:bg-white disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1 text-sm border rounded hover:bg-white disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
