import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api, DashboardStats, Report, Announcement } from '../../api/api';
import './RegionalDashboard.css';

/* ─── Types ──────────────────────────────────────────────────────────────── */
type SRHealth = 'green' | 'yellow' | 'red';

interface SubRegion {
  id: number;
  name: string;
  coordinator: string;
  health: SRHealth;
  healthLabel: string;
  lastReport: string;
  sparkline: number[]; 
  fellowships: number;
  areas: number;
  pendingCount: number;
}

const HEALTH_META: Record<SRHealth, { color: string; bg: string; dot: string; badge: string }> = {
  green:  { color: '#15803d', bg: 'rgba(22,163,74,0.09)',  dot: '#16a34a', badge: '#dcfce7' },
  yellow: { color: '#92400e', bg: 'rgba(234,179,8,0.09)',  dot: '#eab308', badge: '#fef9c3' },
  red:    { color: '#b91c1c', bg: 'rgba(220,38,38,0.09)',  dot: '#dc2626', badge: '#fee2e2' },
};

type HOStatus = 'DRAFT' | 'PENDING_HO' | 'REQUIRES_CORRECTION' | 'APPROVED';

const HO_STATUS: Record<HOStatus, { label: string; color: string; bg: string; icon: string }> = {
  DRAFT:               { label: 'Draft',            color: '#475569', bg: 'rgba(100,116,139,0.1)',  icon: 'edit_note' },
  PENDING_HO:          { label: 'Pending HO Review',color: '#1e40af', bg: 'rgba(37,99,235,0.1)',   icon: 'hourglass_top' },
  REQUIRES_CORRECTION: { label: 'Action Required',  color: '#b91c1c', bg: 'rgba(220,38,38,0.12)',  icon: 'warning' },
  APPROVED:            { label: 'Approved by HO',   color: '#15803d', bg: 'rgba(22,163,74,0.1)',   icon: 'verified' },
};

/* ─── Component ──────────────────────────────────────────────────────────── */
export default function RegionalDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [inbox, setInbox] = useState<Report[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  // Sub-regions and HO submissions (to be replaced by API calls)
  const [subRegions] = useState<SubRegion[]>([]);
  const [hoSubs] = useState<{ title: string; status: HOStatus; period: string }[]>([]);

  const [reviewSR, setReviewSR] = useState<SubRegion | null>(null);
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [broadcastText, setBroadcastText] = useState('');

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
    name?.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2) || 'RD';

  const totalPending = subRegions.reduce((a, b) => a + b.pendingCount, 0);
  const missingSR = subRegions.filter(s => s.health === 'red').length;

  const kpis = [
    { label: 'Sub-Regions / Areas', value: `${subRegions.length} / 0`,   icon: 'account_tree',      color: '#1e40af', sub: '0 Area offices managed'       },
    { label: 'Fellowships vs Schools', value: `${stats?.schoolsReached?.count ?? 0} / 0`,                  icon: 'groups',            color: '#15803d', sub: '0% fellowship penetration'    },
    { label: 'Regional Human Resources', value: '0',                      icon: 'manage_accounts',   color: '#7c3aed', sub: '0 FT · 0 Assoc · 0 Vol'  },
    { label: 'Regional Coverage Rate',  value: '0%',                       icon: 'track_changes',     color: '#0891b2', sub: 'Target: 0% by year-end'       },
    { label: 'Budget Utilization',      value: '0%',                       icon: 'account_balance',   color: '#ea580c', sub: `${stats?.budgetRequested?.total || '0'} utilized`    },
  ];


  return (
    <div className="rg-db">

      {/* ══ TOP BAR ══════════════════════════════════════════════════════════ */}
      <div className="rg-db__topbar">
        <div className="rg-db__profile">
          <div className="rg-db__avatar">{initials(user?.name)}</div>
          <div>
            <h3 className="rg-db__name">{user?.name || 'Regional Director'}</h3>
            <div className="rg-db__meta">
              <span className="rg-db__role-badge">Regional Coordinator</span>
              <span className="rg-db__loc">
                <span className="material-symbols-outlined" style={{ fontSize: 13 }}>location_on</span>
                {user?.region || 'Not Assigned'}
              </span>
            </div>
          </div>
        </div>

        <div className="rg-db__notif-area">
          {totalPending > 0 && (
            <div className="rg-db__notif rg-db__notif--amber">
              <span className="material-symbols-outlined">pending_actions</span>
              <span><strong>{totalPending} Sub-Regional Report{totalPending > 1 ? 's' : ''}</strong> pending regional review</span>
            </div>
          )}
          {missingSR > 0 && (
            <div className="rg-db__notif rg-db__notif--red">
              <span className="material-symbols-outlined">report_problem</span>
              <span><strong>{missingSR} Sub-Region{missingSR > 1 ? 's' : ''}</strong> missing quarterly reports</span>
            </div>
          )}
          <div className="rg-db__notif rg-db__notif--deadline">
            <span className="material-symbols-outlined">event_busy</span>
            <span><strong>System Notice</strong>: No immediate deadlines pending</span>
          </div>
        </div>

        <div className="rg-db__ctas">
          <button className="btn btn--outline">
            <span className="material-symbols-outlined">upload_file</span>
            Submit to HO
          </button>
          <button className="btn btn--primary rg-db__create-btn">
            <span className="material-symbols-outlined">add</span>
            Create Regional Plan
          </button>
        </div>
      </div>

      {/* ══ EXECUTIVE KPIs ═══════════════════════════════════════════════════ */}
      <div className="rg-db__kpis">
        {kpis.map(k => (
          <div key={k.label} className="rg-db__kpi">
            <div className="rg-db__kpi-icon" style={{ background: k.color + '18', color: k.color }}>
              <span className="material-symbols-outlined">{k.icon}</span>
            </div>
            <div className="rg-db__kpi-body">
              <span className="rg-db__kpi-val">{loading ? '—' : k.value}</span>
              <span className="rg-db__kpi-lbl">{k.label}</span>
              <span className="rg-db__kpi-sub">{k.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ══ BODY ════════════════════════════════════════════════════════════ */}
      <div className="rg-db__body">

        {/* ── LEFT COLUMN ──────────────────────────────────────────────────── */}
        <div className="rg-db__left">

          {/* Section A: HO Submissions */}
          <div className="rg-db__card">
            <div className="rg-db__card-hdr">
              <span className="material-symbols-outlined">upload_file</span>
              My Head Office Submissions
            </div>
            <div className="rg-db__sub-tracker">
              {hoSubs.length > 0 ? hoSubs.map((s, i) => {
                const m = HO_STATUS[s.status];
                return (
                  <div key={i} className={`rg-db__sub-row ${s.status === 'REQUIRES_CORRECTION' ? 'rg-db__sub-row--alert' : ''}`}>
                    <div className="rg-db__sub-info">
                      <span className="rg-db__sub-title">{s.title}</span>
                      <span className="rg-db__sub-period">{s.period}</span>
                    </div>
                    <span className="rg-db__sub-badge" style={{ color: m.color, background: m.bg }}>
                      <span className="material-symbols-outlined">{m.icon}</span>
                      {m.label}
                    </span>
                  </div>
                );
              }) : (
                <div className="rg-db__empty-state">
                  <p>ምንም መረጃ አልተገኘም (No HO Submissions)</p>
                </div>
              )}
            </div>
            <button className="rg-db__add-btn">
              <span className="material-symbols-outlined">add</span>
              Draft New Regional Report
            </button>
          </div>

          {/* Section B: Sub-Regional Approval Inbox */}
          <div className="rg-db__card rg-db__card--inbox">
            <div className="rg-db__card-hdr">
              <span className="material-symbols-outlined">mark_email_unread</span>
              Sub-Regional Approval Inbox
              {inbox.length > 0 && (
                <span className="rg-db__inbox-badge">{inbox.length}</span>
              )}
            </div>
            <div className="rg-db__table-scroll">
              {inbox.length > 0 ? (
                <table className="rg-db__inbox-table">
                  <thead>
                    <tr>
                      <th>Sub-Region</th>
                      <th>Coordinator</th>
                      <th>Document</th>
                      <th>Period</th>
                      <th>Submitted</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {inbox.map((r, i) => (
                      <tr key={i}>
                        <td className="rg-db__inbox-sr">{r.coordinator?.subRegion || 'Unspecified'}</td>
                        <td className="rg-db__inbox-coord">{r.coordinator?.name || 'Unknown'}</td>
                        <td><span className="rg-db__inbox-type">{r.type === 'MONTHLY_UPDATE' ? 'Monthly Report' : 'Annual Plan'}</span></td>
                        <td className="rg-db__inbox-period">{r.reportMonth ? `${r.reportMonth} ${r.reportYear}` : 'FY 2026'}</td>
                        <td className="rg-db__inbox-date">{new Date(r.dateSubmitted).toLocaleDateString()}</td>
                        <td>
                          <button className="rg-db__review-btn" onClick={() => {/* Handle Review */}}>
                            <span className="material-symbols-outlined">merge</span>
                            Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="rg-db__empty-state">
                  <span className="material-symbols-outlined">inbox</span>
                  <p>ምንም መረጃ አልተገኘም (Inbox Empty)</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN ─────────────────────────────────────────────────── */}
        <div className="rg-db__right">

          {/* Sub-Regional Health Map */}
          <div className="rg-db__card">
            <div className="rg-db__card-hdr">
              <span className="material-symbols-outlined">map</span>
              Sub-Regional Territory Health
              <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>
                {subRegions.length} sub-regions
              </span>
            </div>
            <div className="rg-db__sr-list">
              {subRegions.length > 0 ? subRegions.map(sr => {
                const hm = HEALTH_META[sr.health];
                return (
                  <div key={sr.id} className="rg-db__sr-row">
                    <div className="rg-db__sr-dot" style={{ background: hm.dot }} />
                    <div className="rg-db__sr-info">
                      <span className="rg-db__sr-name">{sr.name}</span>
                      <span className="rg-db__sr-coord">
                        <span className="material-symbols-outlined" style={{ fontSize: 12 }}>person</span>
                        {sr.coordinator}
                      </span>
                    </div>

                    <div className="rg-db__sr-right">
                      <span className="rg-db__sr-badge" style={{ color: hm.color, background: hm.badge }}>
                        {sr.healthLabel}
                      </span>
                    </div>
                  </div>
                );
              }) : (
                <div className="rg-db__empty-state" style={{ padding: '2rem 1rem' }}>
                   <p>ምንም መረጃ አልተገኘም (No Sub-Regions Listed)</p>
                </div>
              )}
            </div>
          </div>

          {/* Regional Broadcasts */}
          <div className="rg-db__card">
            <div className="rg-db__card-hdr">
              <span className="material-symbols-outlined">campaign</span>
              Regional Broadcasts
              <button className="rg-db__broadcast-btn" onClick={() => setBroadcastOpen(!broadcastOpen)}>
                <span className="material-symbols-outlined">cell_tower</span>
                Broadcast Update
              </button>
            </div>

            {broadcastOpen && (
              <div className="rg-db__post-form">
                <textarea
                  className="rg-db__post-input"
                  placeholder="Broadcast a strategic update..."
                  value={broadcastText}
                  onChange={e => setBroadcastText(e.target.value)}
                />
                <div className="rg-db__post-actions">
                  <button className="btn btn--outline" onClick={() => setBroadcastOpen(false)}>Cancel</button>
                  <button className="btn btn--primary" onClick={() => setBroadcastOpen(false)}>Broadcast Now</button>
                </div>
              </div>
            )}

            <div className="rg-db__announcements">
              {announcements.length > 0 ? announcements.map((a, i) => (
                <div key={i} className="rg-db__ann-item">
                  <div className="rg-db__ann-dot" />
                  <div className="rg-db__ann-body">
                    <p className="rg-db__ann-title">{a.title}</p>
                    <p className="rg-db__ann-content">{a.content}</p>
                    <div className="rg-db__ann-footer">
                      <span className="rg-db__ann-date">{new Date(a.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="rg-db__empty-state">
                  <p>ምንም መረጃ አልተገኘም</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ══ CONSOLIDATION MODAL (full-screen) ════════════════════════════════ */}
      {reviewSR && (
        <div className="rg-db__overlay" onClick={() => setReviewSR(null)}>
          <div className="rg-db__rmodal" onClick={e => e.stopPropagation()}>
            <div className="rg-db__rmodal-hdr">
              <h2 className="rg-db__rmodal-title">Review — {reviewSR.name}</h2>
              <button className="rg-db__rmodal-close" onClick={() => setReviewSR(null)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="rg-db__rmodal-body">
               <div className="rg-db__empty-state" style={{ height: '300px' }}>
                  <p>ምንም መረጃ አልተገኘም (Report Details Unavailable)</p>
               </div>
            </div>
            <div className="rg-db__rmodal-footer">
              <button className="btn btn--outline" onClick={() => setReviewSR(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
