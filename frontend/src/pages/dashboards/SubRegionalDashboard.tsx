import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api, DashboardStats, Report, Announcement } from '../../api/api';
import './SubRegionalDashboard.css';

/* ─── Types ──────────────────────────────────────────────────────────────── */
type AreaHealth = 'green' | 'yellow' | 'red';

interface ManagedArea {
  id: number;
  name: string;
  coordinator: string;
  health: AreaHealth;
  lastReport: string;
  healthLabel: string;
}

const HEALTH_META: Record<AreaHealth, { color: string; bg: string; dot: string }> = {
  green:  { color: '#15803d', bg: 'rgba(22,163,74,0.1)',   dot: '#16a34a' },
  yellow: { color: '#92400e', bg: 'rgba(234,179,8,0.1)',   dot: '#eab308' },
  red:    { color: '#b91c1c', bg: 'rgba(220,38,38,0.1)',   dot: '#dc2626' },
};

type SubStatus = 'DRAFT' | 'PENDING_REVIEW' | 'REQUIRES_CORRECTION' | 'APPROVED';

const SUB_STATUS: Record<SubStatus, { label: string; color: string; bg: string; icon: string }> = {
  DRAFT:               { label: 'Draft',             color: '#475569', bg: 'rgba(100,116,139,0.1)', icon: 'edit_note' },
  PENDING_REVIEW:      { label: 'Pending Regional',  color: '#1e40af', bg: 'rgba(37,99,235,0.1)',  icon: 'hourglass_top' },
  REQUIRES_CORRECTION: { label: 'Action Required',   color: '#b91c1c', bg: 'rgba(220,38,38,0.12)', icon: 'warning' },
  APPROVED:            { label: 'Approved',           color: '#15803d', bg: 'rgba(22,163,74,0.1)',  icon: 'check_circle' },
};

/* ─── Component ──────────────────────────────────────────────────────────── */
export default function SubRegionalDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [inbox, setInbox] = useState<Report[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  // Dynamic states to replace mocks
  const [managedAreas] = useState<ManagedArea[]>([]);
  const [ownSubs] = useState<{ title: string; status: SubStatus; period: string }[]>([]);

  // Modal state
  const [reviewDoc, setReviewDoc] = useState<Report | null>(null);
  const [postingUpdate, setPostingUpdate] = useState(false);
  const [newUpdate, setNewUpdate] = useState('');

  useEffect(() => {
    Promise.all([
      api.getDashboardStats().catch(() => null),
      api.getReports().catch(() => []),
      api.getAnnouncements().catch(() => []),
    ]).then(([s, r, a]) => {
      setStats(s as DashboardStats);
      setInbox(r as Report[]);
      setAnnouncements(a as Announcement[]);
    }).finally(() => setLoading(false));
  }, []);

  const initials = (name?: string) =>
    name?.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2) || 'SC';

  const pendingInbox = inbox.filter(r => r.status === 'PENDING_REVIEW');


  const handlePostUpdate = async () => {
    if (!newUpdate.trim()) return;
    setPostingUpdate(true);
    await new Promise(r => setTimeout(r, 600));
    setNewUpdate('');
    setPostingUpdate(false);
  };

  /* ── KPI data ── */
  const kpis = [
    { label: 'Total Schools',       value: stats?.schoolsReached?.count ?? 0,  icon: 'school',        color: '#1e40af', trend: 'Latest database count' },
    { label: 'Active Fellowships',  value: 0,   icon: 'groups',        color: '#15803d', trend: 'Updating from field...' },
    { label: 'Associates & Volunteers', value: stats?.totalVolunteers?.count ?? 0, icon: 'volunteer_activism', color: '#7c3aed', trend: 'Active regional staff' },
    { label: 'Fellowship Coverage', value: '0%', icon: 'donut_large',  color: '#0891b2', trend: 'Target: 0%' },
    { label: 'Budget Utilization',        value: stats?.budgetRequested?.total || '0', icon: 'monitoring',   color: '#ea580c', trend: 'Current spend' },
  ];

  return (
    <div className="sr-db">

      {/* ══ TOP BAR ══════════════════════════════════════════════════════════ */}
      <div className="sr-db__topbar">
        {/* Profile */}
        <div className="sr-db__profile">
          <div className="sr-db__avatar">{initials(user?.name)}</div>
          <div>
            <h3 className="sr-db__name">{user?.name || 'Sub-Regional Coordinator'}</h3>
            <div className="sr-db__meta">
              <span className="sr-db__role-badge">Sub-Regional Coordinator</span>
              <span className="sr-db__loc">
                <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>location_on</span>
                {user?.subRegion || user?.region || 'Not Assigned'}
              </span>
            </div>
          </div>
        </div>

        {/* Notification badge */}
        <div className="sr-db__notif-area">
          {pendingInbox.length > 0 && (
            <div className="sr-db__notif sr-db__notif--red">
              <span className="material-symbols-outlined">inbox</span>
              <span><strong>{pendingInbox.length} Area Reports</strong> pending your review</span>
            </div>
          )}
          {managedAreas.filter(a => a.health === 'red').length > 0 && (
            <div className="sr-db__notif sr-db__notif--amber">
              <span className="material-symbols-outlined">report_problem</span>
              <span><strong>{managedAreas.filter(a => a.health === 'red').length} Areas</strong> missing reports</span>
            </div>
          )}
          <div className="sr-db__notif sr-db__notif--deadline">
            <span className="material-symbols-outlined">event_busy</span>
            <span><strong>System Notice</strong>: No immediate deadlines pending</span>
          </div>
        </div>

        {/* CTAs */}
        <div className="sr-db__ctas">
          <button className="btn btn--outline">
            <span className="material-symbols-outlined">upload_file</span>
            Submit Report
          </button>
          <button className="btn btn--primary">
            <span className="material-symbols-outlined">add</span>
            Create Plan
          </button>
        </div>
      </div>

      {/* ══ KPI TILES ════════════════════════════════════════════════════════ */}
      <div className="sr-db__kpis">
        {kpis.map(k => (
          <div key={k.label} className="sr-db__kpi">
            <div className="sr-db__kpi-icon" style={{ background: k.color + '18', color: k.color }}>
              <span className="material-symbols-outlined">{k.icon}</span>
            </div>
            <div className="sr-db__kpi-body">
              <span className="sr-db__kpi-val">{loading ? '—' : k.value}</span>
              <span className="sr-db__kpi-lbl">{k.label}</span>
              <span className="sr-db__kpi-trend">{k.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ══ TWO-COLUMN BODY ══════════════════════════════════════════════════ */}
      <div className="sr-db__body">

        {/* ── LEFT COLUMN ─────────────────────────────────────────────────── */}
        <div className="sr-db__left">

          {/* Section A: My Submissions Tracker */}
          <div className="sr-db__card">
            <div className="sr-db__card-hdr">
              <span className="material-symbols-outlined">folder_open</span>
              My Submissions Tracker
            </div>
            <div className="sr-db__sub-tracker">
              {ownSubs.length > 0 ? ownSubs.map((s, i) => {
                const meta = SUB_STATUS[s.status];
                return (
                  <div key={i} className={`sr-db__sub-row ${s.status === 'REQUIRES_CORRECTION' ? 'sr-db__sub-row--alert' : ''}`}>
                    <div className="sr-db__sub-info">
                      <span className="sr-db__sub-title">{s.title}</span>
                      <span className="sr-db__sub-period">{s.period}</span>
                    </div>
                    <span className="sr-db__sub-badge" style={{ color: meta.color, background: meta.bg }}>
                      <span className="material-symbols-outlined">{meta.icon}</span>
                      {meta.label}
                    </span>
                  </div>
                );
              }) : (
                <div className="sr-db__empty-state">
                  <p>ምንም መረጃ አልተገኘም (No Submissions Found)</p>
                </div>
              )}
            </div>
            <button className="sr-db__add-btn">
              <span className="material-symbols-outlined">add</span>
              Draft New Submission
            </button>
          </div>

          {/* Section B: Area Approval Inbox */}
          <div className="sr-db__card sr-db__card--inbox">
            <div className="sr-db__card-hdr">
              <span className="material-symbols-outlined">mark_email_unread</span>
              Area Approval Inbox
              {pendingInbox.length > 0 && (
                <span className="sr-db__inbox-badge">{pendingInbox.length}</span>
              )}
            </div>

            {loading ? (
              <p className="sr-db__empty">Loading inbox…</p>
            ) : inbox.length === 0 ? (
              <div className="sr-db__empty-state">
                <span className="material-symbols-outlined">inbox</span>
                <p>ምንም መረጃ አልተገኘም (Inbox Empty)</p>
              </div>
            ) : (
              <table className="sr-db__inbox-table">
                <thead>
                  <tr>
                    <th>Area</th>
                    <th>Document</th>
                    <th>Period</th>
                    <th>Submitted</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {inbox.map(r => (
                    <tr key={r.id}>
                      <td>
                        <div className="sr-db__inbox-area">
                          <div className="sr-db__inbox-dot" />
                          {r.coordinator?.area || 'Area Office'}
                        </div>
                      </td>
                      <td>
                        <span className="sr-db__inbox-type">
                          {r.type === 'MONTHLY_UPDATE' ? 'Monthly Report' : 'Annual Plan'}
                        </span>
                      </td>
                      <td className="sr-db__inbox-period">
                        {r.reportMonth ? `${r.reportMonth} ${r.reportYear}` : 'FY 2026'}
                      </td>
                      <td className="sr-db__inbox-date">
                        {new Date(r.dateSubmitted).toLocaleDateString()}
                      </td>
                      <td>
                        <button
                          className="sr-db__review-btn"
                          onClick={() => setReviewDoc(r)}
                        >
                          <span className="material-symbols-outlined">rate_review</span>
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN ────────────────────────────────────────────────── */}
        <div className="sr-db__right">

          {/* My Coordinated Areas */}
          <div className="sr-db__card">
            <div className="sr-db__card-hdr">
              <span className="material-symbols-outlined">map</span>
              My Coordinated Areas
              <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>{managedAreas.length} areas</span>
            </div>

            <div className="sr-db__areas-list">
              {managedAreas.length > 0 ? managedAreas.map(area => {
                const hm = HEALTH_META[area.health];
                return (
                  <div key={area.id} className="sr-db__area-row">
                    <div className="sr-db__area-health-dot" style={{ background: hm.dot }} />
                    <div className="sr-db__area-info">
                      <span className="sr-db__area-name">{area.name}</span>
                      <span className="sr-db__area-coord">
                        <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>person</span>
                        {area.coordinator}
                      </span>
                    </div>
                    <div className="sr-db__area-right">
                      <span className="sr-db__area-badge" style={{ color: hm.color, background: hm.bg }}>
                        {area.healthLabel}
                      </span>
                    </div>
                  </div>
                );
              }) : (
                <div className="sr-db__empty-state" style={{ padding: '2rem 1rem' }}>
                   <p>ምንም መረጃ አልተገኘም (No Areas Managed)</p>
                </div>
              )}
            </div>
          </div>

          {/* Announcements Board */}
          <div className="sr-db__card">
            <div className="sr-db__card-hdr">
              <span className="material-symbols-outlined">campaign</span>
              Post Updates to Areas
              <button className="sr-db__post-btn" onClick={() => setPostingUpdate(!postingUpdate)}>
                <span className="material-symbols-outlined">add</span>
                Post Update
              </button>
            </div>

            {postingUpdate && (
              <div className="sr-db__post-form">
                <textarea
                  className="sr-db__post-input"
                  placeholder="Write an update for your Area coordinators…"
                  value={newUpdate}
                  onChange={e => setNewUpdate(e.target.value)}
                />
                <div className="sr-db__post-actions">
                  <button className="btn btn--outline" style={{ fontSize: '0.8rem' }} onClick={() => { setPostingUpdate(false); setNewUpdate(''); }}>
                    Cancel
                  </button>
                  <button className="btn btn--primary" style={{ fontSize: '0.8rem' }} onClick={handlePostUpdate}>
                    <span className="material-symbols-outlined">send</span>
                    Publish
                  </button>
                </div>
              </div>
            )}

            <div className="sr-db__announcements">
              {loading ? (
                <p className="sr-db__empty">Loading…</p>
              ) : announcements.length === 0 ? (
                <div className="sr-db__empty-state">
                  <p>ምንም መረጃ አልተገኘም</p>
                </div>
              ) : announcements.slice(0, 4).map(a => (
                <div key={a.id} className="sr-db__ann-item">
                  <div className="sr-db__ann-dot" />
                  <div>
                    <p className="sr-db__ann-title">{a.title}</p>
                    <p className="sr-db__ann-content">{a.content}</p>
                    <span className="sr-db__ann-date">{new Date(a.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══ DOCUMENT REVIEW MODAL ════════════════════════════════════════════ */}
      {reviewDoc && (
        <div className="sr-db__overlay" onClick={() => setReviewDoc(null)}>
          <div className="sr-db__review-modal" onClick={e => e.stopPropagation()}>

            {/* Modal Header */}
            <div className="sr-db__rmodal-hdr">
              <div>
                <h2 className="sr-db__rmodal-title">{reviewDoc.title}</h2>
                <div className="sr-db__rmodal-meta">
                  <span className="sr-db__inbox-type">{reviewDoc.type === 'MONTHLY_UPDATE' ? 'Monthly Report' : 'Annual Plan'}</span>
                  <span>·</span>
                  <span>Submitted {new Date(reviewDoc.dateSubmitted).toLocaleDateString()}</span>
                  <span>·</span>
                  <span>{reviewDoc.coordinator?.area || 'Area Office'}</span>
                </div>
              </div>
              <button className="sr-db__rmodal-close" onClick={() => setReviewDoc(null)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>


            {/* Content Body */}
            <div className="sr-db__rmodal-body">
               <div className="sr-db__empty-state" style={{ height: '240px' }}>
                  <p>ምንም መረጃ አልተገኘም (Report Details Unavailable)</p>
               </div>
            </div>

            {/* Sticky Footer */}
            <div className="sr-db__rmodal-footer">
              <button className="btn btn--outline" onClick={() => setReviewDoc(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
