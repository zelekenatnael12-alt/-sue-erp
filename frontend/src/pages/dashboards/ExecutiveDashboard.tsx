import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, ExecutiveAnalyticsPayload } from '../../api/api';
import './ExecutiveDashboard.css';

/* ─── Types ─────────────────────────────────────────────────────────── */
type SimRole = 'NATIONAL_DIRECTOR' | 'SCHOOL_MINISTRY' | 'FINANCE_ADMIN';
type Dept = 'SCHOOL_MINISTRY' | 'STAFF_CAPACITY' | 'PARTNERSHIP' | 'MEDIA' | 'FINANCE';

export default function ExecutiveDashboard() {
  const navigate = useNavigate();
  const [activeRole, setActiveRole] = useState<SimRole>('NATIONAL_DIRECTOR');
  
  // Modals
  const [financeModalOpen, setFinanceModalOpen] = useState(false);
  const [placementModalOpen, setPlacementModalOpen] = useState(false);

  // Strict State for Live Data
  const [data, setData] = useState<ExecutiveAnalyticsPayload | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Lifecycle: Fetch Data on Mount
  useEffect(() => {
    setLoading(true);
    api.getExecutiveAnalytics()
      .then((payload) => {
        setData(payload);
        setError(null);
      })
      .catch((err) => {
        console.error('Failed to fetch executive analytics:', err);
        setError(err.message || 'Failed to communicate with the centralized analytics server.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Determine which tabs are unlocked
  const isUnlocked = (dept: Dept) => {
    if (activeRole === 'NATIONAL_DIRECTOR') return true;
    if (activeRole === 'SCHOOL_MINISTRY' && dept === 'SCHOOL_MINISTRY') return true;
    if (activeRole === 'FINANCE_ADMIN' && dept === 'FINANCE') return true;
    return false;
  };

  const activeTabName = 
    activeRole === 'FINANCE_ADMIN' ? 'Finance & Administration' :
    activeRole === 'SCHOOL_MINISTRY' ? 'School Ministry Operations' :
    'National Executive Overview';

  // ── Render Guards ──────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="hq-portal-loading">
        <div className="hq-spinner-container">
          <span className="material-symbols-outlined hq-spinner">sync</span>
          <p>Aggregating Regional Analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="hq-portal-error">
        <div className="hq-error-banner">
          <span className="material-symbols-outlined">error</span>
          <h3>Analytics Disconnected</h3>
          <p>{error}</p>
          <button className="btn-solid" onClick={() => window.location.reload()}>Retry Connection</button>
        </div>
      </div>
    );
  }

  // If data is null despite loading being false (shouldn't happen with the guards above)
  if (!data) return null;

  return (
    <div className="hq-portal">
      
      {/* ══ THE PERSISTENT SIDEBAR (Departmental Navigation) ══ */}
      <div className="hq-sidebar">
        <div className="hq-sidebar__brand">
          <div className="hq-sidebar__logo">✦</div>
          <div className="hq-sidebar__logotext">
            <strong>SU ETHIOPIA</strong>
            <span>National HQ</span>
          </div>
        </div>

        <div className="hq-sidebar__nav">
          <div className="hq-sidebar__lbl">Executive Departments</div>
          
          <button className={`hq-nav-btn ${activeRole === 'NATIONAL_DIRECTOR' ? 'active' : ''}`} onClick={() => setActiveRole('NATIONAL_DIRECTOR')}>
            <span className="material-symbols-outlined">globe</span> Apex Overview
          </button>

          <button className={`hq-nav-btn ${isUnlocked('SCHOOL_MINISTRY') ? '' : 'locked'} ${activeRole === 'SCHOOL_MINISTRY' ? 'active' : ''}`} onClick={() => {if(isUnlocked('SCHOOL_MINISTRY')) setActiveRole('SCHOOL_MINISTRY')}}>
            <span className="material-symbols-outlined">school</span> School Ministry
            {!isUnlocked('SCHOOL_MINISTRY') && <span className="material-symbols-outlined hq-nav-lock">lock</span>}
          </button>

          <button className={`hq-nav-btn ${isUnlocked('STAFF_CAPACITY') ? '' : 'locked'}`}>
            <span className="material-symbols-outlined">group_add</span> Staff Capacity
            {!isUnlocked('STAFF_CAPACITY') && <span className="material-symbols-outlined hq-nav-lock">lock</span>}
          </button>

          <button className={`hq-nav-btn ${isUnlocked('PARTNERSHIP') ? '' : 'locked'}`}>
            <span className="material-symbols-outlined">handshake</span> Partnership
            {!isUnlocked('PARTNERSHIP') && <span className="material-symbols-outlined hq-nav-lock">lock</span>}
          </button>

          <button className={`hq-nav-btn ${isUnlocked('MEDIA') ? '' : 'locked'}`}>
            <span className="material-symbols-outlined">campaign</span> Media & Comms
            {!isUnlocked('MEDIA') && <span className="material-symbols-outlined hq-nav-lock">lock</span>}
          </button>

          <button className={`hq-nav-btn ${isUnlocked('FINANCE') ? '' : 'locked'} ${activeRole === 'FINANCE_ADMIN' ? 'active' : ''}`} onClick={() => {if(isUnlocked('FINANCE')) setActiveRole('FINANCE_ADMIN')}}>
            <span className="material-symbols-outlined">account_balance</span> Finance & Admin
            {!isUnlocked('FINANCE') && <span className="material-symbols-outlined hq-nav-lock">lock</span>}
          </button>
        </div>
      </div>

      {/* ══ MAIN CONTENT AREA ══ */}
      <div className="hq-main">
        
        {/* GLOBAL HEADER & ROLE SIMULATOR */}
        <header className="hq-header">
          <div className="hq-header__title">
            <h2>{activeTabName}</h2>
          </div>
          
          <div className="hq-header__actions">
            <button
              style={{ cursor: 'pointer', background: '#f0fdf4', border: '1.5px solid #16a34a', borderRadius: 8, padding: '0.35rem 0.9rem', color: '#15803d', fontWeight: 700, fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 6 }}
              onClick={() => navigate('/simulate')}
            >
              ⚡ Full Portal Simulator
            </button>

            <div className="hq-simulator">
              <span className="hq-simulator__lbl">Simulate Login As:</span>
              <select className="hq-simulator__select" value={activeRole} onChange={(e) => setActiveRole(e.target.value as SimRole)}>
                <option value="NATIONAL_DIRECTOR">🌟 National Director</option>
                <option value="SCHOOL_MINISTRY">📚 School Ministry Director</option>
                <option value="FINANCE_ADMIN">💰 Finance & Admin Director</option>
              </select>
            </div>

            <div className="hq-header__notif">
              <span className="material-symbols-outlined">notifications</span>
              <div className="hq-header__badge">0</div>
            </div>
          </div>
        </header>

        {/* DYNAMIC VIEWS */}
        <div className="hq-content">
          
          {/* ── VIEW A: NATIONAL DIRECTOR (Apex View) ── */}
          {activeRole === 'NATIONAL_DIRECTOR' && (
            <div className="hq-view hq-view-apex slide-up">
              <div className="hq-kpis">
                <div className="hq-kpi">
                  <span className="material-symbols-outlined">map</span>
                  <div className="hq-kpi-val">{data.staffPlacements.length || 0}</div>
                  <div className="hq-kpi-lbl">Total Covered Regions</div>
                </div>
                <div className="hq-kpi">
                  <span className="material-symbols-outlined">donut_large</span>
                  <div className="hq-kpi-val">{(data.matrixData.totalActual || 0).toLocaleString()} <span>/ {(data.matrixData.totalTarget || 0).toLocaleString()}</span></div>
                  <div className="hq-kpi-lbl">National Matrix Target Progress</div>
                </div>
                <div className="hq-kpi">
                  <span className="material-symbols-outlined">groups</span>
                  <div className="hq-kpi-val">{data.staffPlacements.reduce((sum, sp) => sum + (parseInt(sp.roleNeeded) || 0), 0)}</div>
                  <div className="hq-kpi-lbl">Total National HR Count</div>
                </div>
                <div className="hq-kpi hq-kpi--green">
                  <span className="material-symbols-outlined">account_balance_wallet</span>
                  <div className="hq-kpi-val">{(data.financials.spent || 0).toLocaleString()} <span style={{fontSize:'1rem'}}>ETB</span></div>
                  <div className="hq-kpi-lbl">Total National Expenditures</div>
                </div>
              </div>

              <div className="hq-card">
                <div className="hq-card-header">
                  <h3>Regional Master Reports (Pending Approval)</h3>
                </div>
                {data.pendingReports.length > 0 ? (
                  <table className="hq-table">
                    <thead>
                      <tr><th>Region</th><th>Director</th><th>Period</th><th>Status</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {data.pendingReports.map((rp) => (
                        <tr key={rp.id}>
                          <td><strong>{rp.region}</strong></td><td>{rp.director}</td><td>{rp.period}</td>
                          <td><span className="badge badge-yellow">{rp.status}</span></td>
                          <td><button className="btn-text">Audit & Authorize →</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="empty-state-container">
                     <span className="material-symbols-outlined">inventory_2</span>
                     <p>ምንም መረጃ አልተገኘም (No Pending Reports)</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── VIEW B: SCHOOL MINISTRY DIRECTOR ── */}
          {activeRole === 'SCHOOL_MINISTRY' && (
            <div className="hq-view hq-view-ops slide-up">
              <div className="hq-grid-2">
                <div className="hq-card">
                  <div className="hq-card-header hq-hdr-blue">
                    <h3><span className="material-symbols-outlined">person_pin_circle</span> Active Staff Placements</h3>
                    <button className="btn-solid" onClick={() => setPlacementModalOpen(true)}>➕ Assign Staff</button>
                  </div>
                  <div className="hq-list">
                    {data.staffPlacements.length > 0 ? data.staffPlacements.map((sp, i) => (
                      <div className={`hq-list-item active`} key={i}>
                        <div>
                          <strong>{sp.location}</strong>
                          <span>{sp.roleNeeded}</span>
                        </div>
                        <span className={`badge badge-green`}>{sp.status}</span>
                      </div>
                    )) : (
                      <div className="empty-state-container">
                        <p>ምንም መረጃ አልተገኘም (No active placements identified)</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="hq-card">
                  <div className="hq-card-header">
                    <h3>National Field Data (Aggregated Real-Time Matrix)</h3>
                  </div>
                  <table className="hq-table hq-table-compact">
                    <thead>
                      <tr><th>Geography</th><th>Matrix Target</th><th>Matrix Actual</th><th>Progress</th></tr>
                    </thead>
                    <tbody>
                       <tr>
                         <td><strong>Ethiopia (National)</strong></td>
                         <td>{data.matrixData.totalTarget.toLocaleString()}</td>
                         <td>{data.matrixData.totalActual.toLocaleString()}</td>
                         <td>
                           <span className="txt-highlight">
                             {data.matrixData.totalTarget > 0 ? Math.round((data.matrixData.totalActual / data.matrixData.totalTarget) * 100) : 0}% Coverage
                           </span>
                         </td>
                       </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── VIEW C: FINANCE & ADMIN DIRECTOR ── */}
          {activeRole === 'FINANCE_ADMIN' && (
            <div className="hq-view hq-view-finance slide-up">
              <div className="hq-grid-3">
                <div className="hq-card span-2">
                  <div className="hq-card-header hq-hdr-green">
                    <h3><span className="material-symbols-outlined">receipt_long</span> Financial Aggregate Inbox</h3>
                  </div>
                  <table className="hq-table">
                    <thead>
                      <tr><th>Budgetary Classification</th><th>Total Evaluated (ETB)</th><th>Action</th></tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>Requested Budget (Total System Plans)</strong></td>
                        <td style={{fontWeight: 800}}>{data.financials.requested.toLocaleString()} ETB</td>
                        <td><button className="btn-audit" onClick={() => setFinanceModalOpen(true)}>Inspect Details</button></td>
                      </tr>
                      <tr>
                        <td><strong>Actual Expenditure (Approved Reports)</strong></td>
                        <td style={{fontWeight: 800}}>{data.financials.spent.toLocaleString()} ETB</td>
                        <td><button className="btn-audit" onClick={() => setFinanceModalOpen(true)}>Inspect Details</button></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="hq-card">
                  <div className="hq-card-header">
                    <h3>HR Finance Analytics</h3>
                  </div>
                  <div className="hq-fin-hub">
                    <div className="hq-fin-box">
                      <span>Total Active Deployments</span>
                      <strong>{data.staffPlacements.reduce((sum, sp) => sum + (parseInt(sp.roleNeeded) || 0), 0)}</strong>
                    </div>
                    <div className="hq-fin-box">
                      <span>Budget Utilization Rate</span>
                      <strong>{data.financials.requested > 0 ? Math.round((data.financials.spent / data.financials.requested) * 100) : 0}%</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ══ MODALS ══ */}

      {/* Finance Detail Modal */}
      {financeModalOpen && (
        <div className="hq-modal-overlay" onClick={() => setFinanceModalOpen(false)}>
          <div className="hq-modal hq-modal-side pulse" onClick={e => e.stopPropagation()}>
            <div className="hq-modal-hdr green">
              <h3>Expense Audit / Breakdown</h3>
              <button className="close-btn" onClick={() => setFinanceModalOpen(false)}>✕</button>
            </div>
            <div className="hq-modal-body">
              <h4 className="hq-subtxt">Line-Item Variances (Aggregated)</h4>
              <div className="hq-variance-box">
                <div className="hq-v-row"><span>Aggregate Budget: {data.financials.requested.toLocaleString()} ETB</span> <span className="txt-r">Actual: {data.financials.spent.toLocaleString()} ETB</span></div>
              </div>
              <p className="hq-subtxt" style={{marginTop:'1.5rem'}}>Detailed regional line-items can be reviewed in the <strong>Reports Archive</strong> modal upon selection.</p>
            </div>
            <div className="hq-modal-footer">
              <button className="btn-deny">Close View</button>
            </div>
          </div>
        </div>
      )}

      {/* Staff Placement Modal */}
      {placementModalOpen && (
        <div className="hq-modal-overlay" onClick={() => setPlacementModalOpen(false)}>
          <div className="hq-modal pulse" onClick={e => e.stopPropagation()}>
            <div className="hq-modal-hdr blue">
              <h3>Deployment Node Mapping</h3>
              <button className="close-btn" onClick={() => setPlacementModalOpen(false)}>✕</button>
            </div>
            <div className="hq-modal-body">
              <p>Active Staff count currently evaluated directly from User Management database via <code>GET /api/executive/analytics</code> route.</p>
              <select className="hq-input-select" style={{width:'100%', marginTop:'1rem'}} disabled>
                <option>System Auto-Managed: {data.staffPlacements.length} Regions Active</option>
              </select>
            </div>
            <div className="hq-modal-footer">
              <button className="btn-solid" onClick={() => setPlacementModalOpen(false)}>Confirmed</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
