import { Link } from 'react-router-dom';
import { useAnalytics } from '../api/hooks';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const STATUS_COLORS_MAP = {
  in_progress: '#f59e0b',
  completed: '#22c55e',
  flagged: '#ef4444',
  on_hold: '#9ca3af',
};

export default function AnalyticsPage() {
  const { data: result, isLoading } = useAnalytics();
  const analytics = result?.data;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-40 bg-gray-200 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!analytics) return <p className="text-gray-500">Failed to load analytics.</p>;

  const { requests, datasets, users, recent_requests, top_datasets } = analytics;

  const statusData = [
    { name: 'In Progress', value: requests.in_progress, color: STATUS_COLORS_MAP.in_progress },
    { name: 'Completed', value: requests.completed, color: STATUS_COLORS_MAP.completed },
    { name: 'Flagged', value: requests.flagged, color: STATUS_COLORS_MAP.flagged },
    { name: 'On Hold', value: requests.on_hold, color: STATUS_COLORS_MAP.on_hold },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <Link to="/admin" className="text-sm text-indigo-600 hover:underline">← Back to Admin</Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Requests', value: requests.total },
          { label: 'Datasets', value: datasets.total_datasets },
          { label: 'Contacts', value: datasets.total_contacts },
          { label: 'Active Users', value: users.active_users },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Status breakdown pie */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Request Status Breakdown</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                {statusData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top datasets bar chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Top Datasets by Records</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={(top_datasets || []).slice(0, 8)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-30} textAnchor="end" height={60} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="record_count" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent requests table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <h2 className="font-semibold text-gray-900 px-5 py-4 border-b border-gray-100">Recent Requests</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-2 font-medium text-gray-500">Title</th>
              <th className="text-left px-4 py-2 font-medium text-gray-500">Status</th>
              <th className="text-left px-4 py-2 font-medium text-gray-500">Priority</th>
              <th className="text-left px-4 py-2 font-medium text-gray-500">Company</th>
            </tr>
          </thead>
          <tbody>
            {(recent_requests || []).map(r => (
              <tr key={r.id} className="border-b border-gray-100">
                <td className="px-4 py-2">
                  <Link to={`/requests/${r.id}`} className="text-gray-900 hover:text-indigo-600">{r.title}</Link>
                </td>
                <td className="px-4 py-2 text-gray-500">{r.status}</td>
                <td className="px-4 py-2 text-gray-500">{r.priority}</td>
                <td className="px-4 py-2 text-gray-500">{r.company}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
