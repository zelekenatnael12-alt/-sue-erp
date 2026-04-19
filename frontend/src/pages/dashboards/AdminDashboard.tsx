import { useState, useEffect } from 'react';
import { api, AdminOverview as AdminOverviewData } from '../../api/api';
import Skeleton from '../../components/common/Skeleton';
import '../admin/AdminOverview.css';

export default function AdminDashboard() {
  const [data, setData] = useState<AdminOverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAdminOverview()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="ao">
        <div className="ao__header">
          <Skeleton width="300px" height="32px" borderRadius="8px" />
          <div style={{ marginTop: '8px' }}>
            <Skeleton width="450px" height="18px" borderRadius="4px" />
          </div>
        </div>
        <div className="ao__kpi-grid" style={{ marginTop: '24px' }}>
          {[1, 2, 3].map(i => (
            <Skeleton key={i} height="120px" borderRadius="24px" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="ao">
      <div className="ao__header">
        <div>
          <h1 className="ao__title">Admin Dashboard</h1>
          <p className="ao__subtitle">Manage the internal SUE Ethiopia portal.</p>
        </div>
      </div>
      <div className="ao__kpi-grid">
        <div className="ao__kpi ao__kpi--blue">
          <div className="ao__kpi-content">
            <span className="ao__kpi-value">{data.users.total}</span>
            <span className="ao__kpi-label">Total System Users</span>
          </div>
        </div>
      </div>
    </div>
  );
}
