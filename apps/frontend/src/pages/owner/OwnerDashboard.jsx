import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Building2, ChevronRight } from 'lucide-react';
import { ownerService } from '../../services/owner.service.js';
import { Card, CardTitle } from '../../components/ui';

export default function OwnerDashboard() {
  const [list, setList] = useState([]);

  useEffect(() => {
    ownerService
      .listBusinesses()
      .then((r) => setList(r.data.data.businesses))
      .catch((e) => toast.error(e.message));
  }, []);

  return (
    <div className="space-y-8">
      <div className="dashboard-hero">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Your venues</h1>
        <p className="mt-2 text-primary-100 max-w-xl">QR codes and analytics per business.</p>
      </div>
      <div className="grid gap-4">
        {list.map((b) => (
          <Link key={b._id} to={`/owner/${b._id}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary-50 text-primary-600">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="!text-base">{b.name}</CardTitle>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-mono mt-1">/r/{b.qrSlug}</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </Card>
          </Link>
        ))}
        {list.length === 0 && <p className="text-gray-500 dark:text-gray-400 text-center py-12">No businesses yet.</p>}
      </div>
    </div>
  );
}
