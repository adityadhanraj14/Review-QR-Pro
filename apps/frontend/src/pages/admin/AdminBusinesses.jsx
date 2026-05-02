import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { adminService } from '../../services/admin.service.js';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Select } from '../../components/ui';

export default function AdminBusinesses() {
  const [owners, setOwners] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [bizName, setBizName] = useState('');
  const [placeId, setPlaceId] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [addr, setAddr] = useState('');
  const [city, setCity] = useState('');

  const load = async () => {
    const [o, b] = await Promise.all([adminService.listOwners(), adminService.listBusinesses()]);
    setOwners(o.data.data.owners);
    setBusinesses(b.data.data.businesses);
    if (!ownerId && o.data.data.owners[0]) setOwnerId(o.data.data.owners[0]._id);
  };

  useEffect(() => {
    load().catch((e) => toast.error(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial load
  }, []);

  const onCreateBusiness = async (e) => {
    e.preventDefault();
    try {
      await adminService.createBusiness({
        name: bizName,
        placeId,
        ownerId,
        location: { address: addr, city },
      });
      toast.success('Business created');
      setBizName('');
      setPlaceId('');
      setAddr('');
      setCity('');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-8">
      <div className="dashboard-hero">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Businesses</h1>
        <p className="mt-2 text-primary-100 max-w-xl">Create venues and review the catalog.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create business</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onCreateBusiness} className="grid sm:grid-cols-2 gap-4 max-w-3xl">
            <Input
              label="Business name"
              placeholder="e.g. Downtown Bistro"
              value={bizName}
              onChange={(e) => setBizName(e.target.value)}
              required
            />
            <Select label="Owner" value={ownerId} onChange={(e) => setOwnerId(e.target.value)} required>
              <option value="">Select owner</option>
              {owners.map((o) => (
                <option key={o._id} value={o._id}>
                  {o.name} ({o.email})
                </option>
              ))}
            </Select>
            <Input
              label="Google Place ID"
              value={placeId}
              onChange={(e) => setPlaceId(e.target.value)}
              placeholder="ChIJ… (from Google Maps / business profile)"
              required
            />
            <Input
              label="Address"
              placeholder="Street, area"
              value={addr}
              onChange={(e) => setAddr(e.target.value)}
            />
            <Input label="City" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
            <div className="sm:col-span-2">
              <Button type="submit" variant="cta">
                Create business
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Businesses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b dark:text-gray-400 dark:border-slate-700">
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Slug</th>
                  <th className="py-2 pr-4">Owner</th>
                  <th className="py-2 pr-4 text-right">Metrics</th>
                </tr>
              </thead>
              <tbody>
                {businesses.map((b) => (
                  <tr key={b._id} className="border-b border-gray-100 dark:border-slate-700/80">
                    <td className="py-2 pr-4 font-medium dark:text-gray-100">{b.name}</td>
                    <td className="py-2 pr-4 font-mono text-xs dark:text-gray-300">{b.qrSlug}</td>
                    <td className="py-2 pr-4 dark:text-gray-300">{b.ownerId?.name || '—'}</td>
                    <td className="py-2 pl-4 text-right">
                      <Link
                        to={`/admin/businesses/${b._id}`}
                        className="text-primary-600 hover:underline dark:text-primary-400 text-sm font-medium"
                      >
                        View scans &amp; QR
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
