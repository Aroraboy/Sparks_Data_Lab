import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useRequest, useComments, useUpdateRequest, useAddComment, useDeleteRequest, useUsers } from '../api/hooks';
import useAuthStore from '../stores/authStore';
import { format, formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['In Progress', 'Completed', 'Flagged', 'On Hold'];
const STATUS_COLORS = {
  'In Progress': 'bg-amber-100 text-amber-800',
  'Completed': 'bg-green-100 text-green-800',
  'Flagged': 'bg-red-100 text-red-800',
  'On Hold': 'bg-gray-100 text-gray-800',
};

export default function RequestDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: request, isLoading } = useRequest(id);
  const { data: commentsData } = useComments(id);
  const { data: usersData } = useUsers();
  const updateMutation = useUpdateRequest();
  const deleteMutation = useDeleteRequest();
  const addCommentMutation = useAddComment();
  const [commentText, setCommentText] = useState('');

  const comments = commentsData?.data || [];
  const users = usersData?.data || [];
  const usersMap = Object.fromEntries(users.map(u => [u.id, u]));
  const req = request?.data;

  const isAssignee = req?.assigned_to?.includes(user?.id);
  const isAdmin = user?.role === 'admin';
  const canChangeStatus = isAssignee || isAdmin;

  const handleStatusChange = (status) => {
    updateMutation.mutate({ id, data: { status } }, {
      onSuccess: () => toast.success(`Status updated to ${status}`),
      onError: (err) => toast.error(err.response?.data?.error || 'Failed to update status'),
    });
  };

  const handleDelete = () => {
    if (!window.confirm('Delete this request? This cannot be undone.')) return;
    deleteMutation.mutate(id, {
      onSuccess: () => { toast.success('Request deleted'); navigate('/requests'); },
      onError: (err) => toast.error(err.response?.data?.error || 'Failed to delete'),
    });
  };

  const handleComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addCommentMutation.mutate({ requestId: id, body: commentText.trim() }, {
      onSuccess: () => { setCommentText(''); toast.success('Comment added'); },
      onError: (err) => toast.error(err.response?.data?.error || 'Failed to add comment'),
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-6 bg-gray-200 rounded animate-pulse w-3/4" />
        ))}
      </div>
    );
  }

  if (!req) {
    return <p className="text-gray-500">Request not found.</p>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link to="/requests" className="text-sm text-indigo-600 hover:underline">← Back to Requests</Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">{req.title}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Submitted {format(new Date(req.created_at), 'MMM d, yyyy h:mm a')} · {req.company}
          </p>
        </div>
        {isAdmin && (
          <button onClick={handleDelete} className="text-red-500 hover:text-red-700 text-sm">
            Delete
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">Description</h2>
            <p className="text-gray-600 whitespace-pre-wrap">{req.description || 'No description.'}</p>
          </div>

          {/* Request details grid */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Details</h2>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div><dt className="text-gray-500">Type</dt><dd className="font-medium text-gray-900">{req.request_type}</dd></div>
              <div><dt className="text-gray-500">Company</dt><dd className="font-medium text-gray-900">{req.company}</dd></div>
              <div><dt className="text-gray-500">Market</dt><dd className="font-medium text-gray-900">{req.market || '—'}</dd></div>
              <div><dt className="text-gray-500">Priority</dt><dd className="font-medium text-gray-900">{req.priority}</dd></div>
              <div><dt className="text-gray-500">Deadline</dt><dd className="font-medium text-gray-900">{req.deadline ? format(new Date(req.deadline), 'MMM d, yyyy') : '—'}</dd></div>
              <div><dt className="text-gray-500">Linked Dataset</dt><dd className="font-medium text-gray-900">{req.dataset_id || '—'}</dd></div>
            </dl>
          </div>

          {/* Comments */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Comments ({comments.length})</h2>
            <div className="space-y-4 mb-4">
              {comments.length === 0 && <p className="text-sm text-gray-400">No comments yet.</p>}
              {comments.map(c => {
                const author = usersMap[c.user_id];
                return (
                  <div key={c.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold flex-shrink-0">
                      {(author?.full_name || 'U')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm">
                        <span className="font-medium text-gray-900">{author?.full_name || 'Unknown'}</span>
                        <span className="text-gray-400 ml-2">{formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}</span>
                      </p>
                      <p className="text-sm text-gray-600 mt-0.5 whitespace-pre-wrap">{c.body}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <form onSubmit={handleComment} className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={addCommentMutation.isPending || !commentText.trim()}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
              >
                Post
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Status</h3>
            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium mb-3 ${STATUS_COLORS[req.status]}`}>
              {req.status}
            </span>
            {canChangeStatus && (
              <select
                value={req.status}
                onChange={e => handleStatusChange(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
              >
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            )}
          </div>

          {/* Assigned To */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Assigned To</h3>
            {req.assigned_to && req.assigned_to.length > 0 ? (
              <div className="space-y-2">
                {req.assigned_to.map(uid => {
                  const u = usersMap[uid];
                  return (
                    <div key={uid} className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-[10px] font-bold">
                        {(u?.full_name || 'U')[0].toUpperCase()}
                      </div>
                      <span className="text-sm text-gray-700">{u?.full_name || uid}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-400">Unassigned</p>
            )}
          </div>

          {/* Status History */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Status History</h3>
            {req.status_history && req.status_history.length > 0 ? (
              <ol className="relative border-l border-gray-200 ml-2 space-y-3">
                {req.status_history.map((sh, i) => (
                  <li key={sh.id || i} className="ml-4">
                    <div className="absolute -left-1.5 w-3 h-3 bg-indigo-500 rounded-full border-2 border-white" />
                    <p className="text-xs text-gray-500">{format(new Date(sh.created_at), 'MMM d, h:mm a')}</p>
                    <p className="text-sm text-gray-700">
                      {sh.old_status ? `${sh.old_status} → ${sh.new_status}` : sh.new_status}
                    </p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-gray-400">No status changes.</p>
            )}
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-2">
            <button className="w-full bg-gray-100 text-gray-700 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-200 transition">
              Link Dataset
            </button>
            <button className="w-full bg-gray-100 text-gray-700 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-200 transition">
              Run AI Research
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
