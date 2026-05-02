import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { adminService } from '../../services/admin.service.js';
import { Card, CardHeader, CardTitle, CardContent, Button, Select } from '../../components/ui';

function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return '—';
  }
}

export default function AdminFeedback() {
  const [businesses, setBusinesses] = useState([]);
  const [filterBizId, setFilterBizId] = useState('');
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);
  const [expanded, setExpanded] = useState({});

  const loadBusinesses = () =>
    adminService
      .listBusinesses()
      .then((r) => setBusinesses(r.data.data.businesses))
      .catch((e) => toast.error(e.message));

  const loadFeedback = () =>
    adminService
      .listFeedback({
        page,
        limit,
        ...(filterBizId ? { businessId: filterBizId } : {}),
      })
      .then((r) => {
        const d = r.data.data;
        setItems(d.feedback || []);
        setTotal(d.total ?? 0);
      })
      .catch((e) => toast.error(e.message));

  useEffect(() => {
    loadBusinesses();
  }, []);

  useEffect(() => {
    loadFeedback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filterBizId]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const toggleRow = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-8">
      <div className="dashboard-hero">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Feedback</h1>
        <p className="mt-2 text-primary-100 max-w-xl">Low-rating submissions (stored when guests rate 1–3★).</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4 sm:items-end max-w-xl">
          <Select
            label="Business"
            value={filterBizId}
            onChange={(e) => {
              setFilterBizId(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All businesses</option>
            {businesses.map((b) => (
              <option key={b._id} value={b._id}>
                {b.name}
              </option>
            ))}
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b dark:text-gray-400 dark:border-slate-700">
                  <th className="py-2 pr-4">When</th>
                  <th className="py-2 pr-4">Business</th>
                  <th className="py-2 pr-4">Rating</th>
                  <th className="py-2 pr-4">Excerpt</th>
                  <th className="py-2 pr-4" />
                </tr>
              </thead>
              <tbody>
                {items.map((f) => {
                  const bid = f.businessId;
                  const bizName = typeof bid === 'object' && bid?.name ? bid.name : '—';
                  const excerpt =
                    f.feedbackText.length > 80 ? `${f.feedbackText.slice(0, 80)}…` : f.feedbackText;
                  return (
                    <tr key={f._id} className="border-b border-gray-100 align-top dark:border-slate-700/80">
                      <td className="py-2 pr-4 whitespace-nowrap">{formatDate(f.createdAt)}</td>
                      <td className="py-2 pr-4">
                        <span className="font-medium">{bizName}</span>
                        {typeof bid === 'object' && bid?.qrSlug && (
                          <span className="block text-xs text-gray-500 font-mono dark:text-gray-400">/r/{bid.qrSlug}</span>
                        )}
                      </td>
                      <td className="py-2 pr-4">{f.rating}★</td>
                      <td className="py-2 pr-4 max-w-md">
                        {expanded[f._id] ? (
                          <p className="whitespace-pre-wrap">{f.feedbackText}</p>
                        ) : (
                          <p>{excerpt}</p>
                        )}
                        {f.contact && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Contact: {f.contact}</p>
                        )}
                      </td>
                      <td className="py-2 pr-4">
                        {f.feedbackText.length > 80 && (
                          <Button type="button" variant="ghost" size="sm" onClick={() => toggleRow(f._id)}>
                            {expanded[f._id] ? 'Less' : 'More'}
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {items.length === 0 && <p className="text-gray-500 dark:text-gray-400 py-6">No feedback rows.</p>}
          </div>
          {total > 0 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-slate-700 text-sm text-gray-600 dark:text-gray-400">
              <span>
                Page {page} of {totalPages} ({total} total)
              </span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
