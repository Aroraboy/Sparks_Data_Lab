import { useState } from 'react';
import { useRunResearch, useResearchHistory } from '../api/hooks';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const MODES = [
  { value: 'Full Research Plan', label: 'Full Research Plan', desc: 'Comprehensive strategy with objectives, sources, methodology, and timeline' },
  { value: 'Sources Only', label: 'Sources Only', desc: 'Focused list of data sources with access methods and expected volume' },
  { value: 'Validation Checklist', label: 'Validation Checklist', desc: 'Data quality checklist with pass/fail criteria for your dataset' },
  { value: 'Outreach Strategy', label: 'Outreach Strategy', desc: 'B2B outreach plan with segments, channels, and message templates' },
];

const REQUEST_TYPES = [
  '', 'Contact Database', 'Permit Intelligence', 'Real Estate Comps',
  'Influencer & Media Research', 'Subdivision & Land Intelligence', 'Event & REF Data',
];

const MARKETS = [
  '', 'DFW', 'Austin', 'Houston', 'San Antonio',
  'California', 'Phoenix', 'Multi-state', 'National', 'Texas — All Markets',
];

const COMPANIES = [
  '', 'TX Sparks Construction', 'SuperConstruct',
  'REF — Real Estate Forum', 'Leezaspace', 'General',
];

export default function ResearchPage() {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState('Full Research Plan');
  const [requestType, setRequestType] = useState('');
  const [market, setMarket] = useState('');
  const [company, setCompany] = useState('');
  const [result, setResult] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  const runMutation = useRunResearch();
  const { data: historyData, isLoading: historyLoading } = useResearchHistory();
  const history = historyData?.data || [];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim() || query.trim().length < 10) {
      toast.error('Please enter at least 10 characters');
      return;
    }

    setResult(null);
    setSelectedSession(null);

    runMutation.mutate(
      {
        query: query.trim(),
        mode,
        request_type: requestType || null,
        market: market || null,
        company: company || null,
      },
      {
        onSuccess: (data) => {
          setResult(data.data);
          toast.success('Research complete');
        },
        onError: (err) => {
          toast.error(err.response?.data?.error || 'Research failed');
        },
      }
    );
  };

  const viewSession = (session) => {
    setSelectedSession(session);
    setResult(null);
    setShowHistory(false);
  };

  const activeResult = result || selectedSession;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Research Engine</h1>
          <p className="text-sm text-gray-500 mt-1">Powered by Claude — get research plans, source lists, validation checklists, and outreach strategies.</p>
        </div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="text-sm text-indigo-600 hover:underline"
        >
          {showHistory ? 'Hide History' : 'View History'}
        </button>
      </div>

      {/* History panel */}
      {showHistory && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6 max-h-80 overflow-y-auto">
          <div className="px-5 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 text-sm">Research History</h3>
          </div>
          {historyLoading ? (
            <div className="px-5 py-8 text-center text-gray-400 text-sm">Loading...</div>
          ) : history.length === 0 ? (
            <div className="px-5 py-8 text-center text-gray-400 text-sm">No previous research sessions.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {history.map(s => (
                <button
                  key={s.id}
                  onClick={() => viewSession(s)}
                  className="w-full text-left px-5 py-3 hover:bg-gray-50 transition"
                >
                  <p className="text-sm font-medium text-gray-900 truncate">{s.query}</p>
                  <p className="text-xs text-gray-500">
                    {s.mode} · ${s.estimated_cost} · {formatDistanceToNow(new Date(s.created_at), { addSuffix: true })}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input form */}
        <div className="lg:col-span-1 space-y-6">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Research Query</label>
              <textarea
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="e.g. Find all general contractors in DFW that do ground-up commercial construction over $5M..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={4}
                required
                minLength={10}
              />
            </div>

            {/* Mode selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Research Mode</label>
              <div className="space-y-2">
                {MODES.map(m => (
                  <label
                    key={m.value}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition ${
                      mode === m.value
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="mode"
                      value={m.value}
                      checked={mode === m.value}
                      onChange={() => setMode(m.value)}
                      className="mt-0.5"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{m.label}</p>
                      <p className="text-xs text-gray-500">{m.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Context filters */}
            <div className="space-y-3">
              <select value={requestType} onChange={e => setRequestType(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm">
                <option value="">Request Type (optional)</option>
                {REQUEST_TYPES.filter(Boolean).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <select value={market} onChange={e => setMarket(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm">
                <option value="">Market (optional)</option>
                {MARKETS.filter(Boolean).map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <select value={company} onChange={e => setCompany(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm">
                <option value="">Company (optional)</option>
                {COMPANIES.filter(Boolean).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <button
              type="submit"
              disabled={runMutation.isPending}
              className="w-full bg-indigo-600 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
            >
              {runMutation.isPending ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Running Research...
                </>
              ) : (
                'Run AI Research'
              )}
            </button>
          </form>
        </div>

        {/* Result panel */}
        <div className="lg:col-span-2">
          {runMutation.isPending && (
            <div className="bg-white rounded-xl border border-gray-200 p-12 shadow-sm text-center">
              <svg className="animate-spin h-8 w-8 mx-auto text-indigo-600 mb-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-gray-600 font-medium">Analyzing with Claude...</p>
              <p className="text-sm text-gray-400 mt-1">Haiku preprocessing → Opus research generation</p>
            </div>
          )}

          {activeResult && !runMutation.isPending && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              {/* Result header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-gray-900">{activeResult.mode || 'Research Result'}</h2>
                  <p className="text-xs text-gray-500 mt-0.5 truncate max-w-md">{activeResult.query}</p>
                </div>
                <div className="text-right text-xs text-gray-400">
                  <p>Haiku: {activeResult.haiku_tokens || 0} tokens</p>
                  <p>Opus: {activeResult.opus_tokens || 0} tokens</p>
                  <p className="font-medium text-gray-600">Cost: ${activeResult.estimated_cost || '0.00'}</p>
                </div>
              </div>

              {/* Result body */}
              <div className="px-6 py-5">
                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                  {activeResult.ai_response}
                </div>
              </div>
            </div>
          )}

          {!activeResult && !runMutation.isPending && (
            <div className="bg-white rounded-xl border border-gray-200 p-12 shadow-sm text-center">
              <div className="text-4xl mb-3">🔬</div>
              <h3 className="font-semibold text-gray-900 mb-1">Ready to Research</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                Enter your research query, select a mode, and let Claude generate a comprehensive analysis for your data operations.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
