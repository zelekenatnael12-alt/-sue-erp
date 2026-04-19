import React, { useState, useEffect } from 'react';
import { api } from '../../api/api';
import './Media.css';

const MediaHome: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // In this phase media/dashboard is a child of reports, but we use the custom endpoint
      const sResp = await fetch('/erp/api/media/dashboard', { credentials: 'include' });
      const statsData = await sResp.json();
      setStats(statsData);

      const logsData = await api.getCommunicationsLog();
      setLogs(logsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="media-portal"><div className="media-content">Loading Media Metrics...</div></div>;

  return (
    <div className="media-portal">
      {/* Main content */}
      <main className="media-content" style={{ marginLeft: 0 }}>
        <header style={{ marginBottom: '48px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 900 }}>Media & Digital Strategy</h1>
          <p style={{ color: '#64748b' }}>Nationwide reach analytics and global communication log.</p>
        </header>

        <div className="media-metric-grid">
          <div className="media-card">
            <div className="media-card-label">Digital Reach</div>
            <div className="media-card-value">{stats?.digitalReach || 0}</div>
            <div style={{ fontSize: '12px', color: '#10b981', marginTop: '8px' }}>Engagements this period</div>
          </div>
          <div className="media-card">
            <div className="media-card-label">Publications distributed</div>
            <div className="media-card-value">{stats?.publicationsDistributed || 0}</div>
            <div style={{ fontSize: '12px', color: '#fb7185', marginTop: '8px' }}>Physical & Digital items</div>
          </div>
          <div className="media-card" style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)' }}>
            <div className="media-card-label">Active Media Channels</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
              {stats?.activeChannels?.map((c: string) => (
                <span key={c} style={{ fontSize: '11px', padding: '4px 10px', background: '#334155', borderRadius: '4px' }}>{c}</span>
              ))}
            </div>
          </div>
        </div>

        <section className="media-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '18px', margin: 0 }}>Global Broadcast Log</h2>
            <button className="staff-dept-badge" style={{ cursor: 'pointer' }}>+ New Broadcast</button>
          </div>
          <table className="log-table">
            <thead>
              <tr>
                <th>Broadcast Title</th>
                <th>Sender</th>
                <th>Audience</th>
                <th>Engagement</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontWeight: 600 }}>{log.title}</td>
                  <td>
                    <div style={{ fontSize: '13px' }}>{log.author.full_name}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{log.author.role}</div>
                  </td>
                  <td><span className="staff-dept-badge">{log.region || 'Nationwide'}</span></td>
                  <td>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: '#38bdf8' }}>
                      {JSON.parse(log.viewedBy || '[]').length} Views
                    </div>
                  </td>
                  <td style={{ fontSize: '13px', color: '#64748b' }}>{new Date(log.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {logs.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: '#475569' }}>No broadcast history found.</td></tr>}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
};

export default MediaHome;
