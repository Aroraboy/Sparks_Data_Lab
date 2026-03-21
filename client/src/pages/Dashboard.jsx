import { Link } from 'react-router-dom';
import { useRequests, useDatasets } from '../api/hooks';
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

export default function Dashboard() {
  const { user } = useAuthStore();
  const { data: requestData, isLoading: rLoading } = useRequests({ limit: 5 });
  const { data: datasetData, isLoading: dLoading } = useDatasets({ limit: 5 });

  const recentRequests = requestData?.data || [];
  const totalRequests = requestData?.total || 0;
  const recentDatasets = datasetData?.data || [];
  const totalDatasets = datasetData?.total || 0;

  const inProgress = recentRequests.filter(r => r.status === 'In Progress').length;
  const completed = recentRequests.filter(r => r.status === 'Completed').length;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
      </h1>
      <p className="text-sm text-gray-500 mb-6">Here's what's happening across your data operations.</p>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Requests', value: totalRequests, icon: '📋', color: 'bg-indigo-50 text-indigo-700' },
          { label: 'In Progress', value: inProgress, icon: '⏳', color: 'bg-amber-50 text-amber-700' },
          { label: 'Completed', value: completed, icon: '✅', color: 'bg-green-50 text-green-700' },
          { label: 'Datasets', value: totalDatasets, icon: '📊', color: 'bg-purple-50 text-purple-700' },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${card.color}`}>
                {card.icon}
              </span>
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {rLoading || dLoading ? '—' : card.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Requests */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Requests</h2>
            <Link to="/requests" className="text-sm text-indigo-600 hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-gray-100">
            {rLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="px-5 py-3"><div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" /></div>
              ))
            ) : recentRequests.length === 0 ? (
              <p className="px-5 py-8 text-sm text-gray-400 text-center">No requests yet</p>
            ) : (
              recentRequests.map(req => (
                <Link key={req.id} to={`/requests/${req.id}`} className="block px-5 py-3 hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{req.title}</p>
                      <p className="text-xs text-gray-500">{req.company} · {format(new Date(req.created_at), 'MMM d')}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${PRIORITY_COLORS[req.priority]}`}>
                        {req.priority}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${STATUS_COLORS[req.status]}`}>
                        {req.status}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Datasets */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Datasets</h2>
            <Link to="/datasets" className="text-sm text-indigo-600 hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-gray-100">
            {dLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="px-5 py-3"><div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" /></div>
              ))
            ) : recentDatasets.length === 0 ? (
              <p className="px-5 py-8 text-sm text-gray-400 text-center">No datasets yet</p>
            ) : (
              recentDatasets.map(ds => (
                <Link key={ds.id} to={`/datasets/${ds.id}`} className="block px-5 py-3 hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{ds.name}</p>
                      <p className="text-xs text-gray-500">
                        {ds.company || 'General'} · {ds.record_count ?? 0} records
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      {format(new Date(ds.created_at), 'MMM d')}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/requests/new" className="bg-indigo-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-indigo-700 transition">
          + New Request
        </Link>
        <Link to="/datasets" className="bg-white border border-gray-300 text-gray-700 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-50 transition">
          Browse Datasets
        </Link>
        <Link to="/permits" className="bg-white border border-gray-300 text-gray-700 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-50 transition">
          View Permits
        </Link>
      </div>
    </div>
  );
}
