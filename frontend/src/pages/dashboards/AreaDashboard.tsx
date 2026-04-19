import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api, DashboardStats } from '../../api/api';
import './AreaDashboard.css';

interface Announcement { id: number; title: string; content: string; target: string; createdAt: string; }

export default function AreaDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [announcementTab, setAnnouncementTab] = useState<'ALL' | 'REGIONAL' | 'SUB_REGIONAL'>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getDashboardStats().catch(() => null),
      api.getAnnouncements().catch(() => []),
    ]).then(([s, a]) => {
      setStats(s as DashboardStats);
      setAnnouncements(a as Announcement[]);
    }).finally(() => setLoading(false));
  }, []);

  const initials = (name?: string) => name?.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2) || 'AC';

  const myReports = stats?.recentReports ?? [];
  const pending = myReports.filter(r => r.status && r.status !== 'APPROVED');
  const approved = myReports.filter(r => r.status === 'APPROVED');
  const corrections = myReports.filter(r => r.status === 'REQUIRES_CORRECTION');

  const filteredAnnouncements = announcements.filter(a => {
    if (announcementTab === 'ALL') return true;
    return a.target === announcementTab || a.target === 'ALL';
  });

  // Strict Zero-Defaults for Metrics
  const totalSchools = stats?.schoolsReached?.count ?? 0;
  const suSchools = 0; // To be populated by specific API if available
  const nonSuSchools = totalSchools - suSchools;
  const coverageRate = totalSchools > 0 ? Math.round((suSchools / totalSchools) * 100) : 0;

  return (
    <div className="area-db">

      {/* ══════════════════════════════════════════════ */}
      {/* TOP BAR: Identity + Urgent Actions            */}
      {/* ══════════════════════════════════════════════ */}
      <div className="area-db__topbar">

        {/* Profile */}
        <div className="area-db__profile">
          <div className="area-db__avatar">{initials(user?.name)}</div>
          <div className="area-db__profile-info">
            <h3 className="area-db__profile-name">{user?.name || 'Area Coordinator'}</h3>
            <div className="area-db__profile-meta">
              <span className="area-db__badge area-db__badge--blue">Area Coordinator</span>
              <span className="area-db__profile-loc">
                <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>location_on</span>
                {user?.region || 'Not Assigned'}
              </span>
            </div>
          </div>
        </div>

        {/* Urgent Alerts */}
        <div className="area-db__alerts">
          {corrections.length > 0 && (
            <div className="area-db__alert area-db__alert--error">
              <span className="material-symbols-outlined">error</span>
              <span>Corrections Needed: <strong>{corrections.length} plan{corrections.length > 1 ? 's' : ''}</strong> require{corrections.length === 1 ? 's' : ''} revision</span>
            </div>
          )}
          <div className="area-db__alert area-db__alert--deadline">
            <span className="material-symbols-outlined">event_busy</span>
            <span><strong>System Notice</strong>: No immediate deadlines pending</span>
          </div>
          {pending.length === 0 && corrections.length === 0 && (
            <div className="area-db__alert area-db__alert--success">
              <span className="material-symbols-outlined">check_circle</span>
              <span>ምንም አዲስ መልዕክት የለም (All caught up)</span>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="area-db__quick-ctas">
          <button className="btn btn--outline" onClick={() => navigate('/area/reports')}>
            <span className="material-symbols-outlined">upload_file</span>
            Submit Report
          </button>
          <button className="btn btn--primary" onClick={() => navigate('/plan/step-1')}>
            <span className="material-symbols-outlined">add</span>
            Submit New Plan
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════ */}
      {/* TWO-COLUMN MAIN BODY                          */}
      {/* ══════════════════════════════════════════════ */}
      <div className="area-db__body">

        {/* ── LEFT COLUMN ────────────────────────────── */}
        <div className="area-db__left">

          {/* Submission Status Tracker */}
          <div className="area-db__card">
            <div className="area-db__card-header">
              <span className="material-symbols-outlined">folder_open</span>
              My Submissions
            </div>

            {loading ? (
              <p className="area-db__empty">Loading submissions…</p>
            ) : (
              <>
                {/* Pending */}
                <div className="area-db__status-group">
                  <span className="area-db__status-label area-db__status-label--pending">
                    <span className="material-symbols-outlined">hourglass_top</span> Pending Review
                  </span>
                  {pending.length === 0 ? (
                    <p className="area-db__empty-inline">ምንም መረጃ አልተገኘም (No pending submissions)</p>
                  ) : pending.map(r => (
                    <div key={r.id} className="area-db__submission-row">
                      <div className="area-db__submission-info">
                        <span className="area-db__submission-title">{r.title}</span>
                        <span className="area-db__submission-status">Awaiting Approval</span>
                      </div>
                      <button className="area-db__view-btn" onClick={() => navigate(`/area/reports/${r.id}`)}>
                        View
                      </button>
                    </div>
                  ))}
                </div>

                {/* Requires Correction */}
                <div className="area-db__status-group">
                  <span className="area-db__status-label area-db__status-label--correction">
                    <span className="material-symbols-outlined">warning</span> Requires Correction
                  </span>
                  {corrections.length === 0 ? (
                    <p className="area-db__empty-inline">ምንም መረጃ አልተገኘም ✅</p>
                  ) : corrections.map(r => (
                    <div key={r.id} className="area-db__submission-row area-db__submission-row--error">
                      <div className="area-db__submission-info">
                        <span className="area-db__submission-title">{r.title}</span>
                      </div>
                      <button className="area-db__edit-btn" onClick={() => navigate(`/plan/step-1`)}>
                        Edit
                      </button>
                    </div>
                  ))}
                </div>

                {/* Approved */}
                <div className="area-db__status-group">
                  <span className="area-db__status-label area-db__status-label--approved">
                    <span className="material-symbols-outlined">check_circle</span> Approved ({approved.length})
                  </span>
                  {approved.length === 0 ? (
                    <p className="area-db__empty-inline">ምንም መረጃ አልተገኘም</p>
                  ) : approved.slice(0, 2).map(r => (
                    <div key={r.id} className="area-db__submission-row">
                      <span className="area-db__submission-title">{r.title}</span>
                      <button className="area-db__view-btn" onClick={() => navigate(`/area/reports/${r.id}`)}>View</button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Area Metrics */}
          <div className="area-db__card">
            <div className="area-db__card-header">
              <span className="material-symbols-outlined">bar_chart</span>
              Area Metrics
            </div>

            <div className="area-db__metrics-grid">
              <div className="area-db__metric">
                <span className="area-db__metric-icon">🏫</span>
                <div>
                  <span className="area-db__metric-value">{totalSchools}</span>
                  <span className="area-db__metric-label">Total Schools in Area</span>
                </div>
              </div>
              <div className="area-db__metric area-db__metric--success">
                <span className="area-db__metric-icon">✅</span>
                <div>
                  <span className="area-db__metric-value">{suSchools}</span>
                  <span className="area-db__metric-label">Schools with SU Fellowship</span>
                </div>
              </div>
              <div className="area-db__metric area-db__metric--danger">
                <span className="area-db__metric-icon">❌</span>
                <div>
                  <span className="area-db__metric-value">{nonSuSchools}</span>
                  <span className="area-db__metric-label">Schools without SU Fellowship</span>
                </div>
              </div>
              <div className="area-db__metric area-db__metric--primary">
                <span className="area-db__metric-icon">📈</span>
                <div>
                  <span className="area-db__metric-value">{coverageRate}%</span>
                  <span className="area-db__metric-label">Fellowship Coverage Rate</span>
                </div>
              </div>
            </div>

            {/* Coverage bar */}
            <div style={{ marginTop: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.4rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                <span>Coverage Progress</span>
                <span>{coverageRate}%</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-bar__fill"
                  style={{ width: `${coverageRate}%`, background: 'linear-gradient(90deg, #16a34a, #22c55e)' }}
                />
              </div>
            </div>

            {/* KPI mini-row */}
            <div className="area-db__kpi-row">
              <div className="area-db__kpi-mini">
                <span className="material-symbols-outlined">description</span>
                <span className="area-db__kpi-mini-val">{loading ? '—' : stats?.totalReports ?? 0}</span>
                <span className="area-db__kpi-mini-lbl">Total Reports</span>
              </div>
              <div className="area-db__kpi-mini">
                <span className="material-symbols-outlined">pending</span>
                <span className="area-db__kpi-mini-val">{loading ? '—' : stats?.pendingReports ?? 0}</span>
                <span className="area-db__kpi-mini-lbl">Pending</span>
              </div>
              <div className="area-db__kpi-mini">
                <span className="material-symbols-outlined">check_circle</span>
                <span className="area-db__kpi-mini-val">{loading ? '—' : stats?.approvedReports ?? 0}</span>
                <span className="area-db__kpi-mini-lbl">Approved</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN ───────────────────────────── */}
        <div className="area-db__right">

          {/* Announcements Board */}
          <div className="area-db__card">
            <div className="area-db__card-header">
              <span className="material-symbols-outlined">campaign</span>
              Announcements Board
            </div>

            {/* Tabs */}
            <div className="area-db__tabs">
              {(['ALL', 'REGIONAL', 'SUB_REGIONAL'] as const).map(tab => (
                <button
                  key={tab}
                  className={`area-db__tab ${announcementTab === tab ? 'area-db__tab--active' : ''}`}
                  onClick={() => setAnnouncementTab(tab)}
                >
                  {tab === 'ALL' ? 'Head Office' : tab === 'REGIONAL' ? 'Regional' : 'Sub-Regional'}
                </button>
              ))}
            </div>

            <div className="area-db__announcements">
              {loading ? (
                <p className="area-db__empty">Loading announcements…</p>
              ) : filteredAnnouncements.length === 0 ? (
                <div className="area-db__empty-state">
                  <span className="material-symbols-outlined">notifications_none</span>
                  <p>ምንም መረጃ አልተገኘም</p>
                </div>
              ) : filteredAnnouncements.slice(0, 4).map(a => (
                <div key={a.id} className="area-db__announcement-item">
                  <div className={`area-db__announcement-dot area-db__announcement-dot--${a.target === 'COORDINATOR' ? 'blue' : a.target === 'EXECUTIVE' ? 'purple' : 'green'}`} />
                  <div className="area-db__announcement-body">
                    <p className="area-db__announcement-title">{a.title}</p>
                    <p className="area-db__announcement-content">{a.content}</p>
                    <span className="area-db__announcement-date">{new Date(a.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Impact Story (Placeholder for real data) */}
          <div className="area-db__card area-db__card--empty">
            <div className="area-db__empty-state">
               <span className="material-symbols-outlined">history_edu</span>
               <p>ምንም መረጃ አልተገኘም (No Impact Stories Yet)</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
