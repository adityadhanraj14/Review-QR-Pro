import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Download, ImageIcon } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { useAuth } from '../../context/AuthContext.jsx';
import { ownerService } from '../../services/owner.service.js';
import { adminService } from '../../services/admin.service.js';
import { brand } from '../../theme/brand.js';
import { Button, Card, CardHeader, CardTitle, CardContent } from '../../components/ui';
import { generateReviewPosterPng } from '../../utils/generateReviewPoster.js';

function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return '—';
  }
}

export default function BusinessDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const backHref = isAdmin ? '/admin/businesses' : '/owner';

  const [qr, setQr] = useState(null);
  const [stats, setStats] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [fbPage, setFbPage] = useState(1);
  const [fbTotal, setFbTotal] = useState(0);
  const [fbLimit] = useState(20);
  const [expandedFb, setExpandedFb] = useState({});
  const [posterLoading, setPosterLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const qrReq = isAdmin ? adminService.getBusinessQr(id) : ownerService.getQr(id);
    const analyticsReq = isAdmin ? adminService.businessAnalytics(id) : ownerService.analytics(id);
    Promise.all([qrReq, analyticsReq])
      .then(([q, a]) => {
        setQr(q.data.data);
        setStats(a.data.data);
      })
      .catch((e) => toast.error(e.message));
  }, [id, isAdmin]);

  useEffect(() => {
    if (!id) return;
    const fbReq = isAdmin
      ? adminService.businessFeedback(id, { page: fbPage, limit: fbLimit })
      : ownerService.feedback(id, { page: fbPage, limit: fbLimit });
    fbReq
      .then((r) => {
        const d = r.data.data;
        setFeedback(d.feedback || []);
        setFbTotal(d.total ?? 0);
      })
      .catch((e) => toast.error(e.message));
  }, [id, fbPage, fbLimit, isAdmin]);

  const barData = stats
    ? [1, 2, 3, 4, 5].map((star) => ({ star: `${star}★`, count: stats.ratingsDistribution[star] || 0 }))
    : [];

  const lineData = stats?.dailyScans?.map((d) => ({ day: d._id, scans: d.count })) || [];

  const publicBase = import.meta.env.VITE_PUBLIC_APP_URL?.trim().replace(/\/$/, '') ?? '';
  const publicUrl = qr && publicBase ? `${publicBase}/r/${qr.qrSlug}` : '';

  const fbTotalPages = Math.max(1, Math.ceil(fbTotal / fbLimit));

  const onDownloadPoster = async () => {
    if (!qr?.pngDataUrl) return;
    setPosterLoading(true);
    try {
      const name = stats?.businessName || 'Our venue';
      const dataUrl = await generateReviewPosterPng({
        businessName: name,
        qrDataUrl: qr.pngDataUrl,
      });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'review-qr-poster.png';
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success('Poster saved');
    } catch (e) {
      toast.error(e?.message || 'Could not build poster');
    } finally {
      setPosterLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Link
        to={backHref}
        className="inline-flex items-center text-sm text-primary-600 hover:underline dark:text-primary-400"
      >
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to {isAdmin ? 'businesses' : 'venues'}
      </Link>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>QR code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {qr?.pngDataUrl && (
              <img
                src={qr.pngDataUrl}
                alt="QR"
                className="w-48 h-48 mx-auto rounded-lg border border-gray-200 dark:border-slate-600"
              />
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 break-all text-center">{publicUrl}</p>
            {qr?.pngDataUrl && (
              <div className="flex flex-col gap-2">
                <a href={qr.pngDataUrl} download="reviewqr.png" className="block">
                  <Button className="w-full" variant="secondary" type="button">
                    <Download className="h-4 w-4 mr-2 inline" />
                    Download QR only (PNG)
                  </Button>
                </a>
                <Button
                  className="w-full"
                  variant="cta"
                  type="button"
                  loading={posterLoading}
                  onClick={onDownloadPoster}
                >
                  <ImageIcon className="h-4 w-4 mr-2 inline" />
                  Download poster (PNG)
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p
                className="text-gray-500 dark:text-gray-400"
                title="Loads of your public review page (QR or shared link). Each device/browser session counts; duplicate loads within a few seconds are ignored."
              >
                Scans
              </p>
              <p className="text-2xl font-bold dark:text-gray-50">{stats?.totalScans ?? '—'}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Suggestion loads</p>
              <p className="text-2xl font-bold dark:text-gray-50">{stats?.reviewsGenerated ?? '—'}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Google opens</p>
              <p className="text-2xl font-bold dark:text-gray-50">{stats?.googleRedirects ?? '—'}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Avg rating</p>
              <p className="text-2xl font-bold dark:text-gray-50">{stats?.avgRating ?? '—'}</p>
            </div>
            <div>
              <p
                className="text-gray-500 dark:text-gray-400"
                title="Google opens divided by page loads (scans)."
              >
                Opens per scan
              </p>
              <p className="text-2xl font-bold dark:text-gray-50">{stats?.opensPerScan ?? '—'}</p>
            </div>
            <div>
              <p
                className="text-gray-500 dark:text-gray-400"
                title="Shown as a percentage capped at 100% when opens exceed deduplicated scans."
              >
                Opens / scans (cap 100%)
              </p>
              <p className="text-2xl font-bold dark:text-gray-50">{stats?.conversionRate ?? 0}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Private feedback (1–3★)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Messages guests left instead of posting publicly. Not shown on Google.
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b dark:text-gray-400 dark:border-slate-700">
                  <th className="py-2 pr-4">When</th>
                  <th className="py-2 pr-4">Rating</th>
                  <th className="py-2 pr-4">Message</th>
                  <th className="py-2 pr-4" />
                </tr>
              </thead>
              <tbody>
                {feedback.map((f) => {
                  const excerpt = f.feedbackText.length > 100 ? `${f.feedbackText.slice(0, 100)}…` : f.feedbackText;
                  return (
                    <tr key={f._id} className="border-b border-gray-100 align-top dark:border-slate-700/80 dark:text-gray-200">
                      <td className="py-2 pr-4 whitespace-nowrap">{formatDate(f.createdAt)}</td>
                      <td className="py-2 pr-4">{f.rating}★</td>
                      <td className="py-2 pr-4 max-w-lg">
                        {expandedFb[f._id] ? (
                          <p className="whitespace-pre-wrap">{f.feedbackText}</p>
                        ) : (
                          <p>{excerpt}</p>
                        )}
                        {f.contact && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Contact: {f.contact}</p>}
                      </td>
                      <td className="py-2 pr-4">
                        {f.feedbackText.length > 100 && (
                          <Button type="button" variant="ghost" size="sm" onClick={() => setExpandedFb((p) => ({ ...p, [f._id]: !p[f._id] }))}>
                            {expandedFb[f._id] ? 'Less' : 'More'}
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {feedback.length === 0 && <p className="text-gray-500 dark:text-gray-400 py-6">No feedback yet.</p>}
          </div>
          {fbTotal > 0 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-slate-700 text-sm text-gray-600 dark:text-gray-400">
              <span>
                Page {fbPage} of {fbTotalPages} ({fbTotal} total)
              </span>
              <div className="flex gap-2">
                <Button type="button" variant="secondary" size="sm" disabled={fbPage <= 1} onClick={() => setFbPage((p) => p - 1)}>
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={fbPage >= fbTotalPages}
                  onClick={() => setFbPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ratings distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-72 [&_.recharts-cartesian-axis-tick_text]:fill-gray-500 dark:[&_.recharts-cartesian-axis-tick_text]:fill-gray-400">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.35} />
                <XAxis dataKey="star" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill={brand.toast.successBg} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scans (last 30 days)</CardTitle>
          </CardHeader>
          <CardContent className="h-72 [&_.recharts-cartesian-axis-tick_text]:fill-gray-500 dark:[&_.recharts-cartesian-axis-tick_text]:fill-gray-400">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.35} />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="scans" stroke="#7c3aed" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
