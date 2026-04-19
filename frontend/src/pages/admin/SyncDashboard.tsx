import React, { useState, useEffect } from 'react';
import { api } from '../../api/api';
import './Admin.css';

const SyncDashboard: React.FC = () => {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHealth = async () => {
      try {
        const data = await api.getSyncHealth();
        setHealth(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadHealth();
  }, []);

  if (loading) return <div className="admin-portal"><div className="admin-content">Monitoring Sync Pulse...</div></div>;

  return (
    <div className="admin-portal">
       <main className="admin-content" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 900 }}>Offline Sync Health</h1>
          <p style={{ color: '#64748b' }}>Real-time WatermelonDB reconciliation monitoring (7-Day window).</p>
        </header>

        <div className="health-rollup">
          <div className="health-pill">
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Sync Events</div>
            <div style={{ fontSize: '32px', fontWeight: 900, marginTop: '8px' }}>{health?.summary?.total || 0}</div>
          </div>
          <div className="health-pill" style={{ borderLeft: '4px solid #10b981' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Success Rate</div>
            <div style={{ fontSize: '32px', fontWeight: 900, marginTop: '8px', color: '#10b981' }}>
              {health?.summary?.total ? Math.round((health.summary.success / health.summary.total) * 100) : 100}%
            </div>
          </div>
          <div className="health-pill" style={{ borderLeft: '4px solid #ef4444' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Failed Reconciliation</div>
            <div style={{ fontSize: '32px', fontWeight: 900, marginTop: '8px', color: '#ef4444' }}>{health?.summary?.failed || 0}</div>
          </div>
        </div>

        <section>
          <h3 style={{ fontSize: '16px', marginBottom: '24px' }}>Critical Alerts (Binary Lane 2)</h3>
          <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
            Users with 3+ repeated receipt upload failures in the last 48 hours.
          </p>

          {health?.alerts?.map((alert: any) => (
            <div className="critical-alert" key={alert.userId}>
              <div className="alert-icon">!</div>
              <div>
                <div style={{ fontWeight: 800 }}>Staff ID: {alert.userId}</div>
                <div style={{ fontSize: '12px', opacity: 0.7 }}>{alert.count} reported failures in data lane 2. Internal audit required.</div>
              </div>
            </div>
          ))}

          {health?.alerts?.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px', background: '#0f172a', borderRadius: '16px', border: '1px solid #1e293b', color: '#475569' }}>
               No critical sync alerts detected. Field reconciliation is stable.
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default SyncDashboard;
