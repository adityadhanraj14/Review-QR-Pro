import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';
import { adminService } from '../../services/admin.service.js';
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from '../../components/ui';

export default function AdminOverview() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  useEffect(() => {
    adminService
      .analytics()
      .then((a) => setAnalytics(a.data.data))
      .catch((e) => toast.error(e.message));
  }, []);

  const onCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      await adminService.createAdmin({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
      });
      toast.success('Admin created');
      setAdminName('');
      setAdminEmail('');
      setAdminPassword('');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-8">
      <div className="dashboard-hero">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Overview</h1>
        <p className="mt-2 text-primary-100 max-w-xl">Global analytics and admin tools.</p>
      </div>

      {analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total scans</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{analytics.totals.scans}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">Feedback (1–3★)</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{analytics.totals.feedbackSubmissions}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">Businesses</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{analytics.totals.businesses}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {user?.role === 'superadmin' && (
        <Card>
          <CardHeader>
            <CardTitle>Create admin</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onCreateAdmin} className="grid sm:grid-cols-2 gap-4 max-w-3xl">
              <Input
                label="Name"
                placeholder="Full name"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                required
              />
              <Input
                label="Email"
                type="email"
                placeholder="admin@example.com"
                autoComplete="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                required
              />
              <Input
                label="Password (min 8)"
                type="password"
                placeholder="At least 8 characters"
                autoComplete="new-password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                required
              />
              <div className="sm:col-span-2">
                <Button type="submit" variant="cta">
                  Create admin
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
