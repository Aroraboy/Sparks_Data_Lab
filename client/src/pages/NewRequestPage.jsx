import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCreateRequest } from '../api/hooks';
import { useUsers } from '../api/hooks';

const REQUEST_TYPES = [
  'Contact Database',
  'Permit Intelligence',
  'Real Estate Comps',
  'Influencer & Media Research',
  'Subdivision & Land Intelligence',
  'Event & REF Data',
];

const COMPANIES = [
  'TX Sparks Construction',
  'SuperConstruct',
  'REF — Real Estate Forum',
  'Leezaspace',
  'General',
];

const MARKETS = [
  'DFW', 'Austin', 'Houston', 'San Antonio',
  'California', 'Phoenix', 'Multi-state',
  'National', 'Texas — All Markets',
];

export default function NewRequestPage() {
  const navigate = useNavigate();
  const createRequest = useCreateRequest();
  const { data: usersData } = useUsers();
  const users = usersData?.data || [];

  const [form, setForm] = useState({
    title: '',
    requirement: '',
    request_type: 'Contact Database',
    company: 'TX Sparks Construction',
    market: 'DFW',
    priority: 'Normal',
    assigned_to: [],
    timeline: '',
  });

  const [showWarning, setShowWarning] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAssignees = (e) => {
    const values = Array.from(e.target.selectedOptions, o => o.value);
    setForm({ ...form, assigned_to: values });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = { ...form };
    if (!payload.timeline) delete payload.timeline;

    try {
      const result = await createRequest.mutateAsync(payload);

      if (result.warning) {
        setShowWarning(result.warning);
      }

      toast.success('Request submitted successfully');
      navigate(`/requests/${result.data.id}`);
    } catch (err) {
      const msg = err.response?.data?.error || 'Something went wrong. Try again.';
      toast.error(msg);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">New Data Request</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            minLength={3}
            maxLength={200}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            placeholder="e.g. 200 General Contractors in Dallas with verified emails"
          />
        </div>

        {/* Requirement */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Requirement Details</label>
          <textarea
            name="requirement"
            value={form.requirement}
            onChange={handleChange}
            required
            minLength={20}
            rows={5}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-y"
            placeholder="Describe exactly what data you need, including fields, geography, filters, and any specific sources to check..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Request Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Request Type</label>
            <select name="request_type" value={form.request_type} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
              {REQUEST_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Company */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
            <select name="company" value={form.company} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
              {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Market */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Market</label>
            <select name="market" value={form.market} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
              {MARKETS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select name="priority" value={form.priority} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
              <option value="Normal">Normal</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
        </div>

        {/* Assigned To */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Assign To (hold Ctrl to select multiple)</label>
          <select
            multiple
            value={form.assigned_to}
            onChange={handleAssignees}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none min-h-[100px]"
          >
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
            ))}
          </select>
        </div>

        {/* Timeline */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Timeline (optional)</label>
          <input
            type="date"
            name="timeline"
            value={form.timeline}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={createRequest.isPending}
            className="w-full bg-indigo-600 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {createRequest.isPending ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>

      {/* Duplicate Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-amber-700 mb-2">Similar Dataset Found</h3>
            <p className="text-sm text-gray-600 mb-3">{showWarning.message}</p>
            <div className="bg-amber-50 rounded-lg p-3 mb-4">
              <p className="text-sm font-medium text-gray-900">{showWarning.similar.name}</p>
              <p className="text-xs text-gray-500 mt-1">
                Created: {new Date(showWarning.similar.created_at).toLocaleDateString()} | Owner: {showWarning.similar.owner_name}
              </p>
            </div>
            <div className="flex gap-3">
              {showWarning.similar.sheet_url && (
                <a
                  href={showWarning.similar.sheet_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 border border-gray-300 text-gray-700 rounded-lg px-3 py-2 text-sm text-center hover:bg-gray-50"
                >
                  View Sheet
                </a>
              )}
              <button
                onClick={() => setShowWarning(null)}
                className="flex-1 bg-amber-600 text-white rounded-lg px-3 py-2 text-sm hover:bg-amber-700"
              >
                OK, I understand
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
