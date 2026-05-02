import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { adminService } from '../../services/admin.service.js';
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from '../../components/ui';

export default function AdminOwners() {
  const [owners, setOwners] = useState([]);
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');

  const load = () =>
    adminService
      .listOwners()
      .then((r) => setOwners(r.data.data.owners))
      .catch((e) => toast.error(e.message));

  useEffect(() => {
    load();
  }, []);

  const onCreateOwner = async (e) => {
    e.preventDefault();
    try {
      const { data } = await adminService.createOwner({
        name: ownerName,
        email: ownerEmail,
        password: ownerPassword || undefined,
      });
      toast.success(data.message || 'Owner created');
      if (data.data?.temporaryPassword) {
        toast(`Temp password: ${data.data.temporaryPassword}`, { duration: 8000 });
      }
      setOwnerName('');
      setOwnerEmail('');
      setOwnerPassword('');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-8">
      <div className="dashboard-hero">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Owners</h1>
        <p className="mt-2 text-primary-100 max-w-xl">Create owner accounts and view the directory.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create owner</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onCreateOwner} className="grid sm:grid-cols-2 gap-4 max-w-3xl">
            <Input
              label="Name"
              placeholder="Owner full name"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              required
            />
            <Input
              label="Email"
              type="email"
              placeholder="owner@restaurant.com"
              autoComplete="email"
              value={ownerEmail}
              onChange={(e) => setOwnerEmail(e.target.value)}
              required
            />
            <Input
              label="Password (optional — auto if empty)"
              type="password"
              placeholder="Leave blank to auto-generate"
              autoComplete="new-password"
              value={ownerPassword}
              onChange={(e) => setOwnerPassword(e.target.value)}
            />
            <div className="sm:col-span-2">
              <Button type="submit" variant="cta">
                Create owner
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All owners</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b dark:text-gray-400 dark:border-slate-700">
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Email</th>
                </tr>
              </thead>
              <tbody>
                {owners.map((o) => (
                  <tr key={o._id} className="border-b border-gray-100 dark:border-slate-700/80">
                    <td className="py-2 pr-4 font-medium dark:text-gray-100">{o.name}</td>
                    <td className="py-2 pr-4 dark:text-gray-300">{o.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {owners.length === 0 && <p className="text-gray-500 dark:text-gray-400 py-4">No owners yet.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
