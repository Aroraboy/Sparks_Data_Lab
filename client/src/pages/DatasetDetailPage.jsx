import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDataset, useUpdateDataset, useAddSource } from '../api/hooks';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function DatasetDetailPage() {
  const { id } = useParams();
  const { data: result, isLoading } = useDataset(id);
  const updateMutation = useUpdateDataset();
  const addSourceMutation = useAddSource();
  const [showSourceForm, setShowSourceForm] = useState(false);
  const [sourceForm, setSourceForm] = useState({ source_name: '', source_url: '', tool_used: '', notes: '' });

  const dataset = result?.data;

  const handleAddSource = (e) => {
    e.preventDefault();
    if (!sourceForm.source_name.trim()) return;
    addSourceMutation.mutate({ datasetId: id, ...sourceForm }, {
      onSuccess: () => {
        setSourceForm({ source_name: '', source_url: '', tool_used: '', notes: '' });
        setShowSourceForm(false);
        toast.success('Source added');
      },
      onError: (err) => toast.error(err.response?.data?.error || 'Failed to add source'),
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-6 bg-gray-200 rounded animate-pulse w-3/4" />
        ))}
      </div>
    );
  }

  if (!dataset) return <p className="text-gray-500">Dataset not found.</p>;

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/datasets" className="text-sm text-indigo-600 hover:underline">← Back to Datasets</Link>
      <h1 className="text-2xl font-bold text-gray-900 mt-2 mb-1">{dataset.name}</h1>
      <p className="text-sm text-gray-500 mb-6">
        Created {format(new Date(dataset.created_at), 'MMM d, yyyy')}
        {dataset.owner_name ? ` by ${dataset.owner_name}` : ''}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Details</h2>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div><dt className="text-gray-500">Company</dt><dd className="font-medium text-gray-900">{dataset.company || '—'}</dd></div>
              <div><dt className="text-gray-500">Market</dt><dd className="font-medium text-gray-900">{dataset.market || '—'}</dd></div>
              <div><dt className="text-gray-500">Type</dt><dd className="font-medium text-gray-900">{dataset.request_type || '—'}</dd></div>
              <div><dt className="text-gray-500">Records</dt><dd className="font-medium text-gray-900">{dataset.record_count ?? 0}</dd></div>
              <div className="col-span-2"><dt className="text-gray-500">Purpose</dt><dd className="font-medium text-gray-900">{dataset.purpose || '—'}</dd></div>
              <div className="col-span-2"><dt className="text-gray-500">Delivery Note</dt><dd className="font-medium text-gray-900">{dataset.delivery_note || '—'}</dd></div>
            </dl>
          </div>

          {/* Sources */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-700">Sources ({dataset.sources?.length || 0})</h2>
              <button onClick={() => setShowSourceForm(!showSourceForm)} className="text-sm text-indigo-600 hover:underline">
                {showSourceForm ? 'Cancel' : '+ Add Source'}
              </button>
            </div>

            {showSourceForm && (
              <form onSubmit={handleAddSource} className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
                <input type="text" placeholder="Source name *" value={sourceForm.source_name} onChange={e => setSourceForm(f => ({ ...f, source_name: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" required />
                <input type="url" placeholder="URL (optional)" value={sourceForm.source_url} onChange={e => setSourceForm(f => ({ ...f, source_url: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                <input type="text" placeholder="Tool used (optional)" value={sourceForm.tool_used} onChange={e => setSourceForm(f => ({ ...f, tool_used: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                <textarea placeholder="Notes (optional)" value={sourceForm.notes} onChange={e => setSourceForm(f => ({ ...f, notes: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" rows={2} />
                <button type="submit" disabled={addSourceMutation.isPending} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
                  Add Source
                </button>
              </form>
            )}

            {(!dataset.sources || dataset.sources.length === 0) && !showSourceForm && (
              <p className="text-sm text-gray-400">No sources recorded.</p>
            )}

            {dataset.sources && dataset.sources.length > 0 && (
              <div className="space-y-3">
                {dataset.sources.map(s => (
                  <div key={s.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 rounded bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0">S</div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{s.source_name}</p>
                      {s.source_url && (
                        <a href={s.source_url} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline break-all">
                          {s.source_url}
                        </a>
                      )}
                      {s.tool_used && <p className="text-xs text-gray-500 mt-0.5">Tool: {s.tool_used}</p>}
                      {s.notes && <p className="text-xs text-gray-500 mt-0.5">{s.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Sheet URL */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Google Sheet</h3>
            {dataset.sheet_url ? (
              <a href={dataset.sheet_url} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline break-all">
                Open Sheet
              </a>
            ) : (
              <p className="text-sm text-gray-400">No sheet linked</p>
            )}
          </div>

          {/* Linked Request */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Linked Request</h3>
            {dataset.request_id ? (
              <Link to={`/requests/${dataset.request_id}`} className="text-sm text-indigo-600 hover:underline">
                View Request
              </Link>
            ) : (
              <p className="text-sm text-gray-400">Not linked to a request</p>
            )}
          </div>

          {/* Metadata */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm text-sm space-y-2">
            <div className="flex justify-between"><span className="text-gray-500">Pre-existing</span><span className="text-gray-900">{dataset.is_pre_existing ? 'Yes' : 'No'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Updated</span><span className="text-gray-900">{format(new Date(dataset.updated_at), 'MMM d, yyyy')}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
