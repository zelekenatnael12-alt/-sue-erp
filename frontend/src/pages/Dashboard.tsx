import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api, DashboardStats, Announcement } from '../api/api';
import './Dashboard.css';

const Dashboard = ({ role: _role }: { role?: string }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [announcementPayload, setAnnouncementPayload] = useState({ title: '', content: '' });

  const handleBroadcast = async () => {
    try {
      const newAnn = await api.createAnnouncement({
         title: announcementPayload.title,
         content: announcementPayload.content,
         region: user?.region || undefined,
         authorId: user?.id || 1, // Satisfy types broadly
         createdAt: new Date().toISOString()
      });
      setAnnouncements([newAnn, ...announcements]);
      setBroadcastOpen(false);
      setAnnouncementPayload({ title: '', content: '' });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    api.getDashboardStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));

    api.getAnnouncements()
      .then(setAnnouncements)
      .catch(console.error);
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <div className="dashboard__greeting">
          <h2>{greeting()}, {user?.name || user?.email?.split('@')[0] || 'Coordinator'}</h2>
          <p>Here's the latest update for Scripture Union Ethiopia across all regions.</p>
        </div>
        <div className="dashboard__actions">
          {user?.role === 'ADMIN' && (
            <button type="button" className="btn btn--outline">
              <span className="material-symbols-outlined">visibility</span>
              Comms Audit Log
            </button>
          )}
          <button type="button" className="btn btn--outline" onClick={() => window.print()}>
            <span className="material-symbols-outlined">download</span>
            Export PDF
          </button>
          <button type="button" className="btn btn--primary" onClick={() => navigate('/plan/step-1')}>
            <span className="material-symbols-outlined">add</span>
            New Plan
          </button>
        </div>
      </div>

      {/* Bulletin Board / Targeted Announcements */}
      {announcements.length > 0 && (
        <div className="bulletin-carousel">
          {announcements.map(ann => (
            <div key={ann.id} className="announcement-card">
              <div className="announcement-card__meta">
                <span>{ann.author?.full_name || 'System Notice'}</span>
                <span>{new Date(ann.createdAt).toLocaleDateString()}</span>
              </div>
              <h4 className="announcement-card__title">{ann.title}</h4>
              <p className="announcement-card__content">{ann.content}</p>
            </div>
          ))}
        </div>
      )}

      {user?.role === 'COORDINATOR' && (
        <div className="quick-action-grid">
          <button type="button" className="quick-action-tile" onClick={() => setBroadcastOpen(true)}>
            <span className="material-symbols-outlined">campaign</span>
            Post Announcement
          </button>
        </div>
      )}

      {broadcastOpen && (
        <div className="rg-db__overlay" style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center'}} onClick={() => setBroadcastOpen(false)}>
          <div className="rg-db__rmodal" style={{background:'var(--color-surface)', padding:'2rem', borderRadius:'12px', width:'400px'}} onClick={e => e.stopPropagation()}>
            <h2 style={{marginBottom: '1rem'}}>Broadcast Update</h2>
            <input 
              style={{width: '100%', marginBottom: '1rem', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)'}} 
              placeholder="Announcement Title..." 
              value={announcementPayload.title} 
              onChange={e => setAnnouncementPayload({ ...announcementPayload, title: e.target.value })} 
            />
            <textarea 
              style={{width: '100%', minHeight: '100px', marginBottom: '1rem', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)'}} 
              placeholder="Detailed message..." 
              value={announcementPayload.content} 
              onChange={e => setAnnouncementPayload({ ...announcementPayload, content: e.target.value })} 
            />
            <div style={{display: 'flex', gap: '1rem', justifyContent: 'flex-end'}}>
              <button className="btn btn--outline" onClick={() => setBroadcastOpen(false)}>Cancel</button>
              <button className="btn btn--primary" onClick={handleBroadcast}>Broadcast Now</button>
            </div>
          </div>
        </div>
      )}

      {/* Live KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-card__header">
            <div className="kpi-card__icon"><span className="material-symbols-outlined">description</span></div>
            <div className="kpi-card__trend kpi-card__trend--up">
              <span className="material-symbols-outlined">trending_up</span>
              Total
            </div>
          </div>
          <p className="kpi-card__title">Total Reports</p>
          <p className="kpi-card__subtitle">ሪፖርቶች</p>
          <h3 className="kpi-card__value">{loading ? '—' : stats?.totalReports ?? 0}</h3>
        </div>

        <div className="kpi-card">
          <div className="kpi-card__header">
            <div className="kpi-card__icon"><span className="material-symbols-outlined">pending</span></div>
            <div className="kpi-card__trend kpi-card__trend--neutral">
              <span className="material-symbols-outlined">history</span>
              Pending
            </div>
          </div>
          <p className="kpi-card__title">Pending Review</p>
          <p className="kpi-card__subtitle">በመጠባበቅ ላይ</p>
          <h3 className="kpi-card__value">{loading ? '—' : stats?.pendingReports ?? 0}</h3>
        </div>

        <div className="kpi-card">
          <div className="kpi-card__header">
            <div className="kpi-card__icon"><span className="material-symbols-outlined">check_circle</span></div>
            <div className="kpi-card__trend kpi-card__trend--up">
              <span className="material-symbols-outlined">trending_up</span>
              Approved
            </div>
          </div>
          <p className="kpi-card__title">Approved Plans</p>
          <p className="kpi-card__subtitle">የጸደቁ እቅዶች</p>
          <h3 className="kpi-card__value">{loading ? '—' : stats?.approvedReports ?? 0}</h3>
        </div>

        <div className="kpi-card">
          <div className="kpi-card__header">
            <div className="kpi-card__icon"><span className="material-symbols-outlined">payments</span></div>
            <div className="kpi-card__trend kpi-card__trend--neutral">
              <span className="material-symbols-outlined">history</span>
              On Track
            </div>
          </div>
          <p className="kpi-card__title">Budget Requested</p>
          <p className="kpi-card__subtitle">አጠቃላይ የበጀት እቅድ</p>
          <h3 className="kpi-card__value"><span className="kpi-card__currency">ETB</span> {stats?.budgetRequested?.total ?? '45.2M'}</h3>
        </div>
      </div>

      <div className="charts-grid">
        {/* Budget Allocation Chart */}
        <div className="card chart-card">
          <div className="chart-card__header">
            <div>
              <h4>Budget Allocation</h4>
              <p>16 Categories Breakdown</p>
            </div>
          </div>
          <div className="chart-card__content">
            <div className="pie-chart-placeholder">
              <div className="pie-chart-inner">
                <span className="pie-chart-label">Total</span>
                <span className="pie-chart-value">{stats?.budgetRequested?.total ?? '45.2M'}</span>
              </div>
            </div>
            <div className="chart-legend">
              {[
                { label: 'Youth Programs (35%)', color: 'var(--color-primary)' },
                { label: 'School Outreach (20%)', color: '#f59e0b' },
                { label: 'Training (15%)', color: '#fbbf24' },
                { label: 'Literature (15%)', color: '#d97706' },
                { label: 'Other (15%)', color: '#b45309' },
              ].map(item => (
                <div key={item.label} className="chart-legend__item">
                  <div className="chart-legend__color" style={{ backgroundColor: item.color }}></div>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Regional Progress */}
        <div className="card chart-card">
          <div className="chart-card__header">
            <div>
              <h4>Regional Progress</h4>
              <p>Programs vs Target</p>
            </div>
            <div className="chart-card__legend">
              <div className="chart-card__legend-item">
                <div className="chart-card__legend-color chart-card__legend-color--actual"></div>
                <span>Actual</span>
              </div>
              <div className="chart-card__legend-item">
                <div className="chart-card__legend-color chart-card__legend-color--target"></div>
                <span>Target</span>
              </div>
            </div>
          </div>
          <div className="progress-list">
            {(stats?.regionalProgress ?? []).map(r => (
              <div key={r.region} className="progress-item">
                <div className="progress-item__header">
                  <span>{r.region}</span>
                  <span>{r.actualPercent}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar__fill" style={{ width: `${r.actualPercent}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Submissions Table */}
      <div className="card table-card">
        <div className="table-card__header">
          <h4>Recent Regional Submissions</h4>
          <button type="button" className="table-card__action" onClick={() => navigate('/reports')}>
            View All Submissions
          </button>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Report Title</th>
                <th>Coordinator</th>
                <th>Region</th>
                <th>Status</th>
                <th>Date</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{textAlign:'center', padding:'2rem', color:'var(--color-text-muted)'}}>Loading...</td></tr>
              ) : (stats?.recentReports?.length ?? 0) === 0 ? (
                <tr><td colSpan={6} style={{textAlign:'center', padding:'2rem', color:'var(--color-text-muted)'}}>No submissions yet. <button type="button" className="link-btn" style={{color:'var(--color-primary)'}} onClick={() => navigate('/plan/step-1')}>Create the first plan →</button></td></tr>
              ) : stats!.recentReports.map(r => (
                <tr key={r.id}>
                  <td className="font-bold">{r.title}</td>
                  <td>{r.coordinator?.name || r.coordinator?.email || '—'}</td>
                  <td>{r.coordinator?.region || '—'}</td>
                  <td>
                    <span className={`status-badge ${r.status === 'APPROVED' ? 'status-badge--success' : 'status-badge--warning'}`}>
                      {r.status === 'APPROVED' ? 'Approved' : 'Pending Review'}
                    </span>
                  </td>
                  <td className="text-muted">{new Date(r.dateSubmitted).toLocaleDateString()}</td>
                  <td className="text-right">
                    <button type="button" className="icon-btn" onClick={() => navigate(`/reports/${r.id}`)}>
                      <span className="material-symbols-outlined">visibility</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
