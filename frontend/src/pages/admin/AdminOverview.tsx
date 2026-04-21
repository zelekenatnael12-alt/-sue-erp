import { useState, useEffect } from 'react';
import { api, AdminOverview as AdminOverviewData, AiInsights as AiInsightsData } from '../../api/api';
import './AdminOverview.css';

export default function AdminOverview() {
  const [data, setData] = useState<AdminOverviewData | null>(null);
  const [insights, setInsights] = useState<AiInsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.getAdminOverview(),
      api.getAiInsights().catch(() => null)
    ])
      .then(([overview, ai]) => {
        setData(overview);
        setInsights(ai);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="ao-loading">
      <div className="ao-loading__spinner"></div>
      <p>Loading dashboard...</p>
    </div>
  );

  if (error) return (
    <div className="ao-error">
      <span className="material-symbols-outlined">error</span>
      <p>{error}</p>
      <button className="btn btn--primary" onClick={() => window.location.reload()}>Retry</button>
    </div>
  );

  if (!data) return null;

  const { users, reports, plans, recentReports, recentUsers, regionBreakdown, quickStats } = data;

  const maxRegionCount = Math.max(...regionBreakdown.map(r => r.count), 1);

  return (
    <div className="ao">
      {/* Page Header */}
      <div className="ao__header">
        <div>
          <h1 className="ao__title">Dashboard Overview</h1>
          <p className="ao__subtitle">Welcome back! Here's what's happening across all regions.</p>
        </div>
        <div className="ao__header-actions">
          <button type="button" className="btn btn--outline" onClick={() => window.location.reload()}>
            <span className="material-symbols-outlined">refresh</span>
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="ao__kpi-grid">
        <div className="ao__kpi ao__kpi--blue">
          <div className="ao__kpi-icon">
            <span className="material-symbols-outlined">group</span>
          </div>
          <div className="ao__kpi-content">
            <span className="ao__kpi-value">{users.total}</span>
            <span className="ao__kpi-label">Total Users</span>
          </div>
          <div className="ao__kpi-breakdown">
            <span>{users.coordinators} Coordinators</span>
            <span>{users.executives} Executives</span>
            <span>{users.admins} Admins</span>
          </div>
        </div>

        <div className="ao__kpi ao__kpi--orange">
          <div className="ao__kpi-icon">
            <span className="material-symbols-outlined">lab_profile</span>
          </div>
          <div className="ao__kpi-content">
            <span className="ao__kpi-value">{reports.total}</span>
            <span className="ao__kpi-label">Total Reports</span>
          </div>
          <div className="ao__kpi-breakdown">
            <span className="ao__kpi-tag ao__kpi-tag--warning">{reports.pending} Pending</span>
            <span className="ao__kpi-tag ao__kpi-tag--success">{reports.approved} Approved</span>
          </div>
        </div>

        <div className="ao__kpi ao__kpi--green">
          <div className="ao__kpi-icon">
            <span className="material-symbols-outlined">description</span>
          </div>
          <div className="ao__kpi-content">
            <span className="ao__kpi-value">{plans.total}</span>
            <span className="ao__kpi-label">Project Plans</span>
          </div>
          <div className="ao__kpi-breakdown">
            <span>{plans.draft} Drafts</span>
            <span>{plans.submitted} Submitted</span>
          </div>
        </div>

        <div className="ao__kpi ao__kpi--purple">
          <div className="ao__kpi-icon">
            <span className="material-symbols-outlined">volunteer_activism</span>
          </div>
          <div className="ao__kpi-content">
            <span className="ao__kpi-value">{quickStats.totalVolunteers.count.toLocaleString()}</span>
            <span className="ao__kpi-label">Volunteers</span>
          </div>
          <div className="ao__kpi-breakdown">
            <span className="ao__kpi-tag ao__kpi-tag--success">{quickStats.totalVolunteers.trend}</span>
          </div>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="ao__quick-stats">
        <div className="ao__quick-stat">
          <span className="material-symbols-outlined">school</span>
          <div>
            <strong>{quickStats.schoolsReached.count}</strong>
            <span>Schools Reached</span>
          </div>
          <span className="ao__quick-trend ao__quick-trend--up">{quickStats.schoolsReached.trend}</span>
        </div>
        <div className="ao__quick-stat">
          <span className="material-symbols-outlined">payments</span>
          <div>
            <strong>{quickStats.budgetRequested.total} {quickStats.budgetRequested.currency}</strong>
            <span>Budget Requested</span>
          </div>
          <span className="ao__quick-trend ao__quick-trend--neutral">{quickStats.budgetRequested.status}</span>
        </div>
      </div>

      {/* AI Insights Premium Module */}
      {insights && (
        <div className="ao__ai-module">
          <div className="ao__ai-header">
            <div className="ao__ai-title">
              <span className="material-symbols-outlined ao__ai-sparkle">auto_awesome</span>
              <h2>AI Plan & Report Analysis</h2>
            </div>
            <p className="ao__ai-subtitle">Synthesized insights based on all approved regional plans and recent monthly actuals.</p>
          </div>
          
          <div className="ao__ai-grid">
            {/* Strengths */}
            <div className="ao__ai-card ao__ai-card--strengths">
              <h3>
                <span className="material-symbols-outlined">verified</span>
                Executing Well
              </h3>
              <ul>
                {insights.strengths.map((s, i) => <li key={i}>{s.replace(/\*\*(.*?)\*\*/g, '$1')}</li>)}
              </ul>
            </div>

            {/* Focus Areas */}
            <div className="ao__ai-card ao__ai-card--focus">
              <h3>
                <span className="material-symbols-outlined">warning</span>
                Needs Focus
              </h3>
              <ul>
                {insights.focusAreas.map((f, i) => <li key={i}>{f.replace(/\*\*(.*?)\*\*/g, '$1')}</li>)}
              </ul>
            </div>

            {/* Coordinator Reminders */}
            <div className="ao__ai-card ao__ai-card--reminders">
              <h3>
                <span className="material-symbols-outlined">notifications_active</span>
                Coordinator Reminders
              </h3>
              <div className="ao__ai-reminders-list">
                {insights.coordinatorReminders.map((r, i) => (
                  <div key={i} className="ao__ai-reminder-item">
                    <span className="ao__ai-reminder-region">{r.region}</span>
                    <p>{r.reminder}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Reports + Region */}
      <div className="ao__main-grid">
        {/* Recent Reports */}
        <div className="ao__card ao__card--reports">
          <div className="ao__card-header">
            <h2>
              <span className="material-symbols-outlined">lab_profile</span>
              Recent Reports
            </h2>
            <a href="/admin/reports" className="ao__view-all">View All →</a>
          </div>
          <div className="ao__table-wrapper">
            <table className="ao__table">
              <thead>
                <tr>
                  <th>Report</th>
                  <th>Coordinator</th>
                  <th>Region</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentReports.length === 0 ? (
                  <tr><td colSpan={5} className="ao__table-empty">No reports yet</td></tr>
                ) : (
                  recentReports.map(r => (
                    <tr key={r.id}>
                      <td>
                        <div className="ao__report-name">
                          {r.projectPlan?.projectName || r.title}
                        </div>
                        <div className="ao__report-type">{r.projectPlan?.projectType || '—'}</div>
                      </td>
                      <td>{r.coordinator?.name || '—'}</td>
                      <td>{r.coordinator?.region || '—'}</td>
                      <td>
                        <span className={`ao__status ao__status--${r.status === 'APPROVED' ? 'approved' : 'pending'}`}>
                          {r.status === 'APPROVED' ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td className="ao__date">{new Date(r.dateSubmitted).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column */}
        <div className="ao__right-col">
          {/* Regional Breakdown */}
          <div className="ao__card ao__card--regions">
            <div className="ao__card-header">
              <h2>
                <span className="material-symbols-outlined">map</span>
                Regional Distribution
              </h2>
            </div>
            <div className="ao__region-bars">
              {regionBreakdown.length === 0 ? (
                <p className="ao__empty-msg">No regional data yet</p>
              ) : (
                regionBreakdown.map(r => (
                  <div className="ao__region-bar" key={r.region}>
                    <div className="ao__region-bar-label">
                      <span>{r.region}</span>
                      <span className="ao__region-bar-count">{r.count}</span>
                    </div>
                    <div className="ao__region-bar-track">
                      <div
                        className="ao__region-bar-fill"
                        style={{ width: `${(r.count / maxRegionCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Users */}
          <div className="ao__card ao__card--users">
            <div className="ao__card-header">
              <h2>
                <span className="material-symbols-outlined">person_add</span>
                New Users
              </h2>
              <a href="/admin/users" className="ao__view-all">View All →</a>
            </div>
            <div className="ao__user-list">
              {recentUsers.length === 0 ? (
                <p className="ao__empty-msg">No users yet</p>
              ) : (
                recentUsers.map(u => (
                  <div className="ao__user-item" key={u.id}>
                    <div className="ao__user-avatar">
                      {(u.name || u.email).charAt(0).toUpperCase()}
                    </div>
                    <div className="ao__user-info">
                      <span className="ao__user-name">{u.name || u.email}</span>
                      <span className="ao__user-meta">{u.role} {u.region ? `• ${u.region}` : ''}</span>
                    </div>
                    <span className="ao__user-date">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
